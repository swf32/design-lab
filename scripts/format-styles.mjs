import { readdir, readFile, writeFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import process from 'node:process'
import postcss from 'postcss'
import * as prettier from 'prettier'

const root = process.cwd()
const mode = process.argv.includes('--check') ? 'check' : 'write'
const styleRoots = [
  join(root, 'design-lab/src'),
  join(root, 'libraries/design-lab-system/components'),
]

async function filesUnder(directory, predicate, result = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await filesUnder(path, predicate, result)
    else if (predicate(path)) result.push(path)
  }
  return result
}

const prettierConfig = {
  ...(await prettier.resolveConfig(root)),
  printWidth: 100,
  singleQuote: true,
}

async function formatScss(source, filepath) {
  return prettier.format(source, {
    ...prettierConfig,
    filepath,
    parser: 'scss',
  })
}

async function formatPreviewStyles(source, filepath) {
  const match = previewStylesMatch(source, filepath)
  const result = match.result
  const formatted = (await formatScss(result[2], `${filepath}.scss`)).trimEnd()
  return `${source.slice(0, result.index)}${result[1]}${formatted}${result[3]}${source.slice(result.index + result[0].length)}`
}

function previewStylesMatch(source, filepath) {
  const pattern = /(const previewStyles = String\.raw`\n)([\s\S]*?)(\n`)/m
  const result = pattern.exec(source)
  if (!result)
    throw new Error(`Missing previewStyles String.raw block: ${relative(root, filepath)}`)
  return { pattern, result }
}

function previewStyleSource(source, filepath) {
  return previewStylesMatch(source, filepath).result[2]
}

function duplicateSelectors(source, filepath) {
  const duplicates = []
  const firstSeen = new Map()
  const tree = postcss.parse(source, { from: filepath })

  tree.walkRules((rule) => {
    const ancestors = []
    let parent = rule.parent
    let insideKeyframes = false

    while (parent && parent.type !== 'root') {
      if (parent.type === 'atrule') {
        if (parent.name.endsWith('keyframes')) insideKeyframes = true
        ancestors.unshift(`@${parent.name} ${parent.params}`)
      } else if (parent.type === 'rule') {
        ancestors.unshift(parent.selector)
      }
      parent = parent.parent
    }

    if (insideKeyframes) return

    const key = `${ancestors.join(' > ')}\u0000${rule.selector}`
    const line = rule.source?.start?.line ?? 1
    const firstLine = firstSeen.get(key)
    if (firstLine) {
      duplicates.push({
        path: relative(root, filepath),
        selector: rule.selector,
        firstLine,
        line,
      })
    } else {
      firstSeen.set(key, line)
    }
  })

  return duplicates
}

const scssFiles = []
const previewFiles = []
for (const directory of styleRoots) {
  await filesUnder(directory, (path) => extname(path) === '.scss', scssFiles)
  await filesUnder(directory, (path) => path.endsWith('.preview.tsx'), previewFiles)
}

const changed = []
const duplicates = []
for (const filepath of [...scssFiles, ...previewFiles].sort()) {
  const source = await readFile(filepath, 'utf8')
  const formatted = filepath.endsWith('.scss')
    ? await formatScss(source, filepath)
    : await formatPreviewStyles(source, filepath)
  const styleSource = filepath.endsWith('.scss')
    ? formatted
    : previewStyleSource(formatted, filepath)
  duplicates.push(...duplicateSelectors(styleSource, filepath))
  if (source === formatted) continue
  changed.push(relative(root, filepath))
  if (mode === 'write') await writeFile(filepath, formatted)
}

if (duplicates.length) {
  console.error(`Duplicate selectors found in ${duplicates.length} location(s):`)
  duplicates.forEach(({ path, selector, firstLine, line }) =>
    console.error(`- ${path}:${line} duplicates "${selector}" from line ${firstLine}`),
  )
  process.exitCode = 1
}

if (mode === 'check' && changed.length) {
  console.error(`Style formatting required in ${changed.length} file(s):`)
  changed.forEach((path) => console.error(`- ${path}`))
  process.exitCode = 1
}

if (!duplicates.length && (mode === 'write' || !changed.length)) {
  console.log(
    mode === 'write'
      ? `Formatted ${changed.length} of ${scssFiles.length + previewFiles.length} style source files.`
      : `Checked ${scssFiles.length + previewFiles.length} style source files.`,
  )
}
