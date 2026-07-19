import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { InspectIcon } from '@design-lab/system/icons'

type Inspection = {
  element: HTMLElement
  rect: DOMRect
  kind: 'component' | 'element'
  name: string
  details: Record<string, string>
}

const styleProperties = [
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'padding',
  'margin',
  'gap',
  'color',
  'background-color',
  'border',
  'border-radius',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'grid-template-columns',
] as const

function displayValue(value: unknown) {
  if (typeof value === 'string') return value
  if (value == null || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function inspectElement(element: HTMLElement): Inspection {
  const componentName = element.dataset.dlComponent
  if (componentName) {
    let props: Record<string, unknown> = {}
    try {
      props = JSON.parse(element.dataset.dlProps ?? '{}') as Record<string, unknown>
    } catch {
      props = {}
    }
    return {
      element,
      rect: element.getBoundingClientRect(),
      kind: 'component',
      name: componentName,
      details: Object.fromEntries(
        Object.entries(props).map(([key, value]) => [key, displayValue(value)]),
      ),
    }
  }

  const styles = window.getComputedStyle(element)
  return {
    element,
    rect: element.getBoundingClientRect(),
    kind: 'element',
    name: element.tagName.toLowerCase(),
    details: Object.fromEntries(
      styleProperties
        .map((property) => [property, styles.getPropertyValue(property)] as const)
        .filter(([, value]) => value && value !== 'normal' && value !== 'none' && value !== '0px'),
    ),
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
      event.preventDefault()
      event.stopPropagation()
      select(event.target)
    }
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setInspection(null)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(false)
    }

    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', choose, true)
    canvas.addEventListener('pointerleave', leave)
    window.addEventListener('keydown', escape)
    return () => {
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', choose, true)
      canvas.removeEventListener('pointerleave', leave)
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
          <div className="playground-inspector__outline" aria-hidden="true" />
          <section
            className="playground-inspector__card"
            aria-live="polite"
            aria-label={`${inspection.kind} inspection`}
          >
            <header>
              <span>{inspection.kind}</span>
              <strong>{inspection.name}</strong>
            </header>
            <dl>
              {Object.entries(inspection.details).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <footer>
              {inspection.kind === 'component'
                ? 'Public props from the component contract'
                : 'Computed styles from the rendered element'}
            </footer>
          </section>
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
