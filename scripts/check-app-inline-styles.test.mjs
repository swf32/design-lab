import assert from 'node:assert/strict'
import test from 'node:test'
import { collectInlineVisualStyles } from './check-app-inline-styles.mjs'

test('finds visual JSX, typed-object, and DOM styles without blocking layout geometry', () => {
  const source = `
    import type { CSSProperties } from 'react'
    const swatch = { backgroundColor: token.value } as CSSProperties
    const element = <div style={{ color: 'red', padding: 8, borderRadius: 4 }} />
    textarea.style.opacity = '0'
  `
  const rows = collectInlineVisualStyles(source, 'fixture.tsx')
  assert.deepEqual(rows.map((item) => item[2]).sort(), [
    'background-color',
    'border-radius',
    'color',
    'opacity',
  ])
  assert(rows.some((item) => item[3] === 'token.value'))
})

test('supports React.CSSProperties and computed DOM style keys', () => {
  const source = `
    const swatch = { fontFamily: 'Inter' } as React.CSSProperties
    element.style['backgroundColor'] = 'red'
  `
  assert.deepEqual(
    collectInlineVisualStyles(source, 'fixture.tsx').map((item) => item[2]),
    ['font-family', 'background-color'],
  )
})
