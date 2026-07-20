import type { ReactNode } from 'react'
import type { WireframeControl, WireframeValue, WireframeValues } from '../wireframes'

export type { WireframeControl as PageControl, WireframeValue, WireframeValues }

export type PageState = {
  id: string
  name: string
  description: string
  values: WireframeValues
}

export type PageFlowNode = {
  id: string
  state: string
  x: number
  y: number
}

export type PageFlowCondition = {
  controlId: string
  value: WireframeValue
}

export type PageFlowTarget =
  | { kind: 'state'; stateId: string; condition?: PageFlowCondition }
  | { kind: 'page'; pageId: string; condition?: PageFlowCondition }

export type PageFlowEdge = {
  id: string
  from: string
  action: string
  label: string
  to: PageFlowTarget
}

export type PageDerivedFromWireframe = {
  sourceId?: string
  wireframeId: string
  layoutId?: string
  stateId?: string
}

export type PageDiagnosticAcknowledgement = {
  code: string
  entityRef?: string
  reason: string
  acknowledgedAt: string
}

export type PageManifest = {
  schemaVersion: number
  id: string
  name: string
  status: 'draft' | 'review' | 'approved'
  description: string
  entry: string
  docs: string
  changelog: string
  route?: string
  routeParams?: string[]
  derivedFromWireframe?: PageDerivedFromWireframe
  controls: WireframeControl[]
  states: PageState[]
  defaultState: string
  flow: {
    nodes: PageFlowNode[]
    edges: PageFlowEdge[]
  }
  diagnosticsAcknowledged?: PageDiagnosticAcknowledgement[]
}

export type PageAction = {
  id: string
  values?: WireframeValues
}

export type PageRenderContext = {
  state: string | null
  values: WireframeValues
  onAction: (action: PageAction) => void
}

export type PageModule = {
  renderPage: (context: PageRenderContext) => ReactNode
}
