import './UserFlowCanvas.scss'
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { inspectionAttributes } from '@design-lab/system/inspection'

export type UserFlowCanvasNode = {
  id: string
  title: string
  description: string
  eyebrow?: string
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
}

const NODE_WIDTH = 260
const NODE_HEIGHT = 148
const WORLD_WIDTH = 1840
const WORLD_HEIGHT = 720

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function UserFlowCanvas({
  nodes,
  edges,
  selectedId,
  onSelect,
  className,
  ...props
}: UserFlowCanvasProps) {
  const markerId = useId().replace(/:/g, '')
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    x: number
    y: number
    panX: number
    panY: number
  } | null>(null)
  const [pan, setPan] = useState({ x: 48, y: 48 })
  const [zoom, setZoom] = useState(0.82)
  const byId = new Map(nodes.map((node) => [node.id, node]))

  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setPan({
      x: drag.panX + event.clientX - drag.x,
      y: drag.panY + event.clientY - drag.y,
    })
  }
  const endPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const changeZoom = (next: number) => setZoom(clamp(next, 0.55, 1.25))
  const resetView = () => {
    setPan({ x: 48, y: 48 })
    setZoom(0.82)
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
        aria-label="User flow graph. Drag the empty Canvas to pan or use the visible controls."
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <div
          className="dl-user-flow-canvas__world"
          style={
            {
              width: WORLD_WIDTH,
              height: WORLD_HEIGHT,
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            } as CSSProperties
          }
        >
          <svg
            className="dl-user-flow-canvas__edges"
            width={WORLD_WIDTH}
            height={WORLD_HEIGHT}
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
              const distance = Math.max(90, (endX - startX) * 0.48)
              const middleX = (startX + endX) / 2
              const middleY = (startY + endY) / 2
              const labelWidth = Math.max(116, Math.min(190, edge.label.length * 7.2 + 24))
              return (
                <g key={edge.id}>
                  <path
                    className="dl-user-flow-canvas__edge"
                    d={`M ${startX} ${startY} C ${startX + distance} ${startY}, ${endX - distance} ${endY}, ${endX} ${endY}`}
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
            {nodes.map((node) => {
              const selected = node.id === selectedId
              return (
                <button
                  type="button"
                  key={node.id}
                  className={`dl-user-flow-canvas__node${selected ? ' dl-user-flow-canvas__node--selected' : ''}`}
                  style={{ left: node.x, top: node.y }}
                  aria-pressed={selected}
                  onClick={() => onSelect(node.id)}
                >
                  <span>{node.eyebrow ?? 'State'}</span>
                  <strong>{node.title}</strong>
                  <p>{node.description}</p>
                  <small>{selected ? 'Selected state' : 'Select state'}</small>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
