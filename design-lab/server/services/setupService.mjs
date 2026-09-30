import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import {
  access,
  cp,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  writeFile,
} from 'node:fs/promises'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateInterfacePack } from './interfacePacks.mjs'

export const SETUP_SCHEMA_VERSION = 1
export const DEFAULT_INTEGRATION_DIRECTORY = 'design-lab'

const REPOSITORY_ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
const APPLICATION_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const BUNDLED_ROOT = join(APPLICATION_ROOT, 'vendor')
const DEFAULT_RULES_SOURCE = existsSync(join(REPOSITORY_ROOT, 'rules', 'SYSTEM_RULES.md'))
  ? join(REPOSITORY_ROOT, 'rules')
  : join(BUNDLED_ROOT, 'rules')
const DEFAULT_SYSTEM_SOURCE = existsSync(
  join(REPOSITORY_ROOT, 'libraries', 'design-lab-system', 'design-lab-pack.json'),
)
  ? join(REPOSITORY_ROOT, 'libraries', 'design-lab-system')
  : join(BUNDLED_ROOT, 'default-system')
const RULE_FILES = [
  'COMPONENT_RULES.md',
  'WIREFRAME_RULES.md',
  'PAGE_RULES.md',
  'TOKEN_RULES.md',
  'ASSET_RULES.md',
  'FONT_RULES.md',
]
const SKIPPED_DIRECTORIES = new Set([
  '.git',
  '.hg',
  '.svn',
  '.next',
  '.nuxt',
  '.svelte-kit',
  'node_modules',
  'coverage',
  'dist',
  'build',
  'out',
])
const SOURCE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx',
  '.vue',
  '.svelte',
  '.html',
])
const ASSET_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.mov',
  '.mp4',
  '.png',
  '.svg',
  '.webm',
  '.webp',
])
const MANAGED_AGENTS_START = '<!-- design-lab:setup:start -->'
const MANAGED_AGENTS_END = '<!-- design-lab:setup:end -->'

function setupError(message, code, status = 400) {
  return Object.assign(new Error(message), { code, status })
}

function portablePath(path) {
  return path.split(sep).join('/')
}

function isInside(path, root) {
  return path === root || path.startsWith(`${root}${sep}`)
}

function assertRoot(root) {
  const resolved = resolve(root)
  if (!resolved || resolved === resolve('/'))
    throw setupError('Choose a project folder, not the filesystem root.', 'SETUP_ROOT_INVALID')
  return resolved
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    return null
  }
}

async function walkRepository(root, integrationDirectory, maxDepth = 6) {
  const directories = new Set([''])
  const files = []

  async function walk(current, depth) {
    if (depth > maxDepth) return
    let entries = []
    try {
      entries = await readdir(current, { withFileTypes: true })
    } catch (error) {
      if (error.code === 'EACCES' || error.code === 'ENOENT') return
      throw error
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.storybook') continue
      if (SKIPPED_DIRECTORIES.has(entry.name)) continue
      const absolute = join(current, entry.name)
      const path = portablePath(relative(root, absolute))
      if (entry.isDirectory()) {
        if (path === integrationDirectory) continue
        directories.add(path)
        await walk(absolute, depth + 1)
      } else if (entry.isFile()) {
        files.push(path)
      }
    }
  }

  await walk(root, 0)
  return { directories: [...directories], files }
}

function filesWithin(files, directory) {
  const prefix = directory ? `${directory}/` : ''
  return files.filter((file) => file.startsWith(prefix))
}

