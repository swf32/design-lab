import { readFile, readdir, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import scss from 'postcss-scss'

const workspaceRoot = resolve(import.meta.dirname, '..')
const applicationStyles = join(workspaceRoot, 'design-lab', 'src')
const baselinePath = join(import.meta.dirname, 'app-visual-style-baseline.jsonl')
const visualProperty =
  /^(?:color|background(?:-.+)?|border(?:-.+)?|outline(?:-.+)?|box-shadow|text-shadow|font(?:-.+)?|letter-spacing|line-height|text-transform|transition(?:-.+)?|opacity|fill|stroke|caret-color|accent-color|--(?:color|typography|surface|corner|shadow|transition|motion)(?:-.+)?)$/

async function styleFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await styleFiles(path)))
    else if (
      ['.css', '.scss'].includes(extname(entry.name)) &&
      path !== join(applicationStyles, 'styles', 'default-skin.css')
    )
      files.push(path)
  }
  return files
}

async function inventory() {
  const declarations = []
  for (const path of await styleFiles(applicationStyles)) {
    const tree = scss.parse(await readFile(path, 'utf8'), { from: path })
    tree.walkDecls((declaration) => {
      if (!visualProperty.test(declaration.prop.toLowerCase())) return
      const context = []
      let parent = declaration.parent
      while (parent && parent.type !== 'root') {
        if (parent.type === 'rule') context.unshift(parent.selector)
        else if (parent.type === 'atrule') context.unshift(`@${parent.name} ${parent.params}`)
        parent = parent.parent
      }
      declarations.push([
        relative(workspaceRoot, path).replaceAll('\\', '/'),
        context.join(' > '),
        declaration.prop.toLowerCase(),
        declaration.value,
      ])
    })
  }
  return declarations.sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  )
}

const current = await inventory()
if (process.argv.includes('--write-baseline')) {
  await writeFile(baselinePath, `${current.map((item) => JSON.stringify(item)).join('\n')}\n`)
  console.log(`Recorded ${current.length} existing app-local visual declarations.`)
} else {
  const previous = (await readFile(baselinePath, 'utf8'))
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line))
  const allowance = new Map()
  for (const item of previous) {
    const key = JSON.stringify(item)
    allowance.set(key, (allowance.get(key) ?? 0) + 1)
  }
  const additions = []
  for (const item of current) {
    const key = JSON.stringify(item)
    const remaining = allowance.get(key) ?? 0
    if (remaining > 0) allowance.set(key, remaining - 1)
    else additions.push(item)
  }
  if (additions.length) {
    console.error('New visual declarations belong in design-lab-system Components or tokens:')
    for (const [file, context, property, value] of additions)
      console.error(`- ${file} · ${context} · ${property}: ${value}`)
    process.exitCode = 1
  } else {
    console.log(
      `No new app-local visual declarations (${current.length} existing baseline entries).`,
    )
  }
}
