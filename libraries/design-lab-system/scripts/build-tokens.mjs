import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const source = JSON.parse(await readFile(resolve(root, 'tokens/base.tokens.json'), 'utf8'))

function declarations(group, path = [], result = []) {
  for (const [key, value] of Object.entries(group ?? {})) {
    const next = [...path, key]
    if (value && typeof value === 'object' && Object.hasOwn(value, 'value'))
      result.push(`  --${next.join('-')}: ${value.value};`)
    else if (value && typeof value === 'object') declarations(value, next, result)
  }
  return result
}

const blocks = [`:root, [data-theme="dark"] {\n${declarations(source.tokens).join('\n')}\n}`]
for (const [theme, definition] of Object.entries(source.themes ?? {}))
  blocks.push(`[data-theme="${theme}"] {\n${declarations(definition.tokens).join('\n')}\n}`)

const target = resolve(root, 'tokens/generated/tokens.css')
await mkdir(dirname(target), { recursive: true })
await writeFile(target, `/* Generated from tokens/base.tokens.json. */\n${blocks.join('\n\n')}\n`)