function candidateMounts(scan, kind) {
  const names = {
    components: new Set(['components', 'component', 'ui']),
    tokens: new Set(['tokens', 'token', 'themes', 'theme', 'styles']),
    assets: new Set(['assets', 'public', 'static', 'media', 'images', 'icons']),
    fonts: new Set(['fonts', 'font']),
    pages: new Set(['pages', 'routes', 'screens', 'views']),
    wireframes: new Set(['wireframes', 'wireframe']),
  }[kind]
  const relevant = (file) => {
    const extension = extname(file).toLowerCase()
    if (kind === 'assets') return ASSET_EXTENSIONS.has(extension)
    if (kind === 'fonts') return ['.otf', '.ttf', '.woff', '.woff2'].includes(extension)
    if (kind === 'tokens')
      return (
        ['.css', '.json', '.scss', '.ts'].includes(extension) &&
        /token|theme|variable|color|typography|space/i.test(file)
      )
    return SOURCE_EXTENSIONS.has(extension) || file.endsWith(`${kind.slice(0, -1)}.json`)
  }

  const candidates = scan.directories
    .filter((directory) => names.has(basename(directory).toLowerCase()))
    .map((directory) => {
      const matchingFiles = filesWithin(scan.files, directory).filter(relevant)
      return {
        path: directory,
        confidence: matchingFiles.length > 2 ? 'high' : matchingFiles.length ? 'medium' : 'low',
        evidence: matchingFiles.slice(0, 4),
        fileCount: matchingFiles.length,
      }
    })
    .filter((candidate) => candidate.fileCount > 0)
    .sort(
      (a, b) =>
        b.fileCount - a.fileCount ||
        b.path.split('/').length - a.path.split('/').length ||
        a.path.localeCompare(b.path),
    )
  return candidates.filter(
    (candidate, index) =>
      !candidates
        .slice(0, index)
        .some(
          (chosen) =>
            chosen.fileCount === candidate.fileCount &&
            chosen.path.startsWith(`${candidate.path}/`),
        ),
  )
}

function frameworkNames(dependencies) {
  const names = new Set(Object.keys(dependencies ?? {}))
  return [
    names.has('react') || names.has('next') ? 'react' : null,
    names.has('vue') || names.has('nuxt') ? 'vue' : null,
    names.has('svelte') || names.has('@sveltejs/kit') ? 'svelte' : null,
    names.has('lit') ? 'custom-elements' : null,
  ].filter(Boolean)
}

function nearestOwner(path, packageRoots) {
  const candidates = packageRoots.filter(
    (root) => path === root || path.startsWith(root ? `${root}/` : ''),
  )
  return candidates.sort((a, b) => b.length - a.length)[0] ?? ''
}

function nearestLockfile(owner, lockfiles) {
  let current = owner
  while (true) {
    const found = lockfiles.find((lockfile) => dirname(lockfile) === (current || '.'))
    if (found) return found
    if (!current) return null
    const parent = portablePath(dirname(current))
    current = parent === '.' ? '' : parent
  }
}

