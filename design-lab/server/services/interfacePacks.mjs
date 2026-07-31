import { parse } from '@babel/parser'
import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import {
  access,
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises'
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const PACK_SCHEMA_VERSION = 1
const SELECTION_SCHEMA_VERSION = 1
const PACK_MANIFEST = 'design-lab-pack.json'
const DEFAULT_SYSTEM_ID = 'design-lab-system'
const APPLICATION_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const DEFAULT_WORKSPACE_ROOT = resolve(APPLICATION_ROOT, '..')
const DEFAULT_CONTRACT_PATH = join(APPLICATION_ROOT, 'interface-system-contract.json')
const DEFAULT_SKIN_PATH = join(APPLICATION_ROOT, 'src', 'styles', 'default-skin.css')
const SCRIPT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
const SYSTEM_AUTHORING_RULES = [
  'SYSTEM_RULES.md',
  'COMPONENT_RULES.md',
  'TOKEN_RULES.md',
  'ASSET_RULES.md',
  'FONT_RULES.md',
  'WIREFRAME_RULES.md',
  'PAGE_RULES.md',
]

function packError(message, code, details = undefined) {
  return Object.assign(new Error(message), { code, details })
}

function portablePath(path) {
  return path.split(sep).join('/')
}

function slugify(value) {
  const slug = String(value ?? '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return slug || 'community-interface'
}

function isInside(root, target) {
  const path = relative(root, target)
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
}

function normalizeRelativePath(value, field) {
  if (typeof value !== 'string' || !value.trim())
    throw packError(`${field} must be a non-empty relative path.`, 'INTERFACE_PACK_PATH_INVALID')
  const normalized = value.trim().replaceAll('\\', '/').replace(/^\.\//, '')
  if (
    !normalized ||
    normalized === '.' ||
    isAbsolute(normalized) ||
    /^[a-zA-Z]:\//.test(normalized) ||
    normalized.split('/').includes('..')
  )
    throw packError(`${field} must stay inside the pack.`, 'INTERFACE_PACK_PATH_INVALID')
  return normalized
}

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(value ?? '')
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
  }
}

function compareVersions(left, right) {
  for (const key of ['major', 'minor', 'patch']) {
    if (left[key] !== right[key]) return left[key] < right[key] ? -1 : 1
  }
  if (left.prerelease === right.prerelease) return 0
  if (left.prerelease === null) return 1
  if (right.prerelease === null) return -1
  return left.prerelease.localeCompare(right.prerelease)
}

export function versionSatisfies(version, range) {
  const candidate = parseVersion(version)
  if (!candidate || typeof range !== 'string' || !range.trim()) return false
  const normalized = range.trim()
  if (normalized === '*') return true
  const exact = parseVersion(normalized)
  if (exact) return compareVersions(candidate, exact) === 0
  if (normalized.startsWith('^') || normalized.startsWith('~')) {
    const operator = normalized[0]
    const lower = parseVersion(normalized.slice(1))
    if (!lower || compareVersions(candidate, lower) < 0) return false
    const upper =
      operator === '~'
        ? { major: lower.major, minor: lower.minor + 1, patch: 0, prerelease: null }
        : lower.major > 0
          ? { major: lower.major + 1, minor: 0, patch: 0, prerelease: null }
          : lower.minor > 0
            ? { major: 0, minor: lower.minor + 1, patch: 0, prerelease: null }
            : { major: 0, minor: 0, patch: lower.patch + 1, prerelease: null }
    return compareVersions(candidate, upper) < 0
  }
  const comparators = normalized.split(/\s+/).filter(Boolean)
  if (!comparators.length) return false
  return comparators.every((comparator) => {
    const match = /^(>=|<=|>|<|=)?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(comparator)
    if (!match) return false
    const expected = parseVersion(match[2])
    const comparison = compareVersions(candidate, expected)
    if (match[1] === '>=') return comparison >= 0
    if (match[1] === '<=') return comparison <= 0
    if (match[1] === '>') return comparison > 0
    if (match[1] === '<') return comparison < 0
    return comparison === 0
  })
}

async function readJson(path, code) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') throw packError(`${portablePath(path)} is missing.`, code)
    if (error instanceof SyntaxError)
      throw packError(`${portablePath(path)} is not valid JSON.`, code)
    throw error
  }
}

async function applicationVersion(applicationRoot = APPLICATION_ROOT) {
  const manifest = await readJson(join(applicationRoot, 'package.json'), 'INTERFACE_APP_INVALID')
  if (!parseVersion(manifest.version))
    throw packError('Design Lab package version is invalid.', 'INTERFACE_APP_INVALID')
  return manifest.version
}

