import assert from 'node:assert/strict'
import test from 'node:test'
import { getModuleEntities } from './moduleEntities.mjs'
import { closeComponentRuntimes, prepareComponentRuntime } from './componentRuntimeService.mjs'

test('the committed Nuxt UI Library compiles through its own Vue package environment', async () => {
  try {
    const data = await getModuleEntities('nuxt-ui-system', 'components')
    assert.deepEqual(data.modes, ['light', 'dark'])
    assert.deepEqual(
      data.components.map(({ id }) => id),
      ['nuxt-button', 'nuxt-action-field', 'nuxt-badge', 'nuxt-input'],
    )
    assert.ok(data.components.every(({ relations }) => relations.diagnostics.length === 0))
    const actionField = data.components.find(({ id }) => id === 'nuxt-action-field')
    const button = data.components.find(({ id }) => id === 'nuxt-button')
    assert.deepEqual(actionField.relations.uses.map(({ id }) => id).sort(), [
      'nuxt-button',
      'nuxt-input',
    ])
    assert.deepEqual(
      button.relations.usedBy.map(({ id }) => id),
      ['nuxt-action-field'],
    )
    assert.equal(
      button.import.statement,
      "import Button from '@design-lab/nuxt-ui-system/components/actions/Button/Button.vue'",
    )

    const runtime = await prepareComponentRuntime('nuxt-ui-system', 'nuxt-button', {
      view: 'preview',
      mode: 'dark',
      captureSurface: true,
    })
    assert.equal(runtime.profile.technology, 'vue')
    assert.equal(runtime.profile.framework.version, '3.5.40')
    assert.equal(runtime.profile.packageEnvironment.manifestName, '@design-lab/nuxt-ui-system')
    assert.deepEqual(
      runtime.stories.map(({ id }) => id),
      ['variants', 'states'],
    )
    assert.deepEqual(
      runtime.playground.variants.map(({ id }) => id),
      ['compact-action', 'prominent-cta'],
    )

    const page = await fetch(runtime.url)
    assert.equal(page.status, 200)
    assert.match(await page.text(), /Design Lab Vue Runtime/)
    const runtimeUrl = new URL(runtime.url)
    const runtimeEntry = await fetch(new URL('/main.ts', runtimeUrl.origin))
    assert.equal(runtimeEntry.status, 200)
    assert.doesNotMatch(await runtimeEntry.text(), /Failed to resolve import/)
    assert.equal(runtimeUrl.searchParams.get('captureSurface'), 'true')
    const entry = runtimeUrl.searchParams.get('entry')
    assert.ok(entry)
    const transformed = await fetch(new URL(entry, runtimeUrl.origin))
    assert.equal(transformed.status, 200)
    assert.match(await transformed.text(), /DesignLab|Button/)
  } finally {
    await closeComponentRuntimes()
  }
})
