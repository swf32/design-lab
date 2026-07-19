import { randomUUID } from 'node:crypto'
import { access, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REGISTRY_VERSION = 1
const APPLICATION_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const WORKSPACE_ROOT = resolve(APPLICATION_ROOT, '..')

export function getWorkspaceDirectory() {
  return resolve(process.env.DESIGN_LAB_WORKSPACE_DIR ?? WORKSPACE_ROOT)
}

export function getDataDirectory() {
  return resolve(process.env.DESIGN_LAB_DATA_DIR ?? join(APPLICATION_ROOT, '.designlab'))
}

export function getProjectsDirectory() {
  return resolve(process.env.DESIGN_LAB_PROJECTS_DIR ?? join(getWorkspaceDirectory(), 'projects'))
}

export function getLibrariesDirectory() {
  return resolve(process.env.DESIGN_LAB_LIBRARIES_DIR ?? join(getWorkspaceDirectory(), 'libraries'))
}

function registryPath() {
  return join(getDataDirectory(), 'projects.json')
}

function slugify(name) {
  const slug = name
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return slug || 'design-system'
}

async function readRegistry() {
  try {
    const registry = JSON.parse(await readFile(registryPath(), 'utf8'))
    return {
      version: REGISTRY_VERSION,
      projects: Array.isArray(registry.projects) ? registry.projects : [],
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return { version: REGISTRY_VERSION, projects: [] }
  }
}

async function writeRegistry(registry) {
  await mkdir(getDataDirectory(), { recursive: true })
  const target = registryPath()
  const temporary = `${target}.${randomUUID()}.tmp`
  await writeFile(temporary, `${JSON.stringify(registry, null, 2)}\n`, 'utf8')
  await rename(temporary, target)
}

export async function listProjects() {
  const registry = await readRegistry()
  const projects = await Promise.all(
    registry.projects.map(async (project) => {
      try {
        await access(project.path)
        return { ...project, available: true }
      } catch {
        return { ...project, available: false }
      }
    }),
  )
  return { projects, workspacePath: getWorkspaceDirectory() }
}

export async function listSources() {
  const { projects } = await listProjects()
  let entries = []
  try {
    entries = await readdir(getLibrariesDirectory(), { withFileTypes: true })
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const libraries = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const path = join(getLibrariesDirectory(), entry.name)
    try {
      const manifest = JSON.parse(await readFile(join(path, 'library.json'), 'utf8'))
      libraries.push({ ...manifest, path, available: true, createdAt: manifest.createdAt ?? null })
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  return { sources: [...libraries, ...projects], workspacePath: getWorkspaceDirectory() }
}

export async function getSource(sourceId) {
  const { sources } = await listSources()
  const source = sources.find((item) => item.id === sourceId)
  if (!source)
    throw Object.assign(new Error('Design source not found'), {
      status: 404,
      code: 'SOURCE_NOT_FOUND',
    })
  return source
}

export async function getProject(projectId) {
  const registry = await readRegistry()
  const project = registry.projects.find((item) => item.id === projectId)
  if (!project)
    throw Object.assign(new Error('Project not found'), { status: 404, code: 'PROJECT_NOT_FOUND' })
  return project
}

export async function createProject(input) {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (name.length < 2 || name.length > 80) {
    throw Object.assign(new Error('Project name must contain 2–80 characters'), {
      status: 400,
      code: 'INVALID_PROJECT_NAME',
    })
  }

  const projectsPath = getProjectsDirectory()
  const directoryName = slugify(name)
  const projectPath = join(projectsPath, directoryName)

  await mkdir(projectsPath, { recursive: true })
  try {
    await mkdir(projectPath, { recursive: false })
  } catch (error) {
    if (error.code === 'EEXIST')
      throw Object.assign(new Error('A directory with this name already exists'), {
        status: 409,
        code: 'PROJECT_DIRECTORY_EXISTS',
      })
    throw error
  }

  const project = {
    id: randomUUID(),
    name,
    path: projectPath,
    kind: 'project',
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
  }

  const directories = [
    'components',
    'tokens',
    'palette',
    'fonts',
    'assets',
    'assets/icons',
    'assets/images',
    'assets/videos',
    'docs',
  ]
  await Promise.all(
    directories.map((directory) => mkdir(join(projectPath, directory), { recursive: true })),
  )
  await Promise.all([
    writeFile(
      join(projectPath, 'project.json'),
      `${JSON.stringify({ id: project.id, name, schemaVersion: 1 }, null, 2)}\n`,
      'utf8',
    ),
    writeFile(
      join(projectPath, 'tokens', 'base.tokens.json'),
      `${JSON.stringify({ schemaVersion: 1, name: 'Base', tokens: {} }, null, 2)}\n`,
      'utf8',
    ),
    writeFile(
      join(projectPath, 'fonts', 'fonts.json'),
      `${JSON.stringify({ schemaVersion: 1, families: [] }, null, 2)}\n`,
      'utf8',
    ),
    writeFile(
      join(projectPath, 'docs', 'README.md'),
      `# ${name}\n\nDesign system project created by Design Lab.\n`,
      'utf8',
    ),
  ])

  const registry = await readRegistry()
  registry.projects.push(project)
  await writeRegistry(registry)
  return { ...project, available: true }
}
