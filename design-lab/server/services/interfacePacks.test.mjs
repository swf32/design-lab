import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import {
  analyzeSystemUpgrade,
  applySystemUpgrade,
  createLocalInterfaceSkin,
  createInterfacePack,
  createLocalInterfaceSystem,
  defaultInterfacePaths,
  defaultSystemRecovery,
  diffInterfaceSystem,
  doctorInterfacePacks,
  inspectLocalInterfaceSystem,
  inspectLocalInterfaceSkin,
  inspectSystemUpgradeConflict,
  installLocalInterfaceSystem,
  installLocalInterfaceSkin,
  installInterfacePack,
  listInterfacePacks,
  parseInterfaceTypecheckDiagnostics,
  readInterfaceSelection,
  resetInterfacePack,
  resolveActiveInterface,
  stageLocalInterfaceSystemUpload,
  stageLocalInterfaceSkinUpload,
  validateInterfacePack,
  versionSatisfies,
  writeSystemBaseline,
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

test('typed System errors identify authored files before application consumers', () => {
  const root = '/tmp/interface-check'
  const application = '/tmp/design-lab-app'
  const report = parseInterfaceTypecheckDiagnostics(
    `${application}/src/App.tsx(20,4): error TS2322: Consumer mismatch.\n${root}/components/Button/Button.tsx(7,11): error TS2322: Wrong prop.\n/tmp/other/file.ts(1,1): error TS1000: Unrelated.`,
    root,
    application,
  )
  assert.deepEqual(report, {
    diagnostics: [
      {
        origin: 'system',
        path: 'components/Button/Button.tsx',
        line: 7,
        column: 11,
        code: 'TS2322',
        message: 'Wrong prop.',
      },
      {
        origin: 'application',
        path: 'src/App.tsx',
        line: 20,
        column: 4,
        code: 'TS2322',
        message: 'Consumer mismatch.',
      },
    ],
    total: 2,
  })
})

test('failed System typecheck exposes authored file diagnostics', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const source = join(sources, 'broken-type-system')
    await writeSystem(source)
    await writeFile(
      join(source, 'components.ts'),
      `${await readFile(join(source, 'components.ts'), 'utf8')}\nexport const broken: string = 1\n`,
    )
    await assert.rejects(
      validateInterfacePack(source, { ...options, expectedKind: 'system', typecheckSystem: true }),
      (error) =>
        error.code === 'INTERFACE_PACK_TYPECHECK_FAILED' &&
        error.details.diagnostics.some(
          (item) =>
            item.origin === 'system' && item.path === 'components.ts' && item.code === 'TS2322',
        ),
    )
  })
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

