import './AssetViewer.scss'

import { BackArrowOutline, PlayOutline, SendArrowOutline, XOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui/Button'
import {
  type ComponentType,
  type ReactNode,
  type SVGProps,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { AttachmentSlot } from '../AttachmentSlot'
import { MeshButton } from '../MeshButton'
import { VideoPlayer } from '../VideoPlayer'

// Section / close glyphs. The Promt / Settings / References icons are the
// iconsax BULK glyphs Val specified, inlined here because `@klyp/icons` bulk
// is deprecated (renders null) — outline wouldn't match the requested look.
type Glyph = ComponentType<SVGProps<SVGSVGElement>>

const PromptGlyph: Glyph = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path
      opacity="0.4"
      d="M22 7.81V16.19C22 19.83 19.83 22 16.19 22H7.81C7.61 22 7.41 21.99 7.22 21.98C5.99 21.9 4.95 21.55 4.13 20.95C3.71 20.66 3.34 20.29 3.05 19.87C2.36 18.92 2 17.68 2 16.19V7.81C2 4.37 3.94 2.24 7.22 2.03C7.41 2.01 7.61 2 7.81 2H16.19C17.68 2 18.92 2.36 19.87 3.05C20.29 3.34 20.66 3.71 20.95 4.13C21.64 5.08 22 6.32 22 7.81Z"
      fill="currentColor"
    />
    <path
      d="M16.67 5.64H7.33C6.18 5.64 5.25 6.57 5.25 7.72V8.9C5.25 9.31 5.59 9.65 6 9.65C6.41 9.65 6.75 9.31 6.75 8.9V7.72C6.75 7.4 7.01 7.14 7.33 7.14H11.25V16.86H9.47C9.06 16.86 8.72 17.2 8.72 17.61C8.72 18.02 9.06 18.36 9.47 18.36H14.54C14.95 18.36 15.29 18.02 15.29 17.61C15.29 17.2 14.95 16.86 14.54 16.86H12.76V7.14H16.68C17 7.14 17.26 7.4 17.26 7.72V8.9C17.26 9.31 17.6 9.65 18.01 9.65C18.42 9.65 18.76 9.31 18.76 8.9V7.72C18.75 6.58 17.82 5.64 16.67 5.64Z"
      fill="currentColor"
    />
  </svg>
)
const SettingsGlyph: Glyph = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path
      opacity="0.4"
      d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2Z"
      fill="currentColor"
    />
    <path
      d="M15.58 19.25C15.17 19.25 14.83 18.91 14.83 18.5V14.6C14.83 14.19 15.17 13.85 15.58 13.85C15.99 13.85 16.33 14.19 16.33 14.6V18.5C16.33 18.91 15.99 19.25 15.58 19.25Z"
      fill="currentColor"
    />
    <path
      d="M15.58 8.2C15.17 8.2 14.83 7.86 14.83 7.45V5.5C14.83 5.09 15.17 4.75 15.58 4.75C15.99 4.75 16.33 5.09 16.33 5.5V7.45C16.33 7.86 15.99 8.2 15.58 8.2Z"
      fill="currentColor"
    />
    <path
      d="M8.42 19.25C8.01 19.25 7.67 18.91 7.67 18.5V16.55C7.67 16.14 8.01 15.8 8.42 15.8C8.83 15.8 9.17 16.14 9.17 16.55V18.5C9.17 18.91 8.84 19.25 8.42 19.25Z"
      fill="currentColor"
    />
    <path
      d="M8.42 10.15C8.01 10.15 7.67 9.81 7.67 9.4V5.5C7.67 5.09 8.01 4.75 8.42 4.75C8.83 4.75 9.17 5.09 9.17 5.5V9.4C9.17 9.81 8.84 10.15 8.42 10.15Z"
      fill="currentColor"
    />
    <path
      d="M15.58 7.33C14.08 7.33 12.85 8.55 12.85 10.05C12.85 11.55 14.07 12.78 15.58 12.78C17.08 12.78 18.3 11.56 18.3 10.05C18.3 8.54 17.08 7.33 15.58 7.33Z"
      fill="currentColor"
    />
    <path
      d="M8.42 11.23C6.92 11.23 5.7 12.45 5.7 13.96C5.7 15.47 6.92 16.68 8.42 16.68C9.92 16.68 11.15 15.46 11.15 13.96C11.15 12.46 9.93 11.23 8.42 11.23Z"
      fill="currentColor"
    />
  </svg>
)
const GalleryGlyph: Glyph = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path
      opacity="0.4"
      d="M22 7.81V13.9L20.37 12.5C19.59 11.83 18.33 11.83 17.55 12.5L13.39 16.07C12.61 16.74 11.35 16.74 10.57 16.07L10.23 15.79C9.52 15.17 8.39 15.11 7.59 15.65L2.67 18.95L2.56 19.03C2.19 18.23 2 17.28 2 16.19V7.81C2 4.17 4.17 2 7.81 2H16.19C19.83 2 22 4.17 22 7.81Z"
      fill="currentColor"
    />
    <path d="M9 10.38A2.38 2.38 0 1 0 9 5.62A2.38 2.38 0 0 0 9 10.38Z" fill="currentColor" />
    <path
      d="M22 13.9V16.19C22 19.83 19.83 22 16.19 22H7.81C5.26 22 3.42 20.93 2.56 19.03L2.67 18.95L7.59 15.65C8.39 15.11 9.52 15.17 10.23 15.79L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9Z"
      fill="currentColor"
    />
  </svg>
)
// =====================================================================
// AssetViewer — Tier 4 brand molecule. The full-screen asset/image/video
// preview (React port of the image-viewer prototype). One overlay reused
// across surfaces; behaviour branches on `context`:
//   library → primary CTA "Edit", Delete shown
//   asset   → primary CTA "Use Preset", no Delete
// Each item carries its own media kind + settings + references; the gallery
// at the bottom switches the active item (click, ←/→, swipe).
//
// Composes DS pieces where they fit: <Button>/<ToolButton> for actions,
// <AttachmentSlot> for reference tiles. The scene / fill-box / gallery /
// modal shell are bespoke (no DS equivalent).
// =====================================================================

