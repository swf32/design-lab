import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { browseInterfaceFolders } from './interfaceFolderBrowser.mjs'

test('interface folder browser stays in the project and lists selectable folders', async () => {
  const root = await mkdtemp(join(tmpdir(), 'design-lab-folder-browser-'))
  try {
    await mkdir(join(root, 'design-lab', 'systems', 'my-system'), { recursive: true })
    await mkdir(join(root, 'node_modules', 'not-a-system'), { recursive: true })
    await symlink(tmpdir(), join(root, 'outside'))
    const top = await browseInterfaceFolders('.', { workspaceDirectory: root })
    assert.deepEqual(
      top.folders.map((folder) => folder.name),
      ['design-lab'],
    )
    const systems = await browseInterfaceFolders('design-lab/systems', { workspaceDirectory: root })
    assert.equal(systems.parent, 'design-lab')
    assert.deepEqual(systems.folders, [{ name: 'my-system', path: 'design-lab/systems/my-system' }])
    await assert.rejects(browseInterfaceFolders('../', { workspaceDirectory: root }), {
      code: 'INTERFACE_FOLDER_PATH_INVALID',
    })
    await assert.rejects(browseInterfaceFolders('outside', { workspaceDirectory: root }), {
      code: 'INTERFACE_FOLDER_PATH_INVALID',
    })
    await assert.rejects(browseInterfaceFolders('missing', { workspaceDirectory: root }), {
      code: 'INTERFACE_FOLDER_PATH_INVALID',
    })
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
