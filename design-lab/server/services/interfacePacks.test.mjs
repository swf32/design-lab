import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import {
  createLocalInterfaceSkin,
  createInterfacePack,
  createLocalInterfaceSystem,
  defaultInterfacePaths,
  defaultSystemRecovery,
  diffInterfaceSystem,
  doctorInterfacePacks,
  inspectLocalInterfaceSystem,
  inspectLocalInterfaceSkin,
  installLocalInterfaceSystem,
  installLocalInterfaceSkin,
  installInterfacePack,
  listInterfacePacks,
  readInterfaceSelection,
  resetInterfacePack,
  resolveActiveInterface,
  validateInterfacePack,
  versionSatisfies,
} from './interfacePacks.mjs'

const applicationRoot = resolve(import.meta.dirname, '../..')
const contractPath = join(applicationRoot, 'interface-system-contract.json')

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function writeSkin(root, { id = 'soft-glass', version = '1.0.0', range = '^0.1.0' } = {}) {
  await mkdir(root, { recursive: true })
  await writeJson(join(root, 'design-lab-pack.json'), {
    schemaVersion: 1,
    id,
    name: 'Soft Glass',
    version,
    kind: 'skin',
    designLab: range,
    entrypoints: { style: 'theme.css' },
  })
  await writeFile(join(root, 'theme.css'), ':root { --shell-application-background: #eef1ff; }\n')
}

async function writeSystem(
  root,
  { id = 'community-system', version = '1.0.0', omitExport = null } = {},
) {
  const contract = JSON.parse(await readFile(contractPath, 'utf8'))
  const entrypoints = {}
  await mkdir(root, { recursive: true })
  for (const [key, definition] of Object.entries(contract.entrypoints)) {
    if (key === 'tokens') {
      entrypoints[key] = 'tokens.css'
      await writeFile(join(root, 'tokens.css'), ':root { --color-text-primary: #111; }\n')
      continue
    }
    if (key === 'assets') {
      entrypoints[key] = 'assets'
      await mkdir(join(root, 'assets'), { recursive: true })
      continue
    }
    entrypoints[key] = `${key}.ts`
    const names = definition.requiredExports.filter((name) => name !== omitExport)
    await writeFile(
      join(root, `${key}.ts`),
      `${names.map((name) => `export const ${name} = null`).join('\n')}\n`,
      'utf8',
    )
  }
  await writeJson(join(root, 'design-lab-pack.json'), {
    schemaVersion: 1,
    id,
    name: id === 'design-lab-system' ? 'Design Lab System' : 'Community System',
    version,
    kind: 'system',
    designLab: '>=0.1.0 <0.2.0',
    entrypoints,
  })
  await writeJson(join(root, 'library.json'), {
    id,
    kind: 'library',
    name: id === 'design-lab-system' ? 'Design Lab System' : 'Community System',
    schemaVersion: 1,
    version,
    packageName: '@design-lab/system',
    componentImport: '@design-lab/system/components',
    iconImport: '@design-lab/system/icons',
    assetImport: '@design-lab/system/assets',
  })
  await writeJson(join(root, 'package.json'), {
    name: '@design-lab/system',
    version,
    private: true,
    type: 'module',
  })
}

