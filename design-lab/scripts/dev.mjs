import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'
import { defaultInterfacePaths } from '../server/services/interfacePacks.mjs'

const viteBin = fileURLToPath(new URL('../../bin/vite.js', import.meta.resolve('vite')))
const applicationRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const { systemSlot } = defaultInterfacePaths()
const componentIndexBuilder = join(systemSlot, 'scripts', 'build-component-index.mjs')
const iconIndexBuilder = join(systemSlot, 'scripts', 'build-icon-index.mjs')
const tokenBuilder = join(systemSlot, 'scripts', 'build-tokens.mjs')

const commands = [
  ['node', ['server/index.mjs']],
  ['node', [viteBin]],
  ['node', [componentIndexBuilder, '--watch']],
  ['node', [iconIndexBuilder, '--watch']],
  ['node', [tokenBuilder, '--watch']],
]

const children = commands.map(([command, args]) =>
  spawn(command, args, { stdio: 'inherit', cwd: applicationRoot }),
)
let stopping = false

const stop = (exitCode = 0) => {
  if (stopping) return
  stopping = true
  process.exitCode = exitCode
  children.forEach((child) => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM')
  })
}

children.forEach((child) => {
  child.on('error', (error) => {
    console.error(error)
    stop(1)
  })
  child.on('exit', (code, signal) => {
    if (!stopping) {
      console.error(`Development process stopped (${signal ?? `exit ${code ?? 1}`})`)
      stop(code ?? 1)
    }
  })
})

process.on('SIGINT', () => stop(130))
process.on('SIGTERM', () => stop(143))
