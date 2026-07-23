import './UserFlowCanvas.scss'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { WireframeScreenPreview } from '../../../molecules/workbench/WireframeScreenPreview/WireframeScreenPreview'

export type UserFlowCanvasNode = {
  id: string
  title: string
  description: string
  eyebrow?: string
  preview: ReactNode
  mobilePreview?: ReactNode
  screenStyle?: CSSProperties
  x: number
  y: number
}

export type UserFlowCanvasEdge = {
  id: string
  from: string
  to: string
  label: string
  action?: string
}

export type UserFlowCanvasViewState = {
  pan: { x: number; y: number }
  zoom: number
}

export type UserFlowCanvasVariant = 'flow' | 'sitemap'

export type UserFlowCanvasProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  nodes: UserFlowCanvasNode[]
  edges: UserFlowCanvasEdge[]
  selectedId: string | null
  onSelect: (id: string) => void
  onPreview?: (id: string) => void
  viewState?: UserFlowCanvasViewState
  onViewStateChange?: (next: UserFlowCanvasViewState) => void
  variant?: UserFlowCanvasVariant
  highlightedEdgeIds?: string[]
  onLayoutNormalized?: (nodes: Array<{ id: string; x: number; y: number }>) => void
}

type Point = { x: number; y: number }
type PositionedNode = UserFlowCanvasNode & { x: number; y: number }

export const USER_FLOW_NODE_WIDTH = 520
export const USER_FLOW_NODE_HEIGHT = 390
// Gap must fit edge labels between columns; labels are ~120–190px wide and sit above nodes.
export const USER_FLOW_NODE_GAP = 168
export const SITEMAP_NODE_WIDTH = 280
export const SITEMAP_NODE_HEIGHT = 140
export const SITEMAP_NODE_GAP = 80
const COLUMN_SNAP = 48
const SITEMAP_COLUMN_SNAP = 32
const MIN_ZOOM = 0.4
const MAX_ZOOM = 1.25
const GRID_SIZE = 24
const DEFAULT_VIEW: UserFlowCanvasViewState = { pan: { x: 48, y: 48 }, zoom: 0.72 }
const LOD_ZOOM_DESKTOP = 0.48

type FlowLayoutConfig = {
  nodeWidth: number
  nodeHeight: number
  nodeGap: number
  columnSnap: number
}

const FLOW_LAYOUT: FlowLayoutConfig = {
  nodeWidth: USER_FLOW_NODE_WIDTH,
  nodeHeight: USER_FLOW_NODE_HEIGHT,
  nodeGap: USER_FLOW_NODE_GAP,
  columnSnap: COLUMN_SNAP,
}

const SITEMAP_LAYOUT: FlowLayoutConfig = {
  nodeWidth: SITEMAP_NODE_WIDTH,
  nodeHeight: SITEMAP_NODE_HEIGHT,
  nodeGap: SITEMAP_NODE_GAP,
  columnSnap: SITEMAP_COLUMN_SNAP,
}

type LodLevel = 'metadata' | 'desktop'

function lodForZoom(zoom: number): LodLevel {
  // Desktop-only for now; mobile/tablet viewport choice comes later.
  if (zoom >= LOD_ZOOM_DESKTOP) return 'desktop'
  return 'metadata'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function distance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y)
}

function center(first: Point, second: Point) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  }
}

