import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const APPLICATION_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const CHILD_PATH = fileURLToPath(new URL('../../runtime/runtimeChild.mjs', import.meta.url))

function launcherError(message, code = 'RUNTIME_START_FAILED') {
  return Object.assign(new Error(message), { code, status: 503 })
}

export async function launchManagedRuntime(profile) {
  if (profile.technology !== 'vue')
    throw launcherError(
      `${profile.technology} runtime launcher is not implemented.`,
      'RUNTIME_ADAPTER_UNAVAILABLE',
    )
  if (!profile.framework.available)
    throw launcherError(
      `The ${profile.framework.packageName} package is not installed in this source environment.`,
      'RUNTIME_FRAMEWORK_UNAVAILABLE',
    )

  const payload = Buffer.from(
    JSON.stringify({
      runtimeRoot: resolve(APPLICATION_ROOT, 'runtime/vue'),
      sourceRoot: profile.sourceRoot,
      packageRoot: profile.packageEnvironment.root,
    }),
  ).toString('base64url')
  const child = spawn(process.execPath, [CHILD_PATH, payload], {
    cwd: profile.packageEnvironment.root,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  })
  let diagnostics = ''
  child.stdout.on('data', (chunk) => {
    diagnostics = `${diagnostics}${chunk}`.slice(-12_000)
  })
  child.stderr.on('data', (chunk) => {
    diagnostics = `${diagnostics}${chunk}`.slice(-12_000)
  })

  const origin = await new Promise((resolveReady, reject) => {
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      reject(launcherError(`Vue runtime did not start in time. ${diagnostics}`.trim()))
    }, 30_000)
    child.once('error', (error) => {
      clearTimeout(timeout)
      reject(launcherError(`Vue runtime process failed: ${error.message}`))
    })
    child.once('exit', (code) => {
      clearTimeout(timeout)
      reject(
        launcherError(
          `Vue runtime exited before readiness${code === null ? '' : ` with code ${code}`}. ${diagnostics}`.trim(),
        ),
      )
    })
    child.on('message', (message) => {
      if (message?.type === 'ready') {
        clearTimeout(timeout)
        resolveReady(message.origin)
      } else if (message?.type === 'error') {
        clearTimeout(timeout)
        reject(launcherError(`Vue runtime could not start: ${message.message}`))
      }
    })
  })

  const closed = new Promise((resolveClosed) => {
    child.once('exit', (code, signal) => resolveClosed({ code, signal }))
  })
  return {
    origin,
    closed,
    async close() {
      if (child.exitCode !== null || child.signalCode !== null) return
      child.send({ type: 'close' })
      await closed
    },
    forceClose() {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
    },
  }
}