export function defaultInterfacePaths(options = {}) {
  const applicationRoot = resolve(options.applicationRoot ?? APPLICATION_ROOT)
  const workspaceDirectory = resolve(
    options.workspaceDirectory ?? process.env.DESIGN_LAB_WORKSPACE_DIR ?? DEFAULT_WORKSPACE_ROOT,
  )
  const dataDirectory = resolve(
    options.dataDirectory ?? process.env.DESIGN_LAB_DATA_DIR ?? join(applicationRoot, '.designlab'),
  )
  const librariesDirectory = resolve(
    options.librariesDirectory ??
      process.env.DESIGN_LAB_LIBRARIES_DIR ??
      join(workspaceDirectory, 'libraries'),
  )
  return {
    applicationRoot,
    workspaceDirectory,
    dataDirectory,
    librariesDirectory,
    systemSlot: resolve(options.systemSlot ?? join(librariesDirectory, DEFAULT_SYSTEM_ID)),
    systemsDirectory: resolve(
      options.systemsDirectory ?? join(dataDirectory, 'interface-packs', 'systems'),
    ),
    contractPath: resolve(
      options.contractPath ?? join(applicationRoot, 'interface-system-contract.json'),
    ),
    defaultSkinPath: resolve(
      options.defaultSkinPath ?? join(applicationRoot, 'src/styles/default-skin.css'),
    ),
    rulesDirectory: resolve(options.rulesDirectory ?? join(applicationRoot, '..', 'rules')),
    skinTemplatePath: resolve(
      options.skinTemplatePath ??
        join(applicationRoot, 'server/templates/interface-packs/skin/theme.css'),
    ),
  }
}

async function assertPackHasNoSymlinks(root, current = root) {
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const target = join(current, entry.name)
    if (entry.isSymbolicLink())
      throw packError(
        `Interface packs cannot contain symbolic links: ${portablePath(relative(root, target))}.`,
        'INTERFACE_PACK_SYMLINK_UNSUPPORTED',
      )
    if (entry.isDirectory()) await assertPackHasNoSymlinks(root, target)
  }
}

function selectionPath(paths) {
  return join(paths.dataDirectory, 'interface.json')
}

function defaultSelection(paths) {
  return {
    schemaVersion: SELECTION_SCHEMA_VERSION,
    system: {
      id: DEFAULT_SYSTEM_ID,
      version: null,
      path: portablePath(relative(paths.workspaceDirectory, paths.systemSlot)),
    },
    skin: null,
  }
}

export async function readInterfaceSelection(options = {}) {
  const paths = defaultInterfacePaths(options)
  try {
    const selection = JSON.parse(await readFile(selectionPath(paths), 'utf8'))
    if (selection.schemaVersion !== SELECTION_SCHEMA_VERSION)
      throw packError('Unsupported interface selection schema.', 'INTERFACE_SELECTION_UNSUPPORTED')
    return selection
  } catch (error) {
    if (error.code === 'ENOENT') return defaultSelection(paths)
    if (error instanceof SyntaxError)
      throw packError(
        'The active interface selection is invalid JSON.',
        'INTERFACE_SELECTION_INVALID',
      )
    throw error
  }
}

async function writeInterfaceSelection(selection, options = {}) {
  const paths = defaultInterfacePaths(options)
  await mkdir(paths.dataDirectory, { recursive: true })
  const target = selectionPath(paths)
  const temporary = `${target}.${randomUUID()}.tmp`
  await writeFile(temporary, `${JSON.stringify(selection, null, 2)}\n`, 'utf8')
  await rename(temporary, target)
  return selection
}

async function assertPackFile(root, relativePath, field) {
  const normalized = normalizeRelativePath(relativePath, field)
  const target = resolve(root, normalized)
  if (!isInside(root, target))
    throw packError(`${field} escapes the pack.`, 'INTERFACE_PACK_PATH_INVALID')
  let realTarget
  try {
    realTarget = await realpath(target)
  } catch (error) {
    if (error.code === 'ENOENT')
      throw packError(`${field} points to a missing file.`, 'INTERFACE_PACK_ENTRY_MISSING', {
        path: normalized,
      })
    throw error
  }
  const realRoot = await realpath(root)
  if (!isInside(realRoot, realTarget))
    throw packError(`${field} resolves outside the pack.`, 'INTERFACE_PACK_SYMLINK_ESCAPE')
  return { path: normalized, target: realTarget }
}

function declarationNames(declaration) {
  if (!declaration) return []
  if (
    [
      'FunctionDeclaration',
      'ClassDeclaration',
      'TSInterfaceDeclaration',
      'TSTypeAliasDeclaration',
      'TSEnumDeclaration',
    ].includes(declaration.type)
  )
    return declaration.id ? [declaration.id.name] : []
  if (declaration.type === 'VariableDeclaration')
    return declaration.declarations.flatMap((item) =>
      item.id.type === 'Identifier' ? [item.id.name] : [],
    )
  return []
}

async function resolveScript(path) {
  const candidates = extname(path)
    ? [path]
    : [
        path,
        ...SCRIPT_EXTENSIONS.map((extension) => `${path}${extension}`),
        ...SCRIPT_EXTENSIONS.map((extension) => join(path, `index${extension}`)),
      ]
  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    } catch {}
  }
  return null
}