function collisionSafeNodes(
  nodes: UserFlowCanvasNode[],
  layout: FlowLayoutConfig,
): PositionedNode[] {
  const columns: Array<{ authoredX: number; nodes: UserFlowCanvasNode[] }> = []

  for (const node of [...nodes].sort((first, second) => first.x - second.x || first.y - second.y)) {
    const column = columns.find(
      (candidate) => Math.abs(candidate.authoredX - node.x) <= layout.columnSnap,
    )
    if (column) column.nodes.push(node)
    else columns.push({ authoredX: node.x, nodes: [node] })
  }

  let previousX: number | null = null
  return columns.flatMap((column) => {
    const x =
      previousX == null
        ? column.authoredX
        : Math.max(column.authoredX, previousX + layout.nodeWidth + layout.nodeGap)
    previousX = x
    let previousY: number | null = null

    return [...column.nodes]
      .sort((first, second) => first.y - second.y)
      .map((node) => {
        const y =
          previousY == null
            ? node.y
            : Math.max(node.y, previousY + layout.nodeHeight + layout.nodeGap)
        previousY = y
        return { ...node, x, y }
      })
  })
}

export function normalizeFlowNodeLayout(
  nodes: UserFlowCanvasNode[],
  variant: UserFlowCanvasVariant = 'flow',
) {
  return collisionSafeNodes(nodes, variant === 'sitemap' ? SITEMAP_LAYOUT : FLOW_LAYOUT)
}

type EdgeAnchors = {
  startX: number
  startY: number
  endX: number
  endY: number
  path: string
  labelX: number
  labelY: number
}

function edgeGeometry(
  from: PositionedNode,
  to: PositionedNode,
  layout: FlowLayoutConfig,
): EdgeAnchors {
  const sameColumn = Math.abs(from.x - to.x) <= layout.columnSnap
  const fromCenterX = from.x + layout.nodeWidth / 2
  const fromCenterY = from.y + layout.nodeHeight / 2
  const toCenterX = to.x + layout.nodeWidth / 2
  const toCenterY = to.y + layout.nodeHeight / 2

  let startX: number
  let startY: number
  let endX: number
  let endY: number
  let path: string

  if (sameColumn) {
    const downward = to.y >= from.y
    startX = fromCenterX
    startY = downward ? from.y + layout.nodeHeight : from.y
    endX = toCenterX
    endY = downward ? to.y : to.y + layout.nodeHeight
    const bend = Math.max(48, Math.abs(endY - startY) * 0.42)
    path = downward
      ? `M ${startX} ${startY} C ${startX} ${startY + bend}, ${endX} ${endY - bend}, ${endX} ${endY}`
      : `M ${startX} ${startY} C ${startX} ${startY - bend}, ${endX} ${endY + bend}, ${endX} ${endY}`
  } else if (to.x >= from.x) {
    startX = from.x + layout.nodeWidth
    startY = fromCenterY
    endX = to.x
    endY = toCenterY
    const bend = Math.max(48, (endX - startX) * 0.48)
    path = `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`
  } else {
    startX = from.x
    startY = fromCenterY
    endX = to.x + layout.nodeWidth
    endY = toCenterY
    const bend = Math.max(48, (startX - endX) * 0.48)
    path = `M ${startX} ${startY} C ${startX - bend} ${startY}, ${endX + bend} ${endY}, ${endX} ${endY}`
  }

  // Horizontal labels sit in the column gap above the path so they stay readable;
  // vertical (same-column) labels stay on the path mid-point in the row gap.
  const horizontal = !sameColumn
  return {
    startX,
    startY,
    endX,
    endY,
    path,
    labelX: (startX + endX) / 2,
    labelY: horizontal ? Math.min(startY, endY) - 22 : (startY + endY) / 2,
  }
}

function centerNodeInViewport(
  node: PositionedNode,
  viewportWidth: number,
  viewportHeight: number,
  zoom: number,
  layout: FlowLayoutConfig,
) {
  return {
    x: viewportWidth / 2 - (node.x + layout.nodeWidth / 2) * zoom,
    y: viewportHeight / 2 - (node.y + layout.nodeHeight / 2) * zoom,
  }
}

