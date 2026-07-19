import type { ReactNode } from 'react'

export type WireframeValue = string | number | boolean
export type WireframeValues = Record<string, WireframeValue>

export type WireframeCondition = {
  control: string
  equals: WireframeValue
}

type BaseWireframeControl<Kind extends string> = {
  id: string
  kind: Kind
  label: string
  description?: string
  visibleWhen?: WireframeCondition
}

export type WireframeRadioControl = BaseWireframeControl<'radio'> & {
  options: Array<{ value: string; label: string; description?: string }>
}

export type WireframeBooleanControl = BaseWireframeControl<'boolean'>

export type WireframeRangeControl = BaseWireframeControl<'range'> & {
  min: number
  max: number
  step: number
  unit?: string
}

export type WireframeControl =
  WireframeRadioControl | WireframeBooleanControl | WireframeRangeControl

export type WireframeLayout = {
  id: string
  name: string
  description: string
  hypothesis: string
}

export type WireframeState = {
  id: string
  name: string
  description: string
  values: WireframeValues
}

export type WireframeFlowNode = {
  id: string
  state: string
  x: number
  y: number
}

export type WireframeFlowEdge = {
  id: string
  from: string
  to: string
  action: string
  label: string
}

export type WireframeManifest = {
  schemaVersion: number
  id: string
  name: string
  status: 'draft' | 'review' | 'approved'
  description: string
  entry: string
  docs: string
  changelog: string
  defaultLayout: string
  defaultState: string
  layouts: WireframeLayout[]
  controls: WireframeControl[]
  states: WireframeState[]
  flow: {
    nodes: WireframeFlowNode[]
    edges: WireframeFlowEdge[]
  }
}

export type WireframeAction = {
  id: string
  values?: WireframeValues
}

export type WireframeRenderContext = {
  layout: string
  state: string | null
  values: WireframeValues
  onAction: (action: WireframeAction) => void
}

export type WireframeModule = {
  renderWireframe: (context: WireframeRenderContext) => ReactNode
}
