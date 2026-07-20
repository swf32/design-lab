import './WorkbenchInspector.scss'
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { InspectIcon } from '@design-lab/system/icons'
import {
  inspectionEntriesWithin,
  inspectionMetadataFor,
  type InspectionDescriptor,
  type InspectionSourceLocation,
} from '@design-lab/system/inspection'
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

type AuthoredStyleRule = {
  selectors: string[]
  conditions: { kind: 'media' | 'supports'; value: string }[]
  code: string
  line: number
}

type AuthoredStyles = {
  styles: { file: string; rules: AuthoredStyleRule[] }[]
}

const authoredStylesCache = new Map<string, Promise<AuthoredStyles>>()

function descriptorInspection(
  element: InspectableElement,
  kind: 'component' | 'slot',
  descriptor: InspectionDescriptor,
): Inspection {
  return {
    rect: element.getBoundingClientRect(),
    kind,
    name: descriptor.name,
    code: descriptor.code,
    language: 'tsx',
  }
}

function conditionMatches(condition: AuthoredStyleRule['conditions'][number]) {
  if (condition.kind === 'media') return window.matchMedia(condition.value).matches
  if (condition.kind === 'supports' && typeof CSS.supports === 'function')
    try {
      return CSS.supports(condition.value)
    } catch {
      return true
    }
  return true
}

async function authoredCss(element: InspectableElement, source: InspectionSourceLocation) {
  const cacheKey = `${source.sourceId}:${source.file}`
  let request = authoredStylesCache.get(cacheKey)
  if (!request) {
    request = fetch(
      `/api/sources/${encodeURIComponent(source.sourceId)}/inspection/styles?file=${encodeURIComponent(source.file)}`,
    ).then(async (response) => {
      if (!response.ok) throw new Error(`Could not load authored styles (${response.status})`)
      return (await response.json()) as AuthoredStyles
    })
    authoredStylesCache.set(cacheKey, request)
  }
  try {
    const result = await request
    const fragments = result.styles.flatMap((style) =>
      style.rules
        .filter(
          (rule) =>
            rule.conditions.every(conditionMatches) &&
            rule.selectors.some((selector) => {
              try {
                return element.matches(selector)
              } catch {
                return false
              }
            }),
        )
        .map((rule) => `/* ${style.file}:${rule.line} */\n${rule.code}`),
    )
    if (fragments.length) return fragments.join('\n\n')
  } catch {
    authoredStylesCache.delete(cacheKey)
  }
  return `/* No authored SCSS/CSS rule imported by ${source.file}:${source.line} directly matches this element. */`
}

async function inspectElement(element: InspectableElement): Promise<Inspection> {
  const metadata = inspectionMetadataFor(element)
  const slot = metadata?.slots.at(-1)
  if (slot) return descriptorInspection(element, 'slot', slot)
  const component = metadata?.components.at(-1)
  if (component) return descriptorInspection(element, 'component', component)
  return {
    rect: element.getBoundingClientRect(),
    kind: 'element',
    name: element.tagName.toLowerCase(),
    code: metadata ? await authoredCss(element, metadata.source) : '/* Source unavailable. */',
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
  const selectionVersionRef = useRef(0)

  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface || !active) return

    surface.setAttribute('data-workbench-inspecting', '')
    const markedElements = inspectionEntriesWithin(surface).map(([element, metadata]) => {
      if (metadata.components.length) element.setAttribute('data-dl-inspection-component', '')
      if (metadata.slots.length) element.setAttribute('data-dl-inspection-slot', '')
      return element
    })

    const select = async (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement || target instanceof SVGElement)) return
      if (target.closest('[data-workbench-inspector-ui]')) return
      let inspectionTarget: InspectableElement | null = target
      while (inspectionTarget && !inspectionMetadataFor(inspectionTarget))
        inspectionTarget = inspectionTarget.parentElement
      if (!inspectionTarget || !surface.contains(inspectionTarget)) return
      const version = ++selectionVersionRef.current
      const nextInspection = await inspectElement(inspectionTarget)
      if (version === selectionVersionRef.current) setInspection(nextInspection)
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
      for (const element of markedElements) {
        element.removeAttribute('data-dl-inspection-component')
        element.removeAttribute('data-dl-inspection-slot')
      }
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
