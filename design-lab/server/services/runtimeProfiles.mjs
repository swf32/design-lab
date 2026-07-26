import { createHash } from 'node:crypto'
import { access, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { getWorkspaceDirectory } from './projectRegistry.mjs'
import { resolveMountedPath } from './sourceMounts.mjs'

const FRAMEWORK_PACKAGE = new Map([
  ['react', 'react'],
  ['vue', 'vue'],
  ['svelte', 'svelte'],
])

const LOCKFILES = new Map([
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
])

function profileError(message, code = 'RUNTIME_PROFILE_INVALID') {
  return Object.assign(new Error(message), { code, status: 400 })
}

function isInside(root, target) {
  const path = relative(root, target)
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
}

function portable(path) {
  return path.split(sep).join('/')
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function configuredEnvironmentRoot(source, environment) {
  if (typeof environment?.root !== 'string' || !environment.root.trim()) return null
  if (
    isAbsolute(environment.root) ||
    /^[a-zA-Z]:[\\/]/.test(environment.root) ||
    environment.root.startsWith('\\\\') ||
    environment.root.split(/[\\/]/).includes('..')
  )
    throw profileError('Package environment roots must be relative to the source root.')
  const root = resolve(source.path, environment.root)
  if (!isInside(resolve(source.path), root))
    throw profileError('Package environment root escapes the source root.')
  return root
}

async function nearestPackageRoot(source, entryPath) {
  const sourceRoot = resolve(source.path)
  const configured = (source.packageEnvironments ?? [])
    .map((environment) => ({ environment, root: configuredEnvironmentRoot(source, environment) }))
    .filter(({ root }) => root && isInside(root, entryPath))
    .sort((left, right) => right.root.length - left.root.length)[0]
  if (configured) return configured

  let current = dirname(entryPath)
  while (isInside(sourceRoot, current)) {
    if (await exists(join(current, 'package.json')))
      return {
        root: current,
        environment: { root: portable(relative(sourceRoot, current)) || '.' },
      }
    if (current === sourceRoot) break
    current = dirname(current)
  }
  return { root: sourceRoot, environment: { root: '.' } }
}

async function findLockfile(packageRoot) {
  const workspaceRoot = resolve(getWorkspaceDirectory())
  const boundary = isInside(workspaceRoot, packageRoot) ? workspaceRoot : packageRoot
  let current = packageRoot
  while (isInside(boundary, current)) {
    for (const [name, packageManager] of LOCKFILES) {
      const path = join(current, name)
      if (await exists(path)) return { path, packageManager }
    }
    if (current === boundary) break
    current = dirname(current)
  }
  return { path: null, packageManager: null }
}

async function resolvedLockfile(source, owner) {
  const configured = owner.environment?.lockfile
  if (typeof configured === 'string' && configured.trim()) {
    if (
      isAbsolute(configured) ||
      /^[a-zA-Z]:[\\/]/.test(configured) ||
      configured.startsWith('\\\\') ||
      configured.split(/[\\/]/).includes('..')
    )
      throw profileError('Configured lockfile must be relative to the source root.')
    const path = resolve(source.path, configured)
    if (!isInside(resolve(source.path), path))
      throw profileError('Configured lockfile escapes the source root.')
    const packageManager = LOCKFILES.get(path.split(sep).at(-1)) ?? null
    if (packageManager && (await exists(path))) return { path, packageManager }
  }
  return findLockfile(owner.root)
}

async function packageManifest(packageRoot) {
  const path = join(packageRoot, 'package.json')
  try {
    return { path, value: JSON.parse(await readFile(path, 'utf8')) }
  } catch (error) {
    if (error.code === 'ENOENT') return { path: null, value: null }
    throw profileError(`Could not read package environment: ${error.message}`)
  }
}

async function resolvedFramework(packageRoot, technology) {
  const packageName = FRAMEWORK_PACKAGE.get(technology)
  if (!packageName) return { packageName: null, packagePath: null, version: null, available: false }
  try {
    const require = createRequire(join(packageRoot, 'package.json'))
    const packagePath = require.resolve(`${packageName}/package.json`)
    const manifest = JSON.parse(await readFile(packagePath, 'utf8'))
    return { packageName, packagePath, version: manifest.version ?? null, available: true }
  } catch {
    return { packageName, packagePath: null, version: null, available: false }
  }
}

function componentEntryPublicPath(entity) {
  if (entity.sourcePath) return entity.sourcePath
  const locator = entity.implementation?.locator
  if (locator?.kind !== 'file')
    throw profileError(
      'Component does not have a file runtime locator.',
      'RUNTIME_ENTRY_UNAVAILABLE',
    )
  return [entity.directory, locator.path].filter(Boolean).join('/')
}

export async function resolveComponentRuntimeProfile(source, component) {
  const technology = component.technology ?? component.implementation?.technology
  if (!FRAMEWORK_PACKAGE.has(technology) && technology !== 'web-component')
    throw profileError(
      `${technology || 'Unknown'} does not have a managed web runtime adapter.`,
      'RUNTIME_ADAPTER_UNAVAILABLE',
    )
  const entryPublicPath = componentEntryPublicPath(component)
  const entry = resolveMountedPath(source, 'components', entryPublicPath)
  const owner = await nearestPackageRoot(source, entry.target)
  const [manifest, lockfile, framework] = await Promise.all([
    packageManifest(owner.root),
    resolvedLockfile(source, owner),
    resolvedFramework(owner.root, technology),
  ])
  const ownerPath = portable(relative(resolve(source.path), owner.root)) || '.'
  const profileKey = `${source.id}\0${technology}\0${ownerPath}`
  const fingerprint = createHash('sha256').update(profileKey).digest('hex').slice(0, 12)

  return {
    id: `${source.id}:${technology}:${fingerprint}`,
    sourceId: source.id,
    technology,
    adapter: component.adapter ?? component.implementation?.adapter ?? technology,
    sourceRoot: resolve(source.path),
    entryPath: entry.target,
    entryPublicPath: entry.publicPath,
    packageEnvironment: {
      root: owner.root,
      sourceRelativeRoot: ownerPath,
      manifestPath: manifest.path,
      manifestName: manifest.value?.name ?? null,
      lockfilePath: lockfile.path,
      packageManager: lockfile.packageManager,
    },
    framework,
  }
}
