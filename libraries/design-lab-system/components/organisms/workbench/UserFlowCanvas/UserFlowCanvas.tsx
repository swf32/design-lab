import './UserFlowCanvas.scss'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { inspectionAttributes } from '@design-lab/system/inspection'
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
}

export type UserFlowCanvasProps = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  nodes: UserFlowCanvasNode[]
  edges: UserFlowCanvasEdge[]
  selectedId: string | null
  onSelect: (id: string) => void
  onPreview?: (id: string) => void
}

type Point = { x: number; y: number }
type PositionedNode = UserFlowCanvasNode & { x: number; y: number }

const NODE_WIDTH = 520
const NODE_HEIGHT = 390
const NODE_GAP = 64
const COLUMN_SNAP = 48
const MIN_ZOOM = 0.4
const MAX_ZOOM = 1.25
const GRID_SIZE = 24

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

function collisionSafeNodes(nodes: UserFlowCanvasNode[]): PositionedNode[] {
  const columns: Array<{ authoredX: number; nodes: UserFlowCanvasNode[] }> = []

  for (const node of [...nodes].sort((first, second) => first.x - second.x || first.y - second.y)) {
    const column = columns.find(
      (candidate) => Math.abs(candidate.authoredX - node.x) <= COLUMN_SNAP,
    )
    if (column) column.nodes.push(node)
    else columns.push({ authoredX: node.x, nodes: [node] })
  }

  let previousX: number | null = null
  return columns.flatMap((column) => {
    const x =
      previousX == null
        ? column.authoredX
        : Math.max(column.authoredX, previousX + NODE_WIDTH + NODE_GAP)
    previousX = x
    let previousY: number | null = null

    return [...column.nodes]
      .sort((first, second) => first.y - second.y)
      .map((node) => {
        const y = previousY == null ? node.y : Math.max(node.y, previousY + NODE_HEIGHT + NODE_GAP)
        previousY = y
        return { ...node, x, y }
      })
  })
}

export function UserFlowCanvas({
  nodes,
  edges,
  selectedId,
  onSelect,
  onPreview,
  className,
  ...props
}: UserFlowCanvasProps) {
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
  const [pan, setPanState] = useState({ x: 48, y: 48 })
  const [zoom, setZoomState] = useState(0.72)
  const panRef = useRef(pan)
  const zoomRef = useRef(zoom)
  const positionedNodes = collisionSafeNodes(nodes)
  const byId = new Map(positionedNodes.map((node) => [node.id, node]))
  const worldWidth = Math.max(1200, ...positionedNodes.map((node) => node.x + NODE_WIDTH + 480))
  const worldHeight = Math.max(900, ...positionedNodes.map((node) => node.y + NODE_HEIGHT + 360))

  const setPan = (next: Point) => {
    panRef.current = next
    setPanState(next)
  }

  const setZoom = (next: number) => {
    zoomRef.current = next
    setZoomState(next)
  }

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
    setZoom(nextZoom)
    setPan({
      x: local.x - worldPoint.x * nextZoom,
      y: local.y - worldPoint.y * nextZoom,
    })
  }

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

    if ((event.target as HTMLElement).closest('button')) return
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
      setZoom(nextZoom)
      setPan({
        x: pinchCenter.x - viewport.left - pinchRef.current.worldX * nextZoom,
        y: pinchCenter.y - viewport.top - pinchRef.current.worldY * nextZoom,
      })
      return
    }

    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setPan({
      x: drag.panX + event.clientX - drag.x,
      y: drag.panY + event.clientY - drag.y,
    })
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
    setPan({ x: 48, y: 48 })
    setZoom(0.72)
  }

  return (
    <div
      className={`dl-user-flow-canvas${className ? ` ${className}` : ''}`}
      {...inspectionAttributes('UserFlowCanvas', {
        nodeCount: nodes.length,
        edgeCount: edges.length,
      })}
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
      <div
        ref={viewportRef}
        className="dl-user-flow-canvas__viewport"
        aria-label="User flow graph. Drag to pan, pinch with two fingers to zoom, or use the visible controls."
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
              const startX = from.x + NODE_WIDTH
              const startY = from.y + NODE_HEIGHT / 2
              const endX = to.x
              const endY = to.y + NODE_HEIGHT / 2
              const distanceX = Math.max(90, (endX - startX) * 0.48)
              const middleX = (startX + endX) / 2
              const middleY = (startY + endY) / 2
              const labelWidth = Math.max(116, Math.min(190, edge.label.length * 7.2 + 24))
              return (
                <g key={edge.id}>
                  <path
                    className="dl-user-flow-canvas__edge"
                    d={`M ${startX} ${startY} C ${startX + distanceX} ${startY}, ${endX - distanceX} ${endY}, ${endX} ${endY}`}
                    markerEnd={`url(#${markerId})`}
                  />
                  <rect
                    className="dl-user-flow-canvas__edge-label-background"
                    x={middleX - labelWidth / 2}
                    y={middleY - 14}
                    width={labelWidth}
                    height={28}
                    rx={14}
                  />
                  <text
                    className="dl-user-flow-canvas__edge-label"
                    x={middleX}
                    y={middleY + 4}
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              )
            })}
          </svg>
          <div className="dl-user-flow-canvas__nodes">
            {positionedNodes.map((node) => {
              const selected = node.id === selectedId
              return (
                <article
                  key={node.id}
                  className={`dl-user-flow-canvas__node${selected ? ' dl-user-flow-canvas__node--selected' : ''}`}
                  style={{ left: node.x, top: node.y }}
                >
                  <div className="dl-user-flow-canvas__screens">
                    <div className="dl-user-flow-canvas__screen dl-user-flow-canvas__screen--desktop">
                      <span>Desktop</span>
                      <WireframeScreenPreview style={node.screenStyle}>
                        {node.preview}
                      </WireframeScreenPreview>
                    </div>
                    <div className="dl-user-flow-canvas__screen dl-user-flow-canvas__screen--mobile">
                      <span>Mobile</span>
                      <WireframeScreenPreview
                        viewportWidth={390}
                        viewportHeight={844}
                        style={node.screenStyle}
                      >
                        {node.mobilePreview ?? node.preview}
                      </WireframeScreenPreview>
                    </div>
                  </div>
                  <footer>
                    <div>
                      <span>{node.eyebrow ?? 'State'}</span>
                      <strong>{node.title}</strong>
                      <p>{node.description}</p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        onSelect(node.id)
                        onPreview?.(node.id)
                      }}
                    >
                      Preview state
                    </button>
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
