import assert from 'node:assert/strict'
import test from 'node:test'
import { parseAuthoredStyles } from './authoredStyles.mjs'

test('authored SCSS preserves variables, imports, mixins, and nested selectors', () => {
  const rules = parseAuthoredStyles(`
@use './palette' as palette;

.card {
  color: palette.$text;

  &__action {
    @include action-surface($tone: palette.$brand);
    width: 100%;
  }
}
`)
  const action = rules.find((rule) => rule.selectors.includes('.card__action'))
  assert.ok(action)
  assert.ok(action.code.includes("@use './palette' as palette;"))
  assert.ok(action.code.includes('@include action-surface($tone: palette.$brand);'))
  assert.match(action.code, /width: 100%;/)
  assert.match(action.code, /\.card \{[\s\S]*&__action \{/)
})