async function withPackWorkspace(run) {
  const root = await mkdtemp(join(tmpdir(), 'design-lab-interface-packs-'))
  const workspaceDirectory = join(root, 'workspace')
  const dataDirectory = join(root, 'data')
  const librariesDirectory = join(workspaceDirectory, 'libraries')
  const sources = join(root, 'sources')
  await mkdir(librariesDirectory, { recursive: true })
  await mkdir(sources, { recursive: true })
  await writeSystem(join(librariesDirectory, 'design-lab-system'), { id: 'design-lab-system' })
  const options = {
    applicationRoot,
    workspaceDirectory,
    dataDirectory,
    librariesDirectory,
    contractPath,
    defaultSkinPath: join(applicationRoot, 'src/styles/default-skin.css'),
    designLabVersion: '0.1.0',
    typecheckSystem: false,
    cwd: root,
  }
  try {
    await run({ root, sources, options, librariesDirectory, dataDirectory })
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('compatibility ranges support exact, comparator, caret, and tilde forms', () => {
  assert.equal(versionSatisfies('0.1.0', '>=0.1.0 <0.2.0'), true)
  assert.equal(versionSatisfies('0.2.0', '>=0.1.0 <0.2.0'), false)
  assert.equal(versionSatisfies('0.1.4', '^0.1.0'), true)
  assert.equal(versionSatisfies('0.2.0', '^0.1.0'), false)
  assert.equal(versionSatisfies('1.3.1', '~1.3.0'), true)
  assert.equal(versionSatisfies('1.4.0', '~1.3.0'), false)
})

test('system diff reports authored file and Component changes without generated files', async () => {
  await withPackWorkspace(async ({ root, options, librariesDirectory }) => {
    const active = join(librariesDirectory, 'design-lab-system')
    const baseline = join(root, 'package-default')
    await cp(active, baseline, { recursive: true })
    for (const system of [active, baseline]) {
      await writeJson(join(system, 'components/atoms/Button/component.json'), { id: 'button' })
      await writeFile(
        join(system, 'components/atoms/Button/Button.tsx'),
        'export const Button = 1\n',
      )
      await writeJson(join(system, 'components/atoms/Old/component.json'), { id: 'old' })
      await writeFile(join(system, 'components/index.ts'), 'generated barrel\n')
    }
    await writeFile(join(active, 'components/atoms/Button/Button.tsx'), 'export const Button = 2\n')
    await rm(join(active, 'components/atoms/Old'), { recursive: true })
    await writeJson(join(active, 'components/atoms/New/component.json'), { id: 'new' })
    await writeFile(join(active, 'assets/new.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>\n')
    await writeFile(join(active, 'components/index.ts'), 'new generated barrel\n')
    const diff = await diffInterfaceSystem({ ...options, defaultSystemSource: baseline })
    assert.equal(diff.identical, false)
    assert.deepEqual(diff.components, {
      added: ['components/atoms/New'],
      missing: ['components/atoms/Old'],
      changed: ['components/atoms/Button'],
    })
    assert(diff.files.added.includes('assets/new.svg'))
    assert(diff.files.changed.includes('components/atoms/Button/Button.tsx'))
    assert(!diff.files.changed.includes('components/index.ts'))
    assert(diff.files.missing.includes('components/atoms/Old/component.json'))
    await symlink(join(root, 'outside'), join(active, 'assets', 'unsafe.svg'))
    await assert.rejects(diffInterfaceSystem({ ...options, defaultSystemSource: baseline }), {
      code: 'INTERFACE_PACK_SYMLINK_UNSUPPORTED',
    })
  })
})

test('local System creation copies the active source without replacing it', async () => {
  await withPackWorkspace(async ({ options, librariesDirectory }) => {
    const created = await createLocalInterfaceSystem('authoring/my-system', 'My System', options)
    assert.equal(created.created, true)
    assert.equal(created.id, 'my-system')
    assert.equal(
      JSON.parse(await readFile(join(created.path, 'library.json'), 'utf8')).id,
      'my-system',
    )
    assert.equal(
      JSON.parse(await readFile(join(librariesDirectory, 'design-lab-system/library.json'), 'utf8'))
        .id,
      'design-lab-system',
    )
    await assert.rejects(
      createLocalInterfaceSystem('libraries/design-lab-system/nested', 'Nested', options),
      (error) => error.code === 'INTERFACE_PACK_DESTINATION_ACTIVE',
    )
    await assert.rejects(
      createLocalInterfaceSystem('authoring/my-system', 'Duplicate', options),
      (error) => error.code === 'INTERFACE_PACK_DESTINATION_EXISTS',
    )
  })
})

test('local Skin workflow creates, validates, installs, lists, and resets', async () => {
  await withPackWorkspace(async ({ options }) => {
    const created = await createLocalInterfaceSkin('authoring/my-skin', 'My Skin', options)
    assert.equal(created.id, 'my-skin')
    assert.equal((await inspectLocalInterfaceSkin(created.path, options)).valid, true)
    const installed = await installLocalInterfaceSkin(created.path, options)
    assert.equal(installed.active, true)
    assert.equal((await listInterfacePacks('skin', options))[0].active, true)
    assert.equal((await doctorInterfacePacks(options)).skin.id, 'my-skin')
    assert.equal((await resetInterfacePack('skin', options)).active, null)
    assert.equal((await doctorInterfacePacks(options)).skin, null)
  })
})

test('local System inspection and install share the validated one-slot installer', async () => {
  await withPackWorkspace(async ({ root, options, sources, librariesDirectory }) => {
    assert.equal((await defaultSystemRecovery(options)).available, false)
    const candidate = join(sources, 'new-system')
    await writeSystem(candidate, { id: 'new-system' })
    await assert.rejects(inspectLocalInterfaceSystem('', options), {
      code: 'INTERFACE_PACK_SOURCE_REQUIRED',
    })
    await assert.rejects(inspectLocalInterfaceSystem('missing-system', options), {
      code: 'INTERFACE_PACK_SOURCE_NOT_FOUND',
    })
    const inspected = await inspectLocalInterfaceSystem('sources/new-system', options)
    assert.equal(inspected.valid, true)
    assert.equal(inspected.id, 'new-system')
    assert.equal(inspected.canInstall, true)
    const installed = await installLocalInterfaceSystem('sources/new-system', options)
    assert.equal(installed.active, true)
    assert.equal(installed.id, 'new-system')
    assert.deepEqual(await defaultSystemRecovery(options), {
      available: true,
      source: 'snapshot',
      version: '1.0.0',
    })
    assert.equal(
      JSON.parse(
        await readFile(
          join(librariesDirectory, 'design-lab-system', 'design-lab-pack.json'),
          'utf8',
        ),
      ).id,
      'new-system',
    )
    assert.equal(
      JSON.parse(
        await readFile(
          join(
            root,
            'data',
            'interface-packs',
            'systems',
            'design-lab-system',
            '1.0.0',
            'design-lab-pack.json',
          ),
          'utf8',
        ),
      ).id,
      'design-lab-system',
    )
  })
})

test('embedded config selects one project-owned active System folder', async () => {
  const workspaceDirectory = await mkdtemp(join(tmpdir(), 'design-lab-embedded-system-'))
  try {
    await writeJson(join(workspaceDirectory, 'design-lab', 'designlab.config.json'), {
      schemaVersion: 1,
      interfaceSystem: { path: 'design-lab/system' },
    })
    const paths = defaultInterfacePaths({ workspaceDirectory })
    assert.equal(paths.systemSlot, join(workspaceDirectory, 'design-lab', 'system'))
    assert.equal(paths.dataDirectory, join(workspaceDirectory, 'design-lab', '.cache'))
  } finally {
    await rm(workspaceDirectory, { recursive: true, force: true })
  }
})

test('embedded reset restores the package default without relying on a cache snapshot', async () => {
  const workspaceDirectory = await mkdtemp(join(tmpdir(), 'design-lab-embedded-reset-'))
  const systemSlot = join(workspaceDirectory, 'design-lab', 'system')
  const defaultSystemSource = join(workspaceDirectory, 'package-default')
  try {
    await writeJson(join(workspaceDirectory, 'design-lab', 'designlab.config.json'), {
      schemaVersion: 1,
      interfaceSystem: { path: 'design-lab/system' },
    })
    await writeSystem(systemSlot, { id: 'design-lab-system' })
    await writeSystem(defaultSystemSource, { id: 'design-lab-system' })
    await writeFile(join(systemSlot, 'local-note.txt'), 'My edit\n')
    const result = await resetInterfacePack('system', {
      applicationRoot,
      workspaceDirectory,
      defaultSystemSource,
      contractPath,
      typecheckSystem: false,
    })
    assert.equal(result.active, 'design-lab-system')
    await assert.rejects(readFile(join(systemSlot, 'local-note.txt')))
    assert.equal(
      (await readInterfaceSelection({ workspaceDirectory })).system.path,
      'design-lab/system',
    )
  } finally {
    await rm(workspaceDirectory, { recursive: true, force: true })
  }
})

test('Skin authoring template documents only real generated System variables', async () => {
  const template = await readFile(
    join(applicationRoot, 'server/templates/interface-packs/skin/theme.css'),
    'utf8',
  )
  const generated = await readFile(
    resolve(applicationRoot, '../libraries/design-lab-system/tokens/generated/tokens.css'),
    'utf8',
  )
  const documented = new Set(template.match(/--[a-z0-9-]+/g) ?? [])
  const available = new Set(generated.match(/--[a-z0-9-]+/g) ?? [])
  assert.ok(documented.has('--shell-application-background'))
  assert.ok(documented.has('--shell-navigation-width'))
  assert.ok(documented.has('--shell-directory-panel-min'))
  assert.ok(documented.has('--shell-workspace-background'))
  assert.deepEqual(
    [...documented].filter((variable) => !available.has(variable)),
    [],
  )
})

test('the active System slot satisfies the static and typed application contract', async () => {
  const result = await validateInterfacePack(
    resolve(applicationRoot, '../libraries/design-lab-system'),
    {
      applicationRoot,
      contractPath,
      expectedKind: 'system',
      typecheckSystem: true,
    },
  )
  assert.equal(result.manifest.kind, 'system')
})

test('Skin and System scaffolds are immediately valid authoring packages', async () => {
  await withPackWorkspace(async ({ root, options }) => {
    const skin = await createInterfacePack('skin', 'new-skin', {
      ...options,
      cwd: root,
      name: 'New Skin',
    })
    const system = await createInterfacePack('system', 'new-system', {
      ...options,
      cwd: root,
      name: 'New System',
    })
    assert.equal(skin.id, 'new-skin')
    assert.equal(system.id, 'new-system')
    assert.match(
      await readFile(join(root, 'new-skin', 'AGENTS.md'), 'utf8'),
      /rules\/SKIN_RULES\.md/,
    )
    assert.match(
      await readFile(join(root, 'new-skin', 'theme.css'), 'utf8'),
      /--shell-navigation-width/,
    )
    assert.equal(
      await readFile(join(root, 'new-skin', 'rules', 'SKIN_RULES.md'), 'utf8'),
      await readFile(resolve(applicationRoot, '../rules/SKIN_RULES.md'), 'utf8'),
    )
    assert.match(
      await readFile(join(root, 'new-system', 'AGENTS.md'), 'utf8'),
      /rules\/SYSTEM_RULES\.md/,
    )
    for (const rule of [
      'SYSTEM_RULES.md',
      'COMPONENT_RULES.md',
      'TOKEN_RULES.md',
      'ASSET_RULES.md',
      'FONT_RULES.md',
      'WIREFRAME_RULES.md',
      'PAGE_RULES.md',
    ])
      assert.equal(
        await readFile(join(root, 'new-system', 'rules', rule), 'utf8'),
        await readFile(resolve(applicationRoot, `../rules/${rule}`), 'utf8'),
      )
    assert.match(
      await readFile(join(root, 'new-system', 'screenshots', 'README.md'), 'utf8'),
      /dark and light/,
    )
    assert.equal(
      (await validateInterfacePack(join(root, 'new-skin'), { ...options, expectedKind: 'skin' }))
        .manifest.kind,
      'skin',
    )
    assert.equal(
      (
        await validateInterfacePack(join(root, 'new-system'), {
          ...options,
          expectedKind: 'system',
        })
      ).manifest.kind,
      'system',
    )
  })
})

test('Skin install validates, activates, lists, resolves, and resets transactionally', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const skinSource = join(sources, 'soft-glass')
    await writeSkin(skinSource)

    const installed = await installInterfacePack(skinSource, { ...options, kind: 'skin' })
    assert.equal(installed.active, true)
    assert.equal(installed.id, 'soft-glass')
    assert.deepEqual(
      (await listInterfacePacks('skin', options)).map(({ id, version, active }) => ({
        id,
        version,
        active,
      })),
      [{ id: 'soft-glass', version: '1.0.0', active: true }],
    )
    const active = await resolveActiveInterface(options)
    assert.equal(active.system.manifest.id, 'design-lab-system')
    assert.equal(active.skin.manifest.id, 'soft-glass')
    assert.match(await readFile(active.skinStyle, 'utf8'), /shell-application-background/)

    await resetInterfacePack('skin', options)
    assert.equal((await readInterfaceSelection(options)).skin, null)
    assert.equal((await doctorInterfacePacks(options)).ok, true)
  })
})

