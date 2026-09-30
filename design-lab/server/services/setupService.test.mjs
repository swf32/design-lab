import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import {
  applySetupPlan,
  checkSetupInstallation,
  createSetupPlan,
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
