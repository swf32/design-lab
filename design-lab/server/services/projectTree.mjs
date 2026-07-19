import { readdir } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import { getSource } from './projectRegistry.mjs'
import { getModuleNavigation } from './moduleEntities.mjs'

const MODULE_DIRECTORIES = {
  home: '.',
  components: 'components',
  wireframes: 'wireframes',
  pages: 'pages',
  assets: 'assets',
  palette: 'palette',
  tokens: 'tokens',
  fonts: 'fonts',
}

const ignoredNames = new Set(['node_modules', '.git', '.designlab', 'dist', '.DS_Store'])

function assertInsideProject(projectPath, targetPath) {
  const relativePath = relative(projectPath, targetPath)
  if (relativePath.startsWith(`..${sep}`) || relativePath === '..' || resolve(targetPath) === resolve(projectPath, '..')) {
    throw Object.assign(new Error('Path escapes the project directory'), { status: 400, code: 'PATH_OUTSIDE_PROJECT' })
  }
}

async function scanDirectory(rootPath, currentPath, level, result) {
  if (level > 8) return
  let entries
  try {
    entries = await readdir(currentPath, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }

  entries.sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name))
  for (const entry of entries) {
    if (ignoredNames.has(entry.name) || entry.name.startsWith('.')) continue
    const absolutePath = join(currentPath, entry.name)
    result.push({
      name: entry.name,
      path: relative(rootPath, absolutePath),
      kind: entry.isDirectory() ? 'folder' : 'file',
      level,
    })
    if (entry.isDirectory()) await scanDirectory(rootPath, absolutePath, level + 1, result)
  }
}

export async function getProjectTree(projectId, moduleId) {
  const project = await getSource(projectId)
  const semanticTree = await getModuleNavigation(projectId, moduleId)
  if (semanticTree) return { projectId, module: moduleId, rootPath: resolve(project.path, moduleId), tree: semanticTree }
  const moduleDirectory = MODULE_DIRECTORIES[moduleId]
  if (moduleDirectory === undefined) throw Object.assign(new Error('Unknown module'), { status: 400, code: 'UNKNOWN_MODULE' })
  const rootPath = resolve(project.path, moduleDirectory)
  assertInsideProject(project.path, rootPath)
  const tree = []
  await scanDirectory(rootPath, rootPath, 0, tree)
  return { projectId, module: moduleId, rootPath, tree }
}
