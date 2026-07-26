import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildComponentFamilies,
  COMPONENT_CAPABILITIES,
  resolveComponentImplementation,
} from './componentAdapters.mjs'

test('current TSX Components resolve through the compatible React adapter', () => {
  const implementation = resolveComponentImplementation({
    id: 'button',
    file: 'actions/Button/component.json',
    entry: 'Button.tsx',
    preview: 'Button.preview.tsx',
    stories: 'Button.stories.ts',
    props: { children: { type: 'ReactNode' } },
  })

  assert.equal(implementation.platform, 'web')
  assert.equal(implementation.technology, 'react')
  assert.equal(implementation.adapter, 'react-manifest')
  assert.deepEqual(implementation.locator, { kind: 'file', path: 'Button.tsx' })
  assert.deepEqual(implementation.contract, {
    props: { children: { type: 'ReactNode' } },
    events: {},
    slots: {},
  })
  assert.deepEqual(implementation.diagnostics, [])
  assert.deepEqual(implementation.capabilities, [
    'catalog',
    'contract',
    'static-preview',
    'live-preview',
    'controls',
    'inspection',
    'composition',
    'capture',
    'handoff',
  ])
})

test('native source remains useful without pretending to have a browser runtime', () => {
  const implementation = resolveComponentImplementation({
    id: 'ios-button',
    file: 'Button/component.json',
    entry: 'Button.swift',
  })

  assert.equal(implementation.platform, 'ios')
  assert.equal(implementation.technology, 'swiftui')
  assert.equal(implementation.adapter, 'swiftui-source')
  assert.deepEqual(implementation.capabilities, ['catalog', 'handoff'])
})

test('external browser unlocks live preview without promising a capture bridge', () => {
  const external = resolveComponentImplementation({
    id: 'go-widget',
    file: 'widget/component.json',
    previewUrl: 'http://127.0.0.1:8080/widget',
  })
  const customElement = resolveComponentImplementation({
    id: 'user-card',
    file: 'user-card/component.json',
    entry: 'user-card.js',
    tagName: 'user-card',
    props: { user: { type: 'object' } },
  })

  assert.equal(external.adapter, 'external-browser')
  assert.deepEqual(external.locator, {
    kind: 'external-url',
    url: 'http://127.0.0.1:8080/widget',
  })
  assert.deepEqual(external.capabilities, ['catalog', 'live-preview'])
  assert.equal(customElement.technology, 'web-component')
  assert.equal(customElement.adapter, 'custom-element')
  assert.equal(customElement.capabilities.includes('live-preview'), false)
  assert.equal(customElement.capabilities.includes('controls'), false)
  assert.ok(customElement.capabilities.includes('composition'))
})

test('unknown sources degrade to catalog diagnostics and capability names stay bounded', () => {
  const implementation = resolveComponentImplementation({
    id: 'mystery',
    file: 'mystery/component.json',
  })

  assert.deepEqual(implementation.capabilities, ['catalog'])
  assert.deepEqual(
    implementation.diagnostics.map(({ code }) => code),
    ['component-technology-unknown', 'component-platform-unknown'],
  )
  assert.ok(implementation.capabilities.every((value) => COMPONENT_CAPABILITIES.includes(value)))
})

test('Component Families exist only through an explicit semantic relation', () => {
  const components = [
    {
      id: 'web/button',
      name: 'Button',
      familyId: 'actions/button',
      platform: 'web',
      technology: 'react',
      adapter: 'react-manifest',
      capabilities: ['catalog', 'live-preview'],
    },
    {
      id: 'ios/button',
      name: 'Button',
      family: 'actions/button',
      platform: 'ios',
      technology: 'swiftui',
      adapter: 'swiftui-source',
      capabilities: ['catalog', 'handoff'],
    },
    {
      id: 'android/button-with-same-name',
      name: 'Button',
      platform: 'android',
      technology: 'compose',
      adapter: 'compose-source',
      capabilities: ['catalog', 'handoff'],
    },
  ]

  assert.deepEqual(buildComponentFamilies(components), [
    {
      id: 'actions/button',
      name: 'Actions Button',
      implementations: [
        {
          id: 'ios/button',
          name: 'Button',
          platform: 'ios',
          technology: 'swiftui',
          adapter: 'swiftui-source',
          capabilities: ['catalog', 'handoff'],
        },
        {
          id: 'web/button',
          name: 'Button',
          platform: 'web',
          technology: 'react',
          adapter: 'react-manifest',
          capabilities: ['catalog', 'live-preview'],
        },
      ],
    },
  ])
})
