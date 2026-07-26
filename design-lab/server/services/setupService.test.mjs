import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { applySetupPlan, createSetupPlan, scanRepository } from './setupService.mjs'

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
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('applySetupPlan requires confirmation and preserves existing AGENTS guidance', async () => {
  const root = await fixture()
  const rulesSource = join(root, 'rule-fixtures')
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

    await assert.rejects(
      applySetupPlan({ root, name: 'Sample system', mode: 'attach', rulesSource }),
      (error) => error.code === 'SETUP_CONFIRMATION_REQUIRED',
    )
    const result = await applySetupPlan({
      root,
      name: 'Sample system',
      mode: 'attach',
      confirmed: true,
      rulesSource,
    })
    const config = JSON.parse(
      await readFile(join(root, 'design-lab', 'designlab.config.json'), 'utf8'),
    )
    const agents = await readFile(join(root, 'AGENTS.md'), 'utf8')
    assert.equal(result.applied, true)
    assert.equal(config.mode, 'attach')
    assert.match(agents, /# Existing team rules/)
    assert.match(agents, /design-lab:setup:start/)
    assert.match(agents, /Ask the user to confirm/)
    assert.equal(
      await readFile(join(root, 'src', 'components', 'Button.tsx'), 'utf8'),
      'export function Button() { return <button /> }\n',
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
