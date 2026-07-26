import { access } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const input = JSON.parse(Buffer.from(process.argv[2], 'base64url').toString('utf8'))
const require = createRequire(join(input.packageRoot, 'package.json'))
const vitePath = require.resolve('vite')
const { createServer } = await import(pathToFileURL(vitePath).href)
const runtimeRoot = resolve(input.runtimeRoot)
const configCandidates = ['vite.config.ts', 'vite.config.mts', 'vite.config.js', 'vite.config.mjs']
let configFile = false
for (const name of configCandidates) {
  const candidate = join(input.packageRoot, name)
  try {
    await access(candidate)
    configFile = candidate
    break
  } catch {
    // Continue to the next normal ecosystem config filename.
  }
}

let server
try {
  server = await createServer({
    root: runtimeRoot,
    configFile,
    appType: 'spa',
    clearScreen: false,
    server: {
      host: '127.0.0.1',
      port: 0,
      strictPort: false,
      fs: {
        allow: [runtimeRoot, input.sourceRoot, input.packageRoot],
      },
    },
  })
  await server.listen()
  const address = server.httpServer?.address()
  if (!address || typeof address === 'string')
    throw new Error('Vite did not expose a runtime port.')
  process.send?.({ type: 'ready', origin: `http://127.0.0.1:${address.port}` })
} catch (error) {
  process.send?.({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  await server?.close().catch(() => undefined)
  process.exit(1)
}

async function close() {
  await server?.close()
  process.exit(0)
}

process.on('message', (message) => {
  if (message?.type === 'close') void close()
})
process.once('SIGTERM', () => void close())
process.once('SIGINT', () => void close())