test('System upgrade preserves local files and blocks overlapping edits', async () => {
  await withPackWorkspace(async ({ root, options, librariesDirectory }) => {
    const active = join(librariesDirectory, 'design-lab-system')
    const bundled = join(root, 'new-default')
    await cp(active, bundled, { recursive: true })
    await writeSystemBaseline(active, bundled)
    await writeFile(join(active, 'local-note.txt'), 'local edit\n')
    await writeFile(join(bundled, 'new-feature.txt'), 'bundled update\n')
    const upgradeOptions = { ...options, defaultSystemSource: bundled }
    const preview = await analyzeSystemUpgrade(upgradeOptions)
    assert.equal(preview.available, true)
    assert.deepEqual(preview.files.upstreamOnly, ['new-feature.txt'])
    assert.deepEqual(preview.files.localOnly, ['local-note.txt'])
    assert.deepEqual(preview.files.conflicts, [])
    await assert.rejects(applySystemUpgrade('outdated', upgradeOptions), {
      code: 'INTERFACE_UPGRADE_STALE',
    })
    const applied = await applySystemUpgrade(preview.fingerprint, upgradeOptions)
    assert.equal(applied.updated, true)
    assert.equal(await readFile(join(active, 'local-note.txt'), 'utf8'), 'local edit\n')
    assert.equal(await readFile(join(active, 'new-feature.txt'), 'utf8'), 'bundled update\n')
    assert.equal((await analyzeSystemUpgrade(upgradeOptions)).files.upstreamOnly.length, 0)

    await writeFile(join(active, 'components.ts'), 'export const local = true\n')
    await writeFile(join(bundled, 'components.ts'), 'export const bundled = true\n')
    await writeFile(join(bundled, 'another-default.txt'), 'must not be applied\n')
    const conflicted = await analyzeSystemUpgrade(upgradeOptions)
    assert.deepEqual(conflicted.files.conflicts, ['components.ts'])
    assert(conflicted.files.upstreamOnly.includes('another-default.txt'))
    const comparison = await inspectSystemUpgradeConflict(
      'components.ts',
      conflicted.fingerprint,
      upgradeOptions,
    )
    assert.equal(comparison.local.kind, 'text')
    assert.equal(comparison.local.text, 'export const local = true\n')
    assert.equal(comparison.bundled.kind, 'text')
    assert.equal(comparison.bundled.text, 'export const bundled = true\n')
    await assert.rejects(
      inspectSystemUpgradeConflict('../outside', conflicted.fingerprint, upgradeOptions),
      { code: 'INTERFACE_UPGRADE_CONFLICT_NOT_FOUND' },
    )
    await assert.rejects(inspectSystemUpgradeConflict('components.ts', 'stale', upgradeOptions), {
      code: 'INTERFACE_UPGRADE_STALE',
    })
    await assert.rejects(applySystemUpgrade(conflicted.fingerprint, upgradeOptions), {
      code: 'INTERFACE_UPGRADE_CONFLICT',
    })
    await assert.rejects(
      applySystemUpgrade(conflicted.fingerprint, {
        ...upgradeOptions,
        resolutions: { 'components.ts': 'bundled' },
      }),
      { code: 'INTERFACE_PACK_EXPORTS_MISSING' },
    )
    assert.equal(
      await readFile(join(active, 'components.ts'), 'utf8'),
      'export const local = true\n',
    )
    await assert.rejects(readFile(join(active, 'another-default.txt'), 'utf8'))

    await writeFile(join(active, 'binary.bin'), Buffer.from([0, 1, 2]))
    await writeFile(join(bundled, 'binary.bin'), Buffer.from([0, 3, 4]))
    await writeFile(join(active, 'large.txt'), 'a'.repeat(140_000))
    await writeFile(join(bundled, 'large.txt'), 'b'.repeat(140_000))
    const nonTextPlan = await analyzeSystemUpgrade(upgradeOptions)
    const binary = await inspectSystemUpgradeConflict(
      'binary.bin',
      nonTextPlan.fingerprint,
      upgradeOptions,
    )
    assert.equal(binary.local.kind, 'binary')
    assert.equal(binary.bundled.kind, 'binary')
    const large = await inspectSystemUpgradeConflict(
      'large.txt',
      nonTextPlan.fingerprint,
      upgradeOptions,
    )
    assert.equal(large.local.kind, 'large')
    assert.equal(large.bundled.kind, 'large')
    assert.equal('text' in large.local, false)
    await rm(join(active, 'components.ts'))
    const deletedPlan = await analyzeSystemUpgrade(upgradeOptions)
    const deleted = await inspectSystemUpgradeConflict(
      'components.ts',
      deletedPlan.fingerprint,
      upgradeOptions,
    )
    assert.equal(deleted.local.kind, 'missing')
    assert.equal(deleted.bundled.kind, 'text')
  })
})

