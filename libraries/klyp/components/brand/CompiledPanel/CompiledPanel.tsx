import './CompiledPanel.scss'

import { Drawer } from '@klyp/brand/Drawer'
import { FileBulk, ImageBulk, XBulk } from '@klyp/icons/bulk'
import { CdnImage } from '../CdnImage'

// =====================================================================
// CompiledPanel — Klyp brand molecule (Phase B compose-time inspector)
// =====================================================================
//
// Drawer that shows the user **what prompt the model will actually receive**
// when they click Generate. Opens via toggle in PromptArea.
//
// Data-agnostic per `packages/brand/AGENTS.md` rules: callers (feature
// components in apps/web) own the Convex `useQuery` for
// `api.atoms.previewBuiltPrompt` and pass the resolved `built` payload +
// `isLoading` flag down as props.
//
// Composition: built on the existing <Drawer> brand atom (right-side by
// default). Renders three logical sections — atoms list, final prompt body,
// reference images grid — plus an optional API params footer summary.

/**
 * Mirror of the convex/lib/atoms types kept local to avoid pulling Convex
 * runtime types into the UI. Server validates shape via the `atomRefs`
 * validator in `convex/atoms.ts`.
 */
export type AtomRef = { atomId: string; input: unknown }

/**
 * Shape of the resolved preview returned by `api.atoms.previewBuiltPrompt`.
 * Mirrored locally so the brand layer stays Convex-free; callers ensure
 * the runtime payload matches.
 */
export type CompiledPreview = {
  textBlocks?: unknown
  refImages: string[]
  apiParams?: Record<string, unknown>
  systemHints?: unknown
  raw: string
}

export type CompiledPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  atomRefs: AtomRef[]
  /**
   * Resolved compose-preview payload. `null` when the caller hasn't fetched
   * yet (e.g. drawer closed). Pair with `isLoading` to show skeletons.
   */
  built: CompiledPreview | null
  /** True while the caller's `useQuery` is in flight. */
  isLoading: boolean
  /** Optional — when provided, atom row [×] removes that ref. Composer wires this. */
  onAtomRefsChange?: (next: AtomRef[]) => void
}

