import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { getContextEntity } from './contextGateway.mjs'

const APPLICATION_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const API_ORIGIN = 'http://127.0.0.1:4173'
const UI_ORIGIN = 'http://127.0.0.1:5317'
const managedProcesses = []
let browserPromise = null
let runtimePromise = null

function captureError(message, code, status = 400) {
  return Object.assign(new Error(message), { code, status })
}

async function responds(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(800) })
    return response.ok
  } catch {
    return false
  }
}

function startManaged(command, args) {
  const child = spawn(command, args, {
    cwd: APPLICATION_ROOT,
    detached: false,
    stdio: 'ignore',
  })
  managedProcesses.push(child)
  return child
}

async function waitFor(url, label) {
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    if (await responds(url)) return
    await new Promise((resolveWait) => setTimeout(resolveWait, 100))
  }
  throw captureError(`${label} did not become ready`, 'CAPTURE_RUNTIME_UNAVAILABLE', 503)
}

async function ensureRuntime() {
  if (!runtimePromise)
    runtimePromise = (async () => {
      if (!(await responds(`${API_ORIGIN}/api/health`)))
        startManaged(process.execPath, ['server/index.mjs'])

      if (!(await responds(`${UI_ORIGIN}/__capture/component`))) {
        const viteBin = fileURLToPath(
          new URL('../../../node_modules/vite/bin/vite.js', import.meta.url),
        )
        await access(viteBin)
        startManaged(process.execPath, [viteBin, '--host', '127.0.0.1'])
      }

      await Promise.all([
        waitFor(`${API_ORIGIN}/api/health`, 'Design Lab API'),
        waitFor(`${UI_ORIGIN}/__capture/component`, 'Design Lab capture renderer'),
      ])
    })().catch((error) => {
      runtimePromise = null
      throw error
    })
  return runtimePromise
}

async function getBrowser() {
  if (!browserPromise)
    browserPromise = chromium.launch({ headless: true }).catch((error) => {
      browserPromise = null
      throw captureError(
        `Chromium is unavailable. Run "npx playwright install chromium". ${error.message}`,
        'CAPTURE_BROWSER_UNAVAILABLE',
        503,
      )
    })
  return browserPromise
}

function captureUrl({ entity, capture, storyId, sourceMode, interfaceTheme }) {
  const params = new URLSearchParams({
    source: entity.source.id,
    component: entity.id,
    capture,
    interfaceTheme,
  })
  if (storyId) params.set('story', storyId)
  if (sourceMode) params.set('sourceMode', sourceMode)
  return `${UI_ORIGIN}/__capture/component?${params}`
}

async function readCaptureInfo(page) {
  const ready = page.locator('[data-designlab-capture-ready]')
  try {
    await ready.waitFor({ state: 'attached', timeout: 15_000 })
  } catch {
    const message = (await page.locator('body').innerText()).trim()
    throw captureError(message || 'Component capture did not render', 'CAPTURE_RENDER_FAILED')
  }

  const raw = await ready.getAttribute('data-capture-info')
  return raw ? JSON.parse(raw) : null
}

