import { readFile, readdir } from 'node:fs/promises'
import { basename, join, relative } from 'node:path'

const ROOT_DOCUMENT_KEYS = new Set(['defaultMode', 'name', 'schemaVersion', 'themes', 'tokens'])
const TOKEN_LEAF_ADAPTERS = [
  {
    format: 'dtcg',
    matches: (node) => Object.hasOwn(node, '$value'),
    value: (node) => node.$value,
    type: (node) => node.$type,
    description: (node) => node.$description,
  },
  {
    format: 'design-lab',
    matches: (node) => Object.hasOwn(node, 'value'),
    value: (node) => node.value,
    type: (node) => node.type,
    description: (node) => node.description,
  },
]

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function tokenFilesUnder(root, current = root, result = []) {
  let entries = []
  try {
    entries = await readdir(current, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return result
    throw error
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue
    const path = join(current, entry.name)
    if (entry.isDirectory()) await tokenFilesUnder(root, path, result)
    else if (entry.name.endsWith('.tokens.json')) result.push(path)
  }
  return result
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
}

function leafAdapter(node) {
  if (!isObject(node)) return null
  const adapter = TOKEN_LEAF_ADAPTERS.find((candidate) => candidate.matches(node))
  return adapter
    ? {
        format: adapter.format,
        value: adapter.value(node),
        type: adapter.type(node),
        description: adapter.description(node),
      }
    : null
}

function groupEntries(node, atDocumentRoot) {
  return Object.entries(node).filter(([key, value]) => {
    if (key === '$root') return true
    if (key.startsWith('$')) return false
    if (atDocumentRoot && ROOT_DOCUMENT_KEYS.has(key) && !leafAdapter(value)) return false
    return true
  })
}

function normalizeGroup(
  group,
  file,
  path = [],
  inheritedType = null,
  result = [],
  atDocumentRoot = false,
) {
  if (!isObject(group)) return result
  const groupType = group.$type ?? group.type ?? inheritedType
  for (const [key, node] of groupEntries(group, atDocumentRoot)) {
    const tokenPath = key === '$root' ? path : [...path, key]
    const adapter = leafAdapter(node)
    if (adapter) {
      if (!tokenPath.length) continue
      result.push({
        id: tokenPath.join('.'),
        path: tokenPath.join('.'),
        type: adapter.type ?? groupType ?? 'unknown',
        rawValue: adapter.value,
        description: adapter.description ?? null,
        aliases: stringArray(node.aliases),
        useWhen: stringArray(node.useWhen),
        avoidWhen: stringArray(node.avoidWhen),
        tags: stringArray(node.tags),
        file,
        format: adapter.format,
        sourceLocation: { file, path: tokenPath.join('.') },
        diagnostics: [],
      })
    } else if (isObject(node)) {
      normalizeGroup(node, file, tokenPath, groupType, result)
    }
  }
  return result
}

function documentTokenRoot(document) {
  if (isObject(document.tokens)) return document.tokens
  if (!isObject(document)) return null
  return document
}

function modeTokenRoot(definition) {
  if (!isObject(definition)) return null
  return isObject(definition.tokens) ? definition.tokens : definition
}

function diagnostic(code, message, file, extra = {}) {
  return { code, message, file, ...extra }
}

function addDiagnostic(target, item) {
  const key = `${item.code}:${item.mode ?? ''}:${item.reference ?? ''}:${item.message}`
  if (!target.some((candidate) => candidate._key === key)) target.push({ ...item, _key: key })
}

function publicDiagnostics(items) {
  return items.map(({ _key, ...item }) => item)
}

function normalizeDocument(document, file) {
  const diagnostics = []
  if (!isObject(document))
    return {
      file,
      format: 'unknown',
      defaultMode: 'default',
      explicitDefaultMode: false,
      modes: [],
      tokenCount: 0,
      diagnostics: [
        diagnostic(
          'token-format-unsupported',
          `${file} must contain a JSON object with supported token leaves.`,
          file,
        ),
      ],
      tokens: [],
    }
  const defaultMode =
    typeof document.defaultMode === 'string' && document.defaultMode
      ? document.defaultMode
      : 'default'
  const explicitDefaultMode =
    typeof document.defaultMode === 'string' && Boolean(document.defaultMode)
  const wrapped = isObject(document.tokens)
  const tokens = normalizeGroup(documentTokenRoot(document), file, [], null, [], !wrapped)
  const formats = new Set(tokens.map((token) => token.format))
  const format = formats.size === 1 ? [...formats][0] : formats.size > 1 ? 'mixed' : 'unknown'

  if (!tokens.length)
    diagnostics.push(
      diagnostic(
        'token-format-unsupported',
        `${file} does not contain supported value/type or $value/$type token leaves.`,
        file,
      ),
    )
  if (formats.size > 1)
    diagnostics.push(
      diagnostic(
        'token-format-mixed',
        `${file} mixes Design Lab and DTCG-style leaves; both were read, but one dialect per document is recommended.`,
        file,
        { severity: 'warning' },
      ),
    )

  const modeMaps = new Map()
  for (const [mode, definition] of Object.entries(
    isObject(document.themes) ? document.themes : {},
  )) {
    const modeTokens = normalizeGroup(modeTokenRoot(definition), file)
    modeMaps.set(mode, new Map(modeTokens.map((token) => [token.path, token.rawValue])))
    const basePaths = new Set(tokens.map((token) => token.path))
    for (const token of modeTokens)
      if (!basePaths.has(token.path))
        diagnostics.push(
          diagnostic(
            'token-mode-override-orphan',
            `Mode "${mode}" overrides "${token.path}", which has no base token in ${file}.`,
            file,
            { mode, path: token.path },
          ),
        )
  }

  for (const token of tokens) {
    token.mode = defaultMode
    token.rawValues = { [defaultMode]: token.rawValue }
    for (const [mode, values] of modeMaps) {
      if (values.has(token.path)) token.rawValues[mode] = values.get(token.path)
    }
  }

  return {
    file,
    format,
    defaultMode,
    explicitDefaultMode,
    modes: [...new Set([...(explicitDefaultMode ? [defaultMode] : []), ...modeMaps.keys()])],
    tokenCount: tokens.length,
    diagnostics,
    tokens,
  }
}

function referenceFrom(value) {
  if (typeof value !== 'string') return null
  const match = value.trim().match(/^\{([^{}]+)\}$/)
  return match?.[1]?.trim() || null
}

function resolveCatalogTokens(tokens, modes) {
  const byPath = new Map()
  for (const token of tokens) {
    if (!byPath.has(token.path)) byPath.set(token.path, [])
    byPath.get(token.path).push(token)
  }

  for (const [path, candidates] of byPath) {
    if (candidates.length < 2) continue
    for (const token of candidates)
      addDiagnostic(
        token.diagnostics,
        diagnostic(
          'token-path-duplicate',
          `Token path "${path}" is also declared in ${candidates
            .filter((candidate) => candidate !== token)
            .map((candidate) => candidate.file)
            .join(', ')}.`,
          token.file,
          { path },
        ),
      )
  }

  const memo = new Map()
  const resolveToken = (token, mode, stack = []) => {
    const key = `${token.file}:${token.path}:${mode}`
    if (memo.has(key)) return memo.get(key)
    const cycleAt = stack.findIndex((entry) => entry.key === key)
    if (cycleAt >= 0) {
      const cycle = [...stack.slice(cycleAt), { key, token }]
      const chain = cycle.map((entry) => entry.token.path)
      for (const entry of cycle)
        addDiagnostic(
          entry.token.diagnostics,
          diagnostic(
            'token-reference-circular',
            `Circular token reference in ${mode}: ${chain.join(' → ')}.`,
            entry.token.file,
            { mode, path: entry.token.path },
          ),
        )
      return { value: token.rawValues[mode] ?? token.rawValue, chain }
    }

    const rawValue = token.rawValues[mode] ?? token.rawValue
    const reference = referenceFrom(rawValue)
    if (!reference) {
      const resolved = { value: rawValue, chain: [] }
      memo.set(key, resolved)
      return resolved
    }

    const candidates = byPath.get(reference) ?? []
    if (candidates.length !== 1) {
      addDiagnostic(
        token.diagnostics,
        diagnostic(
          candidates.length ? 'token-reference-ambiguous' : 'token-reference-missing',
          candidates.length
            ? `Reference "${reference}" in ${mode} matches multiple token files.`
            : `Reference "${reference}" in ${mode} does not match a token.`,
          token.file,
          { mode, path: token.path, reference },
        ),
      )
      const unresolved = { value: rawValue, chain: [reference] }
      memo.set(key, unresolved)
      return unresolved
    }

    const target = candidates[0]
    if (token.type !== 'unknown' && target.type !== 'unknown' && token.type !== target.type)
      addDiagnostic(
        token.diagnostics,
        diagnostic(
          'token-reference-type-mismatch',
          `Token type ${token.type} references ${reference} with type ${target.type}.`,
          token.file,
          { mode, path: token.path, reference, severity: 'warning' },
        ),
      )
    const resolvedTarget = resolveToken(target, mode, [...stack, { key, token }])
    const resolved = {
      value: resolvedTarget.value,
      chain: [reference, ...resolvedTarget.chain],
    }
    memo.set(key, resolved)
    return resolved
  }

  return tokens.map((token) => {
    const rawValues = Object.fromEntries(
      modes.map((mode) => [mode, token.rawValues[mode] ?? token.rawValue]),
    )
    const resolvedByMode = Object.fromEntries(
      modes.map((mode) => [mode, resolveToken({ ...token, rawValues }, mode)]),
    )
    const values = Object.fromEntries(
      Object.entries(resolvedByMode).map(([mode, resolved]) => [mode, resolved.value]),
    )
    const referenceChains = Object.fromEntries(
      Object.entries(resolvedByMode).map(([mode, resolved]) => [mode, resolved.chain]),
    )
    const references = [...new Set(Object.values(rawValues).map(referenceFrom).filter(Boolean))]
    return {
      ...token,
      rawValues,
      value: values[token.mode] ?? token.rawValue,
      values,
      references,
      referenceChains,
      diagnostics: publicDiagnostics(token.diagnostics),
    }
  })
}

export async function readTokenCatalogRoots(roots) {
  const normalizedRoots = roots.map((item) =>
    typeof item === 'string'
      ? { root: item, prefix: '' }
      : { root: item.root, prefix: item.prefix ?? '' },
  )
  const fileEntries = (
    await Promise.all(
      normalizedRoots.map(async ({ root, prefix }) =>
        (await tokenFilesUnder(root)).map((filePath) => ({ filePath, root, prefix })),
      ),
    )
  )
    .flat()
    .sort((left, right) => left.filePath.localeCompare(right.filePath))
  const documents = []

  for (const { filePath, root, prefix } of fileEntries) {
    const localFile = relative(root, filePath).split('\\').join('/')
    const file = prefix ? `${prefix}/${localFile}` : localFile
    try {
      const document = JSON.parse(await readFile(filePath, 'utf8'))
      documents.push(normalizeDocument(document, file))
    } catch (error) {
      documents.push({
        file,
        format: 'invalid',
        defaultMode: 'default',
        explicitDefaultMode: false,
        modes: [],
        tokenCount: 0,
        diagnostics: [
          diagnostic(
            'token-document-parse-error',
            `${basename(filePath)} could not be parsed as JSON: ${error instanceof Error ? error.message : String(error)}`,
            file,
          ),
        ],
        tokens: [],
      })
    }
  }

  const modes = [...new Set(documents.flatMap((document) => document.modes).filter(Boolean))]
  if (!modes.length) modes.push('default')
  const defaultMode =
    documents.find((document) => document.explicitDefaultMode)?.defaultMode ?? modes[0]
  const tokens = resolveCatalogTokens(
    documents.flatMap((document) => document.tokens),
    modes,
  )
  const diagnostics = [
    ...documents.flatMap((document) => document.diagnostics),
    ...tokens.flatMap((token) => token.diagnostics),
  ]
  const publicDocuments = documents.map(({ tokens: _tokens, ...document }) => ({
    ...document,
    diagnostics: [
      ...document.diagnostics,
      ...tokens
        .filter((token) => token.file === document.file)
        .flatMap((token) => token.diagnostics),
    ],
  }))

  return {
    kind: 'tokens',
    files: publicDocuments.map((document) => document.file),
    documents: publicDocuments,
    defaultMode,
    modes,
    tokens,
    diagnostics,
  }
}

export async function readTokenCatalog(sourcePath) {
  return readTokenCatalogRoots([{ root: join(sourcePath, 'tokens'), prefix: '' }])
}