function spatialNodeStep(
  nodes: PositionedNode[],
  currentId: string,
  direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
  layout: FlowLayoutConfig,
) {
  const current = nodes.find((node) => node.id === currentId)
  if (!current) return nodes[0]?.id ?? null
  const currentCenter = {
    x: current.x + layout.nodeWidth / 2,
    y: current.y + layout.nodeHeight / 2,
  }

  let best: PositionedNode | null = null
  let bestScore = Number.POSITIVE_INFINITY

  for (const candidate of nodes) {
    if (candidate.id === currentId) continue
    const candidateCenter = {
      x: candidate.x + layout.nodeWidth / 2,
      y: candidate.y + layout.nodeHeight / 2,
    }
    const dx = candidateCenter.x - currentCenter.x
    const dy = candidateCenter.y - currentCenter.y

    if (direction === 'ArrowUp' && dy >= -8) continue
    if (direction === 'ArrowDown' && dy <= 8) continue
    if (direction === 'ArrowLeft' && dx >= -8) continue
    if (direction === 'ArrowRight' && dx <= 8) continue

    const primary =
      direction === 'ArrowUp' || direction === 'ArrowDown' ? Math.abs(dy) : Math.abs(dx)
    const secondary =
      direction === 'ArrowUp' || direction === 'ArrowDown' ? Math.abs(dx) : Math.abs(dy)
    const score = primary * 10 + secondary
    if (score < bestScore) {
      bestScore = score
      best = candidate
    }
  }

  return best?.id ?? currentId
}

