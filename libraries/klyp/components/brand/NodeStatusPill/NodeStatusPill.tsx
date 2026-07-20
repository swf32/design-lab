import { CheckOutline } from '@klyp/icons'
import './NodeStatusPill.scss'

import type { Ref } from 'react'

// =====================================================================
// NodeStatusPill — Klyp brand atom (Stage 3 of canvas-mvp)
// =====================================================================
//
// Tiny status badge slotted into NodeFrame's `statusSlot` to communicate
// the lifecycle of a generation node. Drives appearance via `data-status`
// (idle / queued / running / done / error). The `idle` status renders
// nothing by default — pills only appear once a generation enters the
// queue.
//
// Composition tier: Brand atom (uses status semantic tokens + canvas-aware
//                   spinner / icon affordances).
// Spec ref:        CANVAS-SPEC-2026-05-08.md §8 (Generation flow — In
//                  Queue → In Progress → Done / Failed).
// Pattern ref:     ../Chip/Chip.tsx (data-attribute resolution).

export type NodeStatus = 'idle' | 'queued' | 'running' | 'done' | 'error'

const DEFAULT_LABELS: Record<NodeStatus, string> = {
  idle: 'Idle',
  queued: 'In Queue',
  running: 'In Progress',
  done: 'Done',
  error: 'Failed',
}

export interface NodeStatusPillProps {
  /** Lifecycle status of the node's generation. */
  status: NodeStatus
  /** Override label (default = canonical label per status). */
  label?: string
  /** Forwarded ref — React 19 ref-as-prop, no `forwardRef`. */
  ref?: Ref<HTMLSpanElement>
}

export function NodeStatusPill({ status, label, ref }: NodeStatusPillProps) {
  // Hide pill in idle state by default — only render when caller passes
  // an explicit label (e.g. for showcase / debug surfaces).
  if (status === 'idle' && !label) return null

  return (
    <span
      ref={ref}
      className="klyp-NodeStatusPill"
      data-status={status}
      role="status"
      aria-live="polite"
    >
      {status === 'running' ? <span className="klyp-NodeStatusPill__spinner" aria-hidden /> : null}
      {status === 'done' ? (
        <CheckOutline width={10} height={10} aria-hidden focusable={false} />
      ) : null}
      <span className="klyp-NodeStatusPill__label">{label ?? DEFAULT_LABELS[status]}</span>
    </span>
  )
}

export default NodeStatusPill
