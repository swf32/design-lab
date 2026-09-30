import { readFile, readdir, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { parse } from '@babel/parser'

const workspaceRoot = resolve(import.meta.dirname, '..')
const applicationSource = join(workspaceRoot, 'design-lab', 'src')
const baselinePath = join(import.meta.dirname, 'app-inline-style-baseline.jsonl')
const visualProperty =
  /^(?:color|background(?:-.+)?|border(?:-.+)?|outline(?:-.+)?|box-shadow|text-shadow|font(?:-.+)?|letter-spacing|line-height|text-transform|transition(?:-.+)?|opacity|fill|stroke|caret-color|accent-color|--(?:color|typography|surface|corner|shadow|transition|motion)(?:-.+)?)$/

function propertyName(node) {
  if (!node) return null
  if (node.type === 'Identifier') return node.name
  if (node.type === 'StringLiteral') return node.value
  return null
}

function cssProperty(name) {
  return name?.startsWith('--')
    ? name
    : name?.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function unwrap(node) {
  while (
    node &&
    ['TSAsExpression', 'TSSatisfiesExpression', 'ParenthesizedExpression'].includes(node.type)
  )
    node = node.expression
  return node
}

function jsxName(node) {
  if (node?.type === 'JSXIdentifier') return node.name
  if (node?.type === 'JSXMemberExpression')
    return `${jsxName(node.object)}.${jsxName(node.property)}`
  return 'unknown'
}

function compact(source, node) {
  return source.slice(node.start, node.end).replace(/\s+/g, ' ').trim()
}

function isCssProperties(node) {
  if (node?.type === 'TSTypeAnnotation') return isCssProperties(node.typeAnnotation)
  if (node?.type !== 'TSTypeReference') return false
  return (
    (node.typeName.type === 'Identifier' && node.typeName.name === 'CSSProperties') ||
    (node.typeName.type === 'TSQualifiedName' && node.typeName.right.name === 'CSSProperties')
  )
}

export function collectInlineVisualStyles(source, file) {
  const tree = parse(source, { sourceType: 'unambiguous', plugins: ['typescript', 'jsx'] })
  const declarations = []
  const visitedObjects = new WeakSet()
  const addObject = (object, context) => {
    object = unwrap(object)
    if (object?.type !== 'ObjectExpression' || visitedObjects.has(object)) return
    visitedObjects.add(object)
    for (const property of object.properties) {
      if (property.type !== 'ObjectProperty' || property.computed) continue
      const name = cssProperty(propertyName(property.key))
      if (name && visualProperty.test(name))
        declarations.push([file, context, name, compact(source, property.value)])
    }
  }
  const visit = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'JSXOpeningElement') {
      for (const attribute of node.attributes) {
        if (attribute.type === 'JSXAttribute' && attribute.name.name === 'style')
          addObject(attribute.value?.expression, `<${jsxName(node.name)}>`)
      }
    } else if (node.type === 'VariableDeclarator' && isCssProperties(node.id.typeAnnotation)) {
      addObject(node.init, `CSSProperties ${propertyName(node.id) ?? 'variable'}`)
    } else if (node.type === 'TSAsExpression' && isCssProperties(node.typeAnnotation)) {
      addObject(node.expression, 'CSSProperties expression')
    } else if (node.type === 'AssignmentExpression' && node.operator === '=') {
      const left = node.left
      if (
        left.type === 'MemberExpression' &&
        left.object.type === 'MemberExpression' &&
        propertyName(left.object.property) === 'style'
      ) {
        const name = cssProperty(propertyName(left.property))
        if (name && visualProperty.test(name))
          declarations.push([file, 'DOM style assignment', name, compact(source, node.right)])
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc' || key === 'extra' || key === 'tokens' || key === 'comments') continue
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object') visit(value)
    }
  }
  visit(tree.program)
  return declarations
}

async function sourceFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)))
    else if (['.ts', '.tsx'].includes(extname(entry.name))) files.push(path)
  }
  return files
}

async function inventory() {
  const declarations = []
  for (const path of await sourceFiles(applicationSource)) {
    const file = relative(workspaceRoot, path).replaceAll('\\', '/')
    declarations.push(...collectInlineVisualStyles(await readFile(path, 'utf8'), file))
  }
  return declarations.sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  )
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const current = await inventory()
  if (process.argv.includes('--write-baseline')) {
    await writeFile(baselinePath, `${current.map((item) => JSON.stringify(item)).join('\n')}\n`)
    console.log(`Recorded ${current.length} existing app-local inline visual declarations.`)
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
    const additions = current.filter((item) => {
      const key = JSON.stringify(item)
      const remaining = allowance.get(key) ?? 0
      if (remaining > 0) allowance.set(key, remaining - 1)
      else return true
      return false
    })
    if (additions.length) {
      console.error(
        'New inline visual declarations belong in design-lab-system Components or tokens:',
      )
      for (const [file, context, property, value] of additions)
        console.error(`- ${file} · ${context} · ${property}: ${value}`)
      process.exitCode = 1
    } else {
      console.log(
        `No new app-local inline visual declarations (${current.length} baseline entries).`,
      )
    }
  }
}