export type AssetViewerRef = { src: string; badge?: string }

export type AssetViewerItem = {
  id: string
  /** Main media URL (image src or video poster/src). */
  src: string
  /** Gallery thumbnail; defaults to `src`. */
  thumbSrc?: string
  /** Playable video URL (video items) — renders the DS <VideoPlayer> as the
   *  main media (src stays the poster). Absent → poster + decorative badge. */
  videoUrl?: string
  name: string
  mediaKind?: 'image' | 'video'
  prompt?: string
  /** Model name + an optional leading icon node (e.g. <ProviderIcon/>). */
  model?: string
  modelIcon?: ReactNode
  quality?: string
  aspectRatio?: string
  duration?: string
  resolution?: string
  audio?: string
  /** Reference inputs — plain refs or Start/End frames (badge = the tag). */
  refs?: AssetViewerRef[]
}

export type AssetViewerProps = {
  items: AssetViewerItem[]
  activeId: string
  onActiveChange: (id: string) => void
  /** library → "Edit" + Delete · asset → "Use Preset", no Delete. Default 'library'. */
  context?: 'library' | 'asset'
  onClose?: () => void
  /** Primary CTA — Edit (library) / Use Preset (asset). */
  onPrimary?: (item: AssetViewerItem) => void
  onDuplicate?: (item: AssetViewerItem) => void
  onDownload?: (item: AssetViewerItem) => void
  onDelete?: (item: AssetViewerItem) => void
  /** Localised labels (defaults are EN). */
  labels?: Partial<{
    prompt: string
    copy: string
    copied: string
    showMore: string
    showLess: string
    references: string
    settings: string
    model: string
    quality: string
    aspectRatio: string
    duration: string
    resolution: string
    audio: string
    edit: string
    usePreset: string
    duplicate: string
    download: string
    delete: string
    close: string
    prev: string
    next: string
    gallery: string
    video: string
  }>
  className?: string
}

const DEFAULT_LABELS = {
  prompt: 'Prompt',
  copy: 'Copy',
  copied: 'Copied',
  showMore: 'Show more',
  showLess: 'Show less',
  references: 'References',
  settings: 'Settings',
  model: 'Model',
  quality: 'Quality',
  aspectRatio: 'Aspect Ratio',
  duration: 'Duration',
  resolution: 'Resolution',
  audio: 'Audio',
  edit: 'Edit',
  usePreset: 'Use Preset',
  duplicate: 'Duplicate',
  download: 'Download',
  delete: 'Delete',
  close: 'Close',
  prev: 'Previous',
  next: 'Next',
  gallery: 'Assets',
  // Announced-only (screen readers) — appended to names of video items, which
  // are otherwise indistinguishable from images (the play badge is aria-hidden).
  video: 'Video',
}

