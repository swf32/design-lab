import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { getModuleEntities, getModuleNavigation } from './moduleEntities.mjs'

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

async function writeLibrary(librariesDirectory, id, pages) {
  const libraryDirectory = join(librariesDirectory, id)
  await mkdir(libraryDirectory, { recursive: true })
  await writeFile(
    join(libraryDirectory, 'library.json'),
    JSON.stringify({ id, kind: 'library', name: id, schemaVersion: 1 }),
  )
  for (const [directory, manifest] of Object.entries(pages)) {
    const pageDirectory = join(libraryDirectory, 'pages', directory)
    await mkdir(pageDirectory, { recursive: true })
    await writeFile(join(pageDirectory, 'page.json'), JSON.stringify(manifest))
  }
  return libraryDirectory
}

async function pagesInventory() {
  const result = await getModuleEntities('design-lab-system', 'pages')
  return new Map(result.pages.map((page) => [page.id, page]))
}

test('the canonical Home/Auth/Account example Pages discover cleanly with no diagnostics', async () => {
  const pages = await pagesInventory()
  const home = pages.get('home')
  const auth = pages.get('auth')
  const account = pages.get('account')

  assert.ok(home && auth && account, 'all three example Pages are discovered')
  assert.deepEqual(home.diagnostics, [])
  assert.deepEqual(auth.diagnostics, [])
  assert.deepEqual(account.diagnostics, [])
  assert.equal(home.mirroredRoute, '/')
  assert.equal(auth.mirroredRoute, '/login')
  assert.equal(account.mirroredRoute, '/account')
})

test('a conditional cross-Page flow edge resolves kind, pageId, and condition as authored', async () => {
  const pages = await pagesInventory()
  const home = pages.get('home')
  const toAuth = home.flow.edges.find((edge) => edge.id === 'guest-open-profile')
  const toAccount = home.flow.edges.find((edge) => edge.id === 'member-open-profile')

  assert.deepEqual(toAuth.to, {
    kind: 'page',
    pageId: 'auth',
    condition: { controlId: 'authenticated', value: false },
  })
  assert.deepEqual(toAccount.to, {
    kind: 'page',
    pageId: 'account',
    condition: { controlId: 'authenticated', value: true },
  })
})

test('getModuleNavigation exposes Pages as kind "page" grouped by directory', async () => {
  const navigation = await getModuleNavigation('design-lab-system', 'pages')
  const home = navigation.find((item) => item.id === 'home')
  assert.equal(home.kind, 'page')
})

test('a route that collides with a reserved Design Lab module falls back to the filesystem path', async () => {
  await withTemporaryLibrariesDirectory(async (librariesDirectory) => {
    await writeLibrary(librariesDirectory, 'conflict-system', {
      billing: {
        id: 'billing',
        name: 'Billing',
        schemaVersion: 1,
        status: 'draft',
        entry: 'Billing.page.tsx',
        route: '/components',
        defaultState: 'default',
        controls: [],
        states: [{ id: 'default', name: 'Default', description: '', values: {} }],
        flow: { nodes: [], edges: [] },
      },
    })

    const result = await getModuleEntities('conflict-system', 'pages')
    const billing = result.pages.find((page) => page.id === 'billing')

    assert.equal(billing.mirroredRoute, null)
    assert.equal(
      billing.diagnostics.some(
        (diagnostic) => diagnostic.code === 'page-route-conflicts-reserved-module',
      ),
      true,
    )
  })
})