export async function scanRepository(
  inputRoot,
  { integrationDirectory = DEFAULT_INTEGRATION_DIRECTORY } = {},
) {
  const root = assertRoot(inputRoot)
  const rootStats = await stat(root).catch(() => null)
  if (!rootStats?.isDirectory())
    throw setupError('The project folder does not exist.', 'SETUP_ROOT_NOT_FOUND', 404)

  const scan = await walkRepository(root, integrationDirectory)
  const packageFiles = scan.files.filter((file) => basename(file) === 'package.json')
  const lockfiles = scan.files.filter((file) =>
    ['bun.lock', 'bun.lockb', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].includes(
      basename(file),
    ),
  )
  const packages = []
  for (const file of packageFiles) {
    const manifest = await readJson(join(root, file))
    if (!manifest) continue
    const packageRoot = portablePath(dirname(file)) === '.' ? '' : portablePath(dirname(file))
    const dependencies = {
      ...(manifest.dependencies ?? {}),
      ...(manifest.devDependencies ?? {}),
      ...(manifest.peerDependencies ?? {}),
    }
    packages.push({
      path: packageRoot,
      manifest: file,
      name: manifest.name ?? basename(root),
      frameworks: frameworkNames(dependencies),
      lockfile: nearestLockfile(packageRoot, lockfiles),
    })
  }

  const mounts = Object.fromEntries(
    ['components', 'tokens', 'assets', 'fonts', 'wireframes', 'pages'].map((kind) => [
      kind,
      candidateMounts(scan, kind),
    ]),
  )
  const packageRoots = packages.map((item) => item.path)
  for (const candidates of Object.values(mounts))
    for (const candidate of candidates)
      candidate.packageRoot = nearestOwner(candidate.path, packageRoots)

  const rootPackage = packages.find((item) => item.path === '')
  const suggestedName =
    rootPackage?.name?.replace(/^@[^/]+\//, '')?.replace(/[-_]+/g, ' ') ?? basename(root)
  const frameworks = [...new Set(packages.flatMap((item) => item.frameworks))]
  const found = Object.fromEntries(
    Object.entries(mounts).map(([kind, candidates]) => [
      kind,
      {
        roots: candidates.length,
        files: candidates.reduce((total, candidate) => total + candidate.fileCount, 0),
      },
    ]),
  )

  return {
    schemaVersion: SETUP_SCHEMA_VERSION,
    root,
    suggestedName,
    frameworks,
    packages,
    lockfiles,
    mounts,
    found,
    warnings: packages.length
      ? []
      : ['No package.json was found. Catalog setup can continue, but live previews may need help.'],
  }
}

function chosenMounts(scan, mode, integrationDirectory) {
  const managed = (kind) => [`${integrationDirectory}/${kind}`]
  if (mode === 'managed')
    return Object.fromEntries(
      ['components', 'tokens', 'assets', 'fonts', 'wireframes', 'pages'].map((kind) => [
        kind,
        managed(kind),
      ]),
    )
  return Object.fromEntries(
    Object.entries(scan.mounts).map(([kind, candidates]) => [
      kind,
      candidates.length
        ? candidates.map((candidate) => candidate.path)
        : ['wireframes', 'pages'].includes(kind)
          ? managed(kind)
          : [],
    ]),
  )
}

export async function createSetupPlan({
  root,
  name,
  mode = 'attach',
  integrationDirectory = DEFAULT_INTEGRATION_DIRECTORY,
}) {
  if (!['attach', 'managed'].includes(mode))
    throw setupError('Choose an existing project or a clean start.', 'SETUP_MODE_INVALID')
  const scan = await scanRepository(root, { integrationDirectory })
  const projectName = String(name ?? scan.suggestedName).trim()
  if (projectName.length < 2 || projectName.length > 80)
    throw setupError('Project name must contain 2–80 characters.', 'SETUP_NAME_INVALID')
  const mounts = chosenMounts(scan, mode, integrationDirectory)
  const config = {
    schemaVersion: SETUP_SCHEMA_VERSION,
    installationId: randomUUID(),
    name: projectName,
    mode,
    integrationDirectory,
    source: {
      id: projectName
        .normalize('NFKD')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase(),
      root: '..',
      mounts,
      packageEnvironments: scan.packages.map(({ path, manifest, lockfile, frameworks }) => ({
        root: path,
        manifest,
        lockfile,
        frameworks,
      })),
    },
    runtime: { host: '127.0.0.1', port: 5317, applicationPort: null },
    interfaceSystem: { path: `${integrationDirectory}/system` },
  }
  const createdDirectories = [
    integrationDirectory,
    `${integrationDirectory}/rules`,
    `${integrationDirectory}/.cache`,
    ...Object.values(mounts)
      .flat()
      .filter((path) => path.startsWith(`${integrationDirectory}/`)),
  ]

  return {
    schemaVersion: SETUP_SCHEMA_VERSION,
    root: scan.root,
    name: projectName,
    mode,
    scan,
    config,
    changes: {
      createDirectories: [...new Set(createdDirectories)].sort(),
      createFiles: [
        `${integrationDirectory}/designlab.config.json`,
        `${integrationDirectory}/.gitignore`,
        ...RULE_FILES.map((file) => `${integrationDirectory}/rules/${file}`),
      ],
      updateFiles: ['AGENTS.md'],
      copyDirectories: [`${integrationDirectory}/system`],
      moveFiles: [],
      deleteFiles: [],
    },
    requiresConfirmation: true,
  }
}

function agentsBlock(integrationDirectory) {
  return `${MANAGED_AGENTS_START}
## Design Lab

Design Lab is connected to this repository. Before creating or changing an entity, read the
matching contract in \`${integrationDirectory}/rules/\`.

When a user asks to set up or import a design system:

1. Run the Design Lab setup scan first. It is read-only.
2. Explain in plain language what was found and which files would be created or changed.
3. Ask the user to confirm before applying the plan. Never infer confirmation from the request to
   inspect or scan.
4. Do not move, rename, overwrite, or delete existing product files unless the user separately and
   explicitly approves those exact changes.
5. Keep the product's dev server and port independent from Design Lab's local server.
6. Design Lab's own editable interface System is in \`${integrationDirectory}/system/\`;
   changes there are visible to Design Lab itself. The installed tool package is not the authoring source.
${MANAGED_AGENTS_END}`
}

function upsertManagedBlock(content, block) {
  const start = content.indexOf(MANAGED_AGENTS_START)
  const end = content.indexOf(MANAGED_AGENTS_END)
  if (start >= 0 && end >= start)
    return `${content.slice(0, start)}${block}${content.slice(end + MANAGED_AGENTS_END.length)}`
  const trimmed = content.trimEnd()
  return `${trimmed}${trimmed ? '\n\n' : ''}${block}\n`
}

async function writeJsonAtomic(path, value) {
  const temporary = `${path}.${randomUUID()}.tmp`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporary, path)
}

