import './WorkbenchInspector.scss'
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { InspectIcon } from '@design-lab/system/icons'
import { inspectionAttributes } from '@design-lab/system/inspection'
import {
  InspectorCodePopover,
  type InspectorKind,
} from '../../../molecules/workbench/InspectorCodePopover/InspectorCodePopover'
import { WorkbenchAction } from '../../../atoms/actions/WorkbenchAction/WorkbenchAction'

type Inspection = {
  rect: DOMRect
  kind: InspectorKind
  name: string
  code: string
  language: 'tsx' | 'html' | 'scss'
}

type InspectableElement = HTMLElement | SVGElement

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
  if (children == null)
    return attributes.length ? `<${name}\n${attributes.join('\n')}\n/>` : `<${name} />`
  const opening = attributes.length ? `<${name}\n${attributes.join('\n')}\n>` : `<${name}>`
  return `${opening}\n  ${String(children)}\n</${name}>`
}

function handoffHtml(element: InspectableElement) {
  const clone = element.cloneNode(true) as InspectableElement
  const nodes = [clone, ...Array.from(clone.querySelectorAll('*'))]
  for (const node of nodes)
    for (const attribute of Array.from(node.attributes))
      if (attribute.name.startsWith('data-dl-')) node.removeAttribute(attribute.name)
  return clone.outerHTML
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

function authoredCss(element: InspectableElement) {
  const fragments: string[] = []
  if (element.style.length)
    fragments.push(
      `${element.tagName.toLowerCase()}[style] {\n${authoredDeclarations(element.getAttribute('style') ?? '')}\n}`,
    )

  const visitRules = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      const conditionalRule = rule as CSSConditionRule
      if ('conditionText' in conditionalRule && typeof conditionalRule.conditionText === 'string')
        if (!window.matchMedia(conditionalRule.conditionText).matches) continue
      if ('cssRules' in rule)
        try {
          visitRules((rule as CSSGroupingRule).cssRules)
        } catch {
          continue
        }
      const styleRule = rule as CSSStyleRule
      if (typeof styleRule.selectorText !== 'string' || !styleRule.style) continue
      if (
        styleRule.selectorText === '*' ||
        styleRule.selectorText.includes('.dl-workbench-inspector') ||
        styleRule.selectorText.includes('.component-playground-page') ||
        styleRule.selectorText.includes('.wireframe-view')
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

  for (const sheet of Array.from(document.styleSheets))
    try {
      visitRules(sheet.cssRules)
    } catch {
      continue
    }

  return fragments.length
    ? fragments.join('\n\n')
    : `${element.tagName.toLowerCase()} {\n  /* No authored rule directly targets this element. */\n}`
}

function inspectElement(element: InspectableElement): Inspection {
  const slotName = element.dataset.dlSlot
  if (slotName)
    return {
      rect: element.getBoundingClientRect(),
      kind: 'slot',
      name: slotName,
      code: handoffHtml(element),
      language: 'html',
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

export type WorkbenchInspectorProps = {
  surfaceRef: RefObject<HTMLElement | null>
}

export function WorkbenchInspector({ surfaceRef }: WorkbenchInspectorProps) {
  const [active, setActive] = useState(false)
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [pinned, setPinned] = useState(false)
  const frameRef = useRef<number | null>(null)
  const pinnedRef = useRef(false)
  const pointerClickRef = useRef(false)

  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface || !active) return

    surface.setAttribute('data-workbench-inspecting', '')

    const select = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement || target instanceof SVGElement)) return
      if (target.closest('[data-workbench-inspector-ui]')) return
      const slotTarget = target.closest<InspectableElement>('[data-dl-slot]')
      setInspection(inspectElement(slotTarget ?? target))
    }
    const clearSelection = () => {
      pinnedRef.current = false
      setPinned(false)
      setInspection(null)
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || pinnedRef.current) return
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(() => select(event.target))
    }
    const choose = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-workbench-inspector-ui]'))
        return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      pointerClickRef.current = true
      if (pinnedRef.current) {
        clearSelection()
        return
      }
      select(event.target)
      pinnedRef.current = true
      setPinned(true)
    }
    const blockProductClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-workbench-inspector-ui]'))
        return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      if (pointerClickRef.current) {
        pointerClickRef.current = false
        return
      }
      if (pinnedRef.current) {
        clearSelection()
        return
      }
      select(event.target)
      pinnedRef.current = true
      setPinned(true)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (pinnedRef.current) {
        clearSelection()
        return
      }
      setActive(false)
    }

    surface.addEventListener('pointermove', move)
    surface.addEventListener('pointerdown', choose, true)
    surface.addEventListener('click', blockProductClick, true)
    window.addEventListener('keydown', escape)
    return () => {
      surface.removeAttribute('data-workbench-inspecting')
      surface.removeEventListener('pointermove', move)
      surface.removeEventListener('pointerdown', choose, true)
      surface.removeEventListener('click', blockProductClick, true)
      window.removeEventListener('keydown', escape)
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [active, surfaceRef])

  useEffect(() => {
    if (!active) {
      pinnedRef.current = false
      pointerClickRef.current = false
      setPinned(false)
      setInspection(null)
    }
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
      className={`dl-workbench-inspector${active ? ' dl-workbench-inspector--active' : ''}${
        pinned ? ' dl-workbench-inspector--pinned' : ''
      }`}
      data-workbench-inspector-ui
      style={cardStyle}
      {...inspectionAttributes('WorkbenchInspector', { active })}
    >
      {inspection && (
        <>
          <div
            className={`dl-workbench-inspector__outline dl-workbench-inspector__outline--${inspection.kind}`}
            aria-hidden="true"
          />
          <InspectorCodePopover
            className="dl-workbench-inspector__card"
            kind={inspection.kind}
            name={inspection.name}
            code={inspection.code}
            language={inspection.language}
          />
        </>
      )}
      <WorkbenchAction
        className="dl-workbench-inspector__trigger"
        tone="inspect"
        active={active}
        aria-label={active ? 'Turn off element inspector' : 'Inspect components and elements'}
        aria-pressed={active}
        onClick={() => setActive((current) => !current)}
        icon={<InspectIcon size={18} aria-hidden="true" />}
      >
        {active ? 'Inspecting' : 'Inspect'}
      </WorkbenchAction>
    </div>
  )
}