test('a flow edge that targets an unknown Page or unknown state becomes a diagnostic', async () => {
  await withTemporaryLibrariesDirectory(async (librariesDirectory) => {
    await writeLibrary(librariesDirectory, 'broken-flow-system', {
      lonely: {
        id: 'lonely',
        name: 'Lonely',
        schemaVersion: 1,
        status: 'draft',
        entry: 'Lonely.page.tsx',
        defaultState: 'default',
        controls: [],
        states: [{ id: 'default', name: 'Default', description: '', values: {} }],
        flow: {
          nodes: [{ id: 'default-node', state: 'default', x: 0, y: 0 }],
          edges: [
            {
              id: 'to-nowhere',
              from: 'default-node',
              action: 'go',
              label: 'Go',
              to: { kind: 'page', pageId: 'does-not-exist' },
            },
            {
              id: 'to-unknown-state',
              from: 'default-node',
              action: 'go-state',
              label: 'Go state',
              to: { kind: 'state', stateId: 'missing' },
            },
          ],
        },
      },
    })

    const result = await getModuleEntities('broken-flow-system', 'pages')
    const lonely = result.pages.find((page) => page.id === 'lonely')
    const codes = lonely.diagnostics.map((diagnostic) => diagnostic.code)

    assert.equal(codes.filter((code) => code === 'page-flow-edge-invalid').length, 2)
  })
})

test('a state-target edge without a matching flow node becomes page-flow-edge-target-unreachable', async () => {
  await withTemporaryLibrariesDirectory(async (librariesDirectory) => {
    await writeLibrary(librariesDirectory, 'missing-node-system', {
      checkout: {
        id: 'checkout',
        name: 'Checkout',
        schemaVersion: 1,
        status: 'draft',
        entry: 'Checkout.page.tsx',
        defaultState: 'default',
        controls: [],
        states: [
          { id: 'default', name: 'Default', description: '', values: {} },
          { id: 'done', name: 'Done', description: '', values: {} },
        ],
        flow: {
          nodes: [{ id: 'default-node', state: 'default', x: 0, y: 0 }],
          edges: [
            {
              id: 'to-done',
              from: 'default-node',
              action: 'finish',
              label: 'Finish',
              to: { kind: 'state', stateId: 'done' },
            },
          ],
        },
      },
    })

    const result = await getModuleEntities('missing-node-system', 'pages')
    const checkout = result.pages.find((page) => page.id === 'checkout')

    assert.equal(
      checkout.diagnostics.some(
        (diagnostic) => diagnostic.code === 'page-flow-edge-target-unreachable',
      ),
      true,
    )
  })
})

test('flow edges missing action or label become diagnostics', async () => {
  await withTemporaryLibrariesDirectory(async (librariesDirectory) => {
    await writeLibrary(librariesDirectory, 'incomplete-edge-system', {
      incomplete: {
        id: 'incomplete',
        name: 'Incomplete',
        schemaVersion: 1,
        status: 'draft',
        entry: 'Incomplete.page.tsx',
        defaultState: 'default',
        controls: [],
        states: [{ id: 'default', name: 'Default', description: '', values: {} }],
        flow: {
          nodes: [{ id: 'default-node', state: 'default', x: 0, y: 0 }],
          edges: [
            {
              id: 'missing-label',
              from: 'default-node',
              action: 'go',
              label: '',
              to: { kind: 'state', stateId: 'default' },
            },
            {
              id: 'missing-action',
              from: 'default-node',
              action: '',
              label: 'Go',
              to: { kind: 'state', stateId: 'default' },
            },
          ],
        },
      },
    })

    const result = await getModuleEntities('incomplete-edge-system', 'pages')
    const incomplete = result.pages.find((page) => page.id === 'incomplete')
    const codes = incomplete.diagnostics.map((diagnostic) => diagnostic.code)

    assert.equal(codes.includes('page-flow-edge-label-missing'), true)
    assert.equal(codes.includes('page-flow-edge-action-missing'), true)
  })
})

test('a flow condition referencing an unknown control becomes a diagnostic', async () => {
  await withTemporaryLibrariesDirectory(async (librariesDirectory) => {
    await writeLibrary(librariesDirectory, 'broken-condition-system', {
      a: {
        id: 'a',
        name: 'A',
        schemaVersion: 1,
        status: 'draft',
        entry: 'A.page.tsx',
        defaultState: 'default',
        controls: [],
        states: [{ id: 'default', name: 'Default', description: '', values: {} }],
        flow: {
          nodes: [{ id: 'default-node', state: 'default', x: 0, y: 0 }],
          edges: [
            {
              id: 'conditional',
              from: 'default-node',
              action: 'go',
              label: 'Go',
              to: {
                kind: 'state',
                stateId: 'default',
                condition: { controlId: 'does-not-exist', value: true },
              },
            },
          ],
        },
      },
      b: {
        id: 'b',
        name: 'B',
        schemaVersion: 1,
        status: 'draft',
        entry: 'B.page.tsx',
        defaultState: 'default',
        controls: [],
        states: [{ id: 'default', name: 'Default', description: '', values: {} }],
        flow: { nodes: [], edges: [] },
      },
    })

    const result = await getModuleEntities('broken-condition-system', 'pages')
    const a = result.pages.find((page) => page.id === 'a')

    assert.equal(
      a.diagnostics.some((diagnostic) => diagnostic.code === 'page-flow-condition-invalid'),
      true,
    )
  })
})

