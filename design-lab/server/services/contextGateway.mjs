import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, relative } from 'node:path'
import { randomUUID } from 'node:crypto'
import { getModuleEntities } from './moduleEntities.mjs'
import { getSource, listSources } from './projectRegistry.mjs'

export const CONTEXT_INDEX_VERSION = 1
export const CONTEXT_KINDS = [
  'component',
  'token',
  'asset',
  'font',
  'rule',
  'decision',
  'prompt',
  'doc',
]

const knowledgeDirectories = {
  rule: 'rules',
  decision: 'decisions',
  prompt: 'prompts',
  doc: 'docs',
}

const searchStopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'between',
  'by',
  'for',
  'from',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'the',
  'to',
  'using',
  'with',
  'без',
  'в',
  'для',
  'и',
  'из',
  'или',
  'как',
  'между',
  'на',
  'по',
  'с',
  'со',
  'что',
  'это',
])

function compactWhitespace(value = '') {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripMarkdown(value = '') {
  return compactWhitespace(
    String(value ?? '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[*_>|~-]/g, ' '),
  )
}

function markdownLead(markdown = '') {
  const withoutCode = String(markdown ?? '').replace(/```[\s\S]*?```/g, '')
  const blocks = withoutCode
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
  const lead = blocks.find(
    (block) =>
      !block.startsWith('#') &&
      !block.startsWith('|') &&
      !block.startsWith('- ') &&
      !block.startsWith('* ') &&
      !block.startsWith('>') &&
      !/^\d+\.\s/.test(block),
  )
  return stripMarkdown(lead ?? '')
}

function markdownTitle(markdown, fallback) {
  const match = String(markdown ?? '').match(/^#\s+(.+)$/m)
  return compactWhitespace(match?.[1] ?? fallback)
}

function entityRef(sourceId, kind, id) {
  return `${sourceId}:${kind}:${id}`
}

function componentImport(source, sourceManifest, component) {
  const symbol = basename(component.entry ?? component.name, extname(component.entry ?? ''))
  const from =
    component.importFrom ??
    sourceManifest.componentImport ??
    (source.kind === 'library' && sourceManifest.packageName
      ? `${sourceManifest.packageName}/components`
      : `./components/${component.directory}/${symbol}`)
  return { symbol, from, statement: `import { ${symbol} } from '${from}'` }
}

function assetImport(sourceManifest, asset) {
  if (asset.type !== 'icon' || asset.extension !== 'tsx') return null
  const symbol = basename(asset.name, extname(asset.name))
  const from =
    sourceManifest.iconImport ??
    (sourceManifest.packageName ? `${sourceManifest.packageName}/icons` : null)
  return from ? { symbol, from, statement: `import { ${symbol} } from '${from}'` } : null
}

async function readSourceManifest(source) {
  const filename = source.kind === 'library' ? 'library.json' : 'project.json'
  try {
    return JSON.parse(await readFile(join(source.path, filename), 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return {}
    throw error
  }
}

async function markdownFiles(root, current = root, result = []) {
  let entries = []
  try {
    entries = await readdir(current, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return result
    throw error
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const path = join(current, entry.name)
    if (entry.isDirectory()) await markdownFiles(root, path, result)
    else if (entry.name.toLowerCase().endsWith('.md')) result.push(path)
  }
  return result
}

function sourceIdentity(source) {
  return { id: source.id, name: source.name, kind: source.kind }
}

async function componentEntities(source, sourceManifest) {
  const data = await getModuleEntities(source.id, 'components')
  return data.components.map((component) => {
    const description =
      compactWhitespace(component.description) ||
      markdownLead(component.documentation) ||
      `Reusable ${component.name} interface component.`
    const directory = `components/${component.directory}`
    return {
      ref: entityRef(source.id, 'component', component.id),
      id: component.id,
      kind: 'component',
      source: sourceIdentity(source),
      name: component.name,
      description,
      path: directory,
      status: component.status ?? null,
      tags: [
        ...new Set(
          [
            component.category,
            ...(component.tags ?? []),
            ...(component.aliases ?? []),
            ...(component.useWhen ?? []),
            ...(component.variants ?? []),
            ...(component.states ?? []),
            ...Object.keys(component.props ?? {}),
          ].filter(Boolean),
        ),
      ],
      search: {
        aliases: component.aliases ?? [],
        useWhen: component.useWhen ?? [],
        avoidWhen: component.avoidWhen ?? [],
        props: Object.keys(component.props ?? {}),
        variants: component.variants ?? [],
        states: component.states ?? [],
      },
      details: {
        import: component.entry
          ? (component.import ?? componentImport(source, sourceManifest, component))
          : null,
        files: component.files ?? [],
        relations: component.relations ?? {
          uses: [],
          usedBy: [],
          examplesUse: [],
          usedInExamplesBy: [],
          diagnostics: [],
        },
        entry: component.entry ? join(directory, component.entry) : null,
        style: component.style ? join(directory, component.style) : null,
        manifest: join(directory, 'component.json'),
        playground: component.playground ? join(directory, component.playground) : null,
        preview: component.preview ? join(directory, component.preview) : null,
        stories: component.stories ? join(directory, component.stories) : null,
        docs: component.docs ? join(directory, component.docs) : null,
        changelog: component.changelog ? join(directory, component.changelog) : null,
        props: component.props ?? {},
        variants: component.variants ?? [],
        states: component.states ?? [],
        documentation: component.documentation ?? null,
        changelogDocumentation: component.changelogDocumentation ?? null,
      },
    }
  })
}

async function tokenEntities(source) {
  const data = await getModuleEntities(source.id, 'tokens')
  return data.tokens.map((token) => ({
    ref: entityRef(source.id, 'token', token.id),
    id: token.id,
    kind: 'token',
    source: sourceIdentity(source),
    name: token.path,
    description:
      compactWhitespace(token.description) ||
      `${token.type} design token with resolved values for ${Object.keys(token.values ?? {}).join(', ')}.`,
    path: `tokens/${token.file}`,
    status: null,
    tags: [token.type, ...token.path.split('.'), ...(token.tags ?? [])],
    search: {
      aliases: token.aliases ?? [],
      useWhen: token.useWhen ?? [],
      avoidWhen: token.avoidWhen ?? [],
      type: token.type,
      values: token.values,
    },
    details: token,
  }))
}

async function assetEntities(source, sourceManifest) {
  const data = await getModuleEntities(source.id, 'assets')
  return data.assets.map((asset) => ({
    ref: entityRef(source.id, 'asset', asset.id),
    id: asset.id,
    kind: 'asset',
    source: sourceIdentity(source),
    name: asset.name,
    description:
      compactWhitespace(asset.description) ||
      `${asset.type} asset stored in ${asset.directory || 'the assets root'} as ${asset.extension.toUpperCase()}.`,
    path: `assets/${asset.path}`,
    status: null,
    tags: [
      asset.type,
      asset.extension,
      ...asset.directory.split('/').filter(Boolean),
      ...(asset.tags ?? []),
    ],
    search: {
      aliases: asset.aliases ?? [],
      useWhen: asset.useWhen ?? [],
      avoidWhen: asset.avoidWhen ?? [],
    },
    details: { ...asset, import: assetImport(sourceManifest, asset) },
  }))
}

async function fontEntities(source) {
  const data = await getModuleEntities(source.id, 'fonts')
  return (data.families ?? []).map((font) => ({
    ref: entityRef(source.id, 'font', font.id),
    id: font.id,
    kind: 'font',
    source: sourceIdentity(source),
    name: font.name,
    description:
      compactWhitespace(font.description) ||
      `Font family ${font.name} with ${(font.styles ?? []).length} registered style${(font.styles ?? []).length === 1 ? '' : 's'}.`,
    path: font.source ? `fonts/${font.source}` : 'fonts/fonts.json',
    status: null,
    tags: [
      'typography',
      'font',
      ...(font.tags ?? []),
      ...(font.styles ?? []).flatMap((style) => [String(style.weight), style.style]),
    ],
    search: {
      aliases: font.aliases ?? [],
      useWhen: font.useWhen ?? [],
      avoidWhen: font.avoidWhen ?? [],
    },
    details: font,
  }))
}

async function knowledgeEntities(source, kind) {
  const directory = knowledgeDirectories[kind]
  const root = join(source.path, directory)
  const files = await markdownFiles(root)
  return Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, 'utf8')
      const path = relative(source.path, file)
      const id = relative(root, file).replace(/\.md$/i, '')
      return {
        ref: entityRef(source.id, kind, id),
        id,
        kind,
        source: sourceIdentity(source),
        name: markdownTitle(content, basename(file, extname(file))),
        description: markdownLead(content) || `${kind} knowledge document.`,
        path,
        status: null,
        tags: [
          kind,
          ...dirname(id)
            .split('/')
            .filter((part) => part !== '.'),
        ],
        search: {},
        details: { content },
      }
    }),
  )
}

async function entitiesForSource(source, kinds) {
  const sourceManifest = await readSourceManifest(source)
  const jobs = []
  if (kinds.has('component')) jobs.push(componentEntities(source, sourceManifest))
  if (kinds.has('token')) jobs.push(tokenEntities(source))
  if (kinds.has('asset')) jobs.push(assetEntities(source, sourceManifest))
  if (kinds.has('font')) jobs.push(fontEntities(source))
  for (const kind of Object.keys(knowledgeDirectories)) {
    if (kinds.has(kind)) jobs.push(knowledgeEntities(source, kind))
  }
  return (await Promise.all(jobs)).flat()
}

export async function buildContextCatalog({ sourceId, kinds = CONTEXT_KINDS } = {}) {
  const selectedKinds = new Set(kinds.filter((kind) => CONTEXT_KINDS.includes(kind)))
  const sources = sourceId
    ? [await getSource(sourceId)]
    : (await listSources()).sources.filter((source) => source.available)
  const entities = (
    await Promise.all(sources.map((source) => entitiesForSource(source, selectedKinds)))
  ).flat()
  entities.sort(
    (a, b) =>
      a.source.name.localeCompare(b.source.name) ||
      a.kind.localeCompare(b.kind) ||
      a.path.localeCompare(b.path),
  )
  return {
    schemaVersion: CONTEXT_INDEX_VERSION,
    generatedFrom: 'canonical Design Lab filesystem sources',
    sources: sources.map(sourceIdentity),
    entities: entities.map((entity, index) => ({ index: index + 1, ...entity })),
  }
}

function normalize(value = '') {
  return String(value ?? '')
    .replace(/([\p{Ll}\d])([\p{Lu}])/gu, '$1 $2')
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function tokens(value) {
  return [
    ...new Set(
      normalize(value)
        .split(/\s+/)
        .filter((token) => token.length > 1 && !searchStopWords.has(token)),
    ),
  ]
}

function dice(a, b) {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0
  const pairs = new Map()
  for (let index = 0; index < a.length - 1; index += 1) {
    const pair = a.slice(index, index + 2)
    pairs.set(pair, (pairs.get(pair) ?? 0) + 1)
  }
  let overlap = 0
  for (let index = 0; index < b.length - 1; index += 1) {
    const pair = b.slice(index, index + 2)
    const count = pairs.get(pair) ?? 0
    if (count > 0) {
      pairs.set(pair, count - 1)
      overlap += 1
    }
  }
  return (2 * overlap) / (a.length + b.length - 2)
}

function bestTokenMatch(queryToken, fieldTokens) {
  let best = 0
  for (const fieldToken of fieldTokens) {
    if (fieldToken === queryToken) return 1
    if (fieldToken.startsWith(queryToken) || queryToken.startsWith(fieldToken))
      best = Math.max(best, 0.86)
    else {
      const similarity = dice(queryToken, fieldToken)
      if (similarity >= 0.62) best = Math.max(best, similarity)
    }
  }
  return best
}

function relevance(entity, query) {
  const queryTokens = tokens(query)
  if (!queryTokens.length) return { score: 0, matchedOn: [] }
  const fields = [
    ['description', entity.description, 1],
    ['useWhen', (entity.search.useWhen ?? []).join(' '), 0.95],
    ['aliases', (entity.search.aliases ?? []).join(' '), 0.85],
    ['tags', entity.tags.join(' '), 0.72],
    ['props', (entity.search.props ?? []).join(' '), 0.58],
    ['variants', (entity.search.variants ?? []).join(' '), 0.42],
    ['type', entity.search.type, 0.4],
    ['values', JSON.stringify(entity.search.values ?? ''), 0.24],
    ['name', entity.name, 0.22],
  ]
  let weighted = 0
  let coverage = 0
  const matchedOn = new Set()
  for (const queryToken of queryTokens) {
    let best = 0
    let bestField = null
    for (const [field, value, weight] of fields) {
      const match = bestTokenMatch(queryToken, tokens(String(value ?? ''))) * weight
      if (match > best) {
        best = match
        bestField = field
      }
    }
    weighted += best
    if (best >= 0.45) {
      coverage += 1
      matchedOn.add(bestField)
    }
  }
  const normalizedQuery = normalize(query)
  const phraseBonus = normalize(entity.description).includes(normalizedQuery) ? 0.18 : 0
  const average = weighted / queryTokens.length
  const coverageRatio = coverage / queryTokens.length
  const avoidTokens = tokens((entity.search.avoidWhen ?? []).join(' '))
  const avoidPenalty = avoidTokens.length
    ? (queryTokens.reduce(
        (total, queryToken) => total + bestTokenMatch(queryToken, avoidTokens),
        0,
      ) /
        queryTokens.length) *
      0.42
    : 0
  return {
    score: Math.max(
      0,
      Math.min(1, average * 0.72 + coverageRatio * 0.22 + phraseBonus) - avoidPenalty,
    ),
    matchedOn: [...matchedOn],
  }
}

export async function searchContext({ query, sourceId, kinds = CONTEXT_KINDS, limit = 8 } = {}) {
  const catalog = await buildContextCatalog({ sourceId, kinds })
  const results = catalog.entities
    .map((entity) => ({ entity, ...relevance(entity, query ?? '') }))
    .filter((result) => result.score >= 0.12)
    .sort((a, b) => b.score - a.score || a.entity.index - b.entity.index)
    .slice(0, Math.max(1, Math.min(Number(limit) || 8, 25)))
    .map(({ entity, score, matchedOn }) => ({
      index: entity.index,
      ref: entity.ref,
      kind: entity.kind,
      source: entity.source,
      description: entity.description,
      relevance: Number(score.toFixed(3)),
      matchedOn,
    }))
  return {
    query,
    retrieval: 'weighted lexical + fuzzy fallback',
    namesHidden: true,
    resultCount: results.length,
    results,
  }
}

export async function getContextEntity({ ref, index, sourceId, kinds = CONTEXT_KINDS } = {}) {
  const catalog = await buildContextCatalog({ sourceId, kinds })
  const entity = ref
    ? catalog.entities.find((candidate) => candidate.ref === ref)
    : catalog.entities.find((candidate) => candidate.index === Number(index))
  if (!entity) {
    throw Object.assign(new Error(`Context entity not found: ${ref ?? `#${index}`}`), {
      status: 404,
      code: 'CONTEXT_ENTITY_NOT_FOUND',
    })
  }
  return entity
}

export async function writeContextIndex({ sourceId } = {}) {
  if (!sourceId)
    throw Object.assign(new Error('sourceId is required to write an index'), {
      status: 400,
      code: 'SOURCE_REQUIRED',
    })
  const source = await getSource(sourceId)
  const catalog = await buildContextCatalog({ sourceId })
  const directory = join(source.path, '.designlab', 'index')
  const target = join(directory, `context.v${CONTEXT_INDEX_VERSION}.json`)
  const temporary = `${target}.${randomUUID()}.tmp`
  await mkdir(directory, { recursive: true })
  await writeFile(
    temporary,
    `${JSON.stringify({ ...catalog, builtAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  )
  await rename(temporary, target)
  return {
    source: sourceIdentity(source),
    path: relative(source.path, target),
    entities: catalog.entities.length,
  }
}
