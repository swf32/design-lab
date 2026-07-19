import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { getModuleEntities, parseComponentSourceImports } from './moduleEntities.mjs'

async function componentInventory() {
  const result = await getModuleEntities('design-lab-system', 'components')
  return new Map(result.components.map((component) => [component.id, component]))
}

test('component references are derived from the canonical filesystem contract', async () => {
  const components = await componentInventory()
  const button = components.get('button')

  assert.equal(button.import.statement, "import { Button } from '@design-lab/system/components'")
  assert.deepEqual(
    button.files.map((file) => file.role),
    ['implementation', 'styles', 'manifest', 'preview', 'stories', 'documentation', 'changelog'],
  )
  assert.equal(button.files.length, 7)
})

test('production and example relationships stay separate and direct', async () => {
  const components = await componentInventory()
  const button = components.get('button')
  const dialog = components.get('create-project-dialog')
  const moduleHeader = components.get('module-header')
  const storyCanvas = components.get('story-canvas')
  const playground = components.get('workbench-playground')

  assert.deepEqual(
    dialog.relations.uses.map((relation) => relation.id),
    ['button'],
  )
  assert.equal(
    dialog.relations.uses.some((relation) => relation.id === 'input'),
    false,
  )
  assert.deepEqual(dialog.relations.examplesUse, [])
  assert.deepEqual(
    moduleHeader.relations.uses.map((relation) => relation.id),
    ['button'],
  )
  assert.deepEqual(
    button.relations.usedBy.map((relation) => relation.id),
    ['module-header', 'create-project-dialog'],
  )
  assert.deepEqual(
    storyCanvas.relations.examplesUse.map((relation) => relation.id),
    ['button'],
  )
  assert.deepEqual(
    playground.relations.examplesUse.map((relation) => relation.id),
    ['button', 'checkbox'],
  )
  assert.deepEqual(
    button.relations.usedInExamplesBy.map((relation) => relation.id),
    ['story-canvas', 'workbench-playground'],
  )
})

test('current illustrative previews do not import production components', async () => {
  const components = await componentInventory()
  const diagnostics = [...components.values()].flatMap(
    (component) => component.relations.diagnostics,
  )

  assert.deepEqual(diagnostics, [])
})

test('source import parsing ignores type-only edges and localizes invalid TSX', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'design-lab-relations-'))
  try {
    const validPath = join(directory, 'valid.tsx')
    const invalidPath = join(directory, 'invalid.tsx')
    await writeFile(
      validPath,
      [
        "import type { ButtonProps } from '@design-lab/system/components'",
        "import { Button as Action, type InputProps } from '@design-lab/system/components'",
        'export const example = <Action>Save</Action>',
      ].join('\n'),
    )
    await writeFile(invalidPath, 'export const broken = <Button>')

    const valid = await parseComponentSourceImports(validPath)
    const invalid = await parseComponentSourceImports(invalidPath)

    assert.deepEqual(valid.diagnostics, [])
    assert.deepEqual(valid.imports, [
      {
        specifier: '@design-lab/system/components',
        symbols: ['Button'],
      },
    ])
    assert.equal(invalid.imports.length, 0)
    assert.equal(invalid.diagnostics[0]?.code, 'source-parse-error')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
