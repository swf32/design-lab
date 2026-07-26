import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readTokenCatalog } from '../../../design-lab/server/services/tokenCatalog.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const catalog = await readTokenCatalog(root)

function cssValue(value) {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value === null) return ''
  return JSON.stringify(value)
}

function declarations(mode) {
  return catalog.tokens.map(
    (token) =>
      `  --${token.path.replaceAll('.', '-')}: ${cssValue(token.values[mode] ?? token.value)};`,
  )
}

const defaultMode = catalog.modes.includes('dark') ? 'dark' : catalog.modes[0]
const blocks = [
  `:root, [data-theme="${defaultMode}"] {\n${declarations(defaultMode).join('\n')}\n}`,
]
for (const mode of catalog.modes)
  if (mode !== defaultMode)
    blocks.push(`[data-theme="${mode}"] {\n${declarations(mode).join('\n')}\n}`)

const target = resolve(root, 'tokens/generated/tokens.css')
await mkdir(dirname(target), { recursive: true })
await writeFile(target, `/* Generated from canonical token documents. */\n${blocks.join('\n\n')}\n`)
