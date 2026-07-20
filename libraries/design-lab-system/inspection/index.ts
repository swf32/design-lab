import {
  createContext,
  createElement,
  Children,
  forwardRef,
  useContext,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'

export type InspectionDescriptor = {
  kind: 'component' | 'slot'
  name: string
  code: string
  sourceId: string
  file: string
  line: number
}

export type InspectionSourceLocation = {
  sourceId: string
  file: string
  line: number
}

export type InspectionMetadata = {
  components: InspectionDescriptor[]
  slots: InspectionDescriptor[]
  source: InspectionSourceLocation
}

const InspectionContext = createContext<InspectionDescriptor[]>([])
const inspectionRegistry = new Map<Element, InspectionMetadata>()
const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export function InspectionBoundary({
  descriptor,
  children,
}: {
  descriptor: InspectionDescriptor
  children: ReactNode
}) {
  const parent = useContext(InspectionContext)
  return createElement(InspectionContext.Provider, { value: [...parent, descriptor] }, children)
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

type InspectionHostProps = HTMLAttributes<HTMLElement> & {
  as: ElementType
  source: InspectionSourceLocation
}

export const InspectionHost = forwardRef<HTMLElement, InspectionHostProps>(function InspectionHost(
  { as, source, children, ...props },
  forwardedRef,
) {
  const descriptors = useContext(InspectionContext)
  const elementRef = useRef<HTMLElement | null>(null)
  const ref = (element: HTMLElement | null) => {
    if (elementRef.current) inspectionRegistry.delete(elementRef.current)
    elementRef.current = element
    if (element)
      inspectionRegistry.set(element, {
        components: descriptors.filter((descriptor) => descriptor.kind === 'component'),
        slots: descriptors.filter((descriptor) => descriptor.kind === 'slot'),
        source,
      })
    assignRef(forwardedRef, element)
  }
  if (typeof as === 'string' && voidElements.has(as)) return createElement(as, { ...props, ref })
  const childList = Children.toArray(children)
  return createElement(
    as,
    { ...props, ref },
    createElement(InspectionContext, { value: [] }, ...childList),
  )
})

export function inspectionMetadataFor(element: Element) {
  return inspectionRegistry.get(element) ?? null
}

export function inspectionEntriesWithin(surface: Element) {
  return [...inspectionRegistry.entries()].filter(([element]) => surface.contains(element))
}