test('System install requires the complete app contract and preserves the previous version on failure', async () => {
  await withPackWorkspace(async ({ sources, options, librariesDirectory }) => {
    const validSource = join(sources, 'community-system-v1')
    await writeSystem(validSource)
    await installInterfacePack(validSource, { ...options, kind: 'system' })

    let active = await resolveActiveInterface(options)
    assert.equal(active.system.manifest.id, 'community-system')
    assert.equal(active.system.manifest.version, '1.0.0')
    await assert.rejects(
      readFile(join(librariesDirectory, 'community-system', 'design-lab-pack.json'), 'utf8'),
      (error) => error.code === 'ENOENT',
    )
    assert.deepEqual(
      (await listInterfacePacks('system', options)).map(({ id, active }) => ({ id, active })),
      [
        { id: 'community-system', active: true },
        { id: 'design-lab-system', active: false },
      ],
    )
    assert.equal((await doctorInterfacePacks(options)).ok, true)

    const brokenSource = join(sources, 'community-system-v2-broken')
    await writeSystem(brokenSource, { version: '2.0.0', omitExport: 'ApplicationFrame' })
    await assert.rejects(
      installInterfacePack(brokenSource, { ...options, kind: 'system' }),
      (error) => error.code === 'INTERFACE_PACK_EXPORTS_MISSING',
    )
    const installedManifest = JSON.parse(
      await readFile(join(librariesDirectory, 'design-lab-system', 'design-lab-pack.json'), 'utf8'),
    )
    assert.equal(installedManifest.version, '1.0.0')
    active = await resolveActiveInterface(options)
    assert.equal(active.system.manifest.version, '1.0.0')

    await resetInterfacePack('system', options)
    active = await resolveActiveInterface(options)
    assert.equal(active.system.manifest.id, 'design-lab-system')
    assert.equal(
      JSON.parse(
        await readFile(
          join(librariesDirectory, 'design-lab-system', 'design-lab-pack.json'),
          'utf8',
        ),
      ).id,
      'design-lab-system',
    )
  })
})