export function CompiledPanel({
  open,
  onOpenChange,
  atomRefs,
  built,
  isLoading,
  onAtomRefsChange,
}: CompiledPanelProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      title="Compiled prompt"
      description="What the model will actually receive when you generate."
    >
      <section className="klyp-CompiledPanel" data-state={isLoading ? 'loading' : 'ready'}>
        {/* atoms list */}
        {atomRefs.length === 0 ? (
          <p className="klyp-CompiledPanel__empty">
            No atoms yet — type a prompt or attach references.
          </p>
        ) : (
          <ul className="klyp-CompiledPanel__atoms" aria-label="Prompt atoms">
            {atomRefs.map((ref, i) => (
              <AtomRow
                key={`${ref.atomId}-${i}`}
                atomRef={ref}
                index={i}
                onRemove={
                  onAtomRefsChange
                    ? () => {
                        const next = atomRefs.filter((_, j) => j !== i)
                        onAtomRefsChange(next)
                      }
                    : undefined
                }
              />
            ))}
          </ul>
        )}

        {/* final prompt */}
        <div className="klyp-CompiledPanel__section" data-section="final-prompt">
          <header className="klyp-CompiledPanel__sectionHeader">
            <FileBulk aria-hidden />
            <h3 className="klyp-CompiledPanel__sectionTitle">Final prompt</h3>
          </header>
          {isLoading ? (
            <SkeletonText />
          ) : (
            <pre className="klyp-CompiledPanel__rawText">{built?.raw ?? '(empty)'}</pre>
          )}
        </div>

        {/* refs */}
        <div className="klyp-CompiledPanel__section" data-section="refs">
          <header className="klyp-CompiledPanel__sectionHeader">
            <ImageBulk aria-hidden />
            <h3 className="klyp-CompiledPanel__sectionTitle">
              Reference images
              {built ? (
                <span className="klyp-CompiledPanel__count">{built.refImages.length}</span>
              ) : null}
            </h3>
          </header>
          {isLoading ? (
            <div className="klyp-CompiledPanel__refGrid">
              <SkeletonThumb />
              <SkeletonThumb />
              <SkeletonThumb />
            </div>
          ) : built && built.refImages.length > 0 ? (
            <div className="klyp-CompiledPanel__refGrid">
              {built.refImages.map((url, i) => (
                <CdnImage
                  key={url}
                  src={url}
                  alt={`Reference ${i + 1}`}
                  size="chip"
                  className="klyp-CompiledPanel__refThumb"
                />
              ))}
            </div>
          ) : (
            <p className="klyp-CompiledPanel__empty">No reference images.</p>
          )}
        </div>

        {/* api params footer summary */}
        {built && Object.keys(built.apiParams ?? {}).length > 0 && (
          <footer className="klyp-CompiledPanel__footer">
            <span className="klyp-CompiledPanel__footerLabel">API params</span>
            <code className="klyp-CompiledPanel__footerValue">
              {summarizeApiParams(built.apiParams as Record<string, unknown>)}
            </code>
          </footer>
        )}
      </section>
    </Drawer>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function AtomRow({
  atomRef,
  index,
  onRemove,
}: {
  atomRef: AtomRef
  index: number
  onRemove?: () => void
}) {
  const label = labelAtom(atomRef)
  return (
    <li className="klyp-CompiledPanel__atomRow" data-kind={atomRef.atomId}>
      <span className="klyp-CompiledPanel__atomIndex">{index + 1}</span>
      <span className="klyp-CompiledPanel__atomLabel">{label}</span>
      {onRemove && (
        <button
          type="button"
          className="klyp-CompiledPanel__atomRemove"
          onClick={onRemove}
          aria-label={`Remove ${atomRef.atomId} atom`}
        >
          <XBulk />
        </button>
      )}
    </li>
  )
}

function labelAtom(ref: AtomRef): string {
  const input = (ref.input ?? {}) as Record<string, unknown>
  switch (ref.atomId) {
    case 'user_text': {
      const text = String(input.text ?? '')
      const head = text.slice(0, 40)
      return `Text · "${head}${text.length > 40 ? '…' : ''}"`
    }
    case 'character_dna':
      return `Character · ${String(input.id ?? '')}`
    case 'location_dna':
      return `Location · ${String(input.id ?? '')}`
    case 'vibe_dna':
      return `Vibe · ${String(input.id ?? '')}`
    case 'format_image':
      return `Format · ${String(input.aspectRatio ?? '')} · ${String(input.imageSize ?? '2K')}`
    case 'format_video':
      return `Format · ${String(input.aspectRatio ?? '')} · ${String(
        input.duration ?? '',
      )}s · ${String(input.resolution ?? '')}`
    case 'attached_image_ref': {
      const url = String(input.url ?? '')
      const start = url.lastIndexOf('/') + 1
      const tail = url.slice(start, start + 20)
      return `Attachment · ${tail}${url.length - start > 20 ? '…' : ''}`
    }
    default:
      return ref.atomId
  }
}

function summarizeApiParams(params: Record<string, unknown>): string {
  const parts: string[] = []
  if (params.image_config && typeof params.image_config === 'object') {
    const cfg = params.image_config as Record<string, unknown>
    parts.push(`image: ${String(cfg.aspect_ratio)}/${String(cfg.image_size)}`)
  }
  if (params.videoJobParams && typeof params.videoJobParams === 'object') {
    const vid = params.videoJobParams as Record<string, unknown>
    parts.push(
      `video: ${String(vid.aspectRatio)}/${String(vid.duration)}s/${String(vid.resolution)}`,
    )
  }
  if (params.model) parts.push(`model: ${String(params.model)}`)
  return parts.join(' · ') || '(none)'
}

function SkeletonText() {
  return (
    <div className="klyp-CompiledPanel__skeleton" aria-hidden>
      <div className="klyp-CompiledPanel__skeletonLine" />
      <div className="klyp-CompiledPanel__skeletonLine" data-w="80" />
      <div className="klyp-CompiledPanel__skeletonLine" data-w="60" />
    </div>
  )
}

function SkeletonThumb() {
  return <div className="klyp-CompiledPanel__skeletonThumb" aria-hidden />
}
