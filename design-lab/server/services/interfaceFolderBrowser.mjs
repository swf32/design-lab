import { lstat, readdir, realpath } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { getWorkspaceDirectory } from './projectRegistry.mjs'

const HIDDEN_FOLDERS = new Set(['.git', '.designlab', '.cache', 'node_modules', 'dist'])

function browserError(message) {
  return Object.assign(new Error(message), { code: 'INTERFACE_FOLDER_PATH_INVALID', status: 422 })
}

function within(root, target) {
  const path = relative(root, target)
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
}

export async function browseInterfaceFolders(path = '.', options = {}) {
  if (typeof path !== 'string' || !path.trim() || path.includes('\\') || isAbsolute(path))
    throw browserError('Choose a folder inside the project.')
  const segments = path.split('/')
  if (segments.some((segment) => segment === '..' || segment === '' || HIDDEN_FOLDERS.has(segment)))
    throw browserError('Choose a folder inside the project.')

  const root = await realpath(resolve(options.workspaceDirectory ?? getWorkspaceDirectory()))
  const requested = resolve(root, path)
  if (!within(root, requested)) throw browserError('Choose a folder inside the project.')
  let target
  try {
    target = await realpath(requested)
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR')
      throw browserError('The selected project folder no longer exists.')
    throw error
  }
  if (!within(root, target)) throw browserError('Choose a folder inside the project.')
  if (!(await lstat(target)).isDirectory()) throw browserError('The selected path is not a folder.')

  const current = relative(root, target).split(sep).join('/') || '.'
  const entries = await readdir(target, { withFileTypes: true })
  const folders = entries
    .filter((entry) => entry.isDirectory() && !HIDDEN_FOLDERS.has(entry.name))
    .map((entry) => ({
      name: entry.name,
      path: current === '.' ? entry.name : `${current}/${entry.name}`,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
  const parent = current === '.' ? null : current.split('/').slice(0, -1).join('/') || '.'
  return { path: current, parent, folders }
}
