import { access, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const libraryRoot = fileURLToPath(new URL('..', import.meta.url))
const componentsRoot = join(libraryRoot, 'components')
const outputPath = join(componentsRoot, 'index.ts')
const mode = process.argv.includes('--check')
  ? 'check'
  : process.argv.includes('--watch')
    ? 'watch'
    : 'write'

async function manifestsUnder(directory, result = []) {
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await manifestsUnder(path, result)
    else if (entry.name === 'component.json') result.push(path)
  }
  return result
}

function assertAdjacentPath(componentDirectory, candidate, label) {
  if (!candidate || typeof candidate !== 'string') {
    throw new Error(`${label} must be a non-empty string in ${componentDirectory}/component.json`)
  }
  const resolved = resolve(componentDirectory, candidate)
  if (!resolved.startsWith(`${resolve(componentDirectory)}${sep}`)) {
    throw new Error(`${label} must stay adjacent to its component: ${candidate}`)
  }
  return resolved
}

async function generatedSource() {
  const manifests = await manifestsUnder(componentsRoot)
  const exports = []

  for (const manifestPath of manifests) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    const componentDirectory = dirname(manifestPath)
    const entryPath = assertAdjacentPath(componentDirectory, manifest.entry, 'entry')
    await access(entryPath)
    const exportPath = relative(componentsRoot, entryPath)
      .slice(0, -extname(entryPath).length)
      .split(sep)
      .join('/')
    exports.push(`export * from './${exportPath}'`)
  }

  exports.sort((left, right) => left.localeCompare(right))
  return ['// Generated from component.json manifests. Do not edit by hand.', ...exports, ''].join(
    '\n',
  )
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
    if (!quiet)
      console.log(`Component index is current (${expected.split('\n').length - 2} exports).`)
    return true
  }

  if (mode === 'check') {
    console.error('components/index.ts is stale. Run npm run sync:components.')
    process.exitCode = 1
    return false
  }

  await writeFile(outputPath, expected)
  if (!quiet) console.log(`Generated components/index.ts from filesystem manifests.`)
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
  console.log('Polling component manifests for generated index updates.')
}
