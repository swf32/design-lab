import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { getModuleEntities, parseComponentSourceImports } from './moduleEntities.mjs'

async function withTemporaryLibrariesDirectory(run) {
  const directory = await mkdtemp(join(tmpdir(), 'design-lab-libraries-'))
  const previous = process.env.DESIGN_LAB_LIBRARIES_DIR
  process.env.DESIGN_LAB_LIBRARIES_DIR = directory
  try {
    await run(directory)
  } finally {
    if (previous === undefined) delete process.env.DESIGN_LAB_LIBRARIES_DIR
    else process.env.DESIGN_LAB_LIBRARIES_DIR = previous
    await rm(directory, { recursive: true, force: true })
  }
}

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
    [
      'implementation',
      'styles',
      'manifest',
      'playground',
      'preview',
      'stories',
      'documentation',
      'changelog',
    ],
  )
  assert.equal(button.files.length, 8)
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
    [
      'story-canvas',
      'playground-controls-rail',
      'wireframe-dev-panel',
      'workbench-inspector',
      'workbench-playground',
    ],
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
  const northstar = await getModuleEntities('northstar-travel-system', 'wireframes')
  const pricing = result.wireframes.find((wireframe) => wireframe.id === 'pricing')

  assert.equal(result.kind, 'wireframes')
  assert.deepEqual(result.folders, ['product'])
  assert.deepEqual(result.modes, ['dark', 'light'])
  assert.equal(result.themeVariables.light['--ds-color-surface-primary'], '#f7f7f3')
  assert.deepEqual(northstar.modes, ['day', 'night', 'sunset'])
  assert.equal(northstar.themeVariables.sunset['--ds-color-surface-primary'], '#fffaf5')
  assert.deepEqual(northstar.wireframes, [])
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

test('a component.json that fails JSON.parse becomes a diagnostic on that entity, not a crash', async () => {
  await withTemporaryLibrariesDirectory(async (librariesDirectory) => {
    const libraryDirectory = join(librariesDirectory, 'broken-system')
    await mkdir(libraryDirectory, { recursive: true })
    await writeFile(
      join(libraryDirectory, 'library.json'),
      JSON.stringify({
        id: 'broken-system',
        kind: 'library',
        name: 'Broken System',
        schemaVersion: 1,
      }),
    )
    const okDirectory = join(libraryDirectory, 'components', 'ok')
    const brokenDirectory = join(libraryDirectory, 'components', 'broken')
    await mkdir(okDirectory, { recursive: true })
    await mkdir(brokenDirectory, { recursive: true })
    await writeFile(
      join(okDirectory, 'component.json'),
      JSON.stringify({ id: 'ok', name: 'Ok', schemaVersion: 1, status: 'draft' }),
    )
    await writeFile(join(brokenDirectory, 'component.json'), '{ not valid json')

    const result = await getModuleEntities('broken-system', 'components')
    const components = new Map(result.components.map((component) => [component.id, component]))

    assert.equal(
      components
        .get('ok')
        .completenessDiagnostics.some((diagnostic) => diagnostic.code === 'manifest-parse-error'),
      false,
    )
    const broken = components.get('broken')
    assert.ok(broken, 'a broken manifest still produces a visible entity')
    assert.equal(broken.name, 'broken')
    assert.equal(broken.import, null)
    assert.equal(
      broken.completenessDiagnostics.some(
        (diagnostic) => diagnostic.code === 'manifest-parse-error',
      ),
      true,
    )
  })
})

test('a schemaVersion newer than the server understands degrades to a diagnostic', async () => {
  await withTemporaryLibrariesDirectory(async (librariesDirectory) => {
    const libraryDirectory = join(librariesDirectory, 'future-system')
    await mkdir(libraryDirectory, { recursive: true })
    await writeFile(
      join(libraryDirectory, 'library.json'),
      JSON.stringify({
        id: 'future-system',
        kind: 'library',
        name: 'Future System',
        schemaVersion: 1,
      }),
    )
    const futureDirectory = join(libraryDirectory, 'wireframes', 'future')
    await mkdir(futureDirectory, { recursive: true })
    await writeFile(
      join(futureDirectory, 'wireframe.json'),
      JSON.stringify({ id: 'future', name: 'Future', schemaVersion: 99, status: 'draft' }),
    )

    const result = await getModuleEntities('future-system', 'wireframes')
    const future = result.wireframes.find((wireframe) => wireframe.id === 'future')

    assert.ok(future)
    assert.equal(
      future.diagnostics.some((diagnostic) => diagnostic.code === 'schema-version-unsupported'),
      true,
    )
  })
})
