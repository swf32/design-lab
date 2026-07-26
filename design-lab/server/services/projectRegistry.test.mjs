import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { listProjects, registerInstalledProject } from './projectRegistry.mjs'

test('an embedded source is rebuilt from its filesystem config without registry state', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'design-lab-installation-discovery-'))
  const integration = join(workspace, 'design-lab')
  const data = join(workspace, '.test-data')
  const previousWorkspace = process.env.DESIGN_LAB_WORKSPACE_DIR
  const previousData = process.env.DESIGN_LAB_DATA_DIR
  process.env.DESIGN_LAB_WORKSPACE_DIR = workspace
  process.env.DESIGN_LAB_DATA_DIR = data

  try {
    await mkdir(integration, { recursive: true })
    await writeFile(
      join(integration, 'designlab.config.json'),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          installationId: 'installation-1',
          name: 'Existing product',
          mode: 'attach',
          source: {
            id: 'existing-product',
            root: '..',
            mounts: { components: ['src/components'] },
            packageEnvironments: [],
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    )

    const first = await listProjects()
    assert.equal(first.projects.length, 1)
    assert.equal(first.projects[0].id, 'existing-product')
    assert.equal(first.projects[0].path, workspace)
    assert.equal(first.projects[0].available, true)
    assert.equal(first.projects[0].configPath, 'design-lab/designlab.config.json')
    assert.deepEqual(first.projects[0].mounts, { components: ['src/components'] })

    const registered = await registerInstalledProject({
      name: 'Existing product',
      root: workspace,
      mode: 'attach',
      source: { id: 'existing-product', mounts: { components: ['src/components'] } },
      configPath: 'design-lab/designlab.config.json',
    })
    assert.equal(registered.id, 'existing-product')
    assert.equal((await listProjects()).projects.length, 1)
  } finally {
    if (previousWorkspace === undefined) delete process.env.DESIGN_LAB_WORKSPACE_DIR
    else process.env.DESIGN_LAB_WORKSPACE_DIR = previousWorkspace
    if (previousData === undefined) delete process.env.DESIGN_LAB_DATA_DIR
    else process.env.DESIGN_LAB_DATA_DIR = previousData
    await rm(workspace, { recursive: true, force: true })
  }
})
