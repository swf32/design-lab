import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import {
  applySetupRepair,
  applySetupPlan,
  checkSetupInstallation,
  createSetupRepairPlan,
  createSetupPlan,
  inspectSetupFootprint,
  inspectSetupInstallation,
  scanRepository,
} from './setupService.mjs'

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'design-lab-setup-'))
  await mkdir(join(root, 'src', 'components'), { recursive: true })
  await mkdir(join(root, 'packages', 'tokens', 'src', 'tokens'), { recursive: true })
  await writeFile(
    join(root, 'package.json'),
    `${JSON.stringify(
      {
        name: 'sample-product',
        private: true,
        dependencies: { react: '^19.0.0' },
      },
      null,
      2,
    )}\n`,
  )
  await writeFile(join(root, 'package-lock.json'), '{}\n')
  await writeFile(
    join(root, 'src', 'components', 'Button.tsx'),
    'export function Button() { return <button /> }\n',
  )
  await writeFile(
    join(root, 'packages', 'tokens', 'src', 'tokens', 'base.tokens.json'),
    '{"color":{"accent":{"value":"#6633ff","type":"color"}}}\n',
  )
  return root
}

test('scanRepository finds existing framework sources without changing files', async () => {
  const root = await fixture()
  try {
    const scan = await scanRepository(root)
    assert.equal(scan.suggestedName, 'sample product')
    assert.deepEqual(scan.frameworks, ['react'])
    assert.equal(scan.mounts.components[0].path, 'src/components')
    assert.equal(scan.mounts.tokens[0].path, 'packages/tokens/src/tokens')
    await assert.rejects(readFile(join(root, 'design-lab', 'designlab.config.json')))
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('repair previews and restores only missing managed files', async () => {
  const root = await fixture()
  try {
    await writeFile(join(root, 'AGENTS.md'), '# Existing project guidance\n')
    await applySetupPlan({ root, name: 'Repair smoke', confirmed: true })
    const missingRule = join(root, 'design-lab/rules/COMPONENT_RULES.md')
    const customRule = join(root, 'design-lab/rules/TOKEN_RULES.md')
    const originalComponent = await readFile(join(root, 'src/components/Button.tsx'), 'utf8')
    await rm(missingRule)
    await writeFile(customRule, '# Keep my local rule\n')
    await writeFile(join(root, 'AGENTS.md'), '# Existing project guidance\n')

    const plan = await createSetupRepairPlan({ root })
    assert.equal(plan.available, true)
    assert.deepEqual(plan.changes, [
      { kind: 'restore-rule', path: 'design-lab/rules/COMPONENT_RULES.md' },
      { kind: 'append-agents-pointer', path: 'AGENTS.md' },
    ])
    await assert.rejects(applySetupRepair({ root, fingerprint: plan.fingerprint }), {
      code: 'SETUP_REPAIR_CONFIRMATION_REQUIRED',
    })
    await assert.rejects(applySetupRepair({ root, fingerprint: 'stale', confirmed: true }), {
      code: 'SETUP_REPAIR_STALE',
    })
    const repaired = await applySetupRepair({
      root,
      fingerprint: plan.fingerprint,
      confirmed: true,
    })
    assert.equal(repaired.applied, true)
    assert.equal(repaired.selfCheck.ok, true)
    assert.match(await readFile(missingRule, 'utf8'), /# Design Lab/)
    assert.equal(await readFile(customRule, 'utf8'), '# Keep my local rule\n')
    assert.equal(await readFile(join(root, 'src/components/Button.tsx'), 'utf8'), originalComponent)
    assert.match(await readFile(join(root, 'AGENTS.md'), 'utf8'), /# Existing project guidance/)
    assert.match(await readFile(join(root, 'AGENTS.md'), 'utf8'), /design-lab:setup:start/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('repair restores a damaged config from the reviewed last-good copy and preserves original bytes', async () => {
  const root = await fixture()
  try {
    await applySetupPlan({ root, name: 'Recovery smoke', confirmed: true })
    const configPath = join(root, 'design-lab/designlab.config.json')
    const lastGoodPath = join(root, 'design-lab/designlab.config.last-good.json')
    const original = await readFile(configPath, 'utf8')
    assert.equal(await readFile(lastGoodPath, 'utf8'), original)
    const damaged = '{ invalid config\n'
    await writeFile(configPath, damaged)
    const plan = await createSetupRepairPlan({ root })
    assert.equal(plan.available, true)
    assert.equal(plan.recovery.name, 'Recovery smoke')
    assert(plan.changes.some((change) => change.kind === 'restore-config'))
    const backup = plan.changes.find((change) => change.kind === 'backup-damaged-config')
    assert(backup)
    assert.equal(plan.canApply, true)
    await assert.rejects(
      applySetupRepair({ root, fingerprint: plan.fingerprint, confirmed: false }),
      { code: 'SETUP_REPAIR_CONFIRMATION_REQUIRED' },
    )
    await writeFile(configPath, `${damaged}changed`)
    await assert.rejects(
      applySetupRepair({ root, fingerprint: plan.fingerprint, confirmed: true }),
      { code: 'SETUP_REPAIR_STALE' },
    )
    await writeFile(configPath, damaged)
    const repaired = await applySetupRepair({
      root,
      fingerprint: plan.fingerprint,
      confirmed: true,
    })
    assert.equal(repaired.selfCheck.ok, true)
    assert.equal(await readFile(configPath, 'utf8'), original)
    assert.equal(await readFile(join(root, backup.path), 'utf8'), damaged)
    assert.match(await readFile(join(root, 'src/components/Button.tsx'), 'utf8'), /Button/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('repair reconstructs an older config without last-good after reviewing source mounts', async () => {
  const root = await fixture()
  try {
    await applySetupPlan({ root, name: 'Legacy recovery', confirmed: true })
    const configPath = join(root, 'design-lab/designlab.config.json')
    const lastGoodPath = join(root, 'design-lab/designlab.config.last-good.json')
    await rm(lastGoodPath)
    const damaged = '{ legacy damaged config\n'
    await writeFile(configPath, damaged)
    const draftPlan = await createSetupRepairPlan({ root })
    assert.equal(draftPlan.canApply, false)
    assert(draftPlan.suggestedConfig)
    assert(draftPlan.blockers.some((item) => item.code === 'SETUP_REPAIR_CONFIG_REVIEW_REQUIRED'))
    const recoveryConfig = structuredClone(draftPlan.suggestedConfig)
    recoveryConfig.name = 'Recovered project'
    recoveryConfig.source.mounts.components = ['src/components']
    recoveryConfig.source.mounts.tokens = ['packages/tokens/src/tokens']
    const unsafe = structuredClone(recoveryConfig)
    unsafe.source.mounts.components = ['../outside']
    const unsafePlan = await createSetupRepairPlan({ root, recoveryConfig: unsafe })
    assert.equal(unsafePlan.canApply, false)
    const missing = structuredClone(recoveryConfig)
    missing.source.mounts.components = ['src/not-present']
    const missingPlan = await createSetupRepairPlan({ root, recoveryConfig: missing })
    assert.equal(missingPlan.canApply, false)
    assert(missingPlan.blockers.some((item) => item.code === 'SETUP_REPAIR_MOUNT_INVALID'))
    const plan = await createSetupRepairPlan({ root, recoveryConfig })
    assert.equal(plan.canApply, true)
    assert.equal(plan.recovery.from, 'reviewed config draft')
    await writeFile(configPath, `${damaged}changed`)
    await assert.rejects(
      applySetupRepair({ root, recoveryConfig, fingerprint: plan.fingerprint, confirmed: true }),
      { code: 'SETUP_REPAIR_STALE' },
    )
    await writeFile(configPath, damaged)
    const applied = await applySetupRepair({
      root,
      recoveryConfig,
      fingerprint: plan.fingerprint,
      confirmed: true,
    })
    assert.equal(applied.selfCheck.ok, true)
    assert.deepEqual(
      JSON.parse(await readFile(configPath, 'utf8')).source.mounts,
      recoveryConfig.source.mounts,
    )
    assert.equal(
      await readFile(
        join(root, plan.changes.find((change) => change.kind === 'backup-damaged-config').path),
        'utf8',
      ),
      damaged,
    )
    assert.equal(await readFile(lastGoodPath, 'utf8'), await readFile(configPath, 'utf8'))
    assert.match(await readFile(join(root, 'src/components/Button.tsx'), 'utf8'), /Button/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('repair will not restore a damaged config from a linked or invalid last-good copy', async () => {
  const root = await fixture()
  try {
    await applySetupPlan({ root, name: 'Unsafe recovery', confirmed: true })
    const configPath = join(root, 'design-lab/designlab.config.json')
    const lastGoodPath = join(root, 'design-lab/designlab.config.last-good.json')
    await writeFile(configPath, '{ broken\n')
    await rm(lastGoodPath)
    await symlink(configPath, lastGoodPath)
    let plan = await createSetupRepairPlan({ root })
    assert.equal(
      plan.changes.some((change) => change.kind === 'restore-config'),
      false,
    )
    assert(plan.blockers.some((item) => item.code === 'SETUP_REPAIR_CONFIG_UNSAFE'))
    await rm(lastGoodPath)
    await writeFile(lastGoodPath, '{}\n')
    plan = await createSetupRepairPlan({ root })
    assert.equal(
      plan.changes.some((change) => change.kind === 'restore-config'),
      false,
    )
    assert(plan.blockers.some((item) => item.code === 'SETUP_REPAIR_CONFIG_SNAPSHOT_INVALID'))
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('repair refuses a linked local rules directory', async () => {
  const root = await fixture()
  try {
    await mkdir(join(root, 'design-lab'))
    await writeFile(join(root, 'design-lab/designlab.config.json'), '{}\n')
    await symlink(tmpdir(), join(root, 'design-lab/rules'))
    const plan = await createSetupRepairPlan({ root })
    assert.equal(plan.available, true)
    assert.equal(
      plan.changes.some((change) => change.kind === 'restore-rule'),
      false,
    )
    assert(plan.blockers.some((item) => item.code === 'SETUP_REPAIR_RULES_UNSAFE'))
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('repair replaces a missing relative mount after a project folder moves', async () => {
  const root = await fixture()
  try {
    await applySetupPlan({ root, name: 'Moved source', confirmed: true })
    await rename(join(root, 'src/components'), join(root, 'src/widgets'))
    const mountReplacements = [{ kind: 'components', from: 'src/components', to: 'src/widgets' }]
    const plan = await createSetupRepairPlan({ root, mountReplacements })
    assert(
      plan.changes.some((change) => change.kind === 'replace-mount' && change.to === 'src/widgets'),
    )
    assert.equal(
      plan.blockers.some((item) => item.code === 'SETUP_MOUNT_MISSING'),
      false,
    )
    await assert.rejects(
      applySetupRepair({ root, mountReplacements, fingerprint: 'stale', confirmed: true }),
      { code: 'SETUP_REPAIR_STALE' },
    )
    await assert.rejects(
      createSetupRepairPlan({
        root,
        mountReplacements: [{ kind: 'components', from: 'src/components', to: '../outside' }],
      }),
      { code: 'SETUP_REPAIR_MOUNT_INVALID' },
    )
    await symlink(tmpdir(), join(root, 'src/outside-link'))
    await assert.rejects(
      createSetupRepairPlan({
        root,
        mountReplacements: [{ kind: 'components', from: 'src/components', to: 'src/outside-link' }],
      }),
      { code: 'SETUP_REPAIR_MOUNT_INVALID' },
    )
    const configPath = join(root, 'design-lab/designlab.config.json')
    const originalConfig = await readFile(configPath, 'utf8')
    await writeFile(configPath, `${originalConfig.trimEnd()}\n `)
    await assert.rejects(
      applySetupRepair({ root, mountReplacements, fingerprint: plan.fingerprint, confirmed: true }),
      { code: 'SETUP_REPAIR_STALE' },
    )
    await writeFile(configPath, originalConfig)
    const applied = await applySetupRepair({
      root,
      mountReplacements,
      fingerprint: plan.fingerprint,
      confirmed: true,
    })
    assert.equal(applied.applied, true)
    assert.equal(applied.selfCheck.ok, true)
    const config = JSON.parse(await readFile(configPath, 'utf8'))
    assert.deepEqual(config.source.mounts.components, ['src/widgets'])
    assert.equal(
      await readFile(join(root, 'design-lab/designlab.config.last-good.json'), 'utf8'),
      await readFile(configPath, 'utf8'),
    )
    assert.match(
      await readFile(join(root, 'src/widgets/Button.tsx'), 'utf8'),
      /External button|button/,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('footprint inventory preserves the distinction between setup files and authored content', async () => {
  const root = await fixture()
  try {
    await writeFile(join(root, 'AGENTS.md'), '# Team guidance\n')
    await applySetupPlan({ root, name: 'Inventory smoke', confirmed: true })
    await writeFile(join(root, 'design-lab/rules/TOKEN_RULES.md'), '# My edited rule\n')
    await writeFile(join(root, 'design-lab/notes.md'), '# My notes\n')
    await writeFile(join(root, 'design-lab/rules/local.md'), '# Local\n')
    const before = await readFile(join(root, 'design-lab/rules/TOKEN_RULES.md'), 'utf8')
    const footprint = await inspectSetupFootprint({ root })
    assert.equal(footprint.available, true)
    assert.equal(footprint.agentsPointer.markers, 'complete')
    assert(
      footprint.projectOwned.some(
        (item) => item.path === 'design-lab/system' && item.state === 'directory',
      ),
    )
    assert(footprint.unclassified.includes('design-lab/notes.md'))
    assert(footprint.unclassified.includes('design-lab/rules/local.md'))
    assert.equal(
      footprint.setupFiles.find((item) => item.path === 'design-lab/rules/TOKEN_RULES.md')
        .matchesBundled,
      false,
    )
    assert.equal(await readFile(join(root, 'design-lab/rules/TOKEN_RULES.md'), 'utf8'), before)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('footprint inventory does not follow a linked rules directory', async () => {
  const root = await fixture()
  try {
    await mkdir(join(root, 'design-lab'))
    await symlink(tmpdir(), join(root, 'design-lab/rules'))
    const footprint = await inspectSetupFootprint({ root })
    assert.equal(
      footprint.setupFiles.find((item) => item.path === 'design-lab/rules').state,
      'link',
    )
    assert.equal(
      footprint.setupFiles.some((item) => item.path.endsWith('/TOKEN_RULES.md')),
      false,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('footprint inventory ignores an unrelated folder named design-lab', async () => {
  const root = await fixture()
  try {
    await mkdir(join(root, 'design-lab'))
    await writeFile(join(root, 'design-lab/notes.md'), '# Not an installation\n')
    assert.equal((await inspectSetupFootprint({ root })).available, false)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('integration status distinguishes a standalone workspace from a damaged setup', async () => {
  const root = await fixture()
  try {
    assert.deepEqual(await inspectSetupInstallation({ root }), {
      available: false,
      reason: 'No embedded Design Lab setup is present in this workspace.',
    })
    await mkdir(join(root, 'design-lab'))
    await writeFile(join(root, 'design-lab', 'designlab.config.json'), 'null\n')
    const status = await inspectSetupInstallation({ root })
    assert.equal(status.available, true)
    assert.equal(status.ok, false)
    assert.equal(status.diagnostics[0].code, 'SETUP_CONFIG_INVALID')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('createSetupPlan explains writes and never proposes moving product files', async () => {
  const root = await fixture()
  try {
    const plan = await createSetupPlan({ root, name: 'Sample system', mode: 'attach' })
    assert.equal(plan.requiresConfirmation, true)
    assert.deepEqual(plan.changes.moveFiles, [])
    assert.deepEqual(plan.changes.deleteFiles, [])
    assert.deepEqual(plan.config.source.mounts.components, ['src/components'])
    assert.equal(plan.config.runtime.port, 5317)
    assert.equal(plan.config.runtime.applicationPort, null)
    assert.equal(plan.config.interfaceSystem.path, 'design-lab/system')
    assert.deepEqual(plan.changes.copyDirectories, ['design-lab/system'])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('applySetupPlan requires confirmation and preserves existing AGENTS guidance', async () => {
  const root = await fixture()
  const rulesSource = join(root, 'rule-fixtures')
  const defaultSystemSource = await mkdtemp(join(tmpdir(), 'design-lab-default-system-'))
  try {
    await mkdir(rulesSource)
    for (const name of [
      'COMPONENT_RULES.md',
      'WIREFRAME_RULES.md',
      'PAGE_RULES.md',
      'TOKEN_RULES.md',
      'ASSET_RULES.md',
      'FONT_RULES.md',
    ])
      await writeFile(join(rulesSource, name), `# ${name}\n`)
    await writeFile(join(root, 'AGENTS.md'), '# Existing team rules\n\n- Keep this.\n')
    await writeFile(join(defaultSystemSource, 'design-lab-pack.json'), '{"kind":"system"}\n')
    await writeFile(join(defaultSystemSource, 'library.json'), '{"id":"design-lab-system"}\n')
    await writeFile(join(defaultSystemSource, 'README.md'), '# Default System\n')

    await assert.rejects(
      applySetupPlan({
        root,
        name: 'Sample system',
        mode: 'attach',
        rulesSource,
        defaultSystemSource,
      }),
      (error) => error.code === 'SETUP_CONFIRMATION_REQUIRED',
    )
    const result = await applySetupPlan({
      root,
      name: 'Sample system',
      mode: 'attach',
      confirmed: true,
      rulesSource,
      defaultSystemSource,
    })
    const config = JSON.parse(
      await readFile(join(root, 'design-lab', 'designlab.config.json'), 'utf8'),
    )
    const agents = await readFile(join(root, 'AGENTS.md'), 'utf8')
    assert.equal(result.applied, true)
    assert.equal(result.selfCheck.ok, false)
    assert(
      result.selfCheck.diagnostics.some((diagnostic) => diagnostic.code.startsWith('INTERFACE_')),
    )
    assert.equal(config.mode, 'attach')
    assert.equal(config.interfaceSystem.path, 'design-lab/system')
    assert.equal(
      await readFile(join(root, 'design-lab', 'system', 'README.md'), 'utf8'),
      '# Default System\n',
    )
    assert.match(agents, /# Existing team rules/)
    assert.match(agents, /design-lab:setup:start/)
    assert.match(agents, /Ask the user to confirm/)
    assert.equal(
      await readFile(join(root, 'src', 'components', 'Button.tsx'), 'utf8'),
      'export function Button() { return <button /> }\n',
    )
    await rm(join(root, 'src', 'components'), { recursive: true })
    const selfCheck = await checkSetupInstallation({ root, typecheckSystem: false })
    assert(
      selfCheck.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'SETUP_MOUNT_MISSING' && diagnostic.path === 'src/components',
      ),
    )
    await writeFile(join(root, 'design-lab', 'designlab.config.json'), 'null\n')
    assert.equal(
      (await checkSetupInstallation({ root })).diagnostics[0].code,
      'SETUP_CONFIG_INVALID',
    )
  } finally {
    await rm(root, { recursive: true, force: true })
    await rm(defaultSystemSource, { recursive: true, force: true })
  }
})
