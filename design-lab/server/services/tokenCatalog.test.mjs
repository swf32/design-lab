import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { readTokenCatalog } from './tokenCatalog.mjs'
import { getModuleNavigation, tokenNavigation } from './moduleEntities.mjs'

async function withTokenFiles(files, run) {
  const source = await mkdtemp(join(tmpdir(), 'design-lab-token-catalog-'))
  const tokensDirectory = join(source, 'tokens')
  await mkdir(tokensDirectory, { recursive: true })
  try {
    for (const [file, document] of Object.entries(files)) {
      const filePath = join(tokensDirectory, file)
      await mkdir(join(filePath, '..'), { recursive: true })
      await writeFile(
        filePath,
        typeof document === 'string' ? document : JSON.stringify(document),
        'utf8',
      )
    }
    await run(await readTokenCatalog(source))
  } finally {
    await rm(source, { recursive: true, force: true })
  }
}

test('normalizes Design Lab and DTCG-style documents into one resolved catalog', async () => {
  await withTokenFiles(
    {
      'primitives.tokens.json': {
        defaultMode: 'dark',
        tokens: {
          space: {
            4: { type: 'dimension', value: '4px' },
          },
          color: {
            brand: { type: 'color', value: '#111111' },
          },
        },
        themes: {
          light: {
            tokens: {
              color: {
                brand: { type: 'color', value: '#eeeeee' },
              },
            },
          },
        },
      },
      'semantic/layout.tokens.json': {
        $type: 'dimension',
        semantic: {
          layout: {
            gap: {
              related: {
                $value: '{space.4}',
                $description: 'Gap between closely related controls.',
              },
            },
          },
        },
        component: {
          badge: {
            foreground: {
              $type: 'color',
              $value: '{color.brand}',
            },
          },
        },
        radius: {
          $type: 'dimension',
          $root: { $value: '8px' },
        },
      },
    },
    async (catalog) => {
      assert.deepEqual(catalog.files, ['primitives.tokens.json', 'semantic/layout.tokens.json'])
      assert.equal(catalog.defaultMode, 'dark')
      assert.deepEqual(catalog.modes, ['dark', 'light'])
      assert.equal(catalog.documents[0].format, 'design-lab')
      assert.equal(catalog.documents[1].format, 'dtcg')

      const byPath = new Map(catalog.tokens.map((token) => [token.path, token]))
      const gap = byPath.get('semantic.layout.gap.related')
      const foreground = byPath.get('component.badge.foreground')
      const radius = byPath.get('radius')

      assert.equal(gap.type, 'dimension')
      assert.equal(gap.rawValue, '{space.4}')
      assert.deepEqual(gap.values, { dark: '4px', light: '4px' })
      assert.deepEqual(gap.referenceChains.light, ['space.4'])
      assert.equal(gap.description, 'Gap between closely related controls.')
      assert.equal(foreground.values.dark, '#111111')
      assert.equal(foreground.values.light, '#eeeeee')
      assert.equal(radius.value, '8px')
      assert.deepEqual(catalog.diagnostics, [])
    },
  )
})

test('preserves arbitrary source-authored theme names and their declared default', async () => {
  await withTokenFiles(
    {
      'brand.tokens.json': {
        defaultMode: 'red',
        tokens: {
          color: { canvas: { type: 'color', value: '#7a1f2b' } },
        },
        themes: {
          blue: { tokens: { color: { canvas: { value: '#183f73' } } } },
          white: { tokens: { color: { canvas: { value: '#ffffff' } } } },
        },
      },
    },
    async (catalog) => {
      assert.equal(catalog.defaultMode, 'red')
      assert.deepEqual(catalog.modes, ['red', 'blue', 'white'])
    },
  )
})

