import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { realpath } from 'node:fs/promises'

export const SOURCE_MOUNT_MODULES = Object.freeze([
  'components',
  'wireframes',
  'pages',
  'assets',
  'tokens',
  'fonts',
])

function mountError(message, code = 'SOURCE_MOUNT_INVALID') {
  return Object.assign(new Error(message), { status: 400, code })
}

function portablePath(path) {
  return path.split(sep).join('/')
}

function isInside(root, target) {
  const path = relative(root, target)
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
}

function normalizeConfiguredPath(value, moduleId) {
  if (typeof value !== 'string' || !value.trim())
    throw mountError(`The ${moduleId} mount must be a non-empty relative path.`)
  if (isAbsolute(value) || /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\'))
    throw mountError(`The ${moduleId} mount must be relative to the source root.`)
  const normalized = portablePath(value.trim().replaceAll('\\', '/')).replace(/^\.\//, '')
  if (!normalized || normalized === '.' || normalized.split('/').includes('..'))
    throw mountError(`The ${moduleId} mount must stay inside the source root.`)
  return normalized
}

export function sourceMounts(source, moduleId) {
  if (!SOURCE_MOUNT_MODULES.includes(moduleId))
    throw mountError(`Unsupported source mount module "${moduleId}".`, 'SOURCE_MOUNT_UNSUPPORTED')
  const sourceRoot = resolve(source.path)
  const configured = source.mounts?.[moduleId]
  const explicit = Array.isArray(configured) && configured.length > 0
  const paths = explicit ? configured : [moduleId]
  const seen = new Set()
  const mounts = []

  for (const value of paths) {
    const path = normalizeConfiguredPath(value, moduleId)
    if (seen.has(path)) continue
    seen.add(path)
    const root = resolve(sourceRoot, path)
    if (!isInside(sourceRoot, root))
      throw mountError(`The ${moduleId} mount "${path}" escapes the source root.`)
    mounts.push({ moduleId, path, root, explicit, sourceRoot })
  }

  return mounts.map((mount, index) => ({
    ...mount,
    index,
    multiple: mounts.length > 1,
  }))
}

export function mountedPublicPath(mounts, mount, localPath = '') {
  const local = portablePath(localPath).replace(/^\.\//, '').replace(/^\/+/, '')
  if (!mounts.some((candidate) => candidate.root === mount.root))
    throw mountError('The requested root is not part of this source mount set.')
  if (!mount.multiple) return local
  return local ? `${mount.path}/${local}` : mount.path
}

export function mountedDirectoryPath(mounts, mount, localDirectory = '') {
  return mountedPublicPath(mounts, mount, localDirectory)
}

export function resolveMountedPath(source, moduleId, publicPath, { allowRoot = false } = {}) {
  if (typeof publicPath !== 'string')
    throw mountError(`The ${moduleId} path must be a string.`, 'SOURCE_PATH_INVALID')
  const mounts = sourceMounts(source, moduleId)
  const normalized = portablePath(publicPath.trim().replaceAll('\\', '/'))
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
  if ((!normalized && !allowRoot) || normalized.split('/').includes('..'))
    throw mountError(
      `The ${moduleId} path must stay inside a configured mount.`,
      'SOURCE_PATH_INVALID',
    )

  const candidates = mounts.flatMap((mount) => {
    if (!mount.multiple) return [{ mount, localPath: normalized }]
    if (normalized === mount.path) return [{ mount, localPath: '' }]
    if (normalized.startsWith(`${mount.path}/`))
      return [{ mount, localPath: normalized.slice(mount.path.length + 1) }]
    return []
  })
  if (candidates.length !== 1)
    throw mountError(
      `The ${moduleId} path does not identify exactly one configured mount.`,
      'SOURCE_PATH_MOUNT_AMBIGUOUS',
    )
  const { mount, localPath } = candidates[0]
  if (!localPath && !allowRoot)
    throw mountError(`The ${moduleId} path must identify a file or entity.`, 'SOURCE_PATH_INVALID')
  const target = resolve(mount.root, localPath)
  if (!isInside(mount.root, target) || (!allowRoot && target === mount.root))
    throw mountError(
      `The ${moduleId} path escapes its configured mount.`,
      'SOURCE_PATH_OUTSIDE_MOUNT',
    )
  return {
    mount,
    mounts,
    localPath,
    target,
    publicPath: mountedPublicPath(mounts, mount, localPath),
  }
}

export async function resolveMountedFile(source, moduleId, publicPath) {
  const resolved = resolveMountedPath(source, moduleId, publicPath)
  const [realSourceRoot, realMountRoot, realTarget] = await Promise.all([
    realpath(resolved.mount.sourceRoot),
    realpath(resolved.mount.root),
    realpath(resolved.target),
  ])
  if (!isInside(realSourceRoot, realMountRoot) || !isInside(realMountRoot, realTarget))
    throw mountError(
      `The ${moduleId} path resolves through a symlink outside its configured mount.`,
      'SOURCE_PATH_SYMLINK_ESCAPE',
    )
  return { ...resolved, target: realTarget }
}

export function sourceRelativePath(source, target) {
  const sourceRoot = resolve(source.path)
  const absolute = resolve(target)
  if (!isInside(sourceRoot, absolute))
    throw mountError('The requested path escapes the source root.', 'SOURCE_PATH_OUTSIDE_SOURCE')
  return portablePath(relative(sourceRoot, absolute))
}

export function sourceManagedPath(source, ...parts) {
  const sourceRoot = resolve(source.path)
  const target = resolve(join(sourceRoot, ...parts))
  if (!isInside(sourceRoot, target))
    throw mountError('The managed path escapes the source root.', 'SOURCE_PATH_OUTSIDE_SOURCE')
  return target
}
