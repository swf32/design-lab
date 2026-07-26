import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, extname, join, relative } from 'node:path'

export const COMPONENT_CAPABILITIES = Object.freeze([
  'catalog',
  'contract',
  'static-preview',
  'live-preview',
  'controls',
  'inspection',
  'composition',
  'capture',
  'handoff',
  'native-validation',
])

const TECHNOLOGY_BY_EXTENSION = new Map([
  ['.tsx', 'react'],
  ['.jsx', 'react'],
  ['.vue', 'vue'],
  ['.svelte', 'svelte'],
  ['.swift', 'swiftui'],
  ['.kt', 'compose'],
  ['.kts', 'compose'],
  ['.wasm', 'wasm'],
  ['.html', 'html'],
])

const PLATFORM_BY_TECHNOLOGY = new Map([
  ['react', 'web'],
  ['vue', 'web'],
  ['svelte', 'web'],
  ['angular', 'web'],
  ['web-component', 'web'],
  ['html', 'web'],
  ['wasm', 'web'],
  ['swiftui', 'ios'],
  ['compose', 'android'],
])

const ADAPTER_BY_TECHNOLOGY = new Map([
  ['react', 'react-manifest'],
  ['vue', 'vue-sfc'],
  ['svelte', 'svelte-component'],
  ['angular', 'angular-component'],
  ['web-component', 'custom-element'],
  ['html', 'external-browser'],
  ['wasm', 'external-browser'],
  ['swiftui', 'swiftui-source'],
  ['compose', 'compose-source'],
])

