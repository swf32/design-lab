import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import {
  createInterfacePack,
  doctorInterfacePacks,
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
    packageName: `@community/${id}`,
    componentImport: '@design-lab/system/components',
    iconImport: '@design-lab/system/icons',
    assetImport: '@design-lab/system/assets',
  })
  await writeJson(join(root, 'package.json'), {
    name: `@community/${id}`,
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

test('bundled System satisfies the static and typed application contract', async () => {
  const result = await validateInterfacePack(
    resolve(applicationRoot, '../libraries/design-lab-system'),
    {
      applicationRoot,
      contractPath,
      expectedKind: 'system',
      typecheckSystem: true,
    },
  )
  assert.equal(result.manifest.id, 'design-lab-system')
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
    assert.equal((await doctorInterfacePacks(options)).ok, true)

    const brokenSource = join(sources, 'community-system-v2-broken')
    await writeSystem(brokenSource, { version: '2.0.0', omitExport: 'ApplicationFrame' })
    await assert.rejects(
      installInterfacePack(brokenSource, { ...options, kind: 'system' }),
      (error) => error.code === 'INTERFACE_PACK_EXPORTS_MISSING',
    )
    const installedManifest = JSON.parse(
      await readFile(join(librariesDirectory, 'community-system', 'design-lab-pack.json'), 'utf8'),
    )
    assert.equal(installedManifest.version, '1.0.0')
    active = await resolveActiveInterface(options)
    assert.equal(active.system.manifest.version, '1.0.0')

    await resetInterfacePack('system', options)
    active = await resolveActiveInterface(options)
    assert.equal(active.system.manifest.id, 'design-lab-system')
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