export async function checkSetupInstallation({
  root,
  integrationDirectory = DEFAULT_INTEGRATION_DIRECTORY,
  typecheckSystem = true,
}) {
  const projectRoot = assertRoot(root)
  const integrationRoot = resolve(projectRoot, integrationDirectory)
  const diagnostics = []
  const report = (code, message, path) => diagnostics.push({ code, message, path })
  if (!isInside(integrationRoot, projectRoot)) {
    report(
      'SETUP_INTEGRATION_PATH_INVALID',
      'The integration folder leaves the project.',
      integrationDirectory,
    )
    return { ok: false, diagnostics }
  }

  const configPath = join(integrationRoot, 'designlab.config.json')
  let config
  try {
    config = JSON.parse(await readFile(configPath, 'utf8'))
  } catch {
    report(
      'SETUP_CONFIG_INVALID',
      'The setup config is missing or invalid JSON.',
      portablePath(relative(projectRoot, configPath)),
    )
    return { ok: false, diagnostics }
  }
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    report(
      'SETUP_CONFIG_INVALID',
      'The setup config must be an object.',
      portablePath(relative(projectRoot, configPath)),
    )
    return { ok: false, diagnostics }
  }
  if (config.schemaVersion !== SETUP_SCHEMA_VERSION)
    report(
      'SETUP_SCHEMA_UNSUPPORTED',
      'The setup config has an unsupported schema version.',
      portablePath(relative(projectRoot, configPath)),
    )
  if (config.source?.root !== '..')
    report(
      'SETUP_SOURCE_ROOT_INVALID',
      'The product source must point to the project root.',
      portablePath(relative(projectRoot, configPath)),
    )

  if (
    !config.source?.mounts ||
    typeof config.source.mounts !== 'object' ||
    Array.isArray(config.source.mounts)
  )
    report(
      'SETUP_MOUNTS_INVALID',
      'The setup config has no source mounts.',
      portablePath(relative(projectRoot, configPath)),
    )

  for (const [kind, mounts] of Object.entries(config.source?.mounts ?? {})) {
    if (!Array.isArray(mounts)) {
      report(
        'SETUP_MOUNTS_INVALID',
        `${kind} mounts must be a list.`,
        portablePath(relative(projectRoot, configPath)),
      )
      continue
    }
    for (const mount of mounts) {
      if (typeof mount !== 'string' || !mount || mount.startsWith('/')) {
        report('SETUP_MOUNT_INVALID', `${kind} mount has an invalid relative path.`, String(mount))
        continue
      }
      const target = resolve(projectRoot, mount)
      if (!isInside(target, projectRoot)) {
        report('SETUP_MOUNT_OUTSIDE_ROOT', `${kind} mount leaves the project.`, mount)
        continue
      }
      if (!(await stat(target).catch(() => null))?.isDirectory())
        report('SETUP_MOUNT_MISSING', `${kind} mount is not a directory.`, mount)
    }
  }

  for (const rule of RULE_FILES) {
    const path = join(integrationRoot, 'rules', rule)
    if (!(await exists(path)))
      report('SETUP_RULE_MISSING', `${rule} is missing.`, portablePath(relative(projectRoot, path)))
  }
  const agents = await readFile(join(projectRoot, 'AGENTS.md'), 'utf8').catch(() => '')
  if (!agents.includes(MANAGED_AGENTS_START) || !agents.includes(MANAGED_AGENTS_END))
    report('SETUP_AGENTS_POINTER_MISSING', 'The root AGENTS.md pointer is missing.', 'AGENTS.md')

  const systemPath = config.interfaceSystem?.path
  if (typeof systemPath !== 'string' || !systemPath || systemPath.startsWith('/'))
    report('SETUP_SYSTEM_PATH_INVALID', 'The active System path is invalid.', String(systemPath))
  else {
    const systemRoot = resolve(projectRoot, systemPath)
    if (!isInside(systemRoot, projectRoot))
      report('SETUP_SYSTEM_PATH_INVALID', 'The active System leaves the project.', systemPath)
    else {
      try {
        await validateInterfacePack(systemRoot, { expectedKind: 'system', typecheckSystem })
      } catch (error) {
        report(error.code ?? 'SETUP_SYSTEM_INVALID', error.message, systemPath)
      }
    }
  }
  return { ok: diagnostics.length === 0, diagnostics }
}

