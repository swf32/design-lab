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
    ['story-canvas', 'playground-controls-rail', 'wireframe-dev-panel', 'workbench-playground'],
  )
})

test('current illustrative previews do not import production components', async () => {
  const components = await componentInventory()
  const diagnostics = [...components.values()].flatMap(
    (component) => component.relations.diagnostics,
  )

  assert.deepEqual(
    diagnostics.filter((diagnostic) => diagnostic.code === 'preview-imports-component'),
    [],
  )
})

test('wireframe-only components and product modes are discovered without production entries', async () => {
  const result = await getModuleEntities('northstar-travel-system', 'components')
  const components = new Map(result.components.map((component) => [component.id, component]))
  const flightSearch = components.get('flight-search')
  const tripCard = components.get('trip-card')

  assert.deepEqual(result.modes, ['day', 'night', 'sunset'])
  assert.equal(result.themeVariables.night['--ds-color-surface-primary'], '#102a31')
  assert.equal(flightSearch.entry, undefined)
  assert.equal(flightSearch.import, null)
  assert.equal(flightSearch.playground, 'FlightSearch.playground.tsx')
  assert.equal(flightSearch.status, 'wireframe')
  assert.deepEqual(
    flightSearch.files.map((file) => file.role),
    ['manifest', 'playground', 'documentation', 'changelog'],
  )
  assert.deepEqual(flightSearch.relations.diagnostics, [])
  assert.equal(tripCard.status, 'ready')
  assert.equal(tripCard.playground, 'TripCard.playground.tsx')
  assert.deepEqual(tripCard.relations.diagnostics, [])
})

test('page Wireframes expose hybrid renderer, layouts, states, and user-flow diagnostics', async () => {
  const result = await getModuleEntities('design-lab-system', 'wireframes')
  const pricing = result.wireframes.find((wireframe) => wireframe.id === 'pricing')

  assert.equal(result.kind, 'wireframes')
  assert.deepEqual(result.folders, ['product'])
  assert.equal(pricing.entry, 'Pricing.wireframe.tsx')
  assert.deepEqual(
    pricing.layouts.map((layout) => layout.id),
    ['comparison', 'recommended', 'guided'],
  )
  assert.equal(pricing.states.length, 6)
  assert.equal(pricing.flow.nodes.length, 6)
  assert.equal(pricing.flow.edges.length, 7)
  assert.deepEqual(pricing.diagnostics, [])
  assert.deepEqual(
    pricing.files.map((file) => file.role),
    ['manifest', 'renderer', 'documentation', 'changelog'],
  )
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
