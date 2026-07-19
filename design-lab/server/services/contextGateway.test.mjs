import test from 'node:test'
import assert from 'node:assert/strict'
import { getContextEntity, searchContext } from './contextGateway.mjs'

test('description-first search ranks authored component intent without revealing its name', async () => {
  const result = await searchContext({
    query: 'switch between themes',
    sourceId: 'design-lab-system',
    kinds: ['component'],
    limit: 3,
  })

  assert.equal(result.namesHidden, true)
  assert.equal(result.results.length, 1)
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
  assert.equal(entity.details.import.statement, "import { Input } from '@design-lab/system/components'")
  assert.deepEqual(entity.details.variants, ['text', 'search', 'textarea'])
  assert.equal(entity.details.props.errorMessage.type, 'ReactNode')
  assert.match(entity.details.documentation, /native `input` or `textarea`/)
})