async function collectExports(file, root, seen = new Set()) {
  const resolvedFile = resolve(file)
  if (seen.has(resolvedFile)) return new Set()
  seen.add(resolvedFile)
  if (!isInside(root, resolvedFile))
    throw packError('An entrypoint export escapes the pack.', 'INTERFACE_PACK_EXPORT_ESCAPE')
  const source = await readFile(resolvedFile, 'utf8')
  let ast
  try {
    ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
  } catch {
    throw packError(
      `${portablePath(relative(root, resolvedFile))} could not be parsed.`,
      'INTERFACE_PACK_EXPORT_INVALID',
    )
  }
  const exports = new Set()
  for (const node of ast.program.body) {
    if (node.type === 'ExportDefaultDeclaration') exports.add('default')
    if (node.type === 'ExportNamedDeclaration') {
      for (const name of declarationNames(node.declaration)) exports.add(name)
      for (const specifier of node.specifiers ?? []) {
        const name = specifier.exported?.name ?? specifier.exported?.value
        if (name) exports.add(name)
      }
      if (node.source?.value?.startsWith('.') && node.specifiers.length === 0) {
        const target = await resolveScript(resolve(dirname(resolvedFile), node.source.value))
        if (target) for (const name of await collectExports(target, root, seen)) exports.add(name)
      }
    }
    if (node.type === 'ExportAllDeclaration' && node.source.value.startsWith('.')) {
      const target = await resolveScript(resolve(dirname(resolvedFile), node.source.value))
      if (!target)
        throw packError(
          `${portablePath(relative(root, resolvedFile))} exports a missing module.`,
          'INTERFACE_PACK_EXPORT_MISSING',
        )
      for (const name of await collectExports(target, root, seen)) exports.add(name)
    }
  }
  return exports
}

