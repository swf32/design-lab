import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'
import {
  defaultInterfacePaths,
  resolveActiveInterface,
  typecheckInterfaceSystem,
} from '../server/services/interfacePacks.mjs'

const viteBin = fileURLToPath(new URL('../../bin/vite.js', import.meta.resolve('vite')))
const applicationRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const { systemSlot } = defaultInterfacePaths()
const componentIndexBuilder = join(systemSlot, 'scripts', 'build-component-index.mjs')
const iconIndexBuilder = join(systemSlot, 'scripts', 'build-icon-index.mjs')
const tokenBuilder = join(systemSlot, 'scripts', 'build-tokens.mjs')

try {
  const active = await resolveActiveInterface()
  await typecheckInterfaceSystem(active.system)
} catch (error) {
  console.error(`[Design Lab] Cannot start: ${error.message}`)
  console.error('Check the active System with `npx designlab system doctor`.')
  console.error('For a default-derived System, review `npx designlab system upgrade`.')
  console.error('If the interface cannot be repaired, run `npx designlab system reset`.')
  console.error('If the active Skin is broken, run `npx designlab theme reset`.')
  process.exit(1)
}

const commands = [
  ['node', ['server/index.mjs']],
  ['node', [viteBin]],
  ['node', [componentIndexBuilder, '--watch']],
  ['node', [iconIndexBuilder, '--watch']],
  ['node', [tokenBuilder, '--watch']],
]

const children = commands.map(([command, args], index) =>
  spawn(command, args, {
    stdio: index === 0 ? ['inherit', 'inherit', 'inherit', 'ipc'] : 'inherit',
    cwd: applicationRoot,
  }),
)
let stopping = false
let uninstallPreparing = false

const stop = (exitCode = 0) => {
  if (stopping) return
  stopping = true
  process.exitCode = exitCode
  children.forEach((child) => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM')
  })
}

children[0].on('message', async (message) => {
  if (message?.type !== 'design-lab:stop-generators' || uninstallPreparing) return
  uninstallPreparing = true
  await Promise.all(
    children.slice(2).map(async (child) => {
      if (child.exitCode !== null || child.signalCode !== null) return
      const exited = new Promise((resolve) => child.once('exit', resolve))
      child.kill('SIGTERM')
      await exited
    }),
  )
  if (children[0].connected)
    children[0].send({ type: 'design-lab:generators-stopped', requestId: message.requestId })
})

children.forEach((child, index) => {
  child.on('error', (error) => {
    console.error(error)
    stop(1)
  })
  child.on('exit', (code, signal) => {
    if (!stopping && !(uninstallPreparing && index >= 2)) {
      console.error(`Development process stopped (${signal ?? `exit ${code ?? 1}`})`)
      stop(code ?? 1)
    }
  })
})

process.on('SIGINT', () => stop(130))
process.on('SIGTERM', () => stop(143))
