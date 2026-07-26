import assert from 'node:assert/strict'
import test from 'node:test'
import {
  closeComponentCaptureRuntime,
  getComponentCaptureInfo,
  renderComponentCapture,
} from './componentCapture.mjs'

test('Vue preview and Story use the same Component capture path as React', async () => {
  const ref = 'nuxt-ui-system:component:nuxt-button'
  try {
    const info = await getComponentCaptureInfo(ref, 'light')
    assert.equal(info.runtime.adapter, 'vue-sfc')
    assert.equal(info.runtime.technology, 'vue')
    assert.deepEqual(info.availableModes, ['light', 'dark'])
    assert.deepEqual(
      info.availableStories.map(({ id }) => id),
      ['variants', 'states'],
    )

    const preview = await renderComponentCapture({
      ref,
      capture: 'preview',
      sourceMode: 'light',
      interfaceTheme: 'light',
    })
    assert.equal(preview.metadata.cssWidth, 260)
    assert.equal(preview.metadata.cssHeight, 150)
    assert.equal(preview.metadata.overflow.horizontal, false)
    assert.deepEqual(preview.metadata.consoleErrors, [])
    assert.ok(preview.png.length > 1_000)

    const story = await renderComponentCapture({
      ref,
      capture: 'story',
      storyId: 'variants',
      sourceMode: 'dark',
      interfaceTheme: 'dark',
    })
    assert.equal(story.metadata.cssWidth, 600)
    assert.equal(story.metadata.cssHeight, 180)
    assert.equal(story.metadata.overflow.horizontal, false)
    assert.deepEqual(story.metadata.consoleErrors, [])
    assert.ok(story.png.length > 1_000)
  } finally {
    await closeComponentCaptureRuntime()
  }
})
