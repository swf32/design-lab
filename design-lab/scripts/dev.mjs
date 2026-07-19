import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const viteBin = fileURLToPath(new URL('../../bin/vite.js', import.meta.resolve('vite')))
const componentIndexBuilder = fileURLToPath(
  new URL('../../libraries/design-lab-system/scripts/build-component-index.mjs', import.meta.url),
)
const iconIndexBuilder = fileURLToPath(
  new URL('../../libraries/design-lab-system/scripts/build-icon-index.mjs', import.meta.url),
)

const commands = [
  ['node', ['server/index.mjs']],
  ['node', [viteBin]],
  ['node', [componentIndexBuilder, '--watch']],
  ['node', [iconIndexBuilder, '--watch']],
]

const children = commands.map(([command, args]) => spawn(command, args, { stdio: 'inherit' }))
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