export async function typecheckInterfaceSystem(validated, options = {}) {
  if (validated.manifest.kind !== 'system')
    throw packError('Only a System pack can be typechecked.', 'INTERFACE_PACK_KIND_INVALID')
  const paths = defaultInterfacePaths(options)
  const contract = await readJson(paths.contractPath, 'INTERFACE_CONTRACT_INVALID')
  const aliases = {}
  for (const [key, definition] of Object.entries(contract.entrypoints)) {
    if (key === 'tokens') continue
    aliases[definition.import] =
      key === 'assets' ? [`${validated.entrypoints.assets}/*`] : [validated.entrypoints[key]]
  }
  const temporary = await mkdtemp(join(tmpdir(), 'design-lab-system-typecheck-'))
  const configPath = join(temporary, 'tsconfig.json')
  try {
    await writeFile(
      configPath,
      `${JSON.stringify(
        {
          extends: join(paths.applicationRoot, 'tsconfig.app.json'),
          compilerOptions: {
            tsBuildInfoFile: join(temporary, 'system.tsbuildinfo'),
            baseUrl: paths.workspaceDirectory,
            ignoreDeprecations: '6.0',
            paths: aliases,
          },
          include: [
            join(paths.applicationRoot, 'src/**/*.ts'),
            join(paths.applicationRoot, 'src/**/*.tsx'),
            join(validated.root, '**/*.ts'),
            join(validated.root, '**/*.tsx'),
          ],
        },
        null,
        2,
      )}\n`,
    )
    const typescriptBin = fileURLToPath(new URL('../bin/tsc', import.meta.resolve('typescript')))
    await execFileAsync(process.execPath, [typescriptBin, '-p', configPath, '--pretty', 'false'], {
      cwd: paths.applicationRoot,
      maxBuffer: 4 * 1024 * 1024,
    })
    return { ok: true }
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim()
    throw packError(
      `${validated.manifest.name} does not satisfy the typed Design Lab application contract.${output ? `\n${output}` : ''}`,
      'INTERFACE_PACK_TYPECHECK_FAILED',
    )
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
}

function validateManifestShape(manifest, expectedKind) {
  if (manifest.schemaVersion !== PACK_SCHEMA_VERSION)
    throw packError('Unsupported interface pack schema.', 'INTERFACE_PACK_SCHEMA_UNSUPPORTED')
  if (
    !['skin', 'system'].includes(manifest.kind) ||
    (expectedKind && manifest.kind !== expectedKind)
  )
    throw packError(
      `Expected a ${expectedKind ?? 'skin or system'} pack.`,
      'INTERFACE_PACK_KIND_INVALID',
    )
  if (typeof manifest.id !== 'string' || !/^[a-z0-9][a-z0-9._-]{1,62}$/.test(manifest.id))
    throw packError('Pack id must be a stable lowercase slug.', 'INTERFACE_PACK_ID_INVALID')
  if (typeof manifest.name !== 'string' || manifest.name.trim().length < 2)
    throw packError('Pack name is required.', 'INTERFACE_PACK_NAME_INVALID')
  if (!parseVersion(manifest.version))
    throw packError(
      'Pack version must use semantic x.y.z syntax.',
      'INTERFACE_PACK_VERSION_INVALID',
    )
  if (typeof manifest.designLab !== 'string' || !manifest.designLab.trim())
    throw packError(
      'Pack must declare a Design Lab compatibility range.',
      'INTERFACE_PACK_COMPATIBILITY_MISSING',
    )
  if (!manifest.entrypoints || typeof manifest.entrypoints !== 'object')
    throw packError('Pack entrypoints are required.', 'INTERFACE_PACK_ENTRYPOINTS_MISSING')
}

export async function validateInterfacePack(root, options = {}) {
  const packRoot = resolve(root)
  const realPackRoot = await realpath(packRoot)
  await assertPackHasNoSymlinks(packRoot)
  const manifest = await readJson(join(packRoot, PACK_MANIFEST), 'INTERFACE_PACK_MANIFEST_MISSING')
  validateManifestShape(manifest, options.expectedKind)
  const version = options.designLabVersion ?? (await applicationVersion(options.applicationRoot))
  if (!versionSatisfies(version, manifest.designLab))
    throw packError(
      `${manifest.name} ${manifest.version} supports Design Lab ${manifest.designLab}, not ${version}.`,
      'INTERFACE_PACK_INCOMPATIBLE',
    )

  const resolvedEntrypoints = {}
  if (manifest.kind === 'skin') {
    const style = await assertPackFile(packRoot, manifest.entrypoints.style, 'entrypoints.style')
    if (extname(style.path) !== '.css')
      throw packError('Skin style entrypoint must be a CSS file.', 'INTERFACE_PACK_STYLE_INVALID')
    resolvedEntrypoints.style = style.target
  } else {
    const paths = defaultInterfacePaths(options)
    const contract = await readJson(paths.contractPath, 'INTERFACE_CONTRACT_INVALID')
    if (contract.schemaVersion !== 1)
      throw packError('Unsupported interface contract schema.', 'INTERFACE_CONTRACT_INVALID')
    const library = await readJson(join(packRoot, 'library.json'), 'INTERFACE_PACK_LIBRARY_MISSING')
    if (library.id !== manifest.id)
      throw packError('library.json id must match the pack id.', 'INTERFACE_PACK_LIBRARY_INVALID')
    if (
      library.componentImport !== '@design-lab/system/components' ||
      library.iconImport !== '@design-lab/system/icons'
    )
      throw packError(
        'A System library must publish the canonical Design Lab component and icon imports.',
        'INTERFACE_PACK_LIBRARY_IMPORT_INVALID',
      )
    for (const [key, definition] of Object.entries(contract.entrypoints)) {
      const entry = await assertPackFile(packRoot, manifest.entrypoints[key], `entrypoints.${key}`)
      resolvedEntrypoints[key] = entry.target
      if (!definition.requiredExports.length) continue
      const exports = await collectExports(entry.target, realPackRoot)
      const missing = definition.requiredExports.filter((name) => !exports.has(name))
      if (missing.length)
        throw packError(
          `${manifest.name} is missing required ${key} exports: ${missing.join(', ')}.`,
          'INTERFACE_PACK_EXPORTS_MISSING',
          { entrypoint: key, missing },
        )
    }
  }

  for (const [index, screenshot] of (manifest.screenshots ?? []).entries())
    await assertPackFile(packRoot, screenshot, `screenshots[${index}]`)

  const validated = {
    root: packRoot,
    manifest,
    designLabVersion: version,
    entrypoints: resolvedEntrypoints,
  }
  if (manifest.kind === 'system' && options.typecheckSystem)
    await typecheckInterfaceSystem(validated, options)
  return validated
}

function parseGithubSource(spec) {
  if (!spec.startsWith('github:')) return null
  const value = spec.slice('github:'.length)
  const [repository, ref] = value.split('#')
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository))
    throw packError('Invalid GitHub pack source.', 'INTERFACE_PACK_SOURCE_INVALID')
  return { url: `https://github.com/${repository}.git`, ref: ref || null }
}

