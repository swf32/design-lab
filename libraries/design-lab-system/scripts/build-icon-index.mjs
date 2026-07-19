import { readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const libraryRoot = fileURLToPath(new URL('..', import.meta.url))
const iconsRoot = join(libraryRoot, 'assets', 'icons')
const outputPath = join(iconsRoot, 'index.ts')
const mode = process.argv.includes('--check')
  ? 'check'
  : process.argv.includes('--watch')
    ? 'watch'
    : 'write'

async function generatedSource() {
  const entries = await readdir(iconsRoot, { withFileTypes: true })
  const exports = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith('.tsx') &&
        entry.name !== 'index.tsx' &&
        !entry.name.startsWith('.'),
    )
    .map((entry) => {
      const symbol = basename(entry.name, extname(entry.name))
      return `export { ${symbol} } from './${symbol}'`
    })
    .sort((left, right) => left.localeCompare(right))

  return [
    '// Generated from code-native icon assets. Do not edit by hand.',
    ...exports,
    "export type { IconProps } from './IconProps'",
    '',
  ].join('\n')
}

async function syncIndex({ quiet = false } = {}) {
  const expected = await generatedSource()
  let current = null
  try {
    current = await readFile(outputPath, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  if (current === expected) {
    if (!quiet) console.log(`Icon index is current (${expected.split('\n').length - 3} exports).`)
    return true
  }

  if (mode === 'check') {
    console.error('assets/icons/index.ts is stale. Run npm run sync:assets.')
    process.exitCode = 1
    return false
  }

  await writeFile(outputPath, expected)
  if (!quiet) console.log('Generated assets/icons/index.ts from filesystem icons.')
  return true
}

await syncIndex()

if (mode === 'watch') {
  let syncing = false
  const interval = setInterval(async () => {
    if (syncing) return
    syncing = true
    try {
      await syncIndex({ quiet: true })
    } catch (error) {
      console.error(error)
    } finally {
      syncing = false
    }
  }, 750)
  const close = () => clearInterval(interval)
  process.on('SIGINT', close)
  process.on('SIGTERM', close)
  console.log('Polling code-native icons for generated index updates.')
}
