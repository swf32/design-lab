import { readFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { getSource } from './projectRegistry.mjs'
import { getModuleEntities } from './moduleEntities.mjs'
import { resolveMountedPath } from './sourceMounts.mjs'
import { resolveComponentRuntimeProfile } from './runtimeProfiles.mjs'
import { RuntimeSupervisor } from './runtimeSupervisor.mjs'
import { launchManagedRuntime } from './runtimeLauncher.mjs'

const supervisor = new RuntimeSupervisor({ launch: launchManagedRuntime })

function runtimeError(message, code = 'RUNTIME_REQUEST_INVALID', status = 400) {
  return Object.assign(new Error(message), { code, status })
}

function isInside(root, target) {
  const path = relative(root, target)
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
}

function viteFsPath(path) {
  return `/@fs/${path.split(sep).join('/')}`
}

async function sourceManifest(source) {
  const name = source.kind === 'library' ? 'library.json' : 'project.json'
  try {
    return JSON.parse(await readFile(resolve(source.path, name), 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return {}
    throw error
  }
}

function adjacentPath(source, component, filename) {
  if (!filename) return null
  return resolveMountedPath(
    source,
    'components',
    [component.directory, filename].filter(Boolean).join('/'),
  ).target
}

async function optionalJson(path) {
  if (!path || !path.endsWith('.json')) return null
  return JSON.parse(await readFile(path, 'utf8'))
}

function recommendedTheme(mode) {
  const normalized = mode.toLowerCase()
  if (normalized.includes('dark') || normalized.includes('night')) return 'dark'
  if (normalized.includes('light') || normalized.includes('day')) return 'light'
  return null
}

export async function prepareComponentRuntime(
  sourceId,
  componentId,
  {
    view = 'preview',
    story = null,
    mode = null,
    args = {},
    variant = null,
    values = {},
    captureSurface = false,
  } = {},
) {
  if (!['info', 'preview', 'story', 'playground', 'draft'].includes(view))
    throw runtimeError('Runtime view must be info, preview, story, playground, or draft.')
  const [source, data] = await Promise.all([
    getSource(sourceId),
    getModuleEntities(sourceId, 'components'),
  ])
  const component = data.components.find(
    (candidate) => candidate.id === componentId || candidate.directory === componentId,
  )
  if (!component) throw runtimeError('Component was not found.', 'RUNTIME_COMPONENT_NOT_FOUND', 404)
  if (component.technology !== 'vue')
    throw runtimeError(
      `${component.technology} does not use the managed Vue runtime.`,
      'RUNTIME_ADAPTER_UNAVAILABLE',
    )

  const profile = await resolveComponentRuntimeProfile(source, component)
  const state = await supervisor.ensure(profile)
  const manifest = await sourceManifest(source)
  const entryPath = adjacentPath(source, component, component.entry)
  const previewPath = adjacentPath(source, component, component.preview)
  const storiesPath = adjacentPath(source, component, component.stories)
  const playgroundPath = adjacentPath(source, component, component.playground)
  let setupPath = null
  if (typeof manifest.runtimeSetup === 'string' && manifest.runtimeSetup.trim()) {
    const candidate = resolve(source.path, manifest.runtimeSetup)
    if (!isInside(resolve(source.path), candidate))
      throw runtimeError('runtimeSetup escapes the source root.', 'RUNTIME_SETUP_UNSAFE')
    setupPath = candidate
  }
  const [storyDocument, playgroundDocument] = await Promise.all([
    optionalJson(storiesPath),
    optionalJson(playgroundPath),
  ])
  const selectedMode = mode && data.modes.includes(mode) ? mode : (data.modes[0] ?? 'default')
  const query = new URLSearchParams({
    view,
    ref: `${sourceId}:component:${component.id}`,
    componentId: component.id,
    componentName: component.name,
    profileId: profile.id,
    entry: viteFsPath(entryPath),
    mode: selectedMode,
    modes: JSON.stringify(data.modes),
    modeRecommendations: JSON.stringify(
      data.modes.map((item) => ({ mode: item, interfaceTheme: recommendedTheme(item) })),
    ),
    variables: JSON.stringify(data.themeVariables[selectedMode] ?? {}),
  })
  if (previewPath) query.set('preview', viteFsPath(previewPath))
  if (storiesPath) query.set('stories', viteFsPath(storiesPath))
  if (playgroundPath) query.set('playground', viteFsPath(playgroundPath))
  if (setupPath) query.set('setup', viteFsPath(setupPath))
  if (story) query.set('story', story)
  if (variant) query.set('variant', variant)
  if (Object.keys(args).length) query.set('args', JSON.stringify(args))
  if (Object.keys(values).length) query.set('values', JSON.stringify(values))
  if (captureSurface) query.set('captureSurface', 'true')

  return {
    url: `${state.origin}/?${query}`,
    profile: {
      id: profile.id,
      technology: profile.technology,
      adapter: profile.adapter,
      framework: profile.framework,
      packageEnvironment: {
        root: profile.packageEnvironment.sourceRelativeRoot,
        manifestName: profile.packageEnvironment.manifestName,
        packageManager: profile.packageEnvironment.packageManager,
      },
    },
    runtime: state,
    component: { id: component.id, name: component.name, directory: component.directory },
    modes: data.modes,
    selectedMode,
    stories: storyDocument?.stories ?? [],
    playground: playgroundDocument,
    files: {
      entry: basename(entryPath),
      preview: previewPath ? basename(previewPath) : null,
      stories: storiesPath ? basename(storiesPath) : null,
      playground: playgroundPath ? basename(playgroundPath) : null,
      packageRoot: relative(source.path, profile.packageEnvironment.root) || '.',
      sourceDirectory: relative(source.path, dirname(entryPath)),
    },
  }
}

export async function closeComponentRuntimes() {
  await supervisor.disposeAll()
}