test('derivedFromWireframe pointing at an unknown Wireframe, layout, or state becomes a diagnostic', async () => {
  await withTemporaryLibrariesDirectory(async (librariesDirectory) => {
    const libraryDirectory = await writeLibrary(librariesDirectory, 'derived-system', {
      checkout: {
        id: 'checkout',
        name: 'Checkout',
        schemaVersion: 1,
        status: 'draft',
        entry: 'Checkout.page.tsx',
        defaultState: 'default',
        derivedFromWireframe: { wireframeId: 'does-not-exist' },
        controls: [],
        states: [{ id: 'default', name: 'Default', description: '', values: {} }],
        flow: { nodes: [], edges: [] },
      },
    })
    const wireframeDirectory = join(libraryDirectory, 'wireframes', 'checkout')
    await mkdir(wireframeDirectory, { recursive: true })
    await writeFile(
      join(wireframeDirectory, 'wireframe.json'),
      JSON.stringify({
        id: 'checkout-flow',
        name: 'Checkout flow',
        schemaVersion: 1,
        status: 'draft',
        defaultLayout: 'a',
        defaultState: 'a',
        layouts: [{ id: 'a', name: 'A', description: '', hypothesis: '' }],
        states: [{ id: 'a', name: 'A', description: '', values: {} }],
        controls: [],
        flow: { nodes: [], edges: [] },
      }),
    )

    const result = await getModuleEntities('derived-system', 'pages')
    const checkout = result.pages.find((page) => page.id === 'checkout')

    assert.equal(
      checkout.diagnostics.some(
        (diagnostic) => diagnostic.code === 'page-derived-from-wireframe-invalid',
      ),
      true,
    )
  })
})

test('a page.json that fails JSON.parse becomes a diagnostic on that entity, not a crash', async () => {
  await withTemporaryLibrariesDirectory(async (librariesDirectory) => {
    const libraryDirectory = join(librariesDirectory, 'broken-page-system')
    await mkdir(libraryDirectory, { recursive: true })
    await writeFile(
      join(libraryDirectory, 'library.json'),
      JSON.stringify({
        id: 'broken-page-system',
        kind: 'library',
        name: 'Broken',
        schemaVersion: 1,
      }),
    )
    const brokenDirectory = join(libraryDirectory, 'pages', 'broken')
    await mkdir(brokenDirectory, { recursive: true })
    await writeFile(join(brokenDirectory, 'page.json'), '{ not valid json')

    const result = await getModuleEntities('broken-page-system', 'pages')
    const broken = result.pages.find((page) => page.name === 'broken')

    assert.ok(broken, 'a broken manifest still produces a visible Page entity')
    assert.equal(
      broken.diagnostics.some((diagnostic) => diagnostic.code === 'manifest-parse-error'),
      true,
    )
  })
})

test('pages module exposes a derived cross-Page sitemap', async () => {
  const result = await getModuleEntities('design-lab-system', 'pages')
  assert.ok(result.sitemap, 'pages module includes derived sitemap')
  assert.ok(result.sitemap.nodes.length >= 3, 'sitemap includes every discovered Page')
  assert.ok(
    result.sitemap.edges.some((edge) => edge.from === 'home' && edge.to === 'auth'),
    'sitemap includes cross-Page edges from per-Page flow graphs',
  )
  assert.ok(
    result.sitemap.nodes.every((node) => typeof node.x === 'number' && typeof node.y === 'number'),
    'sitemap nodes receive auto-layout coordinates',
  )
})
