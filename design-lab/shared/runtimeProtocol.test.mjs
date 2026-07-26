import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createRuntimeCaptureInfo,
  createRuntimeMessage,
  getRuntimeCaptureDescriptor,
  parseRuntimeMessage,
  RUNTIME_PROTOCOL_VERSION,
} from './runtimeProtocol.mjs'

test('runtime messages are versioned, directed and JSON-only', () => {
  const render = createRuntimeMessage({
    type: 'render',
    runtimeId: 'source:react',
    requestId: 'request-1',
    payload: { entity: { kind: 'component', id: 'button' }, args: { disabled: false } },
  })

  assert.equal(render.version, RUNTIME_PROTOCOL_VERSION)
  assert.equal(parseRuntimeMessage(render, { direction: 'command' }), render)
  assert.throws(() => parseRuntimeMessage(render, { direction: 'event' }), /is not a event/)
  assert.throws(
    () =>
      createRuntimeMessage({
        type: 'render',
        runtimeId: 'source:react',
        payload: { callback: () => {} },
      }),
    /JSON-serializable/,
  )
})

test('capture surfaces are supplied by the runtime instead of known by MCP', () => {
  const info = createRuntimeCaptureInfo({
    runtime: {
      profileId: 'design-lab-system:react',
      adapter: 'react-compatibility',
      technology: 'react',
      capabilities: ['component.preview', 'component.story', 'capture', 'hmr'],
    },
    captures: {
      preview: {
        kind: 'preview',
        selector: '[data-capture="preview"]',
        cssWidth: 260,
        cssHeight: 150,
        dpr: 2,
      },
      story: {
        kind: 'story',
        selector: '[data-capture="story"]',
        cssWidth: 600,
        cssHeight: 180,
        dpr: 2,
      },
    },
  })

  assert.deepEqual(getRuntimeCaptureDescriptor(info, 'preview'), {
    kind: 'preview',
    selector: '[data-capture="preview"]',
    cssWidth: 260,
    cssHeight: 150,
    dpr: 2,
    pixelWidth: 520,
    pixelHeight: 300,
  })
  assert.throws(
    () => getRuntimeCaptureDescriptor(info, 'page'),
    /does not provide a page capture surface/,
  )
})

test('capture info rejects invented capabilities and unsafe geometry', () => {
  const base = {
    runtime: {
      profileId: 'source:vue',
      adapter: 'vue',
      technology: 'vue',
      capabilities: ['component.preview', 'capture'],
    },
    captures: {
      preview: {
        kind: 'preview',
        selector: '#preview',
        cssWidth: 260,
        cssHeight: 150,
        dpr: 2,
      },
    },
  }

  assert.throws(
    () =>
      createRuntimeCaptureInfo({
        ...base,
        runtime: { ...base.runtime, capabilities: ['component.preview', 'telepathy', 'capture'] },
      }),
    /Unknown runtime capabilities: telepathy/,
  )
  assert.throws(
    () =>
      createRuntimeCaptureInfo({
        ...base,
        captures: { preview: { ...base.captures.preview, cssWidth: 0 } },
      }),
    /cssWidth must be a positive number/,
  )
})