const COPY_RESET_MS = 1500
const SWIPE_THRESHOLD = 40
const REFS_ONE_ROW_PX = 72 // 64px tile + padding → "more than one row" probe
const PROMPT_CLAMP_PX = 80 // matches `.klyp-brand-AssetViewer__prompt` max-height: var(--space-80)
const GALLERY_THUMB_PX = 64 // matches --space-64 thumb width
const GALLERY_THUMB_NARROW_PX = 48 // matches the ≤520px @container thumb (--space-48)
const GALLERY_GAP_PX = 8 // matches --space-8 gallery gap
const GALLERY_STRIP_PAD_X = 8 // matches the strip's --space-4 horizontal padding × 2
// Infinite-loop gallery: render the strip 3× (the middle copy is the "real"
// one), start scrolled onto it, and after the strip idles teleport back into
// the middle band so scrolling never hits an end. Ported 1:1 from the prototype
// (oneSet / recenter, 140ms idle debounce).
const GALLERY_COPIES = 3
const GALLERY_MIDDLE_COPY = 1
const RECENTER_IDLE_MS = 140
// Below these counts the strip fits without scrolling → no loop clones, no scroll,
// no nav arrows, no edge-fade mask (just the thumbs, centred).
const GALLERY_MIN_LOOP = 7
const GALLERY_MIN_LOOP_NARROW = 5
const NARROW_PX = 520 // matches the @container mobile breakpoint

// Centre the active thumb's MIDDLE copy WITHIN the gallery scrollport only —
// a direct scrollLeft (not `scrollIntoView`, which also scrolls every ancestor
// and janked the page/scene on mobile). Geometry is read relative to the strip
// so it's transform-independent.
function centerThumb(el: HTMLDivElement | null, activeId: string, smooth: boolean) {
  if (!el) return
  const thumb = el.querySelector<HTMLElement>(
    `[data-thumb-id="${activeId}"][data-copy="${GALLERY_MIDDLE_COPY}"]`,
  )
  if (!thumb) return
  const gRect = el.getBoundingClientRect()
  const tRect = thumb.getBoundingClientRect()
  const target = el.scrollLeft + (tRect.left - gRect.left) - (el.clientWidth - tRect.width) / 2
  // 'instant' (NOT 'auto' — 'auto' resolves to the CSS scroll-behavior).
  el.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'instant' })
}

function InfoRow({ k, value }: { k: string; value: ReactNode }) {
  return (
    <div className="klyp-brand-AssetViewer__row">
      <span className="klyp-brand-AssetViewer__rowK">{k}</span>
      <span className="klyp-brand-AssetViewer__rowV">{value}</span>
    </div>
  )
}

