import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { InspectorCodePopover, type InspectorKind } from '@design-lab/system/components'
import { InspectIcon } from '@design-lab/system/icons'

type Inspection = {
  rect: DOMRect
  kind: InspectorKind
  name: string
  code: string
  language: 'tsx' | 'html' | 'scss'
}

function displayValue(value: unknown) {
  if (typeof value === 'string') return `"${value.replaceAll('"', '\\"')}"`
  if (value == null) return '{null}'
  if (typeof value === 'number' || typeof value === 'boolean') return `{${String(value)}}`
  return `{${JSON.stringify(value)}}`
}

function componentCode(name: string, props: Record<string, unknown>) {
  const children = props.children
  const attributes = Object.entries(props)
    .filter(([key]) => key !== 'children')
    .map(([key, value]) => `  ${key}=${displayValue(value)}`)
  if (children == null) {
    return attributes.length ? `<${name}\n${attributes.join('\n')}\n/>` : `<${name} />`
  }
  const opening = attributes.length ? `<${name}\n${attributes.join('\n')}\n>` : `<${name}>`
  return `${opening}\n  ${String(children)}\n</${name}>`
}

function authoredDeclarations(cssText: string) {
  const openBrace = cssText.indexOf('{')
  const closeBrace = cssText.lastIndexOf('}')
  const body =
    openBrace >= 0 && closeBrace > openBrace ? cssText.slice(openBrace + 1, closeBrace) : cssText
  return body
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => `  ${declaration};`)
    .join('\n')
}

function authoredCss(element: HTMLElement) {
  const fragments: string[] = []
  if (element.style.length) {
    fragments.push(
      `${element.tagName.toLowerCase()}[style] {\n${authoredDeclarations(element.getAttribute('style') ?? '')}\n}`,
    )
  }

  const visitRules = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      const conditionalRule = rule as CSSConditionRule
      if ('conditionText' in conditionalRule && typeof conditionalRule.conditionText === 'string') {
        if (!window.matchMedia(conditionalRule.conditionText).matches) continue
      }
      if ('cssRules' in rule) {
        try {
          visitRules((rule as CSSGroupingRule).cssRules)
        } catch {
          continue
        }
      }
      const styleRule = rule as CSSStyleRule
      if (typeof styleRule.selectorText !== 'string' || !styleRule.style) continue
      if (
        styleRule.selectorText === '*' ||
        styleRule.selectorText.includes('.playground-inspector') ||
        styleRule.selectorText.includes('.component-playground-page')
      )
        continue
      try {
        if (!element.matches(styleRule.selectorText)) continue
      } catch {
        continue
      }
      const declarations = authoredDeclarations(styleRule.cssText)
      if (declarations) fragments.push(`${styleRule.selectorText} {\n${declarations}\n}`)
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visitRules(sheet.cssRules)
    } catch {
      continue
    }
  }

  return fragments.length
    ? fragments.join('\n\n')
    : `${element.tagName.toLowerCase()} {\n  /* No authored rule directly targets this element. */\n}`
}

function inspectElement(element: HTMLElement): Inspection {
  const slotName = element.dataset.dlSlot
  if (slotName) {
    return {
      rect: element.getBoundingClientRect(),
      kind: 'slot',
      name: slotName,
      code: element.outerHTML,
      language: 'html',
    }
  }

  const componentName = element.dataset.dlComponent
  if (componentName) {
    let props: Record<string, unknown> = {}
    try {
      props = JSON.parse(element.dataset.dlProps ?? '{}') as Record<string, unknown>
    } catch {
      props = {}
    }
    return {
      rect: element.getBoundingClientRect(),
      kind: 'component',
      name: componentName,
      code: componentCode(componentName, props),
      language: 'tsx',
    }
  }

  return {
    rect: element.getBoundingClientRect(),
    kind: 'element',
    name: element.tagName.toLowerCase(),
    code: authoredCss(element),
    language: 'scss',
  }
}

export function PlaygroundInspector({ canvasRef }: { canvasRef: RefObject<HTMLElement | null> }) {
  const [active, setActive] = useState(false)
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return

    const select = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return
      if (target.closest('[data-playground-inspector-ui]')) return
      setInspection(inspectElement(target))
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(() => select(event.target))
    }
    const choose = (event: PointerEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('[data-playground-inspector-ui]')
      )
        return
      event.preventDefault()
      event.stopPropagation()
      select(event.target)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(false)
    }

    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', choose, true)
    window.addEventListener('keydown', escape)
    return () => {
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', choose, true)
      window.removeEventListener('keydown', escape)
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [active, canvasRef])

  useEffect(() => {
    if (!active) setInspection(null)
  }, [active])

  const rect = inspection?.rect
  const cardStyle = (
    rect
      ? {
          '--inspector-target-top': `${rect.top}px`,
          '--inspector-target-right': `${window.innerWidth - rect.right}px`,
          '--inspector-target-bottom': `${window.innerHeight - rect.bottom}px`,
          '--inspector-target-left': `${rect.left}px`,
          '--inspector-target-width': `${rect.width}px`,
          '--inspector-target-height': `${rect.height}px`,
        }
      : undefined
  ) as CSSProperties | undefined

  return (
    <div
      className={`playground-inspector${active ? ' is-active' : ''}`}
      data-playground-inspector-ui
      style={cardStyle}
    >
      {inspection && (
        <>
          <div
            className={`playground-inspector__outline playground-inspector__outline--${inspection.kind}`}
            aria-hidden="true"
          />
          <InspectorCodePopover
            className="playground-inspector__card"
            kind={inspection.kind}
            name={inspection.name}
            code={inspection.code}
            language={inspection.language}
          />
        </>
      )}
      <button
        type="button"
        className="playground-inspector__trigger"
        aria-label={active ? 'Turn off element inspector' : 'Inspect components and elements'}
        aria-pressed={active}
        onClick={() => setActive((current) => !current)}
      >
        <InspectIcon size={20} aria-hidden="true" />
        <span>{active ? 'Inspecting' : 'Inspect'}</span>
      </button>
    </div>
  )
}
