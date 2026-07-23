import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { buildPageSitemap } from './flowLayout.mjs'
import { patchEntityManifest } from './manifestWrite.mjs'

test('buildPageSitemap merges duplicate cross-Page edges and assigns layout coordinates', () => {
  const sitemap = buildPageSitemap([
    {
      id: 'home',
      name: 'Home',
      description: 'Landing',
      route: '/',
      flow: {
        edges: [
          {
            id: 'to-auth',
            action: 'sign-in',
            label: 'Sign in',
            to: { kind: 'page', pageId: 'auth' },
          },
          {
            id: 'to-auth-duplicate',
            action: 'sign-in',
            label: 'Sign in again',
            to: { kind: 'page', pageId: 'auth' },
          },
        ],
      },
    },
    {
      id: 'auth',
      name: 'Auth',
      description: 'Login',
      route: '/login',
      flow: { edges: [] },
    },
  ])

  assert.equal(sitemap.nodes.length, 2)
  assert.equal(sitemap.edges.length, 1)
  assert.match(sitemap.edges[0].label, /Sign in/)
  assert.ok(sitemap.nodes.every((node) => node.x >= 0 && node.y >= 0))
})

test('buildPageSitemap keeps cyclic graphs in a compact viewport', () => {
  const sitemap = buildPageSitemap([
    {
      id: 'home',
      name: 'Home',
      description: '',
      route: '/',
      flow: {
        edges: [
          { id: 'to-auth', action: 'a', label: 'A', to: { kind: 'page', pageId: 'auth' } },
          { id: 'to-account', action: 'b', label: 'B', to: { kind: 'page', pageId: 'account' } },
        ],
      },
    },
    {
      id: 'auth',
      name: 'Auth',
      description: '',
      route: '/login',
      flow: {
        edges: [
          { id: 'to-home', action: 'c', label: 'C', to: { kind: 'page', pageId: 'home' } },
          { id: 'to-account', action: 'd', label: 'D', to: { kind: 'page', pageId: 'account' } },
        ],
      },
    },
    {
      id: 'account',
      name: 'Account',
      description: '',
      route: '/account',
      flow: {
        edges: [{ id: 'to-home', action: 'e', label: 'E', to: { kind: 'page', pageId: 'home' } }],
      },
    },
  ])

  assert.equal(sitemap.nodes.length, 3)
  assert.ok(
    sitemap.nodes.every((node) => node.x < 1200 && node.y < 800),
    `cyclic layout must stay near the origin, got ${JSON.stringify(sitemap.nodes.map((n) => [n.id, n.x, n.y]))}`,
  )
})

test('patchEntityManifest writes normalized flow node coordinates back to page.json', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'design-lab-manifest-write-'))
  const previous = process.env.DESIGN_LAB_LIBRARIES_DIR
  process.env.DESIGN_LAB_LIBRARIES_DIR = directory
  try {
    const libraryDirectory = join(directory, 'write-test-system')
    const pageDirectory = join(libraryDirectory, 'pages', 'demo', 'Sample')
    await mkdir(pageDirectory, { recursive: true })
    await writeFile(
      join(libraryDirectory, 'library.json'),
      JSON.stringify({
        id: 'write-test-system',
        kind: 'library',
        name: 'Write test',
        schemaVersion: 1,
      }),
    )
    await writeFile(
      join(pageDirectory, 'page.json'),
      JSON.stringify(
        {
          schemaVersion: 1,
          id: 'sample',
          name: 'Sample',
          status: 'review',
          entry: 'Sample.page.tsx',
          defaultState: 'default',
          controls: [],
          states: [{ id: 'default', name: 'Default', description: '', values: {} }],
          flow: {
            nodes: [
              { id: 'node-a', state: 'default', x: 10, y: 20 },
              { id: 'node-b', state: 'default', x: 10, y: 200 },
            ],
            edges: [],
          },
        },
        null,
        2,
      ),
    )

    await patchEntityManifest('write-test-system', 'pages', 'demo/Sample', {
      flow: {
        nodes: [
          { id: 'node-a', x: 80, y: 160 },
          { id: 'node-b', x: 80, y: 594 },
        ],
      },
    })

    const manifest = JSON.parse(await readFile(join(pageDirectory, 'page.json'), 'utf8'))
    assert.deepEqual(
      manifest.flow.nodes.map((node) => ({ id: node.id, x: node.x, y: node.y })),
      [
        { id: 'node-a', x: 80, y: 160 },
        { id: 'node-b', x: 80, y: 594 },
      ],
    )
  } finally {
    if (previous === undefined) delete process.env.DESIGN_LAB_LIBRARIES_DIR
    else process.env.DESIGN_LAB_LIBRARIES_DIR = previous
    await rm(directory, { recursive: true, force: true })
  }
})
