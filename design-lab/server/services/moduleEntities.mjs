import { readFile, readdir } from 'node:fs/promises'
import { dirname, extname, join, relative } from 'node:path'
import { getSource } from './projectRegistry.mjs'

async function filesUnder(root, predicate, current = root, result = []) {
  let entries = []
  try { entries = await readdir(current, { withFileTypes: true }) } catch (error) { if (error.code === 'ENOENT') return result; throw error }
  for (const entry of entries) {
    const path = join(current, entry.name)
    if (entry.isDirectory()) await filesUnder(root, predicate, path, result)
    else if (predicate(entry.name)) result.push(path)
  }
  return result
}

async function directoriesUnder(root, current = root, result = []) {
  let entries = []
  try { entries = await readdir(current, { withFileTypes: true }) } catch (error) { if (error.code === 'ENOENT') return result; throw error }
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

async function assetsFor(source, sourceId) {
  const root = join(source.path, 'assets')
  const [files, folders] = await Promise.all([
    filesUnder(root, (name) => !name.startsWith('.') && assetExtensions.has(extname(name).toLowerCase())),
    directoriesUnder(root),
  ])
  const assets = files.map((filePath) => {
    const path = relative(root, filePath)
    const extension = extname(path).slice(1).toLowerCase()
    const kind = assetKind(path)
    return {
      id: path,
      name: path.split('/').at(-1),
      path,
      directory: dirname(path) === '.' ? '' : dirname(path),
      extension,
      type: kind,
      previewUrl: kind === 'image' || (kind === 'icon' && ['svg','tsx'].includes(extension)) ? `/api/sources/${encodeURIComponent(sourceId)}/asset-previews/${path.split('/').map(encodeURIComponent).join('/')}` : null,
    }
  })
  return { kind: 'assets', folders: folders.sort(), assets: assets.sort((a, b) => a.path.localeCompare(b.path)) }
}

function flattenTokens(group, file, path = [], result = []) {
  for (const [key, node] of Object.entries(group ?? {})) {
    const tokenPath = [...path, key]
    if (node && typeof node === 'object' && Object.hasOwn(node, 'value')) result.push({ id: tokenPath.join('.'), path: tokenPath.join('.'), type: node.type ?? 'unknown', value: node.value, description: node.description ?? null, file })
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
      modeMaps.set(mode, new Map(flattenTokens(definition.tokens, file).map((token) => [token.path, token.value])))
    }
    for (const token of base) {
      const values = { [defaultMode]: token.value }
      for (const mode of modes) values[mode] = modeMaps.get(mode)?.get(token.path) ?? token.value
      tokens.push({ ...token, mode: defaultMode, values })
    }
  }
  return { kind: 'tokens', files: files.map((file) => relative(root, file)), modes: [...modes], tokens }
}

export async function getModuleEntities(sourceId, moduleId) {
  const source = await getSource(sourceId)
  if (moduleId === 'assets') return assetsFor(source, sourceId)
  if (moduleId === 'tokens') return tokensFor(source)
  if (moduleId === 'palette') {
    const tokenData = await tokensFor(source)
    return { kind: 'palette', modes: tokenData.modes, colors: tokenData.tokens.filter((token) => token.type === 'color') }
  }
  if (moduleId === 'fonts') {
    try { const registry = JSON.parse(await readFile(join(source.path, 'fonts', 'fonts.json'), 'utf8')); const tokenData=await tokensFor(source); return { kind: 'fonts', modes:tokenData.modes, typography:tokenData.tokens.filter((token)=>['fontFamily','fontWeight','fontSize','lineHeight','letterSpacing'].includes(token.type)), families: registry.families ?? [] } }
    catch (error) { if (error.code === 'ENOENT') return { kind: 'fonts', modes:['default'], typography:[], families: [] }; throw error }
  }
  if (moduleId === 'components') {
    const root = join(source.path, 'components')
    const manifests = await filesUnder(root, (name) => name === 'component.json')
    const components = []
    for (const filePath of manifests) {
      const file = relative(root, filePath)
      const manifest = JSON.parse(await readFile(filePath, 'utf8'))
      let documentation = null
      if (manifest.docs) { try { documentation = await readFile(join(dirname(filePath), manifest.docs), 'utf8') } catch {} }
      let changelogDocumentation = null
      if (manifest.changelog) { try { changelogDocumentation = await readFile(join(dirname(filePath), manifest.changelog), 'utf8') } catch {} }
      components.push({ ...manifest, sourceId, documentation, changelogDocumentation, file, directory: file.split('/').slice(0, -1).join('/') })
    }
    return { kind: 'components', components }
  }
  return { kind: moduleId, entities: [] }
}

function flattenNavigation(node, level = 0, result = []) {
  for (const folder of [...node.folders.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    result.push({ name: folder.name, path: folder.path, kind: 'folder', level })
    flattenNavigation(folder, level + 1, result)
  }
  for (const entity of node.entities.sort((a, b) => a.name.localeCompare(b.name))) result.push({ ...entity, level })
  return result
}

function navigationFromPaths(entities, entityKind, folderPaths = []) {
  const root = { folders: new Map(), entities: [] }
  const ensureFolderPath = (parts) => {
    let node = root
    let path = ''
    for (const part of parts) {
      path = path ? `${path}/${part}` : part
      if (!node.folders.has(part)) node.folders.set(part, { name: part, path, folders: new Map(), entities: [] })
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
  if (data.kind === 'components') return navigationFromPaths(data.components.map((component) => { const parts = component.directory.split('/').filter(Boolean); return { id: component.id, name: component.name, path: component.directory, groups: parts.slice(0, -1) } }), 'component')
  if (data.kind === 'tokens') return navigationFromPaths(data.tokens.map((token) => { const parts = token.path.split('.'); return { id: token.id, name: parts.at(-1), path: token.path, groups: parts.slice(0, -1) } }), 'token')
  if (data.kind === 'assets') return navigationFromPaths(data.assets.map((asset) => ({ id: asset.id, name: asset.name, path: asset.path, groups: asset.directory.split('/').filter(Boolean) })), 'asset', data.folders)
  return null
}
