import { access, readFile, readdir } from 'node:fs/promises'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { parse } from '@babel/parser'
import { getSource } from './projectRegistry.mjs'

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
      let metadata = {}
      let metadataFile = null
      try {
        metadata = JSON.parse(await readFile(metadataPath, 'utf8'))
        metadataFile = relative(root, metadataPath)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
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
  const symbol = basename(component.entry ?? component.name, extname(component.entry ?? ''))
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
    { role: 'preview', path: component.preview },
    { role: 'stories', path: component.stories },
    { role: 'documentation', path: component.docs },
    { role: 'changelog', path: component.changelog },
  ].filter((file) => file.path)
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
    components.map((component) => [
      basename(component.entry ?? component.name, extname(component.entry ?? '')),
      component,
    ]),
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
    const [manifests, discoveredFolders, sourceManifest] = await Promise.all([
      filesUnder(root, (name) => name === 'component.json'),
      directoriesUnder(root),
      readSourceManifest(source),
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
      const manifest = JSON.parse(await readFile(filePath, 'utf8'))
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
      const style = await componentStyle(dirname(filePath), manifest)
      const component = {
        ...manifest,
        category,
        style,
        sourceId,
        documentation,
        changelogDocumentation,
        file,
        directory,
      }
      components.push({
        ...component,
        import: componentImport(source, sourceManifest, component),
        files: componentFiles(component),
      })
    }
    return {
      kind: 'components',
      folders,
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
