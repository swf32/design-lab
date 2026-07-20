#!/usr/bin/env node
/**
 * One-shot migrator: klyp-front packages → libraries/klyp Design Lab contract.
 *
 * Copies implementation as-is, generates component.json markers, converts DTCG
 * tokens ($value/$type) into Design Lab tokens (value/type), and parks icons
 * under assets/. Does not rewrite React/SCSS or claim status: ready.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = join(__dirname, '..')
const klypRoot = process.env.KLYP_ROOT ?? '/Users/swf32/Documents/KlypGithub/klyp-front'
const targetRoot = join(workspaceRoot, 'libraries/klyp')

const SKIP_DIR_NAMES = new Set(['__shared', '_archive', 'node_modules', 'dist'])
const SKIP_FILE_NAMES = new Set(['index.ts', 'index.tsx', 'vite-shims.d.ts', 'heavy.ts'])

function ensureCleanDir(path) {
  if (existsSync(path)) rmSync(path, { recursive: true, force: true })
  mkdirSync(path, { recursive: true })
}

function listDirs(path) {
  if (!existsSync(path)) return []
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function listFiles(path) {
  if (!existsSync(path)) return []
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
}

function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

function kebabToPascal(name) {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

function parseRegistry(registryPath) {
  const src = readFileSync(registryPath, 'utf8')
  const entries = new Map()
  const re =
    /\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',\s*pkg:\s*'([^']+)',\s*tier:\s*'([^']+)',\s*status:\s*'([^']+)',\s*summary:\s*'((?:\\'|[^'])*)'/g
  let match
  while ((match = re.exec(src))) {
    const [, slug, name, pkg, tier, status, summary] = match
    const key = `${pkg}::${name}`
    entries.set(key, {
      slug,
      name,
      pkg,
      tier,
      status,
      summary: summary.replace(/\\'/g, "'"),
    })
  }
  return entries
}

function mapStatus(klypStatus, hasEntry) {
  if (!hasEntry) return 'wireframe'
  // Migrated code is discoverable but not Design Lab "ready" (preview contract differs).
  if (klypStatus === 'deprecated') return 'in-progress'
  return 'in-progress'
}

function pickAdjacent(files, stem, suffixes) {
  for (const suffix of suffixes) {
    const candidate = `${stem}${suffix}`
    if (files.includes(candidate)) return candidate
  }
  return null
}

function writeComponentManifest({
  directory,
  id,
  name,
  description,
  tags,
  tier,
  entry,
  stories,
  changelog,
  status,
}) {
  const manifest = {
    id,
    name,
    status,
    schemaVersion: 1,
  }
  if (description) manifest.description = description
  const mergedTags = [...new Set([...(tags ?? []), tier].filter(Boolean))]
  if (mergedTags.length) manifest.tags = mergedTags
  if (entry) manifest.entry = entry
  if (stories) manifest.stories = stories
  if (changelog) manifest.changelog = changelog
  writeFileSync(join(directory, 'component.json'), `${JSON.stringify(manifest, null, 2)}\n`)
}

function copyComponentDir(sourceDir, targetDir, { id, name, meta, categoryTags }) {
  mkdirSync(targetDir, { recursive: true })
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    if (entry.name === '_archive' || entry.name === 'node_modules') continue
    const from = join(sourceDir, entry.name)
    const to = join(targetDir, entry.name)
    cpSync(from, to, { recursive: true })
  }

  const files = listFiles(targetDir)
  const stem = name
  const entry =
    pickAdjacent(files, stem, ['.tsx', '.ts', '.jsx', '.js']) ??
    (files.includes('index.tsx') ? 'index.tsx' : files.includes('index.ts') ? 'index.ts' : null)
  const stories = pickAdjacent(files, stem, ['.stories.tsx', '.stories.ts'])
  const changelog = files.includes('CHANGELOG.md') ? 'CHANGELOG.md' : null

  writeComponentManifest({
    directory: targetDir,
    id,
    name,
    description: meta?.summary ?? null,
    tags: [...(meta?.tags ?? []), ...(categoryTags ?? [])].filter(Boolean),
    tier: meta?.tier ?? null,
    entry,
    stories,
    changelog,
    status: mapStatus(meta?.status, Boolean(entry)),
  })
}

function migratePascalComponents({ sourceRoot, targetCategory, pkg, registry, categoryTags }) {
  const migrated = []
  for (const name of listDirs(sourceRoot)) {
    if (SKIP_DIR_NAMES.has(name) || name.startsWith('.') || !/^[A-Z]/.test(name)) continue
    const sourceDir = join(sourceRoot, name)
    const files = listFiles(sourceDir)
    const hasImpl = files.some(
      (file) =>
        file === `${name}.tsx` ||
        file === `${name}.ts` ||
        file === 'index.tsx' ||
        file === 'index.ts',
    )
    if (!hasImpl && !files.includes('CHANGELOG.md')) continue

    const meta = registry.get(`${pkg}::${name}`)
    const id = meta?.slug ?? toKebab(name)
    const targetDir = join(targetRoot, 'components', targetCategory, name)
    copyComponentDir(sourceDir, targetDir, {
      id,
      name,
      meta: meta
        ? { ...meta, tags: [] }
        : { summary: null, tier: categoryTags?.[0] ?? null, status: 'beta', tags: [] },
      categoryTags,
    })
    migrated.push({ id, name, directory: relative(join(targetRoot, 'components'), targetDir) })
  }
  return migrated
}

function migrateFlatKebabPackage({ sourceDir, targetCategory, packageName }) {
  const migrated = []
  const files = listFiles(sourceDir)
  const stems = new Set()
  for (const file of files) {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue
    if (file.endsWith('.stories.tsx') || file.endsWith('.stories.ts')) continue
    if (SKIP_FILE_NAMES.has(file) || file.endsWith('.d.ts')) continue
    if (file.startsWith('use-') || file === 'types.ts' || file.startsWith('derive-')) continue
    const stem = file.replace(/\.(tsx|ts)$/, '')
    stems.add(stem)
  }

  for (const stem of stems) {
    const name = kebabToPascal(stem)
    const id = toKebab(name)
    const targetDir = join(targetRoot, 'components', targetCategory, packageName, name)
    mkdirSync(targetDir, { recursive: true })

    for (const file of files) {
      if (
        file === `${stem}.tsx` ||
        file === `${stem}.ts` ||
        file === `${stem}.scss` ||
        file === `${stem}.sass` ||
        file === `${stem}.css` ||
        file === `${stem}.stories.tsx` ||
        file === `${stem}.stories.ts`
      ) {
        cpSync(join(sourceDir, file), join(targetDir, file))
      }
    }
    if (files.includes('CHANGELOG.md')) {
      cpSync(join(sourceDir, 'CHANGELOG.md'), join(targetDir, 'CHANGELOG.md'))
    }

    const targetFiles = listFiles(targetDir)
    const entry = pickAdjacent(targetFiles, stem, ['.tsx', '.ts'])
    const stories = pickAdjacent(targetFiles, stem, ['.stories.tsx', '.stories.ts'])
    writeComponentManifest({
      directory: targetDir,
      id: `${packageName}-${id}`,
      name,
      description: `Migrated from @klyp/brand/${packageName}.`,
      tags: ['brand', packageName],
      tier: 'brand-molecule',
      entry,
      stories,
      changelog: targetFiles.includes('CHANGELOG.md') ? 'CHANGELOG.md' : null,
      status: mapStatus('beta', Boolean(entry)),
    })
    migrated.push({
      id: `${packageName}-${id}`,
      name,
      directory: relative(join(targetRoot, 'components'), targetDir),
    })
  }

  // Keep supporting non-entity files next to the package category for later wiring.
  const supportDir = join(targetRoot, 'components', targetCategory, packageName, '_lib')
  mkdirSync(supportDir, { recursive: true })
  for (const file of files) {
    if (
      stems.has(file.replace(/\.(tsx|ts|scss|sass|css|stories\.tsx|stories\.ts)$/, '')) ||
      file.endsWith('.stories.tsx') ||
      file.endsWith('.stories.ts')
    ) {
      continue
    }
    if (file === 'CHANGELOG.md') continue
    cpSync(join(sourceDir, file), join(supportDir, file))
  }
  return migrated
}

function convertDtcgNode(node) {
  if (Array.isArray(node)) return node.map(convertDtcgNode)
  if (!node || typeof node !== 'object') return node

  if (Object.hasOwn(node, '$value') || Object.hasOwn(node, 'value')) {
    const leaf = {
      type: node.$type ?? node.type ?? 'unknown',
      value: node.$value ?? node.value,
    }
    const description = node.$description ?? node.description
    if (description) leaf.description = description
    if (node.aliases) leaf.aliases = node.aliases
    if (node.useWhen) leaf.useWhen = node.useWhen
    if (node.avoidWhen) leaf.avoidWhen = node.avoidWhen
    if (node.tags) leaf.tags = node.tags
    return leaf
  }

  const out = {}
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('_') || key === '$extensions') continue
    if (key.startsWith('$') && key !== '$value' && key !== '$type' && key !== '$description')
      continue
    out[key] = convertDtcgNode(value)
  }
  return out
}

function writeTokens() {
  const sourceDir = join(klypRoot, 'packages/tokens/src')
  const targetDir = join(targetRoot, 'tokens')
  mkdirSync(targetDir, { recursive: true })

  const primitives = JSON.parse(readFileSync(join(sourceDir, 'primitives.tokens.json'), 'utf8'))
  writeFileSync(
    join(targetDir, 'primitives.tokens.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        name: 'Klyp Primitives',
        defaultMode: 'default',
        tokens: convertDtcgNode(primitives),
      },
      null,
      2,
    )}\n`,
  )

  const semantic = JSON.parse(readFileSync(join(sourceDir, 'semantic.tokens.json'), 'utf8'))
  const unreals = JSON.parse(readFileSync(join(sourceDir, 'semantic.unreals.tokens.json'), 'utf8'))
  writeFileSync(
    join(targetDir, 'semantic.tokens.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        name: 'Klyp Semantic',
        defaultMode: 'klyp',
        tokens: convertDtcgNode(semantic),
        themes: {
          unreals: {
            tokens: convertDtcgNode(unreals),
          },
        },
      },
      null,
      2,
    )}\n`,
  )
}

function writeLibraryManifests() {
  writeFileSync(
    join(targetRoot, 'library.json'),
    `${JSON.stringify(
      {
        id: 'klyp',
        kind: 'library',
        name: 'Klyp',
        schemaVersion: 1,
        version: '0.1.0',
        packageName: '@klyp/ds',
        componentImport: '@klyp/ds/components',
        iconImport: '@klyp/ds/icons',
      },
      null,
      2,
    )}\n`,
  )

  writeFileSync(
    join(targetRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: '@klyp/ds',
        version: '0.1.0',
        private: true,
        type: 'module',
        description:
          'Klyp design system mirrored into Design Lab filesystem contract (migrated from klyp-front packages).',
        peerDependencies: {
          react: '^19.2.0',
          'react-dom': '^19.2.0',
        },
        dependencies: {
          react: '^19.2.0',
        },
      },
      null,
      2,
    )}\n`,
  )
}

function copyShared() {
  // Original packages/{ui,brand}/src/**/*.tsx reference these as sibling
  // dirs/files via relative imports (e.g. '../__shared/stories-types',
  // '../_brand-context'). The migrated tree must preserve the exact same
  // relative shape one level up from each component dir — i.e. directly
  // under components/ui/ and components/brand/ — not nested any deeper,
  // and with the original `__shared` (double underscore) name intact.
  const uiShared = join(klypRoot, 'packages/ui/src/__shared')
  const brandShared = join(klypRoot, 'packages/brand/src/__shared')
  if (existsSync(uiShared)) {
    cpSync(uiShared, join(targetRoot, 'components/ui/__shared'), { recursive: true })
  }
  if (existsSync(brandShared)) {
    cpSync(brandShared, join(targetRoot, 'components/brand/__shared'), { recursive: true })
  }

  const brandRootFiles = ['_brand-context.tsx', '_mesh-keyframes.scss', 'vite-shims.d.ts']
  const brandRoot = join(targetRoot, 'components/brand')
  mkdirSync(brandRoot, { recursive: true })
  for (const file of brandRootFiles) {
    const from = join(klypRoot, 'packages/brand/src', file)
    if (existsSync(from)) cpSync(from, join(brandRoot, file))
  }

  const promptInput = join(klypRoot, 'packages/brand/src/prompt-input')
  if (existsSync(promptInput)) {
    cpSync(promptInput, join(targetRoot, 'components/brand/prompt-input'), {
      recursive: true,
    })
  }
}

