import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readTokenCatalog } from 'design-lab/server/services/tokenCatalog.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const target = resolve(root, 'tokens/generated/tokens.css')

function cssValue(value) {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value === null) return ''
  return JSON.stringify(value)
}

function declarations(catalog, mode) {
  return catalog.tokens.map(
    (token) =>
      `  --${token.path.replaceAll('.', '-')}: ${cssValue(token.values[mode] ?? token.value)};`,
  )
}

async function syncTokens() {
  const catalog = await readTokenCatalog(root)
  const defaultMode = catalog.modes.includes('dark') ? 'dark' : catalog.modes[0]
  const blocks = [
    `:root, [data-theme="${defaultMode}"] {\n${declarations(catalog, defaultMode).join('\n')}\n}`,
  ]
  for (const mode of catalog.modes)
    if (mode !== defaultMode)
      blocks.push(`[data-theme="${mode}"] {\n${declarations(catalog, mode).join('\n')}\n}`)
  const expected = `/* Generated from canonical token documents. */\n${blocks.join('\n\n')}\n`
  const current = await readFile(target, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return null
    throw error
  })
  if (current === expected) return
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, expected)
  console.log('Generated tokens/generated/tokens.css from canonical token documents.')
}

await syncTokens()

if (process.argv.includes('--watch')) {
  let syncing = false
  const interval = setInterval(async () => {
    if (syncing) return
    syncing = true
    try {
      await syncTokens()
    } catch (error) {
      console.error(error)
    } finally {
      syncing = false
    }
  }, 750)
  const close = () => clearInterval(interval)
  process.on('SIGINT', close)
  process.on('SIGTERM', close)
  console.log('Polling token documents for generated CSS updates.')
}