test('System upgrade applies only explicitly chosen conflict resolutions', async () => {
  for (const choice of ['local', 'bundled']) {
    await withPackWorkspace(async ({ root, options, librariesDirectory }) => {
      const active = join(librariesDirectory, 'design-lab-system')
      const bundled = join(root, 'new-default')
      await cp(active, bundled, { recursive: true })
      await writeSystemBaseline(active, bundled)
      await writeFile(join(active, 'conflict.txt'), 'my version\n')
      await writeFile(join(bundled, 'conflict.txt'), 'bundled version\n')
      await writeFile(join(bundled, 'new-feature.txt'), 'new upstream file\n')
      const upgradeOptions = { ...options, defaultSystemSource: bundled }
      const plan = await analyzeSystemUpgrade(upgradeOptions)
      assert.deepEqual(plan.files.conflicts, ['conflict.txt'])
      await assert.rejects(
        applySystemUpgrade(plan.fingerprint, {
          ...upgradeOptions,
          resolutions: { 'unknown.txt': 'local' },
        }),
        { code: 'INTERFACE_UPGRADE_RESOLUTION_INVALID' },
      )
      await assert.rejects(applySystemUpgrade(plan.fingerprint, upgradeOptions), {
        code: 'INTERFACE_UPGRADE_CONFLICT',
      })
      assert.equal(await readFile(join(active, 'conflict.txt'), 'utf8'), 'my version\n')
      await assert.rejects(readFile(join(active, 'new-feature.txt')))
      const applied = await applySystemUpgrade(plan.fingerprint, {
        ...upgradeOptions,
        resolutions: { 'conflict.txt': choice },
      })
      assert.equal(applied.updated, true)
      assert.equal(
        await readFile(join(active, 'conflict.txt'), 'utf8'),
        choice === 'local' ? 'my version\n' : 'bundled version\n',
      )
      assert.equal(await readFile(join(active, 'new-feature.txt'), 'utf8'), 'new upstream file\n')
      assert.deepEqual((await analyzeSystemUpgrade(upgradeOptions)).files.conflicts, [])
    })
  }
})