function copyIcons() {
  const from = join(klypRoot, 'packages/icons/src')
  const to = join(targetRoot, 'assets/icons')
  mkdirSync(dirname(to), { recursive: true })
  cpSync(from, to, { recursive: true })
}

function main() {
  if (!existsSync(klypRoot)) {
    console.error(`Klyp root not found: ${klypRoot}`)
    process.exit(1)
  }

  ensureCleanDir(targetRoot)
  writeLibraryManifests()

  const registry = parseRegistry(join(klypRoot, 'apps/web/src/lib/components-registry.ts'))

  const ui = migratePascalComponents({
    sourceRoot: join(klypRoot, 'packages/ui/src'),
    targetCategory: 'ui',
    pkg: '@klyp/ui',
    registry,
    categoryTags: ['ui'],
  })
  const brand = migratePascalComponents({
    sourceRoot: join(klypRoot, 'packages/brand/src'),
    targetCategory: 'brand',
    pkg: '@klyp/brand',
    registry,
    categoryTags: ['brand'],
  })
  const promptComposer = migrateFlatKebabPackage({
    sourceDir: join(klypRoot, 'packages/brand/src/prompt-composer'),
    targetCategory: 'brand',
    packageName: 'prompt-composer',
  })

  copyShared()
  writeTokens()
  copyIcons()

  const summary = {
    source: klypRoot,
    target: targetRoot,
    components: {
      ui: ui.length,
      brand: brand.length,
      promptComposer: promptComposer.length,
      total: ui.length + brand.length + promptComposer.length,
    },
  }
  writeFileSync(
    join(targetRoot, '.migration-summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
  )
  console.log(JSON.stringify(summary, null, 2))
}

main()
