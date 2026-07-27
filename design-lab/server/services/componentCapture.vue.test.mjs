import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright'
import {
  closeComponentCaptureRuntime,
  getComponentCaptureInfo,
  renderComponentCapture,
} from './componentCapture.mjs'
import { prepareComponentRuntime } from './componentRuntimeService.mjs'

test('Vue preview and Story use the same Component capture path as React', async () => {
  const ref = 'nuxt-ui-system:component:nuxt-button'
  try {
    const info = await getComponentCaptureInfo(ref, 'light')
    assert.equal(info.runtime.adapter, 'vue-sfc')
    assert.equal(info.runtime.technology, 'vue')
    assert.deepEqual(info.availableModes, ['light', 'dark', 'Sunset Gray'])
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
      sourceMode: 'Sunset Gray',
      interfaceTheme: 'dark',
    })
    assert.equal(story.metadata.cssWidth, 600)
    assert.equal(story.metadata.cssHeight, 180)
    assert.equal(story.metadata.overflow.horizontal, false)
    assert.deepEqual(story.metadata.consoleErrors, [])
    assert.ok(story.png.length > 1_000)

    const runtime = await prepareComponentRuntime('nuxt-ui-system', 'nuxt-button', {
      view: 'playground',
      mode: 'Sunset Gray',
      args: { label: 'Continue' },
    })
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    const consoleErrors = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    try {
      await page.goto(runtime.url, { waitUntil: 'networkidle' })
      const initialUrl = page.url()
      assert.equal(
        await page
          .getByRole('button', { name: 'Continue' })
          .evaluate((element) => getComputedStyle(element).backgroundColor),
        'rgb(255, 90, 54)',
      )
      assert.equal(
        await page.evaluate(() => document.documentElement.dataset.sourceMode),
        'Sunset Gray',
      )
      for (const label of ['L', 'La', 'Launch', 'Launch design'])
        await page.evaluate(
          ({ runtimeId, nextLabel }) =>
            window.postMessage(
              {
                protocol: 'designlab.runtime',
                version: 1,
                type: 'setArgs',
                runtimeId,
                payload: { args: { label: nextLabel } },
              },
              '*',
            ),
          { runtimeId: runtime.profile.id, nextLabel: label },
        )
      await page.getByRole('button', { name: 'Launch design' }).waitFor()
      assert.equal(page.url(), initialUrl)

      const darkRuntime = await prepareComponentRuntime('nuxt-ui-system', 'nuxt-button', {
        view: 'preview',
        mode: 'dark',
      })
      const darkVariables = JSON.parse(new URL(darkRuntime.url).searchParams.get('variables'))
      await page.evaluate(
        ({ runtimeId, variables }) =>
          window.postMessage(
            {
              protocol: 'designlab.runtime',
              version: 1,
              type: 'setMode',
              runtimeId,
              payload: { mode: 'dark', variables },
            },
            '*',
          ),
        { runtimeId: runtime.profile.id, variables: darkVariables },
      )
      await page.locator('html.dark[data-source-mode="dark"]').waitFor()
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector('button')).backgroundColor ===
          'rgb(46, 227, 188)',
      )
      assert.equal(
        await page.evaluate(() => document.documentElement.classList.contains('dark')),
        true,
      )
      assert.equal(
        await page
          .getByRole('button', { name: 'Launch design' })
          .evaluate((element) => getComputedStyle(element).backgroundColor),
        'rgb(46, 227, 188)',
      )
      assert.equal(page.url(), initialUrl)
      assert.deepEqual(consoleErrors, [])
      assert.doesNotMatch(await page.locator('body').innerText(), /could not start/i)
    } finally {
      await browser.close()
    }
  } finally {
    await closeComponentCaptureRuntime()
  }
})