test('default-derived System fork can upgrade without losing its identity or local edits', async () => {
  await withPackWorkspace(async ({ root, options, librariesDirectory }) => {
    const active = join(librariesDirectory, 'design-lab-system')
    const bundled = join(root, 'new-default')
    await cp(active, bundled, { recursive: true })
    const created = await createLocalInterfaceSystem('authoring/my-system', 'My System', options)
    await installLocalInterfaceSystem(created.path, options)
    assert.equal(
      (await analyzeSystemUpgrade({ ...options, defaultSystemSource: bundled })).available,
      true,
    )

    await writeFile(join(active, 'local-note.txt'), 'author edit\n')
    await writeFile(join(bundled, 'new-feature.txt'), 'new default\n')
    const upgradeOptions = { ...options, defaultSystemSource: bundled }
    const preview = await analyzeSystemUpgrade(upgradeOptions)
    assert.equal(preview.canApply, true)
    assert(preview.files.localOnly.includes('design-lab-pack.json'))
    await applySystemUpgrade(preview.fingerprint, upgradeOptions)
    assert.equal((await readInterfaceSelection(options)).system.id, 'my-system')
    assert.equal(
      JSON.parse(await readFile(join(active, 'design-lab-pack.json'), 'utf8')).id,
      'my-system',
    )
    assert.equal(await readFile(join(active, 'local-note.txt'), 'utf8'), 'author edit\n')
    assert.equal(await readFile(join(active, 'new-feature.txt'), 'utf8'), 'new default\n')

    await writeFile(join(active, 'new-feature.txt'), 'second author edit\n')
    await writeFile(join(bundled, 'new-feature.txt'), 'second default edit\n')
    const conflicted = await analyzeSystemUpgrade(upgradeOptions)
    assert.deepEqual(conflicted.files.conflicts, ['new-feature.txt'])
    await assert.rejects(applySystemUpgrade(conflicted.fingerprint, upgradeOptions), {
      code: 'INTERFACE_UPGRADE_CONFLICT',
    })
    assert.equal(await readFile(join(active, 'new-feature.txt'), 'utf8'), 'second author edit\n')
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

test('System author can start from bundled default even while a customized System is active', async () => {
  await withPackWorkspace(async ({ root, options, librariesDirectory }) => {
    const active = join(librariesDirectory, 'design-lab-system')
    const bundled = join(root, 'bundled-default')
    await cp(active, bundled, { recursive: true })
    await writeFile(join(active, 'active-only.txt'), 'local customization\n')
    await assert.rejects(
      createLocalInterfaceSystem('authoring/invalid', 'Invalid', {
        ...options,
        template: 'unknown',
      }),
      { code: 'INTERFACE_PACK_TEMPLATE_INVALID' },
    )
    const fresh = await createLocalInterfaceSystem('authoring/from-default', 'From Default', {
      ...options,
      defaultSystemSource: bundled,
      template: 'default',
    })
    await assert.rejects(readFile(join(fresh.path, 'active-only.txt')))
    assert.equal(
      JSON.parse(await readFile(join(fresh.path, 'library.json'), 'utf8')).id,
      'from-default',
    )
    assert(await readFile(join(fresh.path, 'design-lab-baseline.json'), 'utf8'))
    const copied = await createLocalInterfaceSystem('authoring/from-active', 'From Active', {
      ...options,
      template: 'active',
    })
    assert.equal(
      await readFile(join(copied.path, 'active-only.txt'), 'utf8'),
      'local customization\n',
    )
  })
})

test('local Skin workflow creates, validates, installs, lists, and resets', async () => {
  await withPackWorkspace(async ({ options }) => {
    const created = await createLocalInterfaceSkin('authoring/my-skin', 'My Skin', options)
    assert.equal(created.id, 'my-skin')
    const preview = await inspectLocalInterfaceSkin(created.path, options)
    assert.equal(preview.valid, true)
    await writeFile(
      join(created.path, 'theme.css'),
      ':root { --shell-application-background: red; }\n',
    )
    await assert.rejects(
      installLocalInterfaceSkin(created.path, {
        ...options,
        expectedFingerprint: preview.fingerprint,
      }),
      { code: 'INTERFACE_PACK_STALE', status: 409 },
    )
    assert.equal((await doctorInterfacePacks(options)).skin, null)
    const current = await inspectLocalInterfaceSkin(created.path, options)
    assert.notEqual(current.fingerprint, preview.fingerprint)
    const installed = await installLocalInterfaceSkin(created.path, {
      ...options,
      expectedFingerprint: current.fingerprint,
    })
    assert.equal(installed.active, true)
    assert.equal((await listInterfacePacks('skin', options))[0].active, true)
    assert.equal((await doctorInterfacePacks(options)).skin.id, 'my-skin')
    assert.equal((await resetInterfacePack('skin', options)).active, null)
    assert.equal((await doctorInterfacePacks(options)).skin, null)
  })
})

test('uploaded Skin folder is validated and installed from staging without changing the source', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const source = join(sources, 'external-skin')
    await writeSkin(source, { id: 'external-skin' })
    const manifest = await readFile(join(source, 'design-lab-pack.json'))
    const css = await readFile(join(source, 'theme.css'))
    await assert.rejects(
      stageLocalInterfaceSkinUpload([{ path: '../outside.css', bytes: css }], options),
      { code: 'INTERFACE_UPLOAD_PATH_INVALID' },
    )
    await assert.rejects(
      stageLocalInterfaceSkinUpload([{ path: 'design-lab-pack.json', bytes: manifest }], options),
    )
    const inspected = await stageLocalInterfaceSkinUpload(
      [
        { path: 'design-lab-pack.json', bytes: manifest },
        { path: 'theme.css', bytes: css },
      ],
      options,
    )
    assert.equal(inspected.uploaded, true)
    assert.equal(inspected.id, 'external-skin')
    assert.notEqual(inspected.path, source)
    const installed = await installLocalInterfaceSkin(inspected.path, {
      ...options,
      expectedFingerprint: inspected.fingerprint,
    })
    assert.equal(installed.active, true)
    assert.equal((await doctorInterfacePacks(options)).skin.id, 'external-skin')
    assert.deepEqual(await readFile(join(source, 'theme.css')), css)
  })
})

test('local System inspection and install share the validated one-slot installer', async () => {
  await withPackWorkspace(async ({ root, options, sources, librariesDirectory }) => {
    assert.equal((await defaultSystemRecovery(options)).available, false)
    const candidate = join(sources, 'new-system')
    await writeSystem(candidate, { id: 'new-system' })
    await writeFile(
      join(candidate, 'assets', 'candidate.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg"/>\n',
    )
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
    assert.equal(inspected.diff.baselineKind, 'active')
    assert(inspected.diff.files.added.includes('assets/candidate.svg'))
    assert.equal(inspected.diff.target, candidate)
    await writeFile(
      join(candidate, 'assets', 'candidate.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg"><path/></svg>\n',
    )
    await assert.rejects(
      installLocalInterfaceSystem('sources/new-system', {
        ...options,
        expectedFingerprint: inspected.fingerprint,
      }),
      { code: 'INTERFACE_PACK_STALE', status: 409 },
    )
    assert.equal((await doctorInterfacePacks(options)).system.id, 'design-lab-system')
    const current = await inspectLocalInterfaceSystem('sources/new-system', options)
    assert.notEqual(current.fingerprint, inspected.fingerprint)
    const installed = await installLocalInterfaceSystem('sources/new-system', {
      ...options,
      expectedFingerprint: current.fingerprint,
    })
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

test('uploaded System folder is staged, validated, and installed without touching the source', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const source = join(sources, 'upload-system')
    await writeSystem(source, { id: 'upload-system' })
    await writeFile(
      join(source, 'assets', 'mark.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg"/>\n',
    )
    const files = []
    async function collect(directory, prefix = '') {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name
        if (entry.isDirectory()) await collect(join(directory, entry.name), path)
        else files.push({ path, bytes: await readFile(join(directory, entry.name)) })
      }
    }
    await collect(source)
    await assert.rejects(
      stageLocalInterfaceSystemUpload(
        [{ path: '../outside.txt', bytes: Buffer.from('bad') }],
        options,
      ),
      { code: 'INTERFACE_UPLOAD_PATH_INVALID' },
    )
    const inspection = await stageLocalInterfaceSystemUpload(files, options)
    assert.equal(inspection.uploaded, true)
    assert.equal(inspection.id, 'upload-system')
    assert.equal(inspection.canInstall, true)
    assert(inspection.diff.files.added.includes('assets/mark.svg'))
    const installed = await installLocalInterfaceSystem(inspection.path, {
      ...options,
      expectedFingerprint: inspection.fingerprint,
    })
    assert.equal(installed.id, 'upload-system')
    assert.equal(
      await readFile(join(source, 'assets', 'mark.svg'), 'utf8'),
      '<svg xmlns="http://www.w3.org/2000/svg"/>\n',
    )
    assert.equal((await doctorInterfacePacks(options)).system.id, 'upload-system')
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

test('damaged embedded config keeps the project-owned System available for Settings repair', async () => {
  const workspaceDirectory = await mkdtemp(join(tmpdir(), 'design-lab-damaged-config-'))
  try {
    await mkdir(join(workspaceDirectory, 'design-lab', 'system'), { recursive: true })
    const configPath = join(workspaceDirectory, 'design-lab', 'designlab.config.json')
    for (const damaged of ['{ broken\n', 'null\n', '{}\n']) {
      await writeFile(configPath, damaged)
      const paths = defaultInterfacePaths({ workspaceDirectory })
      assert.equal(paths.systemSlot, join(workspaceDirectory, 'design-lab', 'system'))
      assert.equal(paths.dataDirectory, join(workspaceDirectory, 'design-lab', '.cache'))
    }
  } finally {
    await rm(workspaceDirectory, { recursive: true, force: true })
  }
})

test('missing embedded config keeps the project-owned System available when setup files remain', async () => {
  const workspaceDirectory = await mkdtemp(join(tmpdir(), 'design-lab-missing-config-'))
  try {
    await mkdir(join(workspaceDirectory, 'design-lab', 'system'), { recursive: true })
    await mkdir(join(workspaceDirectory, 'design-lab', 'rules'))
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
    const skinReadme = await readFile(join(root, 'new-skin', 'README.md'), 'utf8')
    assert.match(skinReadme, /Settings → Interface Skin/)
    assert.match(skinReadme, /Check Skin/)
    assert.match(skinReadme, /Clear Skin/)
    assert.equal(
      await readFile(join(root, 'new-skin', 'rules', 'SKIN_RULES.md'), 'utf8'),
      await readFile(resolve(applicationRoot, '../rules/SKIN_RULES.md'), 'utf8'),
    )
    assert.match(
      await readFile(join(root, 'new-system', 'AGENTS.md'), 'utf8'),
      /rules\/SYSTEM_RULES\.md/,
    )
    const systemReadme = await readFile(join(root, 'new-system', 'README.md'), 'utf8')
    assert.match(systemReadme, /Settings → Interface System/)
    assert.match(systemReadme, /Choose folder on computer/)
    assert.match(systemReadme, /Check folder/)
    assert.match(systemReadme, /Restore default/)
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

test('System validation identifies a missing statically imported asset before installation', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const source = join(sources, 'asset-system')
    await writeSystem(source)
    await writeFile(
      join(source, 'components.ts'),
      `${await readFile(join(source, 'components.ts'), 'utf8')}\nimport missingImage from '@design-lab/system/assets/images/missing.svg'\nexport { missingImage }\n`,
    )
    await assert.rejects(
      validateInterfacePack(source, { ...options, expectedKind: 'system' }),
      (error) =>
        error.code === 'INTERFACE_PACK_ASSET_MISSING' &&
        error.details.source === 'components.ts' &&
        error.details.path === 'assets/images/missing.svg',
    )
    await mkdir(join(source, 'assets/images'), { recursive: true })
    await writeFile(
      join(source, 'assets/images/missing.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" />\n',
    )
    assert.equal(
      (await validateInterfacePack(source, { ...options, expectedKind: 'system' })).manifest.kind,
      'system',
    )
  })
})

test('System validation checks literal asset URLs and lazy imports before installation', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const source = join(sources, 'url-asset-system')
    await writeSystem(source)
    const componentPath = join(source, 'components.ts')
    const original = await readFile(componentPath, 'utf8')
    await writeFile(
      componentPath,
      `${original}\nexport const imageUrl = new URL('./assets/images/missing.svg', import.meta.url).href\n`,
    )
    await assert.rejects(
      validateInterfacePack(source, { ...options, expectedKind: 'system' }),
      (error) =>
        error.code === 'INTERFACE_PACK_ASSET_MISSING' &&
        error.details.source === 'components.ts' &&
        error.details.path === 'assets/images/missing.svg',
    )
    await mkdir(join(source, 'assets/images'), { recursive: true })
    await writeFile(
      join(source, 'assets/images/missing.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" />\n',
    )
    await writeFile(
      componentPath,
      `${original}\nexport const loadImage = () => import('./assets/images/lazy.svg')\n`,
    )
    await assert.rejects(
      validateInterfacePack(source, { ...options, expectedKind: 'system' }),
      (error) =>
        error.code === 'INTERFACE_PACK_ASSET_MISSING' &&
        error.details.path === 'assets/images/lazy.svg',
    )
    await writeFile(
      join(source, 'assets/images/lazy.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" />\n',
    )
    assert.equal(
      (await validateInterfacePack(source, { ...options, expectedKind: 'system' })).manifest.kind,
      'system',
    )
  })
})

test('System validation resolves constant asset expressions and reports runtime-dependent paths', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const source = join(sources, 'computed-asset-system')
    await writeSystem(source)
    const componentPath = join(source, 'components.ts')
    const original = await readFile(componentPath, 'utf8')
    await writeFile(
      componentPath,
      `${original}\nexport const imageUrl = new URL('./assets/images/' + 'missing.svg', import.meta.url).href\n`,
    )
    await assert.rejects(
      validateInterfacePack(source, { ...options, expectedKind: 'system' }),
      (error) =>
        error.code === 'INTERFACE_PACK_ASSET_MISSING' &&
        error.details.path === 'assets/images/missing.svg',
    )
    await mkdir(join(source, 'assets/images'), { recursive: true })
    await writeFile(join(source, 'assets/images/missing.svg'), '<svg/>\n')
    await writeFile(
      componentPath,
      `${original}\nexport const imageUrl = new URL(\`./assets/images/\${'missing'}\${'.svg'}\`, import.meta.url).href\nexport const dynamicUrl = (name: string) => new URL(name, import.meta.url).href\n`,
    )
    const inspected = await inspectLocalInterfaceSystem(source, {
      ...options,
      typecheckSystem: false,
    })
    assert.deepEqual(inspected.unresolvedAssetReferences, {
      total: 1,
      references: [
        {
          source: 'components.ts',
          line: original.split('\n').length + 2,
          kind: 'new URL',
          expression: 'name',
        },
      ],
    })
  })
})

test('System validation checks local CSS and SCSS asset URLs without treating data URLs as files', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const source = join(sources, 'styled-system')
    await writeSystem(source)
    await mkdir(join(source, 'components/Badge'), { recursive: true })
    const style = join(source, 'components/Badge/Badge.scss')
    await writeFile(
      style,
      '.badge { background: url("../../assets/images/missing.svg"); mask: url(data:image/svg+xml;base64,PHN2Zy8+); }\n',
    )
    await assert.rejects(
      validateInterfacePack(source, { ...options, expectedKind: 'system' }),
      (error) =>
        error.code === 'INTERFACE_PACK_ASSET_MISSING' &&
        error.details.source === 'components/Badge/Badge.scss' &&
        error.details.path === 'assets/images/missing.svg',
    )
    await mkdir(join(source, 'assets/images'), { recursive: true })
    await writeFile(
      join(source, 'assets/images/missing.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" />\n',
    )
    assert.equal(
      (await validateInterfacePack(source, { ...options, expectedKind: 'system' })).manifest.kind,
      'system',
    )
  })
})

test('System inspection reports CSS and SCSS runtime asset URLs for manual review', async () => {
  await withPackWorkspace(async ({ sources, options }) => {
    const source = join(sources, 'dynamic-style-system')
    await writeSystem(source)
    await mkdir(join(source, 'components/Badge'), { recursive: true })
    await writeFile(
      join(source, 'components/Badge/Badge.scss'),
      '.badge { background: url(var(--badge-image)); }\n.badge2 { mask: url($mask-file); }\n.badge3 { background: url(data:image/svg+xml;base64,PHN2Zy8+); }\n',
    )
    const inspected = await inspectLocalInterfaceSystem(source, {
      ...options,
      typecheckSystem: false,
    })
    assert.deepEqual(inspected.unresolvedAssetReferences, {
      total: 2,
      references: [
        {
          source: 'components/Badge/Badge.scss',
          line: 1,
          kind: 'CSS url()',
          expression: 'var(--badge-image)',
        },
        {
          source: 'components/Badge/Badge.scss',
          line: 2,
          kind: 'CSS url()',
          expression: '$mask-file',
        },
      ],
    })
  })
})
