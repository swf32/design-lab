import { readFile } from 'node:fs/promises'
import { dirname, extname, relative, resolve, sep } from 'node:path'
import { parse as parseModule } from '@babel/parser'
import postcss from 'postcss'
import scss from 'postcss-scss'
import { getSource } from './projectRegistry.mjs'

function isInside(path, root) {
  const value = relative(root, path)
  return value === '' || (!value.startsWith('..') && !value.split(sep).includes('..'))
}

function splitSelectors(selector) {
  return selector
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function combineSelectors(parents, children) {
  if (!parents.length) return children
  return parents.flatMap((parent) =>
    children.map((child) =>
      child.includes('&') ? child.replaceAll('&', parent) : `${parent} ${child}`,
    ),
  )
}

function flattenedSelectors(rule) {
  const ancestors = []
  let current = rule
  while (current?.type === 'rule') {
    ancestors.unshift(current)
    current = current.parent
    while (current && current.type !== 'rule' && current.type !== 'root') current = current.parent
  }
  return ancestors.reduce(
    (selectors, ancestor) => combineSelectors(selectors, splitSelectors(ancestor.selector)),
    [],
  )
}

function indent(text, depth = 1) {
  const prefix = '  '.repeat(depth)
  return text
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n')
}

function sourceNodeText(node, source) {
  const start = node.source?.start?.offset
  const end = node.source?.end?.offset
  if (typeof start !== 'number' || typeof end !== 'number') return node.toString()
  const afterEnd = source[end + 1] === ';' ? end + 2 : end + 1
  return source.slice(start, afterEnd).trim()
}

function ownRuleBody(rule, source) {
  return rule.nodes
    .filter(
      (node) =>
        node.type === 'decl' ||
        (node.type === 'atrule' && !node.nodes) ||
        (node.type === 'comment' && node.text.trim()),
    )
    .map((node) => sourceNodeText(node, source))
    .join('\n')
}

function authoredRuleCode(rule, prelude, source) {
  let code = `${rule.selector} {\n${indent(ownRuleBody(rule, source))}\n}`
  let parent = rule.parent
  while (parent && parent.type !== 'root') {
    if (parent.type === 'rule') code = `${parent.selector} {\n${indent(code)}\n}`
    else if (parent.type === 'atrule')
      code = `@${parent.name}${parent.params ? ` ${parent.params}` : ''} {\n${indent(code)}\n}`
    parent = parent.parent
  }
  return prelude ? `${prelude}\n\n${code}` : code
}

export function parseAuthoredStyles(source, file = 'styles.scss') {
  const root = postcss.parse(source, { from: file, parser: scss })
  const prelude = root.nodes
    .filter(
      (node) =>
        node.type === 'atrule' && ['use', 'forward', 'import'].includes(node.name.toLowerCase()),
    )
    .map((node) => sourceNodeText(node, source))
    .join('\n')
  const rules = []
  root.walkRules((rule) => {
    const selectors = flattenedSelectors(rule)
    if (!selectors.length || !ownRuleBody(rule, source).trim()) return
    const conditions = []
    let parent = rule.parent
    while (parent && parent.type !== 'root') {
      if (parent.type === 'atrule' && ['media', 'supports'].includes(parent.name))
        conditions.unshift({ kind: parent.name, value: parent.params })
      parent = parent.parent
    }
    rules.push({
      selectors,
      conditions,
      code: authoredRuleCode(rule, prelude, source),
      line: rule.source?.start?.line ?? 1,
    })
  })
  return rules
}

async function importedStyleFiles(entryPath) {
  const source = await readFile(entryPath, 'utf8')
  const document = parseModule(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'importAttributes'],
  })
  return document.program.body
    .filter(
      (statement) =>
        statement.type === 'ImportDeclaration' &&
        typeof statement.source.value === 'string' &&
        ['.css', '.scss'].includes(extname(statement.source.value)),
    )
    .map((statement) => resolve(dirname(entryPath), statement.source.value))
}

export async function getAuthoredStyles(sourceId, sourceFile) {
  const source = await getSource(sourceId)
  const entryPath = resolve(source.path, sourceFile)
  if (!isInside(entryPath, resolve(source.path)))
    throw Object.assign(new Error('Inspection source must stay inside its Design Lab source'), {
      status: 400,
      code: 'INSPECTION_SOURCE_INVALID',
    })
  const styleFiles = await importedStyleFiles(entryPath)
  const styles = []
  for (const stylePath of styleFiles) {
    if (!isInside(stylePath, resolve(source.path))) continue
    const authored = await readFile(stylePath, 'utf8')
    styles.push({
      file: relative(source.path, stylePath).split(sep).join('/'),
      rules: parseAuthoredStyles(authored, stylePath),
    })
  }
  return { sourceId, sourceFile, styles }
}
