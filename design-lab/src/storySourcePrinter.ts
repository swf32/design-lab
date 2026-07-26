export const STORY_SOURCE_PRINT_WIDTH = 100

function indent(source: string, levels = 1) {
  const prefix = '  '.repeat(levels)
  return source
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n')
}

function isMultiline(source: string) {
  return source.includes('\n')
}

export function printArrayExpression(items: readonly string[]) {
  if (!items.length) return '[]'
  const inline = `[${items.join(', ')}]`
  const containsStructuredItem = items.some((item) => /^[{[]/.test(item.trim()))
  if (!containsStructuredItem && !items.some(isMultiline) && inline.length <= 72) return inline
  return `[\n${items.map((item) => `${indent(item)},`).join('\n')}\n]`
}

export function printObjectExpression(entries: readonly string[]) {
  if (!entries.length) return '{}'
  const inline = `{ ${entries.join(', ')} }`
  if (entries.length <= 2 && !entries.some(isMultiline) && inline.length <= 72) return inline
  return `{\n${entries.map((entry) => `${indent(entry)},`).join('\n')}\n}`
}

export function printJsxElement(tag: string, attributes: readonly string[], children = '') {
  const inlineAttributes = attributes.length ? ` ${attributes.join(' ')}` : ''
  const inlineOpening = `<${tag}${inlineAttributes}`
  const multilineAttributes =
    attributes.some(isMultiline) ||
    `${inlineOpening}${children ? '>' : ' />'}`.length > STORY_SOURCE_PRINT_WIDTH
  const opening = multilineAttributes
    ? `<${tag}\n${attributes.map((attribute) => indent(attribute)).join('\n')}\n>`
    : `${inlineOpening}>`

  if (!children) {
    if (!multilineAttributes) return `${inlineOpening} />`
    return `${opening.slice(0, -1)}/>`
  }

  const inlineElement = `${inlineOpening}>${children}</${tag}>`
  if (
    !multilineAttributes &&
    !isMultiline(children) &&
    inlineElement.length <= STORY_SOURCE_PRINT_WIDTH
  )
    return inlineElement
  return `${opening}\n${indent(children)}\n</${tag}>`
}