test('incompatible packs and paths outside a pack fail before activation', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const incompatible = join(sources, 'future-skin')
    await writeSkin(incompatible, { id: 'future-skin', range: '>=2.0.0 <3.0.0' })
    await assert.rejects(
      validateInterfacePack(incompatible, { ...options, expectedKind: 'skin' }),
      (error) => error.code === 'INTERFACE_PACK_INCOMPATIBLE',
    )

    const escaping = join(sources, 'escaping-skin')
    await writeSkin(escaping, { id: 'escaping-skin' })
    const manifest = JSON.parse(await readFile(join(escaping, 'design-lab-pack.json'), 'utf8'))
    manifest.entrypoints.style = '../outside.css'
    await writeJson(join(escaping, 'design-lab-pack.json'), manifest)
    await assert.rejects(
      validateInterfacePack(escaping, { ...options, expectedKind: 'skin' }),
      (error) => error.code === 'INTERFACE_PACK_PATH_INVALID',
    )

    const linked = join(sources, 'linked-skin')
    await writeSkin(linked, { id: 'linked-skin' })
    await symlink(join(linked, 'theme.css'), join(linked, 'linked-theme.css'))
    await assert.rejects(
      validateInterfacePack(linked, { ...options, expectedKind: 'skin' }),
      (error) => error.code === 'INTERFACE_PACK_SYMLINK_UNSUPPORTED',
    )
  })
})