test('isolates invalid documents and reference diagnostics without hiding valid tokens', async () => {
  await withTokenFiles(
    {
      'a.tokens.json': {
        tokens: {
          cycle: {
            a: { type: 'dimension', value: '{cycle.b}' },
            b: { type: 'dimension', value: '{cycle.a}' },
          },
          missing: { type: 'color', value: '{color.unknown}' },
          mismatch: { type: 'color', value: '{space.4}' },
          space: { 4: { type: 'dimension', value: '4px' } },
          duplicate: { type: 'number', value: 1 },
        },
      },
      'b.tokens.json': {
        tokens: {
          duplicate: { type: 'number', value: 2 },
        },
      },
      'broken.tokens.json': '{ definitely not json',
      'unsupported.tokens.json': { values: { compact: '4px' } },
    },
    async (catalog) => {
      const codes = new Set(catalog.diagnostics.map((item) => item.code))
      assert.equal(
        catalog.tokens.some((token) => token.path === 'space.4'),
        true,
      )
      assert.equal(codes.has('token-document-parse-error'), true)
      assert.equal(codes.has('token-format-unsupported'), true)
      assert.equal(codes.has('token-path-duplicate'), true)
      assert.equal(codes.has('token-reference-circular'), true)
      assert.equal(codes.has('token-reference-missing'), true)
      assert.equal(codes.has('token-reference-type-mismatch'), true)

      const missing = catalog.tokens.find((token) => token.path === 'missing')
      assert.equal(missing.value, '{color.unknown}')
      assert.deepEqual(missing.referenceChains.default, ['color.unknown'])
      assert.equal(
        catalog.documents.find((document) => document.file === 'broken.tokens.json').tokenCount,
        0,
      )
    },
  )
})

test('token navigation exposes independent logical and filesystem projections', async () => {
  const logical = await getModuleNavigation('design-lab-system', 'tokens', {
    tokenView: 'tokens',
  })
  assert.deepEqual(
    logical.filter((item) => item.level === 0).map((item) => item.path),
    [
      'by-token/color',
      'by-token/control',
      'by-token/corner',
      'by-token/easing',
      'by-token/layout',
      'by-token/radius',
      'by-token/shell',
      'by-token/space',
      'by-token/transition',
      'by-token/typography',
    ],
  )
  assert.ok(
    logical.some((item) => item.kind === 'token' && item.path === 'by-token/color/accent/primary'),
  )
  assert.equal(
    logical.some((item) => item.path.includes('.tokens.json')),
    false,
  )

  const files = await getModuleNavigation('design-lab-system', 'tokens', {
    tokenView: 'files',
  })
  assert.deepEqual(
    files.filter((item) => item.level === 0).map((item) => item.path),
    ['by-file/components', 'by-file/primitives', 'by-file/semantic'],
  )
  assert.ok(
    files.some(
      (item) => item.kind === 'token-document' && item.path === 'by-file/semantic/core.tokens.json',
    ),
  )
  assert.ok(
    files.some(
      (item) =>
        item.kind === 'token-group' &&
        item.path === 'by-file/semantic/core.tokens.json/color/accent',
    ),
  )
  assert.ok(
    files.some(
      (item) =>
        item.kind === 'token' && item.path === 'by-file/primitives/space.tokens.json/space/4',
    ),
  )
})

test('token navigation preserves root tokens and duplicate declarations without route collisions', () => {
  const catalog = {
    documents: [
      { file: 'a.tokens.json', diagnostics: [] },
      { file: 'nested/b.tokens.json', diagnostics: [] },
    ],
    tokens: [
      { id: 'radius', path: 'radius', file: 'a.tokens.json' },
      { id: 'radius.small', path: 'radius.small', file: 'a.tokens.json' },
      { id: 'duplicate', path: 'duplicate', file: 'a.tokens.json' },
      { id: 'duplicate', path: 'duplicate', file: 'nested/b.tokens.json' },
    ],
  }

  const logical = tokenNavigation(catalog, 'tokens')
  assert.ok(logical.some((item) => item.kind === 'token-group' && item.path === 'by-token/radius'))
  assert.ok(logical.some((item) => item.kind === 'token' && item.path === 'by-token/radius/$root'))
  assert.deepEqual(
    logical
      .filter((item) => item.kind === 'token' && item.path.startsWith('by-token/duplicate/'))
      .map((item) => item.path),
    ['by-token/duplicate/@source-1', 'by-token/duplicate/@source-2'],
  )

  const files = tokenNavigation(catalog, 'files')
  assert.ok(
    files.some(
      (item) => item.kind === 'token' && item.path === 'by-file/a.tokens.json/radius/$root',
    ),
  )
  assert.equal(new Set(files.map((item) => `${item.kind}:${item.path}`)).size, files.length)
})