async function acquirePack(spec, destination, cwd) {
  const local = resolve(cwd, spec)
  try {
    const info = await lstat(local)
    if (info.isDirectory()) {
      await cp(local, destination, {
        recursive: true,
        errorOnExist: true,
        filter(source) {
          return !['.git', 'node_modules'].includes(basename(source))
        },
      })
      return
    }
    if (info.isFile() && ['.tgz', '.gz'].includes(extname(local))) {
      await mkdir(destination, { recursive: true })
      await execFileAsync('tar', ['-xzf', local, '-C', destination, '--strip-components=1'])
      return
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  const github = parseGithubSource(spec)
  const gitSource =
    github ?? (/^(https?|ssh):.*\.git(?:#.*)?$/.test(spec) ? { url: spec, ref: null } : null)
  if (gitSource) {
    const args = ['clone', '--depth', '1']
    if (gitSource.ref) args.push('--branch', gitSource.ref)
    args.push(gitSource.url, destination)
    await execFileAsync('git', args)
    await rm(join(destination, '.git'), { recursive: true, force: true })
    return
  }

  const downloadDirectory = `${destination}.download`
  await mkdir(downloadDirectory, { recursive: true })
  try {
    const { stdout } = await execFileAsync('npm', [
      'pack',
      spec,
      '--ignore-scripts',
      '--json',
      '--pack-destination',
      downloadDirectory,
    ])
    const result = JSON.parse(stdout)
    if (!Array.isArray(result) || !result[0]?.filename)
      throw packError('npm did not return a package archive.', 'INTERFACE_PACK_DOWNLOAD_FAILED')
    await mkdir(destination, { recursive: true })
    await execFileAsync('tar', [
      '-xzf',
      join(downloadDirectory, result[0].filename),
      '-C',
      destination,
      '--strip-components=1',
    ])
  } finally {
    await rm(downloadDirectory, { recursive: true, force: true })
  }
}

async function replaceDirectory(staged, destination) {
  const backup = `${destination}.backup-${randomUUID()}`
  let hadDestination = false
  try {
    await access(destination)
    hadDestination = true
    await rename(destination, backup)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  try {
    await rename(staged, destination)
  } catch (error) {
    if (hadDestination) await rename(backup, destination).catch(() => undefined)
    throw error
  }
  if (hadDestination) await rm(backup, { recursive: true, force: true }).catch(() => undefined)
}

function installedSystemRoot(paths, id, version) {
  return join(paths.systemsDirectory, id, version)
}

async function copySystemDirectory(source, destination) {
  await cp(source, destination, {
    recursive: true,
    errorOnExist: true,
    filter(path) {
      return !['.git', '.designlab', 'node_modules', 'dist'].includes(basename(path))
    },
  })
}

async function currentSystemManifest(paths) {
  try {
    return await readJson(join(paths.systemSlot, PACK_MANIFEST), 'INTERFACE_PACK_MANIFEST_MISSING')
  } catch (error) {
    if (error.code === 'INTERFACE_PACK_MANIFEST_MISSING') return null
    throw error
  }
}

async function snapshotCurrentSystem(paths) {
  const manifest = await currentSystemManifest(paths)
  if (!manifest) return null
  const destination = installedSystemRoot(paths, manifest.id, manifest.version)
  await mkdir(dirname(destination), { recursive: true })
  const staged = join(paths.systemsDirectory, `.snapshot-${randomUUID()}`)
  try {
    await copySystemDirectory(paths.systemSlot, staged)
    await replaceDirectory(staged, destination)
  } finally {
    await rm(staged, { recursive: true, force: true })
  }
  return { root: destination, manifest }
}

async function activateInstalledSystem(selected, options = {}) {
  const paths = defaultInterfacePaths(options)
  const current = await currentSystemManifest(paths)
  if (
    !options.force &&
    current?.id === selected.manifest.id &&
    current?.version === selected.manifest.version
  )
    return { changed: false, manifest: current }
  if (options.snapshot !== false) await snapshotCurrentSystem(paths)
  await mkdir(dirname(paths.systemSlot), { recursive: true })
  const staged = join(paths.librariesDirectory, `.system-slot-${randomUUID()}`)
  try {
    await copySystemDirectory(selected.root, staged)
    await replaceDirectory(staged, paths.systemSlot)
  } finally {
    await rm(staged, { recursive: true, force: true })
  }
  const selection = await readInterfaceSelection(options)
  selection.system = {
    id: selected.manifest.id,
    version: selected.manifest.version,
    path: portablePath(relative(paths.workspaceDirectory, paths.systemSlot)),
  }
  await writeInterfaceSelection(selection, options)
  return { changed: true, manifest: selected.manifest }
}

function authoringAgents(kind) {
  if (kind === 'skin')
    return `# Skin authoring instructions

Before changing this package, read and follow [\`rules/SKIN_RULES.md\`](rules/SKIN_RULES.md).

This package changes Design Lab visuals through \`theme.css\`. Do not edit Design Lab application
source, replace Components, or target private DOM/class selectors. If the requested direction needs
different markup or behavior, explain that it requires a complete System instead of forcing it into
this Skin. After every change, validate the package and review dark and light interface themes.
`
  return `# System authoring instructions

Before changing this package, read and follow [\`rules/SYSTEM_RULES.md\`](rules/SYSTEM_RULES.md),
then read every entity rule relevant to the files being changed. These local rules are the shared
contract for designers, humans, and coding agents; do not replace them with agent-specific rules.

Preserve all entrypoints and exports required by \`design-lab-pack.json\` and the selected Design
Lab interface contract. Keep application behavior outside this presentation System. After every
contract-level change, validate the complete System against the real Design Lab application.
`
}

function authoringReadme(kind, name) {
  const command = kind === 'skin' ? 'theme' : 'system'
  const noun = kind === 'skin' ? 'visual Skin' : 'complete interface System'
  const firstEdit = kind === 'skin' ? '`theme.css`' : 'canonical tokens and Components'
  return `# ${name}

This package is a ${noun} for Design Lab.

## Visual intent

Replace this section before publishing. Describe the mood, contrast, density, typography, and the
parts of Design Lab that should feel intentionally different.

## Start here

1. Read \`AGENTS.md\` and the linked local rules.
2. Begin with ${firstEdit}; avoid changing more of the interface than the visual direction needs.
3. From the Design Lab workspace, validate this folder:

   \`\`\`bash
   npm run designlab -- ${command} validate <path-to-this-folder>
   \`\`\`

4. Install it locally and restart Design Lab:

   \`\`\`bash
   npm run designlab -- ${command} install <path-to-this-folder>
   \`\`\`

5. Review every module in dark and light modes, add representative files under \`screenshots/\`,
   then update version, compatibility, license, repository, and screenshot paths in
   \`design-lab-pack.json\`.

## Recovery

Use \`npm run designlab -- ${command} reset\` to return to ${
    kind === 'skin'
      ? 'the active System without this Skin'
      : 'the snapshotted default System in the canonical installation slot'
  }. Installed packages are retained for later use.
`
}

async function writeAuthoringScaffold(kind, root, name, paths) {
  const rules = kind === 'skin' ? ['SKIN_RULES.md'] : SYSTEM_AUTHORING_RULES
  await mkdir(join(root, 'rules'), { recursive: true })
  await mkdir(join(root, 'screenshots'), { recursive: true })
  for (const rule of rules) await cp(join(paths.rulesDirectory, rule), join(root, 'rules', rule))
  await writeFile(join(root, 'AGENTS.md'), authoringAgents(kind))
  await writeFile(join(root, 'README.md'), authoringReadme(kind, name))
  await writeFile(
    join(root, 'screenshots', 'README.md'),
    '# Screenshots\n\nAdd deterministic dark and light Design Lab captures here before publishing.\n',
  )
}

export async function installInterfacePack(spec, options = {}) {
  const kind = options.kind
  if (!['skin', 'system'].includes(kind))
    throw packError('Install requires kind skin or system.', 'INTERFACE_PACK_KIND_INVALID')
  const paths = defaultInterfacePaths(options)
  const parent =
    kind === 'system'
      ? paths.systemsDirectory
      : join(paths.dataDirectory, 'interface-packs', 'skins')
  await mkdir(parent, { recursive: true })
  const staged = join(parent, `.staging-${randomUUID()}`)
  try {
    await acquirePack(spec, staged, resolve(options.cwd ?? process.cwd()))
    const validated = await validateInterfacePack(staged, {
      ...options,
      expectedKind: kind,
      applicationRoot: paths.applicationRoot,
      workspaceDirectory: paths.workspaceDirectory,
      dataDirectory: paths.dataDirectory,
      librariesDirectory: paths.librariesDirectory,
      contractPath: paths.contractPath,
      defaultSkinPath: paths.defaultSkinPath,
      typecheckSystem: options.typecheckSystem ?? true,
    })
    if (kind === 'system' && validated.manifest.id === DEFAULT_SYSTEM_ID)
      throw packError(
        'The bundled default System cannot be replaced by a community package.',
        'INTERFACE_PACK_DEFAULT_RESERVED',
      )
    const destination = join(parent, validated.manifest.id, validated.manifest.version)
    await mkdir(dirname(destination), { recursive: true })
    if (kind === 'system' && options.activate !== false) await snapshotCurrentSystem(paths)
    await replaceDirectory(staged, destination)
    if (options.activate !== false) {
      if (kind === 'system')
        await activateInstalledSystem(
          { root: destination, manifest: validated.manifest },
          { ...options, force: true, snapshot: false },
        )
      else
        await useInterfacePack(kind, validated.manifest.id, {
          ...options,
          version: validated.manifest.version,
          typecheckSystem: false,
        })
    }
    return {
      installed: true,
      active: options.activate !== false,
      kind,
      id: validated.manifest.id,
      name: validated.manifest.name,
      version: validated.manifest.version,
      path:
        kind === 'system'
          ? portablePath(relative(paths.workspaceDirectory, paths.systemSlot))
          : portablePath(relative(paths.dataDirectory, destination)),
    }
  } finally {
    await rm(staged, { recursive: true, force: true })
  }
}

export async function createInterfacePack(kind, target, options = {}) {
  if (!['skin', 'system'].includes(kind))
    throw packError('Create requires kind skin or system.', 'INTERFACE_PACK_KIND_INVALID')
  const paths = defaultInterfacePaths(options)
  const destination = resolve(options.cwd ?? process.cwd(), target)
  const name =
    String(options.name ?? '').trim() ||
    destination.split(sep).filter(Boolean).at(-1)?.replaceAll('-', ' ') ||
    'Community Interface'
  const id = slugify(options.id ?? name)
  if (kind === 'system' && id === DEFAULT_SYSTEM_ID)
    throw packError('The default System id is reserved.', 'INTERFACE_PACK_DEFAULT_RESERVED')
  try {
    await access(destination)
    throw packError('The scaffold destination already exists.', 'INTERFACE_PACK_DESTINATION_EXISTS')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  await mkdir(dirname(destination), { recursive: true })
  const staged = join(dirname(destination), `.interface-pack-${randomUUID()}`)
  try {
    if (kind === 'system') {
      await cp(join(paths.librariesDirectory, DEFAULT_SYSTEM_ID), staged, {
        recursive: true,
        errorOnExist: true,
      })
      const manifest = await readJson(
        join(staged, PACK_MANIFEST),
        'INTERFACE_PACK_MANIFEST_MISSING',
      )
      Object.assign(manifest, {
        id,
        name,
        version: '0.1.0',
        description: `A complete community interface System for Design Lab.`,
        license: 'UNLICENSED',
      })
      await writeFile(join(staged, PACK_MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`)
      const library = await readJson(join(staged, 'library.json'), 'INTERFACE_PACK_LIBRARY_MISSING')
      Object.assign(library, {
        id,
        name,
        version: '0.1.0',
        packageName: `@design-lab-community/${id}`,
      })
      await writeFile(join(staged, 'library.json'), `${JSON.stringify(library, null, 2)}\n`)
      const packageManifest = await readJson(
        join(staged, 'package.json'),
        'INTERFACE_PACK_PACKAGE_MISSING',
      )
      Object.assign(packageManifest, {
        name: `@design-lab-community/${id}`,
        version: '0.1.0',
        private: true,
      })
      await writeFile(join(staged, 'package.json'), `${JSON.stringify(packageManifest, null, 2)}\n`)
    } else {
      await mkdir(staged, { recursive: true })
      await writeFile(
        join(staged, PACK_MANIFEST),
        `${JSON.stringify(
          {
            schemaVersion: PACK_SCHEMA_VERSION,
            id,
            name,
            version: '0.1.0',
            kind: 'skin',
            description: 'A visual Skin for the default Design Lab System.',
            designLab: '>=0.1.0 <0.2.0',
            license: 'UNLICENSED',
            screenshots: [],
            entrypoints: { style: 'theme.css' },
          },
          null,
          2,
        )}\n`,
      )
      await writeFile(join(staged, 'theme.css'), await readFile(paths.skinTemplatePath, 'utf8'))
    }
    await writeAuthoringScaffold(kind, staged, name, paths)
    await validateInterfacePack(staged, {
      ...options,
      expectedKind: kind,
      applicationRoot: paths.applicationRoot,
      workspaceDirectory: paths.workspaceDirectory,
      dataDirectory: paths.dataDirectory,
      librariesDirectory: paths.librariesDirectory,
      contractPath: paths.contractPath,
      typecheckSystem: options.typecheckSystem ?? true,
    })
    await rename(staged, destination)
    return { created: true, kind, id, name, version: '0.1.0', path: destination }
  } finally {
    await rm(staged, { recursive: true, force: true })
  }
}

async function installedPacks(kind, options = {}) {
  const paths = defaultInterfacePaths(options)
  const results = []
  if (kind === 'system') {
    let ids = []
    try {
      ids = await readdir(paths.systemsDirectory, { withFileTypes: true })
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    for (const id of ids) {
      if (!id.isDirectory() || id.name.startsWith('.')) continue
      const idRoot = join(paths.systemsDirectory, id.name)
      for (const version of await readdir(idRoot, { withFileTypes: true })) {
        if (!version.isDirectory() || version.name.startsWith('.')) continue
        const root = join(idRoot, version.name)
        const manifest = await readJson(
          join(root, PACK_MANIFEST),
          'INTERFACE_PACK_MANIFEST_MISSING',
        )
        if (manifest.kind === 'system') results.push({ root, manifest })
      }
    }
    const activeManifest = await currentSystemManifest(paths)
    if (
      activeManifest &&
      !results.some(
        ({ manifest }) =>
          manifest.id === activeManifest.id && manifest.version === activeManifest.version,
      )
    )
      results.push({ root: paths.systemSlot, manifest: activeManifest })
  } else {
    const root = join(paths.dataDirectory, 'interface-packs', 'skins')
    let ids = []
    try {
      ids = await readdir(root, { withFileTypes: true })
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    for (const id of ids) {
      if (!id.isDirectory() || id.name.startsWith('.')) continue
      const idRoot = join(root, id.name)
      for (const version of await readdir(idRoot, { withFileTypes: true })) {
        if (!version.isDirectory() || version.name.startsWith('.')) continue
        const packRoot = join(idRoot, version.name)
        const manifest = await readJson(
          join(packRoot, PACK_MANIFEST),
          'INTERFACE_PACK_MANIFEST_MISSING',
        )
        if (manifest.kind === 'skin') results.push({ root: packRoot, manifest })
      }
    }
  }
  return results
}

export async function listInterfacePacks(kind, options = {}) {
  if (!['skin', 'system'].includes(kind))
    throw packError('List requires kind skin or system.', 'INTERFACE_PACK_KIND_INVALID')
  const paths = defaultInterfacePaths(options)
  const selection = await readInterfaceSelection(options)
  const activeSystem = kind === 'system' ? await currentSystemManifest(paths) : null
  const packs = await installedPacks(kind, options)
  return packs
    .map(({ root, manifest }) => {
      const active =
        kind === 'system'
          ? activeSystem?.id === manifest.id && activeSystem?.version === manifest.version
          : selection.skin?.id === manifest.id && selection.skin?.version === manifest.version
      return {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        kind,
        active,
        path:
          kind === 'system' && active
            ? portablePath(relative(paths.workspaceDirectory, paths.systemSlot))
            : portablePath(relative(paths.dataDirectory, root)),
      }
    })
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name) || right.version.localeCompare(left.version),
    )
}

export async function useInterfacePack(kind, id, options = {}) {
  if (!['skin', 'system'].includes(kind))
    throw packError('Use requires kind skin or system.', 'INTERFACE_PACK_KIND_INVALID')
  const paths = defaultInterfacePaths(options)
  const packs = await installedPacks(kind, options)
  const candidates = packs.filter(({ manifest }) => manifest.id === id)
  const selected = options.version
    ? candidates.find(({ manifest }) => manifest.version === options.version)
    : candidates.sort((left, right) =>
        right.manifest.version.localeCompare(left.manifest.version),
      )[0]
  if (!selected)
    throw packError(`${kind} pack "${id}" is not installed.`, 'INTERFACE_PACK_NOT_INSTALLED')
  await validateInterfacePack(selected.root, {
    ...options,
    expectedKind: kind,
    applicationRoot: paths.applicationRoot,
    workspaceDirectory: paths.workspaceDirectory,
    dataDirectory: paths.dataDirectory,
    librariesDirectory: paths.librariesDirectory,
    contractPath: paths.contractPath,
    typecheckSystem: options.typecheckSystem ?? true,
  })
  if (kind === 'system') {
    await activateInstalledSystem(selected, options)
    return { kind, id: selected.manifest.id, version: selected.manifest.version, active: true }
  }
  const selection = await readInterfaceSelection(options)
  selection.skin = {
    id: selected.manifest.id,
    version: selected.manifest.version,
    path: portablePath(relative(paths.dataDirectory, selected.root)),
  }
  await writeInterfaceSelection(selection, options)
  return { kind, id: selected.manifest.id, version: selected.manifest.version, active: true }
}

export async function resetInterfacePack(kind, options = {}) {
  const paths = defaultInterfacePaths(options)
  if (kind === 'system') {
    const packs = await installedPacks('system', options)
    const selected = packs
      .filter(({ manifest }) => manifest.id === DEFAULT_SYSTEM_ID)
      .sort((left, right) => right.manifest.version.localeCompare(left.manifest.version))[0]
    if (!selected)
      throw packError(
        'The default System snapshot is unavailable. Reinstall the default System package.',
        'INTERFACE_DEFAULT_SYSTEM_MISSING',
      )
    await activateInstalledSystem(selected, options)
    return { kind, reset: true, active: DEFAULT_SYSTEM_ID }
  }
  const selection = await readInterfaceSelection(options)
  if (kind === 'skin') selection.skin = null
  else throw packError('Reset requires kind skin or system.', 'INTERFACE_PACK_KIND_INVALID')
  await writeInterfaceSelection(selection, options)
  return { kind, reset: true, active: kind === 'system' ? DEFAULT_SYSTEM_ID : null }
}

function selectedRoot(selection, kind, paths) {
  const selected = selection[kind]
  if (!selected) return null
  const base = paths.dataDirectory
  const root = resolve(base, normalizeRelativePath(selected.path, `${kind}.path`))
  if (!isInside(base, root))
    throw packError(
      `Active ${kind} path escapes its managed root.`,
      'INTERFACE_SELECTION_PATH_INVALID',
    )
  return root
}

export async function resolveActiveInterface(options = {}) {
  const paths = defaultInterfacePaths(options)
  const selection = await readInterfaceSelection(options)
  const system = await validateInterfacePack(paths.systemSlot, {
    ...options,
    expectedKind: 'system',
    applicationRoot: paths.applicationRoot,
    workspaceDirectory: paths.workspaceDirectory,
    dataDirectory: paths.dataDirectory,
    librariesDirectory: paths.librariesDirectory,
    contractPath: paths.contractPath,
  })
  let skin = null
  if (selection.skin) {
    const skinRoot = selectedRoot(selection, 'skin', paths)
    skin = await validateInterfacePack(skinRoot, {
      ...options,
      expectedKind: 'skin',
      applicationRoot: paths.applicationRoot,
      workspaceDirectory: paths.workspaceDirectory,
      dataDirectory: paths.dataDirectory,
      contractPath: paths.contractPath,
    })
  }
  return {
    selection,
    system,
    skin,
    skinStyle: skin?.entrypoints.style ?? paths.defaultSkinPath,
  }
}

export async function doctorInterfacePacks(options = {}) {
  try {
    const active = await resolveActiveInterface(options)
    if (options.typecheckSystem !== false) await typecheckInterfaceSystem(active.system, options)
    return {
      ok: true,
      system: {
        id: active.system.manifest.id,
        version: active.system.manifest.version,
        path: active.system.root,
      },
      skin: active.skin
        ? {
            id: active.skin.manifest.id,
            version: active.skin.manifest.version,
            path: active.skin.root,
          }
        : null,
      diagnostics: [],
    }
  } catch (error) {
    return {
      ok: false,
      system: null,
      skin: null,
      diagnostics: [{ code: error.code ?? 'INTERFACE_PACK_INVALID', message: error.message }],
    }
  }
}
