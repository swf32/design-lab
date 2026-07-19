import test from 'node:test'
import assert from 'node:assert/strict'
import { buildContextCatalog, getContextEntity, searchContext } from './contextGateway.mjs'

test('description-first search ranks authored component intent without revealing its name', async () => {
  const result = await searchContext({
    query: 'switch between themes',
    sourceId: 'design-lab-system',
    kinds: ['component'],
    limit: 3,
  })

  assert.equal(result.namesHidden, true)
  assert.ok(result.results.length >= 1)
  assert.equal(result.results[0].ref, 'design-lab-system:component:tab-switcher')
  assert.ok(result.results[0].relevance >= 0.85)
  assert.equal(Object.hasOwn(result.results[0], 'name'), false)
})

test('entity lookup reveals the verified component contract and import', async () => {
  const entity = await getContextEntity({
    ref: 'design-lab-system:component:input',
    kinds: ['component'],
  })

  assert.equal(entity.name, 'Input')
  assert.equal(
    entity.details.import.statement,
    "import { Input } from '@design-lab/system/components'",
  )
  assert.equal(entity.path, 'components/atoms/inputs/Input')
  assert.ok(entity.tags.includes('atoms/inputs'))
  assert.equal(entity.details.style, 'components/atoms/inputs/Input/Input.scss')
  assert.deepEqual(entity.details.variants, ['text', 'search', 'textarea'])
  assert.equal(entity.details.props.errorMessage.type, 'ReactNode')
  assert.match(entity.details.documentation, /native `input` or `textarea`/)
})

test('default entities provide authored semantic context without separate registries', async () => {
  const catalog = await buildContextCatalog({
    sourceId: 'design-lab-system',
    kinds: ['component', 'token', 'asset', 'font'],
  })
  const byKind = Object.groupBy(catalog.entities, (entity) => entity.kind)

  assert.equal(byKind.component.length, 33)
  assert.equal(
    byKind.component.every(
      (entity) =>
        entity.description &&
        entity.search.aliases.length &&
        entity.search.useWhen.length &&
        entity.search.avoidWhen.length,
    ),
    true,
  )
  assert.equal(
    byKind.token.every((entity) => entity.details.description),
    true,
  )
  assert.equal(
    byKind.asset.every(
      (entity) =>
        entity.details.metadataFile &&
        entity.description &&
        entity.search.useWhen.length &&
        entity.search.avoidWhen.length,
    ),
    true,
  )
  assert.equal(
    byKind.font.every(
      (entity) =>
        entity.description &&
        entity.search.aliases.length &&
        entity.search.useWhen.length &&
        entity.search.avoidWhen.length,
    ),
    true,
  )
})

test('token, asset, and font intent search use authored semantic metadata', async () => {
  const token = await searchContext({
    query: 'space between distinct interface sections',
    sourceId: 'design-lab-system',
    kinds: ['token'],
    limit: 1,
  })
  const asset = await searchContext({
    query: 'return to the previous view',
    sourceId: 'design-lab-system',
    kinds: ['asset'],
    limit: 1,
  })
  const font = await searchContext({
    query: 'font for application controls and labels',
    sourceId: 'design-lab-system',
    kinds: ['font'],
    limit: 1,
  })

  assert.equal(token.results[0].ref, 'design-lab-system:token:spacing.4')
  assert.equal(asset.results[0].ref, 'design-lab-system:asset:icons/ArrowLeftIcon.tsx')
  assert.equal(font.results[0].ref, 'design-lab-system:font:interface-sans')

  const icon = await getContextEntity({
    ref: asset.results[0].ref,
    kinds: ['asset'],
  })
  assert.equal(
    icon.details.import.statement,
    "import { ArrowLeftIcon } from '@design-lab/system/icons'",
  )
})

test('avoidWhen lowers misleading component matches', async () => {
  const result = await searchContext({
    query: 'navigate between primary application modules',
    sourceId: 'design-lab-system',
    kinds: ['component'],
    limit: 8,
  })

  assert.equal(result.results[0].ref, 'design-lab-system:component:sidebar-tab')
  assert.equal(
    result.results.some(
      (candidate) => candidate.ref === 'design-lab-system:component:tab-switcher',
    ),
    false,
  )
})
