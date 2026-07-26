import assert from 'node:assert/strict'
import test from 'node:test'
import {
  printArrayExpression,
  printJsxElement,
  printObjectExpression,
} from './storySourcePrinter.ts'

test('story source printer expands structured arrays and objects with stable indentation', () => {
  const row = printObjectExpression([
    'id: "button"',
    'name: "Button"',
    'status: "Ready"',
    'count: 4',
  ])
  const rows = printArrayExpression([row])

  assert.equal(
    rows,
    `[
  {
    id: "button",
    name: "Button",
    status: "Ready",
    count: 4,
  },
]`,
  )
})

test('story source printer keeps short expressions compact and wraps long JSX props', () => {
  assert.equal(
    printJsxElement('Button', ['leading={<StarIcon size={14} />}'], 'Leading icon'),
    '<Button leading={<StarIcon size={14} />}>Leading icon</Button>',
  )

  const source = printJsxElement('Table', [
    `rows={${printArrayExpression([
      printObjectExpression(['id: "button"', 'name: "Button"', 'status: "Ready"']),
    ])}}`,
    'getRowId={(row) => row.id}',
    'ariaLabel="Component inventory"',
    `defaultSort={${printObjectExpression(['columnId: "name"', 'direction: "ascending"'])}}`,
  ])

  assert.equal(
    source,
    `<Table
  rows={[
    {
      id: "button",
      name: "Button",
      status: "Ready",
    },
  ]}
  getRowId={(row) => row.id}
  ariaLabel="Component inventory"
  defaultSort={{ columnId: "name", direction: "ascending" }}
/>`,
  )
})
