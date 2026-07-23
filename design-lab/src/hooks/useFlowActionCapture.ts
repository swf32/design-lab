import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

export function useFlowActionCapture(surfaceRef: RefObject<HTMLElement | null>) {
  const lastClickTargetRef = useRef<Element | null>(null)

  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface) return
    const capture = (event: MouseEvent) => {
      lastClickTargetRef.current = event.target instanceof Element ? event.target : null
    }
    surface.addEventListener('click', capture, true)
    return () => surface.removeEventListener('click', capture, true)
  }, [surfaceRef])

  return lastClickTargetRef
}

export function resolveFlowActionTarget(from: Element | null) {
  let current = from
  while (current) {
    if (
      current.matches(
        'button, a[href], [role="button"], input[type="button"], input[type="submit"]',
      )
    )
      return current
    current = current.parentElement
  }
  return from
}

const FLOW_ACTION_CLASS = 'dl-flow-action-origin'
let highlightedElement: Element | null = null

export function highlightFlowActionTarget(element: Element | null) {
  if (highlightedElement instanceof HTMLElement)
    highlightedElement.classList.remove(FLOW_ACTION_CLASS)
  highlightedElement = element
  if (element instanceof HTMLElement) element.classList.add(FLOW_ACTION_CLASS)
}

export function clearFlowActionHighlight() {
  highlightFlowActionTarget(null)
}