export function AssetViewer({
  items,
  activeId,
  onActiveChange,
  context = 'library',
  onClose,
  onPrimary,
  onDuplicate,
  onDownload,
  onDelete,
  labels,
  className,
}: AssetViewerProps) {
  const t = { ...DEFAULT_LABELS, ...labels }
  // Defensive: the catalog playground / index instantiates the component from
  // `meta.args` alone (no `items`), so tolerate a missing/empty list — render
  // nothing rather than throwing on `.findIndex`.
  const list = Array.isArray(items) ? items : []
  const idx = Math.max(
    0,
    list.findIndex((i) => i.id === activeId),
  )
  const active = list[idx] ?? list[0]
  const isVideo = active?.mediaKind === 'video'

  const rootRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const galleryWrapRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLParagraphElement>(null)
  const refsRowRef = useRef<HTMLDivElement>(null)

  const [promptOpen, setPromptOpen] = useState(false)
  const [promptOverflowing, setPromptOverflowing] = useState(false)
  const [refsOpen, setRefsOpen] = useState(false)
  const [refsOverflowing, setRefsOverflowing] = useState(false)
  const [copied, setCopied] = useState(false)
  // Narrow (mobile) layout is driven by the overlay's OWN width (matches the
  // @container 520px breakpoint + the lab's mobile-width preview), so the loop
  // threshold can differ desktop (≥7) vs mobile (≥5).
  const [isNarrow, setIsNarrow] = useState(false)
  // True when ONE set of thumbs wouldn't fit the strip's available width —
  // measured against the wrap (stage-wide, content-independent, so no
  // ResizeObserver feedback from the loop clones tripling scrollWidth).
  const [stripOverflows, setStripOverflows] = useState(false)

  // Loop when the strip would actually overflow — count threshold as the floor
  // (unchanged behaviour) OR measured overflow, so a squeezed desktop stage with
  // 5-6 thumbs doesn't centre-clip them unreachably (static mode has no scroll,
  // no arrows). Otherwise the thumbs fit and we drop the clones / scroll /
  // arrows / edge-fade (see request).
  const loop =
    list.length >= (isNarrow ? GALLERY_MIN_LOOP_NARROW : GALLERY_MIN_LOOP) || stripOverflows

  // Latest activeId for the ResizeObserver centring (it's set up once).
  const activeIdRef = useRef(activeId)
  activeIdRef.current = activeId

  // Track narrow layout from the overlay's own width (not the viewport) so the
  // lab's mobile-width preview counts too.
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setIsNarrow(el.clientWidth <= NARROW_PX))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Measure whether a single set of thumbs overflows the wrap (arithmetic — no
  // reading of the strip's own clone-inflated scrollWidth). Re-runs on wrap
  // resize and when the item count / thumb size changes.
  useEffect(() => {
    const wrap = galleryWrapRef.current
    if (!wrap) return
    const thumbPx = isNarrow ? GALLERY_THUMB_NARROW_PX : GALLERY_THUMB_PX
    const needed = list.length * (thumbPx + GALLERY_GAP_PX) - GALLERY_GAP_PX + GALLERY_STRIP_PAD_X
    const measure = () => setStripOverflows(list.length > 0 && needed > wrap.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [list.length, isNarrow])

  const step = (delta: number) => {
    if (list.length === 0) return
    const next = list[(idx + delta + list.length) % list.length]
    if (next) onActiveChange(next.id)
  }

  // Nudge the gallery strip by ~3 thumbs (64px tile + 8px gap) per arrow press.
  // 'instant' under prefers-reduced-motion — JS smooth scroll ignores the OS
  // preference (unlike the CSS transitions, which are gated in the SCSS).
  const scrollGallery = (dir: 1 | -1) => {
    const reduce =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    galleryRef.current?.scrollBy({
      left: dir * (GALLERY_THUMB_PX + GALLERY_GAP_PX) * 3,
      behavior: reduce ? 'instant' : 'smooth',
    })
  }

  // Reset the collapse state + centre the active thumb on item switch. INSTANT
  // (not smooth): a smooth scroll here was silently cancelled by the re-render
  // cascade that the same selection triggers (reset state + overflow re-measure),
  // so the strip never actually moved and the ring landed on off-screen copies
  // (the "blink"). A jump can't be cancelled — the selected thumb lands dead-centre
  // with its ring every time.
  useEffect(() => {
    setPromptOpen(false)
    setRefsOpen(false)
    setCopied(false)
    const g = galleryRef.current
    centerThumb(g, activeId, false)
    // Belt-and-suspenders: a CSS-masked scroller (the gallery's edge fade) can
    // cache its composited layer and skip the active-ring repaint until a global
    // repaint (e.g. an OS window switch — the exact symptom reported). Toggling
    // will-change for one frame forces a re-composite so the ring shows at once.
    if (g) {
      g.style.willChange = 'transform'
      requestAnimationFrame(() => {
        if (galleryRef.current) galleryRef.current.style.willChange = ''
      })
    }
  }, [activeId])

  // (Re)measure overflow whenever the DISPLAYED content changes — item switch OR
  // a same-item prompt/refs edit (the lab toggles these without changing the id).
  // Threshold tests (scrollHeight vs the collapsed clamp), NOT scrollHeight-vs-
  // clientHeight: scrollHeight always reports the full content height, so the test
  // is correct whether or not the section is currently expanded — no data-open guard.
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeId / prompt text / refs count are intentional re-measure triggers — they change the measured DOM (read via refs), not values the body references directly.
  useEffect(() => {
    const el = promptRef.current
    if (el) setPromptOverflowing(el.scrollHeight > PROMPT_CLAMP_PX)
    const r = refsRowRef.current
    setRefsOverflowing(r ? r.scrollHeight > REFS_ONE_ROW_PX : false)
  }, [activeId, active?.prompt, active?.refs?.length])

  // Re-measure on width reflow (container / viewport change) too, so the affordance
  // stays correct when the modal column resizes. Same threshold tests. Re-observes
  // on the same triggers as the content re-measure above — the prompt/refs nodes
  // (conditional sections) mount/unmount per item, so a mount-once observer would
  // keep watching detached nodes and miss newly-mounted ones.
  // biome-ignore lint/correctness/useExhaustiveDependencies: same intentional re-measure triggers as above — they swap the observed DOM nodes (read via refs), not values the body references directly.
  useEffect(() => {
    const prompt = promptRef.current
    const refs = refsRowRef.current
    if ((!prompt && !refs) || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      if (prompt) setPromptOverflowing(prompt.scrollHeight > PROMPT_CLAMP_PX)
      if (refs) setRefsOverflowing(refs.scrollHeight > REFS_ONE_ROW_PX)
    })
    if (prompt) ro.observe(prompt)
    if (refs) ro.observe(refs)
    return () => ro.disconnect()
  }, [activeId, active?.prompt, active?.refs?.length])

  // Infinite loop — on mount / list change, centre the active thumb's middle copy
  // INSTANTLY (before paint), which also lands the strip in the middle band so
  // there's a full set to reveal either way before the recenter teleport fires.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `activeId` is read for the initial centre only; `loop` toggles the clones so re-centre when it flips.
  useLayoutEffect(() => {
    if (list.length === 0 || !loop) return
    centerThumb(galleryRef.current, activeId, false)
  }, [list.length, loop])

  // Re-centre (instant) whenever the strip's box changes size — its initial
  // width settles a frame or two after mount (flex + max-width), and the Mobile
  // preview / window resize also reflow it; without this the active thumb lands
  // off-centre because the first centre ran at the wrong width.
  useEffect(() => {
    const el = galleryRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => centerThumb(el, activeIdRef.current, false))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Idle recenter: once the strip stops moving, teleport by one set-width when
  // it has drifted out of the middle band — invisibly (scroll-behavior:auto),
  // so scrolling/swiping never reaches an end.
  useEffect(() => {
    const el = galleryRef.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const onScroll = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const w = el.scrollWidth / GALLERY_COPIES
        if (w <= 0) return
        const jump = (x: number) => {
          const prev = el.style.scrollBehavior
          el.style.scrollBehavior = 'auto'
          el.scrollLeft = x
          el.style.scrollBehavior = prev
        }
        if (el.scrollLeft < w * 0.5) jump(el.scrollLeft + w)
        else if (el.scrollLeft > w * 1.5) jump(el.scrollLeft - w)
      }, RECENTER_IDLE_MS)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (timer) clearTimeout(timer)
    }
  }, [])

  // Wheel over the stage (media + strip) scrolls the gallery horizontally —
  // ported from the prototype. Native non-passive listener so we can
  // preventDefault (React's onWheel is passive). The modal body is a separate
  // subtree, so its own vertical scroll is never hijacked.
  const stageRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stage = stageRef.current
    const el = galleryRef.current
    if (!stage || !el) return
    const onWheel = (e: WheelEvent) => {
      // In the ≤520px stacked layout the __scene is the vertical page scroller and
      // the stage sits at its top — hijacking deltaY there makes the media a dead
      // zone for mouse users. Live width read (not isNarrow state): the listener
      // is mount-once, so state would be stale.
      if ((rootRef.current?.clientWidth ?? 0) <= NARROW_PX) return
      if (el.scrollWidth <= el.clientWidth) return
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (!d) return
      e.preventDefault()
      el.scrollBy({ left: d })
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [])

  // keyboard ← / → + Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A host may keep the overlay mounted but hidden (the lab fades it out with
      // visibility:hidden) — a hidden viewer must not grab Esc/arrows or switch
      // items invisibly. `?.` keeps this a no-op where checkVisibility is missing.
      if (rootRef.current?.checkVisibility?.() === false) return
      // Guard on the instance — the listener is on `window`, so a keypress with
      // focus on document/body/window has an `e.target` that lacks `.closest`
      // (an `as HTMLElement` cast would defeat the ?. and throw, killing the handler).
      const tgt = e.target instanceof Element ? e.target : null
      if (tgt?.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'Escape') onClose?.()
      else if (e.key === 'ArrowRight') {
        e.preventDefault()
        step(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        step(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Managed reset timer: a rapid second Copy must restart the 1.5s window (an
  // orphan timer from the first click was cutting it short), and unmount must
  // not leave a pending setState.
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    },
    [],
  )

  const copyPrompt = async () => {
    if (!active?.prompt) return
    try {
      // navigator.clipboard is undefined outside secure contexts (e.g. http://
      // over LAN via `vite --host`) — surface that instead of failing silently.
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(active.prompt)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), COPY_RESET_MS)
    } catch (err) {
      // Non-secure context or a secure-context rejection (permission / focus) —
      // keep the button in its idle state but leave a diagnosable trace.
      console.warn('[AssetViewer] copy failed', err)
    }
  }

  // swipe the main media to switch. Capture the pointer on down so pointerup
  // still fires here even if the finger drifts off the image onto the panel /
  // gallery (was a big reason swipe "didn't always work" on mobile).
  //
  // While captured, the browser retargets the trailing click to the CAPTURE
  // element (__viewer) — not the <img data-main-media> that was pressed — so
  // onSceneClick's closest() guard can never see the img and a plain click/tap
  // on the photo (or a completed mouse swipe) was closing the whole overlay.
  // `press` records where the gesture actually started (engine-agnostic — no
  // reliance on per-browser click-targeting); onSceneClick consumes it.
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const press = useRef({ onMedia: false, swiped: false })
  const onScenePointerDown = (e: React.PointerEvent) => {
    // Rewritten on EVERY press inside the scene, so the flag always describes
    // the gesture that produces the next click — staleness self-corrects.
    press.current = {
      onMedia: e.target instanceof Element && !!e.target.closest('[data-main-media]'),
      swiped: false,
    }
  }
  const onPointerDown = (e: React.PointerEvent) => {
    // Presses inside the video player never start a swipe — a seek-bar drag
    // >40px would otherwise switch items mid-scrub.
    if (e.target instanceof Element && e.target.closest('.klyp-brand-AssetViewer__player')) return
    swipe.current = { x: e.clientX, y: e.clientY }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* already captured / detached — fine */
    }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      press.current.swiped = true
      step(dx < 0 ? 1 : -1)
    }
  }
  const onPointerCancel = () => {
    swipe.current = null
    press.current = { onMedia: false, swiped: false }
  }

  // close on empty-space click (not on the content, not after a swipe)
  const onSceneClick = (e: React.MouseEvent) => {
    // Consume the gesture record: a click born from a press on the media, or
    // from a completed swipe, never closes — regardless of where pointer
    // capture retargeted the click event itself.
    const pressed = press.current
    press.current = { onMedia: false, swiped: false }
    if (pressed.onMedia || pressed.swiped) return
    const tgt = e.target as HTMLElement
    if (
      tgt.closest(
        '.klyp-brand-AssetViewer__modal, .klyp-brand-AssetViewer__gallery, [data-main-media]',
      )
    )
      return
    onClose?.()
  }

  if (!active) return null

  // Rows with no value are dropped — an item without e.g. `audio` must not
  // render a label with a blank right side. (Mock data fills everything; real
  // items may not.)
  const settings: { k: string; v: ReactNode }[] = (
    isVideo
      ? [
          { k: t.duration, v: active.duration },
          { k: t.aspectRatio, v: active.aspectRatio },
          { k: t.resolution, v: active.resolution },
          { k: t.audio, v: active.audio },
        ]
      : [
          { k: t.quality, v: active.quality },
          { k: t.aspectRatio, v: active.aspectRatio },
        ]
  ).filter((s) => s.v != null && s.v !== '')

  // Video-ness is announced, not painted — the play badge is aria-hidden, so
  // append the kind to accessible names only (dialog / media / thumbs).
  const announcedName = isVideo ? `${active.name}, ${t.video}` : active.name

  return (
    <div
      ref={rootRef}
      className={['klyp-brand-AssetViewer', className].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={announcedName}
    >
      <div
        className="klyp-brand-AssetViewer__bg"
        style={{ backgroundImage: `url("${active.src}")` }}
        aria-hidden
      />
      <div className="klyp-brand-AssetViewer__scrim" aria-hidden />

      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className="klyp-brand-AssetViewer__scene"
        onClick={onSceneClick}
        onPointerDown={onScenePointerDown}
      >
        {/* STAGE — media + gallery */}
        <div className="klyp-brand-AssetViewer__stage" ref={stageRef}>
          <div
            className="klyp-brand-AssetViewer__viewer"
            data-media={isVideo ? 'video' : 'image'}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            {isVideo && active.videoUrl ? (
              // Playable video → the DS VideoPlayer is the main media (own
              // poster + play overlay + controls). Keyed per item so playback
              // state resets on switch. data-main-media keeps the close-guard
              // treating it as content.
              <VideoPlayer
                key={active.id}
                data-main-media
                className="klyp-brand-AssetViewer__player"
                sources={[{ src: active.videoUrl, type: 'video/mp4' }]}
                poster={active.src}
                label={announcedName}
              />
            ) : (
              <>
                <img data-main-media src={active.src} alt={announcedName} />
                {isVideo ? (
                  // Poster-only video (no videoUrl) — decorative badge.
                  <span className="klyp-brand-AssetViewer__play" aria-hidden>
                    <PlayOutline width={24} height={24} />
                  </span>
                ) : null}
              </>
            )}
          </div>

          <div className="klyp-brand-AssetViewer__galleryWrap" ref={galleryWrapRef}>
            {/* Nav arrows — DS Button (secondary), desktop-only + only when the
                strip scrolls (loop). On mobile the strip finger-scrolls. */}
            {loop && !isNarrow ? (
              <Button
                className="klyp-brand-AssetViewer__nav"
                variant="secondary"
                size="icon"
                aria-label={t.prev}
                onPress={() => scrollGallery(-1)}
              >
                <BackArrowOutline />
              </Button>
            ) : null}
            <div
              className="klyp-brand-AssetViewer__gallery"
              ref={galleryRef}
              role="group"
              aria-label={t.gallery}
              data-loop={loop || undefined}
            >
              {/* Loop mode: 3× copies for the seamless scroll (middle copy is the
                  real tab; flanking clones are aria-hidden duplicates that still
                  switch on click). Static mode (few thumbs): one set, no clones,
                  centred, no scroll. All copies carry data-active for the ring. */}
              {(loop ? [0, 1, 2] : [null]).flatMap((copy) =>
                list.map((it) => {
                  const isActive = it.id === active.id
                  const isReal = copy === null || copy === GALLERY_MIDDLE_COPY
                  return isReal ? (
                    <button
                      key={`${copy}-${it.id}`}
                      type="button"
                      data-thumb-id={it.id}
                      data-copy={copy ?? undefined}
                      data-active={isActive || undefined}
                      aria-current={isActive ? true : undefined}
                      className="klyp-brand-AssetViewer__thumb"
                      onClick={() => onActiveChange(it.id)}
                      aria-label={it.mediaKind === 'video' ? `${it.name}, ${t.video}` : it.name}
                    >
                      <img src={it.thumbSrc ?? it.src} alt="" />
                    </button>
                  ) : (
                    <button
                      key={`${copy}-${it.id}`}
                      type="button"
                      data-thumb-id={it.id}
                      data-copy={copy}
                      data-active={isActive || undefined}
                      tabIndex={-1}
                      aria-hidden
                      // aria-hidden wins over the label (clones are invisible to
                      // AT) — the label only satisfies button-name linters.
                      aria-label={it.name}
                      className="klyp-brand-AssetViewer__thumb"
                      // tabIndex=-1 still allows CLICK-focus — block it so
                      // document.activeElement never lands inside an aria-hidden
                      // subtree (the click itself still fires onActiveChange).
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onActiveChange(it.id)}
                    >
                      <img src={it.thumbSrc ?? it.src} alt="" />
                    </button>
                  )
                }),
              )}
            </div>
            {loop && !isNarrow ? (
              <Button
                className="klyp-brand-AssetViewer__nav"
                variant="secondary"
                size="icon"
                aria-label={t.next}
                onPress={() => scrollGallery(1)}
              >
                <SendArrowOutline />
              </Button>
            ) : null}
          </div>
        </div>

        {/* MODAL — header / body / footer */}
        <aside className="klyp-brand-AssetViewer__modal">
          <header className="klyp-brand-AssetViewer__header">
            <h2 className="klyp-brand-AssetViewer__title">{active.name}</h2>
            {/* size="icon" (not icon-sm): the md-family box carries --r-chip —
                the same radius as the Edit CTA, so the panel's controls read
                as one radii family (icon-sm drops to --radius-sm 6px). */}
            <Button
              className="klyp-brand-AssetViewer__close"
              variant="secondary"
              size="icon"
              aria-label={t.close}
              onPress={onClose}
            >
              <XOutline />
            </Button>
          </header>

          <div className="klyp-brand-AssetViewer__body">
            {/* Prompt */}
            {active.prompt ? (
              <section className="klyp-brand-AssetViewer__sec">
                <div className="klyp-brand-AssetViewer__secHead">
                  <span className="klyp-brand-AssetViewer__secLabel">
                    <PromptGlyph aria-hidden />
                    {t.prompt}
                  </span>
                  <Button variant="secondary" size="xs" onPress={copyPrompt}>
                    {copied ? t.copied : t.copy}
                  </Button>
                  {/* SR-only live region — a text swap on the focused button is
                      not re-announced (WCAG 4.1.3); this is. Renders nothing. */}
                  <span
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="klyp-brand-AssetViewer__srStatus"
                  >
                    {copied ? t.copied : ''}
                  </span>
                </div>
                <p
                  ref={promptRef}
                  className="klyp-brand-AssetViewer__prompt"
                  data-open={promptOpen || undefined}
                  data-clamped={promptOverflowing && !promptOpen ? '' : undefined}
                >
                  {active.prompt}
                </p>
                {promptOverflowing ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="klyp-brand-AssetViewer__moreBtn"
                    onPress={() => setPromptOpen((v) => !v)}
                  >
                    {promptOpen ? t.showLess : t.showMore}
                  </Button>
                ) : null}
              </section>
            ) : null}

            {/* References */}
            {active.refs && active.refs.length > 0 ? (
              <section className="klyp-brand-AssetViewer__sec">
                <div className="klyp-brand-AssetViewer__secHead">
                  <span className="klyp-brand-AssetViewer__secLabel">
                    <GalleryGlyph aria-hidden />
                    {t.references}
                  </span>
                </div>
                <div
                  ref={refsRowRef}
                  className="klyp-brand-AssetViewer__refs"
                  data-open={refsOpen || undefined}
                  data-clamped={refsOverflowing && !refsOpen ? '' : undefined}
                >
                  {active.refs.map((r, i) => (
                    <AttachmentSlot
                      key={`${r.src}#${i}`}
                      thumbnailUrl={r.src}
                      shape="square"
                      badge={r.badge}
                    />
                  ))}
                </div>
                {refsOverflowing ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="klyp-brand-AssetViewer__moreBtn"
                    onPress={() => setRefsOpen((v) => !v)}
                  >
                    {refsOpen ? t.showLess : t.showMore}
                  </Button>
                ) : null}
              </section>
            ) : null}

            {/* Settings */}
            <section className="klyp-brand-AssetViewer__sec">
              <div className="klyp-brand-AssetViewer__secHead">
                <span className="klyp-brand-AssetViewer__secLabel">
                  <SettingsGlyph aria-hidden />
                  {t.settings}
                </span>
              </div>
              <div className="klyp-brand-AssetViewer__rows">
                {active.model || active.modelIcon ? (
                  <InfoRow
                    k={t.model}
                    value={
                      <>
                        {active.modelIcon}
                        <span>{active.model}</span>
                      </>
                    }
                  />
                ) : null}
                {settings.map((s) => (
                  <InfoRow key={s.k} k={s.k} value={<span>{s.v}</span>} />
                ))}
              </div>
            </section>
          </div>

          <footer className="klyp-brand-AssetViewer__footer">
            {context === 'asset' ? (
              // Asset context → the gold Mesh CTA ("Recreate" the preset).
              <MeshButton
                tone="gold"
                size="md"
                fill
                className="klyp-brand-AssetViewer__cta"
                onPress={() => onPrimary?.(active)}
              >
                {t.usePreset}
              </MeshButton>
            ) : (
              // Library context → DS primary ("Edit").
              <Button
                variant="primary"
                size="md"
                className="klyp-brand-AssetViewer__cta"
                onPress={() => onPrimary?.(active)}
              >
                {t.edit}
              </Button>
            )}
            {/* Secondary trio — label-only DS Buttons at md (Val 2026-07-02:
                no icons for now; same size + --r-chip radius as the Edit CTA).
                The SCSS scopes a tighter padding-inline so all three fit the
                272px inner width of the 320px-min modal. */}
            <div className="klyp-brand-AssetViewer__actions">
              <Button variant="outline" size="md" onPress={() => onDuplicate?.(active)}>
                {t.duplicate}
              </Button>
              <Button variant="outline" size="md" onPress={() => onDownload?.(active)}>
                {t.download}
              </Button>
              {context === 'library' ? (
                <Button variant="outline" size="md" onPress={() => onDelete?.(active)}>
                  {t.delete}
                </Button>
              ) : null}
            </div>
          </footer>
        </aside>
      </div>
    </div>
  )
}

export default AssetViewer