export async function inspectSetupInstallation({
  root,
  integrationDirectory = DEFAULT_INTEGRATION_DIRECTORY,
  typecheckSystem = false,
}) {
  const projectRoot = assertRoot(root)
  const configPath = join(projectRoot, integrationDirectory, 'designlab.config.json')
  if (!(await exists(configPath)))
    return {
      available: false,
      reason: 'No embedded Design Lab setup is present in this workspace.',
    }
  return {
    available: true,
    ...(await checkSetupInstallation({ root: projectRoot, integrationDirectory, typecheckSystem })),
  }
}

export async function applySetupPlan({
  root,
  name,
  mode = 'attach',
  confirmed = false,
  integrationDirectory = DEFAULT_INTEGRATION_DIRECTORY,
  rulesSource = DEFAULT_RULES_SOURCE,
  defaultSystemSource = DEFAULT_SYSTEM_SOURCE,
}) {
  if (!confirmed)
    throw setupError(
      'Nothing was changed. Ask the user to confirm the setup plan first.',
      'SETUP_CONFIRMATION_REQUIRED',
      409,
    )
  const plan = await createSetupPlan({ root, name, mode, integrationDirectory })
  const integrationRoot = resolve(plan.root, integrationDirectory)
  if (!isInside(integrationRoot, plan.root))
    throw setupError(
      'The Design Lab folder must stay inside the project.',
      'SETUP_PATH_OUTSIDE_ROOT',
    )
  const configPath = join(integrationRoot, 'designlab.config.json')
  const systemSource = resolve(defaultSystemSource)
  const systemTarget = resolve(plan.root, plan.config.interfaceSystem.path)
  if (!isInside(systemTarget, plan.root))
    throw setupError(
      'The interface System must stay inside the project.',
      'SETUP_SYSTEM_PATH_INVALID',
    )
  if (!(await exists(join(systemSource, 'design-lab-pack.json'))))
    throw setupError('The default interface System is unavailable.', 'SETUP_SYSTEM_SOURCE_MISSING')
  const integrationExists = await exists(integrationRoot)
  if (integrationExists && !(await exists(configPath))) {
    const entries = await readdir(integrationRoot)
    if (entries.length)
      throw setupError(
        `The ${integrationDirectory}/ folder already contains files. Design Lab will not mix setup files into it automatically.`,
        'SETUP_DIRECTORY_OCCUPIED',
        409,
      )
  }

  for (const directory of plan.changes.createDirectories)
    await mkdir(resolve(plan.root, directory), { recursive: true })
  if (await exists(systemTarget))
    throw setupError(
      'The active interface System folder already exists.',
      'SETUP_SYSTEM_OCCUPIED',
      409,
    )
  await cp(systemSource, systemTarget, {
    recursive: true,
    errorOnExist: true,
    filter(path) {
      return !['.git', '.designlab', 'node_modules', 'dist'].includes(basename(path))
    },
  })
  await writeJsonAtomic(configPath, plan.config)
  await writeFile(join(integrationRoot, '.gitignore'), '.cache/\n', 'utf8')

  for (const rule of RULE_FILES) {
    const source = join(rulesSource, rule)
    const target = join(integrationRoot, 'rules', rule)
    if (await exists(source)) await copyFile(source, target)
    else
      await writeFile(
        target,
        `# ${rule.replace('_RULES.md', '').replaceAll('_', ' ')} rules\n\nThis rule contract was not included in the installed package. Run Design Lab repair.\n`,
        'utf8',
      )
  }

  const agentsPath = join(plan.root, 'AGENTS.md')
  const currentAgents = await readFile(agentsPath, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return ''
    throw error
  })
  await writeFile(
    agentsPath,
    upsertManagedBlock(currentAgents, agentsBlock(integrationDirectory)),
    'utf8',
  )

  return {
    applied: true,
    root: plan.root,
    mode: plan.mode,
    configPath: portablePath(relative(plan.root, configPath)),
    source: plan.config.source,
    changes: plan.changes,
    selfCheck: await checkSetupInstallation({ root: plan.root, integrationDirectory }),
  }
}
