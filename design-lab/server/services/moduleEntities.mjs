import { access, readFile, readdir, realpath } from 'node:fs/promises'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { parse } from '@babel/parser'
import { imageSize } from 'image-size'
import { getSource } from './projectRegistry.mjs'
import { buildPageSitemap } from './flowLayout.mjs'
import { readTokenCatalogRoots } from './tokenCatalog.mjs'
import {
  buildComponentFamilies,
  discoverManifestFreeComponents,
  resolveComponentImplementation,
} from './componentAdapters.mjs'
import { componentDisplayName, componentSymbol } from '../../shared/componentIdentity.mjs'
import {
  mountedDirectoryPath,
  mountedPublicPath,
  resolveMountedPath,
  sourceMounts,
} from './sourceMounts.mjs'

// Bump when a manifest field is added/changed in a way older readers cannot safely ignore, and
// pair the bump with a migration for existing files (D-047). One shared constant keeps every
// manifest kind (component.json, wireframe.json, ...) on the same explicit contract.
const SUPPORTED_SCHEMA_VERSION = 1

// A malformed or too-new manifest must stay a scoped diagnostic on one entity, never an unhandled
// error that fails the whole module response (component.json/wireframe.json are hand-authored
// JSON; a typo in one entity must not hide every other entity in the same Library/Project).
async function readManifest(filePath, { maxSchemaVersion = SUPPORTED_SCHEMA_VERSION } = {}) {
  const diagnostics = []
  let manifest
  try {
    manifest = JSON.parse(await readFile(filePath, 'utf8'))
  } catch (error) {
    return {
      manifest: {},
      diagnostics: [
        {
          code: 'manifest-parse-error',
          message: `${basename(filePath)} could not be parsed as JSON: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    }
  }
  if (typeof manifest.schemaVersion === 'number' && manifest.schemaVersion > maxSchemaVersion)
    diagnostics.push({
      code: 'schema-version-unsupported',
      message: `${basename(filePath)} declares schemaVersion ${manifest.schemaVersion}, newer than the ${maxSchemaVersion} this build understands. Update Design Lab before editing this file, or its fields may be read incorrectly.`,
    })
  return { manifest, diagnostics }
}

async function filesUnder(root, predicate, current = root, result = []) {
  let entries = []
  try {
    entries = await readdir(current, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return result
    throw error
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue
    const path = join(current, entry.name)
    if (entry.isDirectory()) await filesUnder(root, predicate, path, result)
    else if (predicate(entry.name)) result.push(path)
  }
  return result
}

async function directoriesUnder(root, current = root, result = []) {
  let entries = []
  try {
    entries = await readdir(current, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return result
    throw error
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink() || !entry.isDirectory() || entry.name.startsWith('.')) continue
    const path = join(current, entry.name)
    result.push(relative(root, path))
    await directoriesUnder(root, path, result)
  }
  return result
}

async function safeAdjacentPath(directory, filename) {
  if (typeof filename !== 'string' || !filename.trim() || filename.split(/[\\/]/).includes('..'))
    return null
  const target = resolve(directory, filename)
  if (!isInside(target, resolve(directory))) return null
  try {
    const [realDirectory, realTarget] = await Promise.all([realpath(directory), realpath(target)])
    return isInside(realTarget, realDirectory) ? realTarget : null
  } catch {
    return null
  }
}

async function readAdjacentText(directory, filename) {
  const target = await safeAdjacentPath(directory, filename)
  return target ? readFile(target, 'utf8').catch(() => null) : null
}

function mountPrefix(mount) {
  return mount.multiple ? mount.path : ''
}

function mountedFolders(mounts, mount, folders) {
  const result = folders.map((folder) => mountedDirectoryPath(mounts, mount, folder))
  if (mount.multiple) result.unshift(mount.path)
  return result
}

const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'])
const videoExtensions = new Set(['.m4v', '.mov', '.mp4', '.webm'])
const assetExtensions = new Set([...imageExtensions, ...videoExtensions, '.svg', '.tsx'])

function assetKind(file) {
  const extension = extname(file).toLowerCase()
  const rootDirectory = file.split('/')[0]
  if (rootDirectory === 'icons' || extension === '.svg' || extension === '.tsx') return 'icon'
  if (rootDirectory === 'videos' || videoExtensions.has(extension)) return 'video'
  if (rootDirectory === 'images' || imageExtensions.has(extension)) return 'image'
  return 'other'
}

function greatestCommonDivisor(a, b) {
  return b === 0 ? a : greatestCommonDivisor(b, a % b)
}

// Derived purely from the pixel dimensions the file itself already reports — never authored, so
// it can never drift from the actual asset the way a hand-typed `aspectRatio` sidecar field could.
function aspectRatioLabel(width, height) {
  const divisor = greatestCommonDivisor(width, height) || 1
  return `${width / divisor}:${height / divisor}`
}

// image-size only needs the file header, not the full pixel data, but its Node API takes a
// Buffer; a corrupt or unrecognized file must stay a scoped `null` (the asset still discovers),
// never fail the whole Assets scan the way one bad component.json diagnostic never fails the rest.
async function imageDimensions(filePath) {
  try {
    const { width, height } = imageSize(await readFile(filePath))
    if (!width || !height) return null
    return {
      width,
      height,
      aspectRatio: aspectRatioLabel(width, height),
      orientation: width === height ? 'square' : width > height ? 'landscape' : 'portrait',
    }
  } catch {
    return null
  }
}

async function assetsFor(source, sourceId) {
  const mounts = sourceMounts(source, 'assets')
  const scans = await Promise.all(
    mounts.map(async (mount) => {
      const [files, folders] = await Promise.all([
        filesUnder(
          mount.root,
          (name) => !name.startsWith('.') && assetExtensions.has(extname(name).toLowerCase()),
        ),
        directoriesUnder(mount.root),
      ])
      return { mount, files, folders }
    }),
  )
  const assets = await Promise.all(
    scans.flatMap(({ mount, files }) =>
      files.map(async (filePath) => {
        const localPath = relative(mount.root, filePath).split(sep).join('/')
        const path = mountedPublicPath(mounts, mount, localPath)
        const extension = extname(path).slice(1).toLowerCase()
        const kind = assetKind(localPath)
        const metadataPath = join(
          dirname(filePath),
          `${basename(filePath, extname(filePath))}.meta.json`,
        )
        const [metadataResult, dimensions] = await Promise.all([
          readFile(metadataPath, 'utf8')
            .then((content) => ({
              metadata: JSON.parse(content),
              metadataFile: mountedPublicPath(
                mounts,
                mount,
                relative(mount.root, metadataPath).split(sep).join('/'),
              ),
            }))
            .catch((error) => {
              if (error.code !== 'ENOENT') throw error
              return { metadata: {}, metadataFile: null }
            }),
          kind === 'image' ? imageDimensions(filePath) : null,
        ])
        const { metadata, metadataFile } = metadataResult
        return {
          id: path,
          name: path.split('/').at(-1),
          path,
          directory: dirname(path) === '.' ? '' : dirname(path).split(sep).join('/'),
          mountPath: mount.path,
          extension,
          type: kind,
          previewUrl:
            kind === 'image' || (kind === 'icon' && ['svg', 'tsx'].includes(extension))
              ? `/api/sources/${encodeURIComponent(sourceId)}/asset-previews/${path.split('/').map(encodeURIComponent).join('/')}`
              : null,
          width: dimensions?.width ?? null,
          height: dimensions?.height ?? null,
          aspectRatio: dimensions?.aspectRatio ?? null,
          orientation: dimensions?.orientation ?? null,
          metadataFile,
          description: metadata.description ?? null,
          aliases: metadata.aliases ?? [],
          useWhen: metadata.useWhen ?? [],
          avoidWhen: metadata.avoidWhen ?? [],
          tags: metadata.tags ?? [],
          license: metadata.license ?? null,
          alt: metadata.alt ?? null,
        }
      }),
    ),
  )
  return {
    kind: 'assets',
    folders: scans.flatMap(({ mount, folders }) => mountedFolders(mounts, mount, folders)).sort(),
    assets: assets.sort((a, b) => a.path.localeCompare(b.path)),
  }
}

async function tokensFor(source) {
  const mounts = sourceMounts(source, 'tokens')
  return readTokenCatalogRoots(
    mounts.map((mount) => ({ root: mount.root, prefix: mountPrefix(mount) })),
  )
}

// Shared across Wireframe and Page manifests: both use the same typed control registry and the
// same saved-state-snapshot identity rule (WIREFRAME_RULES.md / PAGE_RULES.md), only the diagnostic
// code prefix and the entity noun differ.
function diagnoseDuplicateIds(items, entity, prefix) {
  const diagnostics = []
  const seen = new Set()
  for (const item of items) {
    if (!item?.id || seen.has(item.id))
      diagnostics.push({
        code: `${prefix}-${entity}-id-invalid`,
        message: item?.id
          ? `Duplicate ${entity} id "${item.id}".`
          : `Every ${entity} must define a stable id.`,
      })
    if (item?.id) seen.add(item.id)
  }
  return diagnostics
}

function addCrossMountIdDiagnostics(entities, prefix, diagnosticsField = 'diagnostics') {
  const counts = new Map()
  for (const entity of entities) counts.set(entity.id, (counts.get(entity.id) ?? 0) + 1)
  for (const entity of entities) {
    if ((counts.get(entity.id) ?? 0) < 2) continue
    entity[diagnosticsField] = [
      ...(entity[diagnosticsField] ?? []),
      {
        code: `${prefix}-id-duplicate-across-mounts`,
        message: `The authored id "${entity.id}" is used by more than one ${prefix} in this source. Rename one id so routes, relations, and handoff are unambiguous.`,
      },
    ]
  }
}

function validateControls(controls, prefix) {
  const diagnostics = []
  const controlIds = new Set(controls.map((control) => control.id))
  for (const control of controls) {
    if (!['radio', 'boolean', 'range'].includes(control.kind))
      diagnostics.push({
        code: `${prefix}-control-kind-invalid`,
        message: `Control "${control.id}" uses unsupported kind "${control.kind}".`,
      })
    if (
      control.kind === 'range' &&
      (!Number.isFinite(control.min) ||
        !Number.isFinite(control.max) ||
        !Number.isFinite(control.step) ||
        control.min > control.max ||
        control.step <= 0)
    )
      diagnostics.push({
        code: `${prefix}-control-range-invalid`,
        message: `Range control "${control.id}" must define a valid min, max, and positive step.`,
      })
    if (control.visibleWhen && !controlIds.has(control.visibleWhen.control))
      diagnostics.push({
        code: `${prefix}-control-condition-invalid`,
        message: `Control "${control.id}" depends on unknown control "${control.visibleWhen.control}".`,
      })
  }
  return diagnostics
}

function validateStateValues(states, controls, prefix) {
  const diagnostics = []
  const controlIds = new Set(controls.map((control) => control.id))
  for (const state of states) {
    for (const controlId of controlIds) {
      if (!Object.hasOwn(state.values ?? {}, controlId))
        diagnostics.push({
          code: `${prefix}-state-value-missing`,
          message: `State "${state.id}" does not define control "${controlId}".`,
        })
      const control = controls.find((candidate) => candidate.id === controlId)
      const value = state.values?.[controlId]
      if (control?.kind === 'radio' && !control.options?.some((option) => option.value === value))
        diagnostics.push({
          code: `${prefix}-state-radio-value-invalid`,
          message: `State "${state.id}" uses an invalid value for radio control "${controlId}".`,
        })
      if (control?.kind === 'boolean' && typeof value !== 'boolean')
        diagnostics.push({
          code: `${prefix}-state-boolean-value-invalid`,
          message: `State "${state.id}" must use a boolean value for control "${controlId}".`,
        })
      if (
        control?.kind === 'range' &&
        (!Number.isFinite(value) ||
          value < control.min ||
          value > control.max ||
          (value - control.min) % control.step !== 0)
      )
        diagnostics.push({
          code: `${prefix}-state-range-value-invalid`,
          message: `State "${state.id}" uses an out-of-range or off-step value for control "${controlId}".`,
        })
    }
  }
  return diagnostics
}

function wireframeDiagnostics(wireframe) {
  const diagnostics = []
  const supportedStatuses = new Set(['draft', 'review', 'approved'])
  if (!supportedStatuses.has(wireframe.status))
    diagnostics.push({
      code: 'wireframe-status-invalid',
      message: `Unsupported Wireframe status: ${wireframe.status ?? 'missing'}.`,
    })
  if (!wireframe.entry)
    diagnostics.push({
      code: 'wireframe-entry-missing',
      message: 'wireframe.json must declare an adjacent typed renderer entry.',
    })

  const layouts = wireframe.layouts ?? []
  const states = wireframe.states ?? []
  const controls = wireframe.controls ?? []
  const layoutIds = new Set(layouts.map((layout) => layout.id))
  const stateIds = new Set(states.map((state) => state.id))
  const nodes = wireframe.flow?.nodes ?? []
  const nodeIds = new Set(nodes.map((node) => node.id))
  const edges = wireframe.flow?.edges ?? []

  diagnostics.push(...diagnoseDuplicateIds(layouts, 'layout', 'wireframe'))
  diagnostics.push(...diagnoseDuplicateIds(states, 'state', 'wireframe'))
  diagnostics.push(...diagnoseDuplicateIds(controls, 'control', 'wireframe'))
  diagnostics.push(...diagnoseDuplicateIds(nodes, 'flow-node', 'wireframe'))
  diagnostics.push(...diagnoseDuplicateIds(edges, 'flow-edge', 'wireframe'))
  diagnostics.push(...validateControls(controls, 'wireframe'))
  diagnostics.push(...validateStateValues(states, controls, 'wireframe'))

  if (!layoutIds.has(wireframe.defaultLayout))
    diagnostics.push({
      code: 'wireframe-default-layout-invalid',
      message: `Default layout "${wireframe.defaultLayout}" does not exist.`,
    })
  if (!stateIds.has(wireframe.defaultState))
    diagnostics.push({
      code: 'wireframe-default-state-invalid',
      message: `Default state "${wireframe.defaultState}" does not exist.`,
    })
  for (const node of nodes)
    if (!stateIds.has(node.state))
      diagnostics.push({
        code: 'wireframe-flow-state-invalid',
        message: `Flow node "${node.id}" references unknown state "${node.state}".`,
      })
  for (const edge of edges) {
    if (!edge.action)
      diagnostics.push({
        code: 'wireframe-flow-edge-action-missing',
        message: `Flow edge "${edge.id}" must declare an action id.`,
      })
    if (!edge.label)
      diagnostics.push({
        code: 'wireframe-flow-edge-label-missing',
        message: `Flow edge "${edge.id}" must declare a label.`,
      })
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to))
      diagnostics.push({
        code: 'wireframe-flow-edge-invalid',
        message: `Flow edge "${edge.id}" references an unknown node.`,
      })
  }
  return diagnostics
}

async function wireframesFor(source, sourceId) {
  const mounts = sourceMounts(source, 'wireframes')
  const [scans, tokenData] = await Promise.all([
    Promise.all(
      mounts.map(async (mount) => ({
        mount,
        manifests: await filesUnder(mount.root, (name) => name === 'wireframe.json'),
        folders: await directoriesUnder(mount.root),
      })),
    ),
    tokensFor(source),
  ])
  const manifestEntries = scans.flatMap(({ mount, manifests }) =>
    manifests.map((filePath) => ({ mount, filePath })),
  )
  const entityDirectories = manifestEntries.map(({ mount, filePath }) =>
    mountedDirectoryPath(
      mounts,
      mount,
      relative(mount.root, dirname(filePath)).split(sep).join('/'),
    ),
  )
  const folders = scans
    .flatMap(({ mount, folders: discoveredFolders }) =>
      mountedFolders(mounts, mount, discoveredFolders),
    )
    .filter(
      (folder) =>
        !entityDirectories.some(
          (entityDirectory) =>
            folder === entityDirectory || folder.startsWith(`${entityDirectory}/`),
        ),
    )
  const wireframes = []
  for (const { mount, filePath } of manifestEntries) {
    const { manifest, diagnostics: manifestDiagnostics } = await readManifest(filePath)
    const localDirectory = relative(mount.root, dirname(filePath)).split(sep).join('/')
    const directory = mountedDirectoryPath(mounts, mount, localDirectory)
    const [documentation, changelogDocumentation] = await Promise.all([
      readAdjacentText(dirname(filePath), manifest.docs),
      readAdjacentText(dirname(filePath), manifest.changelog),
    ])
    let entry = manifest.entry ?? null
    if (entry && !(await safeAdjacentPath(dirname(filePath), entry))) entry = null
    const wireframe = {
      ...manifest,
      id: manifest.id ?? directory,
      name: manifest.name ?? basename(directory),
      entry,
      sourceId,
      directory,
      file: mountedPublicPath(mounts, mount, relative(mount.root, filePath).split(sep).join('/')),
      mountPath: mount.path,
      documentation,
      changelogDocumentation,
    }
    wireframes.push({
      ...wireframe,
      diagnostics: [...manifestDiagnostics, ...wireframeDiagnostics(wireframe)],
      files: [
        { role: 'manifest', path: basename(filePath) },
        { role: 'renderer', path: entry },
        { role: 'documentation', path: manifest.docs },
        { role: 'changelog', path: manifest.changelog },
      ].filter((file) => file.path),
    })
  }
  addCrossMountIdDiagnostics(wireframes, 'wireframe')
  return {
    kind: 'wireframes',
    folders: [...new Set(folders)].sort(),
    modes: tokenData.modes,
    themeVariables: tokenVariablesByMode(tokenData),
    wireframes: wireframes.sort((a, b) => a.name.localeCompare(b.name)),
  }
}

// Must stay in sync with MODULE_IDS in design-lab/src/navigation.ts (D-051): an authored Page
// `route` never shadows a reserved Design Lab module segment, so full-screen review falls back to
// the filesystem path instead of colliding with Design Lab's own navigation.
const RESERVED_MODULE_SEGMENTS = new Set([
  'home',
  'components',
  'wireframes',
  'pages',
  'assets',
  'palette',
  'tokens',
  'fonts',
])

function firstRouteSegment(route) {
  if (typeof route !== 'string') return null
  const trimmed = route.trim()
  if (!trimmed || trimmed === '/') return null
  return trimmed.split('/').filter(Boolean)[0] ?? null
}

function pageDiagnostics(page, { pageIdsInSource, derivedWireframe }) {
  const diagnostics = []
  const supportedStatuses = new Set(['draft', 'review', 'approved'])
  if (!page.status)
    diagnostics.push({
      code: 'page-status-missing',
      message: 'page.json does not declare a lifecycle status.',
    })
  else if (!supportedStatuses.has(page.status))
    diagnostics.push({
      code: 'page-status-unknown',
      message: `Unsupported Page status: ${page.status}.`,
    })
  if (!page.entry)
    diagnostics.push({
      code: 'page-entry-missing',
      message: 'page.json must declare an adjacent typed renderer entry.',
    })

  const routeSegment = firstRouteSegment(page.route)
  const routeConflict = routeSegment !== null && RESERVED_MODULE_SEGMENTS.has(routeSegment)
  if (routeConflict)
    diagnostics.push({
      code: 'page-route-conflicts-reserved-module',
      message: `Route "${page.route}" collides with the reserved "${routeSegment}" Design Lab module; full-screen review falls back to the filesystem path.`,
    })

  const controls = page.controls ?? []
  const states = page.states ?? []
  const controlIds = new Set(controls.map((control) => control.id))
  const stateIds = new Set(states.map((state) => state.id))
  const nodes = page.flow?.nodes ?? []
  const nodeIds = new Set(nodes.map((node) => node.id))
  const edges = page.flow?.edges ?? []

  diagnostics.push(...diagnoseDuplicateIds(controls, 'control', 'page'))
  diagnostics.push(...diagnoseDuplicateIds(states, 'state', 'page'))
  diagnostics.push(...diagnoseDuplicateIds(nodes, 'flow-node', 'page'))
  diagnostics.push(...diagnoseDuplicateIds(edges, 'flow-edge', 'page'))
  diagnostics.push(...validateControls(controls, 'page'))
  diagnostics.push(...validateStateValues(states, controls, 'page'))

  if (states.length && !stateIds.has(page.defaultState))
    diagnostics.push({
      code: 'page-default-state-invalid',
      message: `Default state "${page.defaultState}" does not exist.`,
    })

  for (const node of nodes)
    if (!stateIds.has(node.state))
      diagnostics.push({
        code: 'page-flow-node-id-invalid',
        message: `Flow node "${node.id}" references unknown state "${node.state}".`,
      })

  for (const edge of edges) {
    if (!edge.action)
      diagnostics.push({
        code: 'page-flow-edge-action-missing',
        message: `Flow edge "${edge.id}" must declare an action id.`,
      })
    if (!edge.label)
      diagnostics.push({
        code: 'page-flow-edge-label-missing',
        message: `Flow edge "${edge.id}" must declare a label.`,
      })
    if (!nodeIds.has(edge.from))
      diagnostics.push({
        code: 'page-flow-edge-invalid',
        message: `Flow edge "${edge.id}" references unknown node "${edge.from}".`,
      })
    const to = edge.to ?? {}
    if (to.kind === 'state') {
      if (!stateIds.has(to.stateId))
        diagnostics.push({
          code: 'page-flow-edge-invalid',
          message: `Flow edge "${edge.id}" targets unknown state "${to.stateId}".`,
        })
      else if (!nodes.some((node) => node.state === to.stateId))
        diagnostics.push({
          code: 'page-flow-edge-target-unreachable',
          message: `Flow edge "${edge.id}" targets state "${to.stateId}" which has no flow node on the Canvas.`,
        })
    } else if (to.kind === 'page') {
      if (!pageIdsInSource.has(to.pageId))
        diagnostics.push({
          code: 'page-flow-edge-invalid',
          message: `Flow edge "${edge.id}" targets unknown Page "${to.pageId}".`,
        })
    } else {
      diagnostics.push({
        code: 'page-flow-edge-invalid',
        message: `Flow edge "${edge.id}" must target a state or a page.`,
      })
    }
    if (to.condition) {
      const control = controls.find((candidate) => candidate.id === to.condition.controlId)
      if (!control)
        diagnostics.push({
          code: 'page-flow-condition-invalid',
          message: `Flow edge "${edge.id}" condition references unknown control "${to.condition.controlId}".`,
        })
      else if (
        control.kind === 'radio' &&
        !control.options?.some((option) => option.value === to.condition.value)
      )
        diagnostics.push({
          code: 'page-flow-condition-invalid',
          message: `Flow edge "${edge.id}" condition uses an invalid value for control "${control.id}".`,
        })
      else if (control.kind === 'boolean' && typeof to.condition.value !== 'boolean')
        diagnostics.push({
          code: 'page-flow-condition-invalid',
          message: `Flow edge "${edge.id}" condition must use a boolean value for control "${control.id}".`,
        })
      else if (control.kind === 'range') {
        const value = to.condition.value
        if (
          typeof value !== 'number' ||
          value < control.min ||
          value > control.max ||
          (control.step > 0 && (value - control.min) % control.step !== 0)
        )
          diagnostics.push({
            code: 'page-flow-condition-invalid',
            message: `Flow edge "${edge.id}" condition uses an invalid value for control "${control.id}".`,
          })
      }
    }
  }

  if (page.derivedFromWireframe) {
    const { wireframeId, layoutId, stateId } = page.derivedFromWireframe
    if (!derivedWireframe)
      diagnostics.push({
        code: 'page-derived-from-wireframe-invalid',
        message: `derivedFromWireframe references unknown Wireframe "${wireframeId}".`,
      })
    else {
      if (layoutId && !(derivedWireframe.layouts ?? []).some((layout) => layout.id === layoutId))
        diagnostics.push({
          code: 'page-derived-from-wireframe-invalid',
          message: `derivedFromWireframe references unknown layout "${layoutId}".`,
        })
      if (stateId && !(derivedWireframe.states ?? []).some((state) => state.id === stateId))
        diagnostics.push({
          code: 'page-derived-from-wireframe-invalid',
          message: `derivedFromWireframe references unknown state "${stateId}".`,
        })
    }
  }

  return { diagnostics, routeConflict }
}

async function pagesFor(source, sourceId) {
  const mounts = sourceMounts(source, 'pages')
  const [scans, tokenData] = await Promise.all([
    Promise.all(
      mounts.map(async (mount) => ({
        mount,
        manifests: await filesUnder(mount.root, (name) => name === 'page.json'),
        folders: await directoriesUnder(mount.root),
      })),
    ),
    tokensFor(source),
  ])
  const manifestEntries = scans.flatMap(({ mount, manifests }) =>
    manifests.map((filePath) => ({ mount, filePath })),
  )
  const entityDirectories = manifestEntries.map(({ mount, filePath }) =>
    mountedDirectoryPath(
      mounts,
      mount,
      relative(mount.root, dirname(filePath)).split(sep).join('/'),
    ),
  )
  const folders = scans
    .flatMap(({ mount, folders: discoveredFolders }) =>
      mountedFolders(mounts, mount, discoveredFolders),
    )
    .filter(
      (folder) =>
        !entityDirectories.some(
          (entityDirectory) =>
            folder === entityDirectory || folder.startsWith(`${entityDirectory}/`),
        ),
    )

  const parsed = []
  for (const { mount, filePath } of manifestEntries) {
    const { manifest, diagnostics: manifestDiagnostics } = await readManifest(filePath)
    const localDirectory = relative(mount.root, dirname(filePath)).split(sep).join('/')
    const directory = mountedDirectoryPath(mounts, mount, localDirectory)
    const [documentation, changelogDocumentation] = await Promise.all([
      readAdjacentText(dirname(filePath), manifest.docs),
      readAdjacentText(dirname(filePath), manifest.changelog),
    ])
    let entry = manifest.entry ?? null
    if (entry && !(await safeAdjacentPath(dirname(filePath), entry))) entry = null
    parsed.push({
      manifestDiagnostics,
      page: {
        ...manifest,
        id: manifest.id ?? directory,
        name: manifest.name ?? basename(directory),
        entry,
        sourceId,
        directory,
        file: mountedPublicPath(mounts, mount, relative(mount.root, filePath).split(sep).join('/')),
        mountPath: mount.path,
        documentation,
        changelogDocumentation,
        diagnosticsAcknowledged: manifest.diagnosticsAcknowledged ?? [],
      },
    })
  }

  const pageIdsInSource = new Set(parsed.map(({ page }) => page.id))
  // A Page may graduate from a Wireframe in a different source; each distinct source is only
  // resolved once even when several Pages reference the same Wireframe.
  const wireframeCache = new Map()
  const resolveDerivedWireframe = async (derived) => {
    if (!derived) return null
    const targetSourceId = derived.sourceId ?? sourceId
    if (!wireframeCache.has(targetSourceId)) {
      try {
        const targetSource = targetSourceId === sourceId ? source : await getSource(targetSourceId)
        wireframeCache.set(targetSourceId, await wireframesFor(targetSource, targetSourceId))
      } catch {
        wireframeCache.set(targetSourceId, { wireframes: [] })
      }
    }
    return wireframeCache
      .get(targetSourceId)
      .wireframes.find((wireframe) => wireframe.id === derived.wireframeId)
  }

  const pages = []
  for (const { manifestDiagnostics, page } of parsed) {
    const derivedWireframe = await resolveDerivedWireframe(page.derivedFromWireframe)
    const { diagnostics: pageOwnDiagnostics, routeConflict } = pageDiagnostics(page, {
      pageIdsInSource,
      derivedWireframe,
    })
    pages.push({
      ...page,
      mirroredRoute: page.route && !routeConflict ? page.route : null,
      diagnostics: [...manifestDiagnostics, ...pageOwnDiagnostics],
      files: [
        { role: 'manifest', path: basename(page.file) },
        { role: 'renderer', path: page.entry },
        { role: 'documentation', path: page.docs },
        { role: 'changelog', path: page.changelog },
      ].filter((file) => file.path),
    })
  }

  addCrossMountIdDiagnostics(pages, 'page')

  return {
    kind: 'pages',
    folders: [...new Set(folders)].sort(),
    modes: tokenData.modes,
    themeVariables: tokenVariablesByMode(tokenData),
    pages: pages.sort((a, b) => a.name.localeCompare(b.name)),
    sitemap: buildPageSitemap(pages),
  }
}

async function componentStyle(directory, manifest) {
  const stem = basename(manifest.entry ?? '', extname(manifest.entry ?? ''))
  const candidates = [
    manifest.style,
    stem ? `${stem}.scss` : null,
    stem ? `${stem}.sass` : null,
    stem ? `${stem}.css` : null,
  ].filter(Boolean)
  for (const candidate of [...new Set(candidates)]) {
    if (await safeAdjacentPath(directory, candidate)) return candidate
  }
  return null
}

async function componentPlayground(directory, manifest) {
  const stem = basename(directory)
  const candidates = [
    manifest.playground,
    `${stem}.playground.tsx`,
    `${stem}.playground.ts`,
  ].filter(Boolean)
  for (const candidate of [...new Set(candidates)]) {
    if (await safeAdjacentPath(directory, candidate)) return candidate
  }
  return null
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

function componentImport(source, sourceManifest, component) {
  if (!component.entry) return null
  const symbol = componentSymbol(component, component.directory)
  const from =
    component.importFrom ??
    sourceManifest.componentImport ??
    (source.kind === 'library' && sourceManifest.packageName
      ? `${sourceManifest.packageName}/components`
      : `./components/${component.directory}/${symbol}`)
  return { symbol, from, statement: `import { ${symbol} } from '${from}'` }
}

function componentFiles(component) {
  return [
    { role: 'implementation', path: component.sourcePath ?? component.entry },
    { role: 'styles', path: component.style },
    { role: 'manifest', path: component.manifestFile ? basename(component.manifestFile) : null },
    { role: 'playground', path: component.playground },
    { role: 'preview', path: component.preview },
    { role: 'stories', path: component.stories },
    { role: 'documentation', path: component.docs },
    { role: 'changelog', path: component.changelog },
  ].filter((file) => file.path)
}

function componentCompletenessDiagnostics(component) {
  const diagnostics = []
  const supportedStatuses = new Set(['wireframe', 'in-progress', 'ready'])
  if (!component.status)
    diagnostics.push({
      code: 'component-status-missing',
      message: 'component.json does not declare a lifecycle status.',
    })
  else if (!supportedStatuses.has(component.status))
    diagnostics.push({
      code: 'component-status-unknown',
      message: `Unsupported lifecycle status: ${component.status}.`,
    })

  if (component.status === 'wireframe' && !component.playground)
    diagnostics.push({
      code: 'wireframe-playground-missing',
      message: 'A wireframe Component should provide an adjacent typed Playground.',
    })

  if (component.status === 'in-progress' && !component.entry)
    diagnostics.push({
      code: 'in-progress-entry-missing',
      message: 'An in-progress Component should provide a production entry.',
    })

  if (component.status === 'ready') {
    const required = [
      ['entry', component.entry],
      ['preview', component.preview],
      ['stories', component.stories],
      ['docs', component.docs],
      ['changelog', component.changelog],
    ]
    if (component.technology === 'react') required.splice(1, 0, ['styles', component.style])
    for (const [field, value] of required)
      if (!value)
        diagnostics.push({
          code: 'ready-component-incomplete',
          message: `Ready Component is missing ${field}.`,
        })
  }
  return diagnostics
}

function tokenVariablesByMode(tokenData) {
  const cssValue = (value) =>
    typeof value === 'string' || typeof value === 'number'
      ? value
      : value === null
        ? ''
        : JSON.stringify(value)
  return Object.fromEntries(
    tokenData.modes.map((mode) => [
      mode,
      Object.fromEntries(
        tokenData.tokens.map((token) => [
          `--ds-${token.path.replaceAll('.', '-')}`,
          cssValue(token.values[mode] ?? token.value),
        ]),
      ),
    ]),
  )
}

function isInside(path, directory) {
  return path === directory || path.startsWith(`${directory}${sep}`)
}

async function existingSourceFile(candidate) {
  const candidates = extname(candidate)
    ? [candidate]
    : [
        candidate,
        `${candidate}.ts`,
        `${candidate}.tsx`,
        `${candidate}.js`,
        `${candidate}.jsx`,
        `${candidate}.mjs`,
        join(candidate, 'index.ts'),
        join(candidate, 'index.tsx'),
        join(candidate, 'index.js'),
      ]
  for (const path of candidates) {
    try {
      await access(path)
      return path
    } catch {}
  }
  return null
}

export async function parseComponentSourceImports(filePath) {
  let source
  try {
    source = await readFile(filePath, 'utf8')
  } catch {
    return { imports: [], diagnostics: [] }
  }
  if (extname(filePath) === '.json') return { imports: [], diagnostics: [] }
  if (extname(filePath) === '.vue') {
    const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    source = scripts.map((match) => match[1]).join('\n')
  }
  let document
  try {
    document = parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'importAttributes'],
    })
  } catch (error) {
    return {
      imports: [],
      diagnostics: [
        {
          code: 'source-parse-error',
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    }
  }
  const imports = []
  for (const statement of document.program.body) {
    const isImport = statement.type === 'ImportDeclaration'
    const isExport =
      statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportAllDeclaration'
    if ((!isImport && !isExport) || !statement.source || statement.exportKind === 'type') continue
    if (isImport && statement.importKind === 'type') continue
    const symbols = []
    for (const specifier of statement.specifiers ?? []) {
      if (specifier.type === 'ImportDefaultSpecifier') {
        symbols.push('default')
      } else if (specifier.type === 'ImportSpecifier' && specifier.importKind !== 'type') {
        symbols.push(
          specifier.imported.type === 'Identifier'
            ? specifier.imported.name
            : specifier.imported.value,
        )
      } else if (specifier.type === 'ExportSpecifier' && specifier.exportKind !== 'type') {
        symbols.push(
          specifier.local.type === 'Identifier' ? specifier.local.name : specifier.local.value,
        )
      }
    }
    imports.push({ specifier: statement.source.value, symbols })
  }
  return { imports, diagnostics: [] }
}

function relationItem(component) {
  return { id: component.id, name: component.name, directory: component.directory }
}

function isScriptSource(filePath) {
  return ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.vue'].includes(extname(filePath))
}

async function componentRelations(source, sourceManifest, components) {
  const directories = components.map((component) => ({
    component,
    path: resolveMountedPath(
      source,
      'components',
      component.sourceDirectory ?? component.directory,
      { allowRoot: true },
    ).target,
  }))
  const bySymbol = new Map(
    components.map((component) => [componentSymbol(component, component.directory), component]),
  )
  const importFrom =
    sourceManifest.componentImport ??
    (source.kind === 'library' && sourceManifest.packageName
      ? `${sourceManifest.packageName}/components`
      : null)

  async function dependenciesFor(component, rootFile) {
    if (!rootFile) return { dependencies: [], diagnostics: [] }
    const ownerDirectory = resolveMountedPath(
      source,
      'components',
      component.sourceDirectory ?? component.directory,
      { allowRoot: true },
    ).target
    const rootTarget = resolve(ownerDirectory, rootFile)
    if (!isInside(rootTarget, ownerDirectory))
      return {
        dependencies: [],
        diagnostics: [
          {
            code: 'component-source-outside-mount',
            message: `${rootFile} resolves outside the Component directory.`,
          },
        ],
      }
    const queue = [rootTarget]
    const visited = new Set()
    const dependencies = new Map()
    const diagnostics = []
    while (queue.length) {
      const filePath = queue.shift()
      if (!filePath || visited.has(filePath)) continue
      visited.add(filePath)
      const [realOwnerDirectory, realFilePath] = await Promise.all([
        realpath(ownerDirectory).catch(() => null),
        realpath(filePath).catch(() => null),
      ])
      if (!realOwnerDirectory || !realFilePath || !isInside(realFilePath, realOwnerDirectory)) {
        diagnostics.push({
          code: 'component-source-outside-mount',
          message: `${relative(ownerDirectory, filePath)} resolves outside the Component directory.`,
        })
        continue
      }
      const scan = await parseComponentSourceImports(realFilePath)
      diagnostics.push(
        ...scan.diagnostics.map((diagnostic) => ({
          ...diagnostic,
          message: `${relative(ownerDirectory, filePath)}: ${diagnostic.message}`,
        })),
      )
      for (const sourceImport of scan.imports) {
        if (importFrom && sourceImport.specifier === importFrom) {
          for (const symbol of sourceImport.symbols) {
            const target = bySymbol.get(symbol)
            if (target && target.id !== component.id) dependencies.set(target.id, target)
          }
          continue
        }
        if (!sourceImport.specifier.startsWith('.')) continue
        const resolved = await existingSourceFile(
          resolve(dirname(filePath), sourceImport.specifier),
        )
        if (!resolved) continue
        const target = directories.find(({ path }) => isInside(resolved, path))
        if (target && target.component.id !== component.id) {
          dependencies.set(target.component.id, target.component)
          continue
        }
        if (isInside(resolved, ownerDirectory) && isScriptSource(resolved)) queue.push(resolved)
      }
    }
    return { dependencies: [...dependencies.values()], diagnostics }
  }

  const forward = new Map()
  const examples = new Map()
  const previewDiagnostics = new Map()
  for (const component of components) {
    const productionScan = await dependenciesFor(component, component.entry)
    const exampleScan = await dependenciesFor(component, component.stories)
    const previewScan = await dependenciesFor(component, component.preview)
    const productionDependencies = productionScan.dependencies
    const productionIds = new Set(productionDependencies.map((dependency) => dependency.id))
    forward.set(component.id, productionDependencies)
    examples.set(
      component.id,
      exampleScan.dependencies.filter((dependency) => !productionIds.has(dependency.id)),
    )
    previewDiagnostics.set(component.id, [
      ...(component.completenessDiagnostics ?? []),
      ...productionScan.diagnostics,
      ...exampleScan.diagnostics,
      ...previewScan.diagnostics,
      ...previewScan.dependencies.map((dependency) => ({
        code: 'preview-imports-component',
        message: `${component.preview} imports production component ${dependency.name}.`,
        component: relationItem(dependency),
      })),
    ])
  }

  return components.map((component) => ({
    ...component,
    relations: {
      uses: (forward.get(component.id) ?? []).map(relationItem),
      usedBy: components
        .filter((candidate) =>
          (forward.get(candidate.id) ?? []).some((dependency) => dependency.id === component.id),
        )
        .map(relationItem),
      examplesUse: (examples.get(component.id) ?? []).map(relationItem),
      usedInExamplesBy: components
        .filter((candidate) =>
          (examples.get(candidate.id) ?? []).some((dependency) => dependency.id === component.id),
        )
        .map(relationItem),
      diagnostics: previewDiagnostics.get(component.id) ?? [],
    },
  }))
}

export async function getModuleEntities(sourceId, moduleId) {
  const source = await getSource(sourceId)
  if (moduleId === 'wireframes') return wireframesFor(source, sourceId)
  if (moduleId === 'pages') return pagesFor(source, sourceId)
  if (moduleId === 'assets') return assetsFor(source, sourceId)
  if (moduleId === 'tokens') return tokensFor(source)
  if (moduleId === 'palette') {
    const tokenData = await tokensFor(source)
    return {
      kind: 'palette',
      modes: tokenData.modes,
      colors: tokenData.tokens.filter((token) => token.type === 'color'),
    }
  }
  if (moduleId === 'fonts') {
    const mounts = sourceMounts(source, 'fonts')
    const [registries, tokenData] = await Promise.all([
      Promise.all(
        mounts.map(async (mount) => {
          try {
            const registry = JSON.parse(await readFile(join(mount.root, 'fonts.json'), 'utf8'))
            return (registry.families ?? []).map((family) => ({
              ...family,
              mountPath: mount.path,
            }))
          } catch (error) {
            if (error.code === 'ENOENT') return []
            throw error
          }
        }),
      ),
      tokensFor(source),
    ])
    return {
      kind: 'fonts',
      modes: tokenData.modes,
      typography: tokenData.tokens.filter((token) =>
        ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing'].includes(
          token.type,
        ),
      ),
      families: registries.flat(),
    }
  }
  if (moduleId === 'components') {
    const mounts = sourceMounts(source, 'components')
    const [scans, sourceManifest, tokenData] = await Promise.all([
      Promise.all(
        mounts.map(async (mount) => {
          const manifests = await filesUnder(mount.root, (name) => name === 'component.json')
          const localComponentDirectories = manifests.map((filePath) =>
            relative(mount.root, dirname(filePath)).split(sep).join('/'),
          )
          return {
            mount,
            manifests,
            localComponentDirectories,
            folders: await directoriesUnder(mount.root),
            inferred: await discoverManifestFreeComponents(mount.root, localComponentDirectories),
          }
        }),
      ),
      readSourceManifest(source),
      tokensFor(source),
    ])
    const componentDirectories = scans.flatMap(({ mount, localComponentDirectories }) =>
      localComponentDirectories.map((directory) => mountedDirectoryPath(mounts, mount, directory)),
    )
    const folders = scans
      .flatMap(({ mount, folders: discoveredFolders }) =>
        mountedFolders(mounts, mount, discoveredFolders),
      )
      .filter(
        (folder) =>
          !componentDirectories.some(
            (componentDirectory) =>
              folder === componentDirectory || folder.startsWith(`${componentDirectory}/`),
          ),
      )
    const components = []
    for (const { mount, manifests } of scans) {
      for (const filePath of manifests) {
        const localFile = relative(mount.root, filePath).split(sep).join('/')
        const file = mountedPublicPath(mounts, mount, localFile)
        const { manifest, diagnostics: manifestDiagnostics } = await readManifest(filePath)
        const [documentation, changelogDocumentation] = await Promise.all([
          readAdjacentText(dirname(filePath), manifest.docs),
          readAdjacentText(dirname(filePath), manifest.changelog),
        ])
        const localDirectory = localFile.split('/').slice(0, -1).join('/')
        const directory = mountedDirectoryPath(mounts, mount, localDirectory)
        const category = directory.split('/').slice(0, -1).join('/')
        const [style, playground] = await Promise.all([
          componentStyle(dirname(filePath), manifest),
          componentPlayground(dirname(filePath), manifest),
        ])
        const component = {
          ...manifest,
          sourcePath: manifest.sourcePath
            ? mountedPublicPath(mounts, mount, manifest.sourcePath)
            : null,
          id: manifest.id ?? directory,
          name: componentDisplayName(manifest, directory),
          variants: manifest.variants ?? [],
          states: manifest.states ?? [],
          category,
          style,
          playground,
          sourceId,
          documentation,
          changelogDocumentation,
          file,
          manifestFile: file,
          directory,
          sourceDirectory: directory,
          mountPath: mount.path,
        }
        const implementation = resolveComponentImplementation(component)
        component.platform = implementation.platform
        component.technology = implementation.technology
        component.adapter = implementation.adapter
        component.familyId = implementation.familyId
        component.capabilities = implementation.capabilities
        component.implementation = implementation
        component.completenessDiagnostics = [
          ...manifestDiagnostics,
          ...componentCompletenessDiagnostics(component),
          ...implementation.diagnostics,
        ]
        components.push({
          ...component,
          import: componentImport(source, sourceManifest, component),
          files: componentFiles(component),
        })
      }
    }
    for (const { mount, inferred: inferredComponents } of scans) {
      for (const inferred of inferredComponents) {
        const directory = mountedDirectoryPath(mounts, mount, inferred.directory)
        const sourceDirectory = mountedDirectoryPath(mounts, mount, inferred.sourceDirectory)
        const sourcePath = mountedPublicPath(mounts, mount, inferred.sourcePath)
        const component = {
          ...inferred,
          id: mountedPublicPath(mounts, mount, inferred.id),
          category: mountedDirectoryPath(mounts, mount, inferred.category),
          directory,
          sourceDirectory,
          sourcePath,
          file: sourcePath,
          mountPath: mount.path,
          sourceId,
        }
        const implementation = resolveComponentImplementation(component)
        component.platform = implementation.platform
        component.technology = implementation.technology
        component.adapter = implementation.adapter
        component.familyId = implementation.familyId
        component.capabilities = implementation.capabilities
        component.implementation = implementation
        component.completenessDiagnostics = implementation.diagnostics
        components.push({
          ...component,
          import: null,
          files: componentFiles(component),
        })
      }
    }
    addCrossMountIdDiagnostics(components, 'component', 'completenessDiagnostics')
    const relatedComponents = await componentRelations(source, sourceManifest, components)
    return {
      kind: 'components',
      folders: [...new Set(folders)].sort(),
      modes: tokenData.modes,
      themeVariables: tokenVariablesByMode(tokenData),
      families: buildComponentFamilies(relatedComponents),
      components: relatedComponents,
    }
  }
  return { kind: moduleId, entities: [] }
}

function flattenNavigation(node, level = 0, result = []) {
  for (const folder of [...node.folders.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    result.push({ name: folder.name, path: folder.path, kind: 'folder', level })
    flattenNavigation(folder, level + 1, result)
  }
  for (const entity of node.entities.sort((a, b) => a.name.localeCompare(b.name)))
    result.push({ ...entity, level })
  return result
}

function navigationFromPaths(entities, entityKind, folderPaths = []) {
  const root = { folders: new Map(), entities: [] }
  const ensureFolderPath = (parts) => {
    let node = root
    let path = ''
    for (const part of parts) {
      path = path ? `${path}/${part}` : part
      if (!node.folders.has(part))
        node.folders.set(part, { name: part, path, folders: new Map(), entities: [] })
      node = node.folders.get(part)
    }
    return node
  }
  for (const folderPath of folderPaths) ensureFolderPath(folderPath.split('/').filter(Boolean))
  for (const entity of entities) {
    const node = ensureFolderPath(entity.groups)
    node.entities.push({ name: entity.name, path: entity.path, kind: entityKind, id: entity.id })
  }
  return flattenNavigation(root)
}

function tokenNavigationId(token) {
  // A logical path is allowed to occur in more than one document so the catalog can report the
  // conflict without hiding either declaration. Navigation IDs therefore include storage
  // identity even though the token's public identity remains its logical path.
  return `${token.id}::${token.file}`
}

export function tokenNavigation(data, view) {
  const containers = new Map()
  const leaves = []
  const addContainer = (item) => containers.set(`${item.kind}:${item.path}`, item)

  if (view === 'files') {
    for (const document of data.documents) {
      const fileParts = document.file.split('/')
      for (let length = 1; length < fileParts.length; length += 1)
        addContainer({
          name: fileParts[length - 1],
          path: `by-file/${fileParts.slice(0, length).join('/')}`,
          kind: 'folder',
          level: length - 1,
        })
      addContainer({
        name: fileParts.at(-1),
        path: `by-file/${document.file}`,
        kind: 'token-document',
        level: fileParts.length - 1,
        diagnostics: document.diagnostics.length,
      })
    }

    for (const token of data.tokens) {
      const fileDepth = token.file.split('/').length
      const parts = token.path.split('.')
      const documentPath = `by-file/${token.file}`
      const hasDescendants = data.tokens.some(
        (candidate) =>
          candidate !== token &&
          candidate.file === token.file &&
          candidate.path.startsWith(`${token.path}.`),
      )
      const containerDepth = hasDescendants ? parts.length : parts.length - 1
      for (let length = 1; length <= containerDepth; length += 1)
        addContainer({
          name: parts[length - 1],
          path: `${documentPath}/${parts.slice(0, length).join('/')}`,
          kind: 'token-group',
          level: fileDepth + length - 1,
        })
      leaves.push({
        id: tokenNavigationId(token),
        name: hasDescendants ? '$root' : parts.at(-1),
        path: `${documentPath}/${parts.join('/')}${hasDescendants ? '/$root' : ''}`,
        kind: 'token',
        level: fileDepth + parts.length - 1 + Number(hasDescendants),
      })
    }
  } else {
    const logicalPathCounts = new Map()
    for (const token of data.tokens)
      logicalPathCounts.set(token.path, (logicalPathCounts.get(token.path) ?? 0) + 1)
    const duplicateIndexes = new Map()

    for (const token of data.tokens) {
      const parts = token.path.split('.')
      const hasDescendants = data.tokens.some(
        (candidate) => candidate !== token && candidate.path.startsWith(`${token.path}.`),
      )
      const isDuplicate = logicalPathCounts.get(token.path) > 1
      const needsContainer = hasDescendants || isDuplicate
      const containerDepth = needsContainer ? parts.length : parts.length - 1
      for (let length = 1; length <= containerDepth; length += 1)
        addContainer({
          name: parts[length - 1],
          path: `by-token/${parts.slice(0, length).join('/')}`,
          kind: 'token-group',
          level: length - 1,
        })
      const duplicateIndex = duplicateIndexes.get(token.path) ?? 0
      duplicateIndexes.set(token.path, duplicateIndex + 1)
      const leafSuffix = isDuplicate
        ? `/@source-${duplicateIndex + 1}`
        : hasDescendants
          ? '/$root'
          : ''
      leaves.push({
        id: tokenNavigationId(token),
        name: isDuplicate ? token.file : hasDescendants ? '$root' : parts.at(-1),
        path: `by-token/${parts.join('/')}${leafSuffix}`,
        kind: 'token',
        level: parts.length - 1 + Number(needsContainer),
      })
    }
  }

  return [...containers.values(), ...leaves].sort(
    (a, b) => a.path.localeCompare(b.path) || a.kind.localeCompare(b.kind),
  )
}

export async function getModuleNavigation(sourceId, moduleId, { tokenView = 'tokens' } = {}) {
  const data = await getModuleEntities(sourceId, moduleId)
  if (data.kind === 'wireframes')
    return navigationFromPaths(
      data.wireframes.map((wireframe) => {
        const parts = wireframe.directory.split('/').filter(Boolean)
        return {
          id: wireframe.id,
          name: wireframe.name,
          path: wireframe.directory,
          groups: parts.slice(0, -1),
        }
      }),
      'wireframe',
      data.folders,
    )
  if (data.kind === 'pages')
    return navigationFromPaths(
      data.pages.map((page) => {
        const parts = page.directory.split('/').filter(Boolean)
        return {
          id: page.id,
          name: page.name,
          path: page.directory,
          groups: parts.slice(0, -1),
        }
      }),
      'page',
      data.folders,
    )
  if (data.kind === 'components')
    return navigationFromPaths(
      data.components.map((component) => {
        const parts = component.directory.split('/').filter(Boolean)
        return {
          id: component.id,
          name: component.name,
          path: component.directory,
          groups: parts.slice(0, -1),
        }
      }),
      'component',
      data.folders,
    )
  if (data.kind === 'tokens') return tokenNavigation(data, tokenView)
  if (data.kind === 'assets')
    return navigationFromPaths(
      data.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        path: asset.path,
        groups: asset.directory.split('/').filter(Boolean),
      })),
      'asset',
      data.folders,
    )
  return null
}
