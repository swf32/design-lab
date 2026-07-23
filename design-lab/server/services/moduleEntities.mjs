import { access, readFile, readdir } from 'node:fs/promises'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { parse } from '@babel/parser'
import { imageSize } from 'image-size'
import { getSource } from './projectRegistry.mjs'
import { buildPageSitemap } from './flowLayout.mjs'
import { componentDisplayName, componentSymbol } from '../../shared/componentIdentity.mjs'

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
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    const path = join(current, entry.name)
    result.push(relative(root, path))
    await directoriesUnder(root, path, result)
  }
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
  const root = join(source.path, 'assets')
  const [files, folders] = await Promise.all([
    filesUnder(
      root,
      (name) => !name.startsWith('.') && assetExtensions.has(extname(name).toLowerCase()),
    ),
    directoriesUnder(root),
  ])
  const assets = await Promise.all(
    files.map(async (filePath) => {
      const path = relative(root, filePath)
      const extension = extname(path).slice(1).toLowerCase()
      const kind = assetKind(path)
      const metadataPath = join(
        dirname(filePath),
        `${basename(filePath, extname(filePath))}.meta.json`,
      )
      const [metadataResult, dimensions] = await Promise.all([
        readFile(metadataPath, 'utf8')
          .then((content) => ({
            metadata: JSON.parse(content),
            metadataFile: relative(root, metadataPath),
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
        directory: dirname(path) === '.' ? '' : dirname(path),
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
  )
  return {
    kind: 'assets',
    folders: folders.sort(),
    assets: assets.sort((a, b) => a.path.localeCompare(b.path)),
  }
}

function flattenTokens(group, file, path = [], result = []) {
  for (const [key, node] of Object.entries(group ?? {})) {
    const tokenPath = [...path, key]
    if (node && typeof node === 'object' && Object.hasOwn(node, 'value'))
      result.push({
        id: tokenPath.join('.'),
        path: tokenPath.join('.'),
        type: node.type ?? 'unknown',
        value: node.value,
        description: node.description ?? null,
        aliases: node.aliases ?? [],
        useWhen: node.useWhen ?? [],
        avoidWhen: node.avoidWhen ?? [],
        tags: node.tags ?? [],
        file,
      })
    else if (node && typeof node === 'object') flattenTokens(node, file, tokenPath, result)
  }
  return result
}

async function tokensFor(source) {
  const root = join(source.path, 'tokens')
  const files = await filesUnder(root, (name) => name.endsWith('.tokens.json'))
  const tokens = []
  const modes = new Set()
  for (const filePath of files) {
    const document = JSON.parse(await readFile(filePath, 'utf8'))
    const file = relative(root, filePath)
    const defaultMode = document.defaultMode ?? 'default'
    const base = flattenTokens(document.tokens, file)
    const modeMaps = new Map()
    modes.add(defaultMode)
    for (const [mode, definition] of Object.entries(document.themes ?? {})) {
      modes.add(mode)
      modeMaps.set(
        mode,
        new Map(flattenTokens(definition.tokens, file).map((token) => [token.path, token.value])),
      )
    }
    for (const token of base) {
      const values = { [defaultMode]: token.value }
      for (const mode of modes) values[mode] = modeMaps.get(mode)?.get(token.path) ?? token.value
      tokens.push({ ...token, mode: defaultMode, values })
    }
  }
  return {
    kind: 'tokens',
    files: files.map((file) => relative(root, file)),
    modes: [...modes],
    tokens,
  }
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
  const root = join(source.path, 'wireframes')
  const [manifests, discoveredFolders, tokenData] = await Promise.all([
    filesUnder(root, (name) => name === 'wireframe.json'),
    directoriesUnder(root),
    tokensFor(source),
  ])
  const entityDirectories = manifests.map((filePath) => relative(root, dirname(filePath)))
  const folders = discoveredFolders.filter(
    (folder) =>
      !entityDirectories.some(
        (entityDirectory) => folder === entityDirectory || folder.startsWith(`${entityDirectory}/`),
      ),
  )
  const wireframes = []
  for (const filePath of manifests) {
    const { manifest, diagnostics: manifestDiagnostics } = await readManifest(filePath)
    const directory = relative(root, dirname(filePath))
    const readAdjacent = async (filename) => {
      if (!filename) return null
      try {
        return await readFile(join(dirname(filePath), filename), 'utf8')
      } catch {
        return null
      }
    }
    const [documentation, changelogDocumentation] = await Promise.all([
      readAdjacent(manifest.docs),
      readAdjacent(manifest.changelog),
    ])
    let entry = manifest.entry ?? null
    if (entry) {
      try {
        await access(join(dirname(filePath), entry))
      } catch {
        entry = null
      }
    }
    const wireframe = {
      ...manifest,
      id: manifest.id ?? directory,
      name: manifest.name ?? basename(directory),
      entry,
      sourceId,
      directory,
      file: relative(root, filePath),
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
  return {
    kind: 'wireframes',
    folders,
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
  const root = join(source.path, 'pages')
  const [manifests, discoveredFolders, tokenData] = await Promise.all([
    filesUnder(root, (name) => name === 'page.json'),
    directoriesUnder(root),
    tokensFor(source),
  ])
  const entityDirectories = manifests.map((filePath) => relative(root, dirname(filePath)))
  const folders = discoveredFolders.filter(
    (folder) =>
      !entityDirectories.some(
        (entityDirectory) => folder === entityDirectory || folder.startsWith(`${entityDirectory}/`),
      ),
  )

  const parsed = []
  for (const filePath of manifests) {
    const { manifest, diagnostics: manifestDiagnostics } = await readManifest(filePath)
    const directory = relative(root, dirname(filePath))
    const readAdjacent = async (filename) => {
      if (!filename) return null
      try {
        return await readFile(join(dirname(filePath), filename), 'utf8')
      } catch {
        return null
      }
    }
    const [documentation, changelogDocumentation] = await Promise.all([
      readAdjacent(manifest.docs),
      readAdjacent(manifest.changelog),
    ])
    let entry = manifest.entry ?? null
    if (entry) {
      try {
        await access(join(dirname(filePath), entry))
      } catch {
        entry = null
      }
    }
    parsed.push({
      manifestDiagnostics,
      page: {
        ...manifest,
        id: manifest.id ?? directory,
        name: manifest.name ?? basename(directory),
        entry,
        sourceId,
        directory,
        file: relative(root, filePath),
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

  return {
    kind: 'pages',
    folders,
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
    try {
      await access(join(directory, candidate))
      return candidate
    } catch {}
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
    try {
      await access(join(directory, candidate))
      return candidate
    } catch {}
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
    { role: 'implementation', path: component.entry },
    { role: 'styles', path: component.style },
    { role: 'manifest', path: basename(component.file) },
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
    for (const [field, value] of [
      ['entry', component.entry],
      ['styles', component.style],
      ['preview', component.preview],
      ['stories', component.stories],
      ['docs', component.docs],
      ['changelog', component.changelog],
    ])
      if (!value)
        diagnostics.push({
          code: 'ready-component-incomplete',
          message: `Ready Component is missing ${field}.`,
        })
  }
  return diagnostics
}

function tokenVariablesByMode(tokenData) {
  return Object.fromEntries(
    tokenData.modes.map((mode) => [
      mode,
      Object.fromEntries(
        tokenData.tokens.map((token) => [
          `--ds-${token.path.replaceAll('.', '-')}`,
          token.values[mode] ?? token.value,
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
  return ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(filePath))
}

async function componentRelations(source, sourceManifest, components) {
  const componentRoot = join(source.path, 'components')
  const directories = components.map((component) => ({
    component,
    path: resolve(componentRoot, component.directory),
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
    const ownerDirectory = resolve(componentRoot, component.directory)
    const queue = [resolve(ownerDirectory, rootFile)]
    const visited = new Set()
    const dependencies = new Map()
    const diagnostics = []
    while (queue.length) {
      const filePath = queue.shift()
      if (!filePath || visited.has(filePath)) continue
      visited.add(filePath)
      const scan = await parseComponentSourceImports(filePath)
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
    try {
      const registry = JSON.parse(await readFile(join(source.path, 'fonts', 'fonts.json'), 'utf8'))
      const tokenData = await tokensFor(source)
      return {
        kind: 'fonts',
        modes: tokenData.modes,
        typography: tokenData.tokens.filter((token) =>
          ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing'].includes(
            token.type,
          ),
        ),
        families: registry.families ?? [],
      }
    } catch (error) {
      if (error.code === 'ENOENT')
        return { kind: 'fonts', modes: ['default'], typography: [], families: [] }
      throw error
    }
  }
  if (moduleId === 'components') {
    const root = join(source.path, 'components')
    const [manifests, discoveredFolders, sourceManifest, tokenData] = await Promise.all([
      filesUnder(root, (name) => name === 'component.json'),
      directoriesUnder(root),
      readSourceManifest(source),
      tokensFor(source),
    ])
    const componentDirectories = manifests.map((filePath) => relative(root, dirname(filePath)))
    const folders = discoveredFolders.filter(
      (folder) =>
        !componentDirectories.some(
          (componentDirectory) =>
            folder === componentDirectory || folder.startsWith(`${componentDirectory}/`),
        ),
    )
    const components = []
    for (const filePath of manifests) {
      const file = relative(root, filePath)
      const { manifest, diagnostics: manifestDiagnostics } = await readManifest(filePath)
      let documentation = null
      if (manifest.docs) {
        try {
          documentation = await readFile(join(dirname(filePath), manifest.docs), 'utf8')
        } catch {}
      }
      let changelogDocumentation = null
      if (manifest.changelog) {
        try {
          changelogDocumentation = await readFile(
            join(dirname(filePath), manifest.changelog),
            'utf8',
          )
        } catch {}
      }
      const directory = file.split('/').slice(0, -1).join('/')
      const category = directory.split('/').slice(0, -1).join('/')
      const [style, playground] = await Promise.all([
        componentStyle(dirname(filePath), manifest),
        componentPlayground(dirname(filePath), manifest),
      ])
      const component = {
        ...manifest,
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
        directory,
      }
      component.completenessDiagnostics = [
        ...manifestDiagnostics,
        ...componentCompletenessDiagnostics(component),
      ]
      components.push({
        ...component,
        import: componentImport(source, sourceManifest, component),
        files: componentFiles(component),
      })
    }
    return {
      kind: 'components',
      folders,
      modes: tokenData.modes,
      themeVariables: tokenVariablesByMode(tokenData),
      components: await componentRelations(source, sourceManifest, components),
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

export async function getModuleNavigation(sourceId, moduleId) {
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
  if (data.kind === 'tokens')
    return navigationFromPaths(
      data.tokens.map((token) => {
        const parts = token.path.split('.')
        return { id: token.id, name: parts.at(-1), path: token.path, groups: parts.slice(0, -1) }
      }),
      'token',
    )
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
