import { useEffect, useRef } from 'react'
import { patchEntityManifest } from '../api/projects'

type FlowNodePosition = { id: string; x: number; y: number }

export function useFlowLayoutAutosave({
  sourceId,
  moduleId,
  directory,
  authoredNodes,
  normalizedNodes,
  enabled = true,
}: {
  sourceId: string | null
  moduleId: 'pages' | 'wireframes'
  directory: string
  authoredNodes: FlowNodePosition[]
  normalizedNodes: FlowNodePosition[]
  enabled?: boolean
}) {
  const inFlightRef = useRef(false)

  useEffect(() => {
    if (!enabled || !sourceId || inFlightRef.current) return
    const authoredById = new Map(authoredNodes.map((node) => [node.id, node]))
    const patch = normalizedNodes.flatMap((node) => {
      const authored = authoredById.get(node.id)
      if (!authored || (authored.x === node.x && authored.y === node.y)) return []
      return [{ id: node.id, x: node.x, y: node.y }]
    })
    if (!patch.length) return

    const timer = window.setTimeout(async () => {
      inFlightRef.current = true
      try {
        await patchEntityManifest(sourceId, moduleId, directory, { flow: { nodes: patch } })
      } catch {
        // Autosave is best-effort; a failed write must not break review.
      } finally {
        inFlightRef.current = false
      }
    }, 900)

    return () => window.clearTimeout(timer)
  }, [authoredNodes, directory, enabled, moduleId, normalizedNodes, sourceId])
}