export function UserFlowCanvas({
  nodes,
  edges,
  selectedId,
  onSelect,
  onPreview,
  viewState,
  onViewStateChange,
  variant = 'flow',
  highlightedEdgeIds = [],
  onLayoutNormalized,
  className,
  ...props
}: UserFlowCanvasProps) {
  const layout = variant === 'sitemap' ? SITEMAP_LAYOUT : FLOW_LAYOUT
  const markerId = useId().replace(/:/g, '')
  const viewportRef = useRef<HTMLDivElement>(null)
  const pointersRef = useRef(new Map<number, Point>())
  const dragRef = useRef<{
    pointerId: number
    x: number
    y: number
    panX: number
    panY: number
  } | null>(null)
  const pinchRef = useRef<{
    distance: number
    zoom: number
    worldX: number
    worldY: number
  } | null>(null)
  const didInitialPanRef = useRef(false)
  const [internalView, setInternalView] = useState(DEFAULT_VIEW)
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(selectedId)
  const pan = viewState?.pan ?? internalView.pan
  const zoom = viewState?.zoom ?? internalView.zoom
  const panRef = useRef(pan)
  const zoomRef = useRef(zoom)
  const positionedNodes = useMemo(() => collisionSafeNodes(nodes, layout), [layout, nodes])
  const lod = variant === 'sitemap' ? ('metadata' as LodLevel) : lodForZoom(zoom)
  const highlightedEdges = useMemo(() => new Set(highlightedEdgeIds), [highlightedEdgeIds])
  const byId = useMemo(
    () => new Map(positionedNodes.map((node) => [node.id, node])),
    [positionedNodes],
  )
  const worldWidth = Math.max(
    1200,
    ...positionedNodes.map((node) => node.x + layout.nodeWidth + 480),
  )
  const worldHeight = Math.max(
    900,
    ...positionedNodes.map((node) => node.y + layout.nodeHeight + 360),
  )
  const selectedNode = selectedId ? byId.get(selectedId) : undefined

  panRef.current = pan
  zoomRef.current = zoom

  const publishView = (nextPan: Point, nextZoom: number) => {
    const next = { pan: nextPan, zoom: nextZoom }
    if (onViewStateChange) onViewStateChange(next)
    else setInternalView(next)
  }

  const setPan = (next: Point) => publishView(next, zoomRef.current)
  const setZoom = (next: number) => publishView(panRef.current, next)

  const zoomAt = (clientPoint: Point, requestedZoom: number) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    const local = { x: clientPoint.x - rect.left, y: clientPoint.y - rect.top }
    const nextZoom = clamp(requestedZoom, MIN_ZOOM, MAX_ZOOM)
    const worldPoint = {
      x: (local.x - panRef.current.x) / zoomRef.current,
      y: (local.y - panRef.current.y) / zoomRef.current,
    }
    publishView(
      {
        x: local.x - worldPoint.x * nextZoom,
        y: local.y - worldPoint.y * nextZoom,
      },
      nextZoom,
    )
  }

  useEffect(() => {
    setFocusedNodeId((current) => selectedId ?? current)
  }, [selectedId])

  useLayoutEffect(() => {
    if (didInitialPanRef.current) return
    const viewport = viewportRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    if (selectedId) {
      const node = byId.get(selectedId)
      if (!node) return
      publishView(
        centerNodeInViewport(node, rect.width, rect.height, zoomRef.current, layout),
        zoomRef.current,
      )
      didInitialPanRef.current = true
      return
    }
    if (!positionedNodes.length) return
    // Site map / empty selection: fit the whole graph into view so cyclic layouts aren't off-screen.
    const minX = Math.min(...positionedNodes.map((node) => node.x))
    const minY = Math.min(...positionedNodes.map((node) => node.y))
    const maxX = Math.max(...positionedNodes.map((node) => node.x + layout.nodeWidth))
    const maxY = Math.max(...positionedNodes.map((node) => node.y + layout.nodeHeight))
    const contentWidth = Math.max(1, maxX - minX)
    const contentHeight = Math.max(1, maxY - minY)
    const nextZoom = clamp(
      Math.min(
        (rect.width - 96) / contentWidth,
        (rect.height - 96) / contentHeight,
        DEFAULT_VIEW.zoom,
      ),
      MIN_ZOOM,
      MAX_ZOOM,
    )
    publishView(
      {
        x: rect.width / 2 - (minX + contentWidth / 2) * nextZoom,
        y: rect.height / 2 - (minY + contentHeight / 2) * nextZoom,
      },
      nextZoom,
    )
    didInitialPanRef.current = true
  }, [layout, selectedId, byId, positionedNodes])

  useEffect(() => {
    if (!onLayoutNormalized) return
    onLayoutNormalized(positionedNodes.map((node) => ({ id: node.id, x: node.x, y: node.y })))
  }, [onLayoutNormalized, positionedNodes])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const preventBrowserGesture = (event: Event) => event.preventDefault()
    const preventTwoFingerPageZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault()
    }
    const handleTrackpadPinch = (event: WheelEvent) => {
      if (!event.ctrlKey) return
      event.preventDefault()
      zoomAt(
        { x: event.clientX, y: event.clientY },
        zoomRef.current * Math.exp(-event.deltaY * 0.012),
      )
    }
    viewport.addEventListener('gesturestart', preventBrowserGesture, { passive: false })
    viewport.addEventListener('gesturechange', preventBrowserGesture, { passive: false })
    viewport.addEventListener('gestureend', preventBrowserGesture, { passive: false })
    viewport.addEventListener('touchmove', preventTwoFingerPageZoom, { passive: false })
    viewport.addEventListener('wheel', handleTrackpadPinch, { passive: false })
    return () => {
      viewport.removeEventListener('gesturestart', preventBrowserGesture)
      viewport.removeEventListener('gesturechange', preventBrowserGesture)
      viewport.removeEventListener('gestureend', preventBrowserGesture)
      viewport.removeEventListener('touchmove', preventTwoFingerPageZoom)
      viewport.removeEventListener('wheel', handleTrackpadPinch)
    }
  }, [])

  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if ((event.target as HTMLElement).closest('.dl-user-flow-canvas__node')) return
    if ((event.target as HTMLElement).closest('button')) return

    const point = { x: event.clientX, y: event.clientY }
    pointersRef.current.set(event.pointerId, point)
    event.currentTarget.setPointerCapture(event.pointerId)
    const pointers = [...pointersRef.current.values()]

    if (pointers.length >= 2) {
      const pinchCenter = center(pointers[0], pointers[1])
      const viewport = viewportRef.current?.getBoundingClientRect()
      if (!viewport) return
      pinchRef.current = {
        distance: Math.max(1, distance(pointers[0], pointers[1])),
        zoom: zoomRef.current,
        worldX: (pinchCenter.x - viewport.left - panRef.current.x) / zoomRef.current,
        worldY: (pinchCenter.y - viewport.top - panRef.current.y) / zoomRef.current,
      }
      dragRef.current = null
      return
    }

    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    }
  }

  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const pointers = [...pointersRef.current.values()]

    if (pointers.length >= 2 && pinchRef.current) {
      const viewport = viewportRef.current?.getBoundingClientRect()
      if (!viewport) return
      const pinchCenter = center(pointers[0], pointers[1])
      const nextZoom = clamp(
        pinchRef.current.zoom * (distance(pointers[0], pointers[1]) / pinchRef.current.distance),
        MIN_ZOOM,
        MAX_ZOOM,
      )
      publishView(
        {
          x: pinchCenter.x - viewport.left - pinchRef.current.worldX * nextZoom,
          y: pinchCenter.y - viewport.top - pinchRef.current.worldY * nextZoom,
        },
        nextZoom,
      )
      return
    }

    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    publishView(
      {
        x: drag.panX + event.clientX - drag.x,
        y: drag.panY + event.clientY - drag.y,
      },
      zoomRef.current,
    )
  }

  const endPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId)
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
    if (pointersRef.current.size < 2) pinchRef.current = null
  }

  const changeZoom = (next: number) => {
    const viewport = viewportRef.current?.getBoundingClientRect()
    if (!viewport) return
    zoomAt({ x: viewport.left + viewport.width / 2, y: viewport.top + viewport.height / 2 }, next)
  }

  const resetView = () => {
    publishView(DEFAULT_VIEW.pan, DEFAULT_VIEW.zoom)
    didInitialPanRef.current = false
  }

  const handleNodeKeyDown = (event: ReactKeyboardEvent<HTMLElement>, nodeId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(nodeId)
      setFocusedNodeId(nodeId)
      return
    }
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const nextId = spatialNodeStep(
      positionedNodes,
      nodeId,
      event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
      layout,
    )
    if (nextId !== nodeId) {
      onSelect(nextId)
      setFocusedNodeId(nextId)
    }
  }

  const handleViewportKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!focusedNodeId) return
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const nextId = spatialNodeStep(
      positionedNodes,
      focusedNodeId,
      event.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
      layout,
    )
    if (nextId !== focusedNodeId) {
      onSelect(nextId)
      setFocusedNodeId(nextId)
    }
  }

  return (
    <div
      className={`dl-user-flow-canvas${variant === 'sitemap' ? ' dl-user-flow-canvas--sitemap' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      <div className="dl-user-flow-canvas__tools" aria-label="User flow Canvas controls">
        <button type="button" onClick={() => changeZoom(zoom - 0.1)}>
          Zoom out
        </button>
        <output aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button type="button" onClick={resetView}>
          Reset
        </button>
        <button type="button" onClick={() => changeZoom(zoom + 0.1)}>
          Zoom in
        </button>
      </div>
      <p className="dl-user-flow-canvas__status" aria-live="polite">
        {selectedNode
          ? `Selected state: ${selectedNode.title}. ${selectedNode.description}`
          : 'No state selected on the user flow graph.'}
      </p>
      <div
        ref={viewportRef}
        className="dl-user-flow-canvas__viewport"
        aria-label="User flow graph. Drag empty space to pan, pinch with two fingers to zoom, or use the visible controls. Select a state card to update the current state; use Open screen to preview it."
        role="application"
        tabIndex={0}
        onKeyDown={handleViewportKeyDown}
        style={
          {
            '--dl-flow-grid-size': `${GRID_SIZE * zoom}px`,
            '--dl-flow-grid-x': `${pan.x}px`,
            '--dl-flow-grid-y': `${pan.y}px`,
          } as CSSProperties
        }
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <div
          className="dl-user-flow-canvas__world"
          style={
            {
              width: worldWidth,
              height: worldHeight,
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            } as CSSProperties
          }
        >
          <svg
            className="dl-user-flow-canvas__edges"
            width={worldWidth}
            height={worldHeight}
            aria-hidden="true"
          >
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const from = byId.get(edge.from)
              const to = byId.get(edge.to)
              if (!from || !to) return null
              const geometry = edgeGeometry(from, to, layout)
              const labelWidth = Math.max(116, Math.min(190, edge.label.length * 7.2 + 24))
              const highlighted = highlightedEdges.has(edge.id)
              return (
                <g key={edge.id}>
                  <path
                    className={`dl-user-flow-canvas__edge${highlighted ? ' dl-user-flow-canvas__edge--highlighted' : ''}`}
                    d={geometry.path}
                    markerEnd={`url(#${markerId})`}
                  />
                  <rect
                    className={`dl-user-flow-canvas__edge-label-background${highlighted ? ' dl-user-flow-canvas__edge-label-background--highlighted' : ''}`}
                    x={geometry.labelX - labelWidth / 2}
                    y={geometry.labelY - 14}
                    width={labelWidth}
                    height={28}
                    rx={14}
                  />
                  <text
                    className="dl-user-flow-canvas__edge-label"
                    x={geometry.labelX}
                    y={geometry.labelY + 4}
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              )
            })}
          </svg>
          <div className="dl-user-flow-canvas__nodes" role="list">
            {positionedNodes.map((node) => {
              const selected = node.id === selectedId
              const focused = node.id === focusedNodeId
              const showPreviews = lod !== 'metadata'
              return (
                <article
                  key={node.id}
                  role="listitem"
                  className={`dl-user-flow-canvas__node${selected ? ' dl-user-flow-canvas__node--selected' : ''}${lod === 'metadata' ? ' dl-user-flow-canvas__node--metadata' : ''}${showPreviews ? ' dl-user-flow-canvas__node--desktop-only' : ''}`}
                  style={
                    {
                      left: node.x,
                      top: node.y,
                      width: layout.nodeWidth,
                      height: layout.nodeHeight,
                    } as CSSProperties
                  }
                  tabIndex={focused ? 0 : -1}
                  aria-current={selected ? 'true' : undefined}
                  aria-label={`${node.title}. ${node.description}`}
                  onFocus={() => setFocusedNodeId(node.id)}
                  onKeyDown={(event) => handleNodeKeyDown(event, node.id)}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => {
                    onSelect(node.id)
                    setFocusedNodeId(node.id)
                  }}
                >
                  {showPreviews ? (
                    <div className="dl-user-flow-canvas__screens dl-user-flow-canvas__screens--desktop-only">
                      <div className="dl-user-flow-canvas__screen dl-user-flow-canvas__screen--desktop">
                        <span>Desktop</span>
                        <WireframeScreenPreview style={node.screenStyle}>
                          {node.preview}
                        </WireframeScreenPreview>
                      </div>
                    </div>
                  ) : (
                    <div className="dl-user-flow-canvas__metadata">
                      <span>{node.eyebrow ?? 'State'}</span>
                      <strong>{node.title}</strong>
                      <p>{node.description}</p>
                    </div>
                  )}
                  <footer>
                    <div>
                      <span>{node.eyebrow ?? 'State'}</span>
                      <strong>{node.title}</strong>
                      <p>{node.description}</p>
                    </div>
                    {onPreview && (
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={(event) => {
                          event.stopPropagation()
                          onSelect(node.id)
                          onPreview(node.id)
                        }}
                      >
                        Open screen
                      </button>
                    )}
                  </footer>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
