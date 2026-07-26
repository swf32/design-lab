import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { getAssetPreview } from './assetFiles.mjs'
import { getComponentHandoff } from './componentHandoff.mjs'
import { buildContextCatalog } from './contextGateway.mjs'
import { patchEntityManifest } from './manifestWrite.mjs'
import { getModuleEntities } from './moduleEntities.mjs'

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

test('Catalog, handoff, assets, Pages, Tokens, and AI context share attached mounts', async () => {
  const sandbox = await mkdtemp(join(tmpdir(), 'design-lab-mounted-consumers-'))
  const libraries = join(sandbox, 'libraries')
  const source = join(libraries, 'mixed-web')
  const previousLibraries = process.env.DESIGN_LAB_LIBRARIES_DIR
  const previousData = process.env.DESIGN_LAB_DATA_DIR
  process.env.DESIGN_LAB_LIBRARIES_DIR = libraries
  process.env.DESIGN_LAB_DATA_DIR = join(sandbox, 'data')

  try {
    await Promise.all([
      mkdir(join(source, 'packages/react/src'), { recursive: true }),
      mkdir(join(source, 'packages/vue/src'), { recursive: true }),
      mkdir(join(source, 'product/tokens'), { recursive: true }),
      mkdir(join(source, 'static/icons'), { recursive: true }),
      mkdir(join(source, 'apps/shop/pages/Home'), { recursive: true }),
      mkdir(join(source, 'apps/admin/pages/Dashboard'), { recursive: true }),
    ])
    await writeJson(join(source, 'library.json'), {
      id: 'mixed-web',
      name: 'Mixed Web',
      kind: 'library',
      componentImport: '@mixed/ui',
      mounts: {
        components: ['packages/react/src', 'packages/vue/src'],
        tokens: ['product/tokens'],
        assets: ['static'],
        pages: ['apps/shop/pages', 'apps/admin/pages'],
      },
    })
    await writeFile(
      join(source, 'packages/react/src/Button.tsx'),
      'export function Button() { return <button>Save</button> }\n',
      'utf8',
    )
    await writeFile(
      join(source, 'packages/vue/src/Card.vue'),
      '<template><article>Card</article></template>\n',
      'utf8',
    )
    await writeJson(join(source, 'product/tokens/base.tokens.json'), {
      tokens: { color: { brand: { type: 'color', value: '#123456' } } },
    })
    await writeFile(
      join(source, 'static/icons/logo.svg'),
      '<svg viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>\n',
      'utf8',
    )
    await writeFile(
      join(sandbox, 'private.svg'),
      '<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>\n',
      'utf8',
    )
    await symlink(join(sandbox, 'private.svg'), join(source, 'static/icons/escape.svg'))
    await writeJson(join(source, 'apps/shop/pages/Home/page.json'), {
      schemaVersion: 1,
      id: 'shop-home',
      name: 'Shop home',
      status: 'draft',
      entry: 'Home.page.tsx',
      flow: { nodes: [{ id: 'home', x: 0, y: 0 }], edges: [] },
    })
    await writeFile(
      join(source, 'apps/shop/pages/Home/Home.page.tsx'),
      "import { Button } from '@mixed/ui'\nexport function Home() { return <Button /> }\n",
      'utf8',
    )
    await writeJson(join(source, 'apps/admin/pages/Dashboard/page.json'), {
      schemaVersion: 1,
      id: 'admin-dashboard',
      name: 'Admin dashboard',
      status: 'draft',
      flow: { nodes: [], edges: [] },
    })

    const [components, tokens, assets, pages, catalog] = await Promise.all([
      getModuleEntities('mixed-web', 'components'),
      getModuleEntities('mixed-web', 'tokens'),
      getModuleEntities('mixed-web', 'assets'),
      getModuleEntities('mixed-web', 'pages'),
      buildContextCatalog({ sourceId: 'mixed-web' }),
    ])

    assert.deepEqual(
      components.components.map(({ id, technology }) => ({ id, technology })),
      [
        { id: 'packages/react/src/Button', technology: 'react' },
        { id: 'packages/vue/src/Card', technology: 'vue' },
      ],
    )
    assert.equal(tokens.tokens[0].path, 'color.brand')
    assert.equal(tokens.tokens[0].file, 'base.tokens.json')
    assert.equal(assets.assets[0].path, 'icons/logo.svg')
    assert.deepEqual(
      pages.pages.map(({ id, directory }) => ({ id, directory })),
      [
        { id: 'admin-dashboard', directory: 'apps/admin/pages/Dashboard' },
        { id: 'shop-home', directory: 'apps/shop/pages/Home' },
      ],
    )

    const handoff = await getComponentHandoff('mixed-web', 'packages/vue/src/Card')
    assert.equal(handoff.language, 'vue')
    assert.match(handoff.source, /<article>Card<\/article>/)
    const preview = await getAssetPreview('mixed-web', 'icons/logo.svg')
    assert.equal(preview.contentType, 'image/svg+xml')
    assert.match(preview.body.toString('utf8'), /<svg/)
    await assert.rejects(() => getAssetPreview('mixed-web', 'icons/escape.svg'), {
      code: 'ASSET_PATH_OUTSIDE_SOURCE',
    })

    const contextPaths = new Set(catalog.entities.map((entity) => entity.path))
    assert.ok(contextPaths.has('packages/react/src/Button'))
    assert.ok(contextPaths.has('packages/vue/src/Card'))
    assert.ok(contextPaths.has('product/tokens/base.tokens.json'))
    assert.ok(contextPaths.has('static/icons/logo.svg'))
    assert.ok(contextPaths.has('apps/shop/pages/Home'))
    const homeContext = catalog.entities.find(
      (entity) => entity.kind === 'page' && entity.id === 'shop-home',
    )
    assert.deepEqual(homeContext.details.compositionUses, ['Button'])

    await patchEntityManifest('mixed-web', 'pages', 'apps/shop/pages/Home', {
      flow: { nodes: [{ id: 'home', x: 120, y: 240 }] },
    })
    const updated = JSON.parse(
      await readFile(join(source, 'apps/shop/pages/Home/page.json'), 'utf8'),
    )
    assert.deepEqual(updated.flow.nodes[0], { id: 'home', x: 120, y: 240 })
  } finally {
    if (previousLibraries === undefined) delete process.env.DESIGN_LAB_LIBRARIES_DIR
    else process.env.DESIGN_LAB_LIBRARIES_DIR = previousLibraries
    if (previousData === undefined) delete process.env.DESIGN_LAB_DATA_DIR
    else process.env.DESIGN_LAB_DATA_DIR = previousData
    await rm(sandbox, { recursive: true, force: true })
  }
})