export async function getComponentCaptureInfo(ref, interfaceTheme = 'dark') {
  if (interfaceTheme !== 'dark' && interfaceTheme !== 'light')
    throw captureError('interfaceTheme must be dark or light', 'CAPTURE_INTERFACE_THEME_INVALID')
  const entity = await getContextEntity({ ref, kinds: ['component'] })
  if (entity.kind !== 'component')
    throw captureError('Capture requires a Component ref', 'CAPTURE_COMPONENT_REQUIRED')

  await ensureRuntime()
  const browser = await getBrowser()
  const context = await browser.newContext({
    viewport: { width: 900, height: 600 },
    deviceScaleFactor: 2,
    colorScheme: interfaceTheme,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  try {
    await page.goto(
      captureUrl({ entity, capture: 'info', storyId: null, sourceMode: null, interfaceTheme }),
      { waitUntil: 'networkidle' },
    )
    return await readCaptureInfo(page)
  } finally {
    await context.close()
  }
}

export async function renderComponentCapture({
  ref,
  capture,
  storyId,
  sourceMode,
  interfaceTheme = 'dark',
}) {
  if (interfaceTheme !== 'dark' && interfaceTheme !== 'light')
    throw captureError('interfaceTheme must be dark or light', 'CAPTURE_INTERFACE_THEME_INVALID')
  if (capture !== 'preview' && capture !== 'story')
    throw captureError('capture must be preview or story', 'CAPTURE_KIND_INVALID')
  if (capture === 'story' && !storyId)
    throw captureError('storyId is required for a Story capture', 'CAPTURE_STORY_REQUIRED')

  const entity = await getContextEntity({ ref, kinds: ['component'] })
  if (entity.kind !== 'component')
    throw captureError('Capture requires a Component ref', 'CAPTURE_COMPONENT_REQUIRED')

  await ensureRuntime()
  const browser = await getBrowser()
  const context = await browser.newContext({
    viewport: { width: 1400, height: 700 },
    deviceScaleFactor: 2,
    colorScheme: interfaceTheme,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  try {
    await page.goto(captureUrl({ entity, capture, storyId, sourceMode, interfaceTheme }), {
      waitUntil: 'networkidle',
    })
    const info = await readCaptureInfo(page)
    await page.evaluate(() => document.fonts.ready)

    const target = page.locator(
      capture === 'preview' ? '.dl-component-card__preview' : '.dl-story-canvas__stage',
    )
    const box = await target.boundingBox()
    if (!box) throw captureError('Capture target is not visible', 'CAPTURE_TARGET_MISSING')

    const expected =
      capture === 'preview' ? { width: 260, height: 150 } : { width: 600, height: 180 }
    if (Math.round(box.width) !== expected.width || Math.round(box.height) !== expected.height)
      throw captureError(
        `Capture geometry is ${Math.round(box.width)}×${Math.round(box.height)}; expected ${expected.width}×${expected.height}`,
        'CAPTURE_GEOMETRY_MISMATCH',
      )

    const overflow = await target.evaluate((element) => ({
      horizontal: element.scrollWidth > element.clientWidth,
      vertical: element.scrollHeight > element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
    }))

    const png = await target.screenshot({
      type: 'png',
      animations: 'disabled',
      caret: 'hide',
      omitBackground: false,
      scale: 'device',
    })
    const selectedMode = sourceMode ?? info.availableModes[0] ?? 'default'
    if (info.availableModes.length && !info.availableModes.includes(selectedMode))
      throw captureError(
        `Unknown source mode "${selectedMode}". Available: ${info.availableModes.join(', ')}`,
        'CAPTURE_SOURCE_MODE_INVALID',
      )
    const recommendedTheme =
      info.modeRecommendations.find(({ mode }) => mode === selectedMode)?.interfaceTheme ?? null
    const warnings = []
    if (recommendedTheme && recommendedTheme !== interfaceTheme)
      warnings.push(
        `Source mode "${selectedMode}" uses a ${recommendedTheme} surface, but interfaceTheme is "${interfaceTheme}". The Component may have insufficient contrast; use interfaceTheme "${recommendedTheme}" unless this mismatch is intentional.`,
      )

    return {
      png,
      metadata: {
        ref: entity.ref,
        component: { id: entity.id, name: entity.name },
        capture,
        storyId: capture === 'story' ? storyId : null,
        sourceMode: selectedMode,
        availableModes: info.availableModes,
        modeRecommendations: info.modeRecommendations,
        availableStories: info.availableStories,
        interfaceTheme,
        recommendedInterfaceTheme: recommendedTheme,
        warnings,
        cssWidth: expected.width,
        cssHeight: expected.height,
        dpr: 2,
        pixelWidth: expected.width * 2,
        pixelHeight: expected.height * 2,
        mimeType: 'image/png',
        bytes: png.length,
        sha256: createHash('sha256').update(png).digest('hex'),
        overflow,
        consoleErrors,
      },
    }
  } finally {
    await context.close()
  }
}

export async function closeComponentCaptureRuntime() {
  const browser = await browserPromise?.catch(() => null)
  await browser?.close()
  browserPromise = null
  for (const child of managedProcesses)
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM')
  managedProcesses.length = 0
  runtimePromise = null
}

process.once('exit', () => {
  for (const child of managedProcesses)
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM')
})
process.once('SIGINT', () => void closeComponentCaptureRuntime().finally(() => process.exit(130)))
process.once('SIGTERM', () => void closeComponentCaptureRuntime().finally(() => process.exit(143)))