function authoredString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function humanizeIdentifier(value) {
  return value
    .split(/[/.\-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function uniqueCapabilities(values) {
  const supported = new Set(COMPONENT_CAPABILITIES)
  return [...new Set(values)].filter((value) => supported.has(value))
}

function inferredTechnology(component) {
  if (authoredString(component.tagName)) return 'web-component'
  const locator =
    component.entry ?? component.sourcePath ?? component.playground ?? component.preview ?? ''
  return TECHNOLOGY_BY_EXTENSION.get(extname(locator).toLowerCase()) ?? 'unknown'
}

function implementationCapabilities(component, { platform, technology }) {
  const capabilities = ['catalog']
  const hasContract = Object.keys(component.props ?? {}).length > 0
  const hasStaticPreview = Boolean(component.previewImage)
  const hasReactPreview = technology === 'react' && Boolean(component.preview)
  const hasReactRuntime =
    technology === 'react' && Boolean(component.preview || component.stories || component.playground)
  const hasExternalRuntime = Boolean(component.previewUrl)
  const hasLivePreview = hasReactRuntime || hasExternalRuntime

  if (hasContract) capabilities.push('contract')
  if (hasStaticPreview || hasReactPreview) capabilities.push('static-preview')
  if (hasLivePreview) capabilities.push('live-preview')
  if (hasContract && (hasLivePreview || component.stories)) capabilities.push('controls')
  if (technology === 'react' && component.entry) capabilities.push('inspection')
  if (platform === 'web' && component.entry) capabilities.push('composition')
  if (hasStaticPreview || hasLivePreview) capabilities.push('capture')
  if (component.entry || component.sourcePath) capabilities.push('handoff')
  if (component.validationCommand) capabilities.push('native-validation')
  return uniqueCapabilities(capabilities)
}

export function resolveComponentImplementation(component) {
  const authoredTechnology = authoredString(component.technology)
  const technology = authoredTechnology ?? inferredTechnology(component)
  const authoredPlatform = authoredString(component.platform)
  const platform = authoredPlatform ?? PLATFORM_BY_TECHNOLOGY.get(technology) ?? 'unknown'
  const authoredAdapter = authoredString(component.adapter)
  const adapter =
    authoredAdapter ??
    (component.previewUrl && technology === 'unknown'
      ? 'external-browser'
      : ADAPTER_BY_TECHNOLOGY.get(technology) ?? 'unknown-source')
  const externalUrl = authoredString(component.previewUrl)
  const entry = authoredString(component.entry) ?? authoredString(component.sourcePath)
  const fallbackPath = authoredString(component.playground) ?? authoredString(component.preview)
  const locator = externalUrl
    ? { kind: 'external-url', url: externalUrl }
    : entry || fallbackPath
      ? { kind: 'file', path: entry ?? fallbackPath }
      : { kind: 'manifest', path: component.file ?? 'component.json' }
  const diagnostics = []

  if (technology === 'unknown')
    diagnostics.push({
      code: 'component-technology-unknown',
      message:
        'Design Lab discovered this Component but could not infer its implementation technology. Catalog access remains available; add ecosystem evidence or an optional technology override to enable richer capabilities.',
    })
  if (platform === 'unknown')
    diagnostics.push({
      code: 'component-platform-unknown',
      message:
        'Design Lab could not infer a target platform for this implementation. The Component remains visible in the catalog.',
    })

  return {
    id: component.id,
    familyId: authoredString(component.family),
    platform,
    technology,
    adapter,
    locator,
    contract: {
      props: component.props ?? {},
      events: component.events ?? {},
      slots: component.slots ?? {},
    },
    capabilities: implementationCapabilities(component, { platform, technology }),
    evidence: {
      technology: authoredTechnology ? 'authored' : 'derived',
      platform: authoredPlatform ? 'authored' : 'derived',
      adapter: authoredAdapter ? 'authored' : 'derived',
    },
    diagnostics,
  }
}

export function buildComponentFamilies(components) {
  const families = new Map()
  for (const component of components) {
    const familyId = authoredString(component.familyId) ?? authoredString(component.family)
    if (!familyId) continue
    if (!families.has(familyId))
      families.set(familyId, {
        id: familyId,
        name: authoredString(component.familyName) ?? humanizeIdentifier(familyId),
        implementations: [],
      })
    families.get(familyId).implementations.push({
      id: component.id,
      name: component.name,
      platform: component.platform,
      technology: component.technology,
      adapter: component.adapter,
      capabilities: component.capabilities,
    })
  }
  return [...families.values()]
    .map((family) => ({
      ...family,
      implementations: family.implementations.sort(
        (left, right) =>
          left.platform.localeCompare(right.platform) ||
          left.technology.localeCompare(right.technology) ||
          left.id.localeCompare(right.id),
      ),
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

const COMPONENT_SOURCE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx',
  '.vue',
  '.svelte',
  '.swift',
  '.kt',
  '.kts',
])

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '__tests__',
  '__snapshots__',
])

function ignoredComponentFilename(name) {
  const stem = basename(name, extname(name))
  return (
    stem === 'index' ||
    stem.endsWith('.d') ||
    /\.(stories|story|preview|playground|test|spec|types?|fixture|generated)$/i.test(stem)
  )
}

function pascalCaseFilename(name) {
  const stem = basename(name, extname(name))
  return /^[A-Z][A-Za-z0-9_$]*$/.test(stem) ? stem : null
}

function componentEvidence(file, source) {
  const extension = extname(file).toLowerCase()
  const filenameSymbol = pascalCaseFilename(file)
  if (extension === '.vue' && filenameSymbol)
    return { symbol: filenameSymbol, technology: 'vue', evidence: 'vue-sfc' }
  if (extension === '.svelte' && filenameSymbol)
    return { symbol: filenameSymbol, technology: 'svelte', evidence: 'svelte-component' }
  if (extension === '.swift') {
    const match = source.match(/\b(?:struct|class)\s+([A-Z][A-Za-z0-9_]*)\s*:\s*[^\{\n]*\bView\b/)
    return match ? { symbol: match[1], technology: 'swiftui', evidence: 'swift-view' } : null
  }
  if (extension === '.kt' || extension === '.kts') {
    const match = source.match(/@Composable\b[\s\S]{0,240}?\bfun\s+([A-Z][A-Za-z0-9_]*)\s*\(/)
    return match ? { symbol: match[1], technology: 'compose', evidence: 'compose-function' } : null
  }
  if (['.js', '.mjs', '.ts'].includes(extension)) {
    const customElement = source.match(/customElements\.define\(\s*['"]([a-z][a-z0-9._-]*-[a-z0-9._-]+)['"]/)
    if (customElement)
      return {
        symbol: filenameSymbol ?? customElement[1],
        technology: 'web-component',
        evidence: 'custom-element-registration',
        tagName: customElement[1],
      }
    return null
  }
  if ((extension === '.tsx' || extension === '.jsx') && filenameSymbol) {
    const escaped = filenameSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const publicExport = new RegExp(
      `(?:export\\s+(?:default\\s+)?(?:function|class|const|let|var)\\s+${escaped}\\b|export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\})`,
    )
    return publicExport.test(source)
      ? { symbol: filenameSymbol, technology: 'react', evidence: 'public-jsx-export' }
      : null
  }
  return null
}

async function candidateFiles(root, current = root, result = []) {
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
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) await candidateFiles(root, path, result)
    } else if (
      COMPONENT_SOURCE_EXTENSIONS.has(extname(entry.name).toLowerCase()) &&
      !ignoredComponentFilename(entry.name)
    )
      result.push(path)
  }
  return result
}

function insideCoveredDirectory(relativeFile, coveredDirectories) {
  return coveredDirectories.some(
    (directory) => relativeFile === directory || relativeFile.startsWith(`${directory}/`),
  )
}

export async function discoverManifestFreeComponents(root, coveredDirectories = []) {
  const files = await candidateFiles(root)
  const candidates = []
  for (const filePath of files) {
    const sourcePath = relative(root, filePath).split('\\').join('/')
    if (insideCoveredDirectory(sourcePath, coveredDirectories)) continue
    let source
    try {
      source = await readFile(filePath, 'utf8')
    } catch {
      continue
    }
    const evidence = componentEvidence(sourcePath, source)
    if (!evidence) continue
    const pathWithoutExtension = sourcePath.slice(0, -extname(sourcePath).length)
    candidates.push({
      id: pathWithoutExtension,
      name: evidence.symbol,
      category: dirname(pathWithoutExtension) === '.' ? '' : dirname(pathWithoutExtension),
      directory: pathWithoutExtension,
      sourceDirectory: dirname(sourcePath) === '.' ? '' : dirname(sourcePath),
      sourcePath,
      file: sourcePath,
      manifestFile: null,
      technology: evidence.technology,
      tagName: evidence.tagName,
      discovery: {
        kind: 'derived',
        evidence: evidence.evidence,
        confidence: 'strong',
      },
      variants: [],
      states: [],
      props: {},
      documentation: null,
      changelogDocumentation: null,
    })
  }
  return candidates.sort((a, b) => a.id.localeCompare(b.id))
}
