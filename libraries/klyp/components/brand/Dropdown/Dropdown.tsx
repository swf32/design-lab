import './Dropdown.scss'

import { ChevronDownOutline } from '@klyp/icons/outline'
import {
  type DropdownMenuTriggerProps,
  DropdownMenuContent as RootContent,
  DropdownMenuGroup as RootGroup,
  DropdownMenuItem as RootItem,
  DropdownMenuLabel as RootLabel,
  DropdownMenu as RootMenu,
  DropdownMenuSeparator as RootSeparator,
  DropdownMenuShortcut as RootShortcut,
  DropdownMenuTrigger as RootTrigger,
} from '@klyp/ui/DropdownMenu'
import {
  type CSSProperties,
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Selection as RacSelection } from 'react-aria-components'

// =====================================================================
// Dropdown — Klyp's unified branded menu (the "one component", 2026-06-28)
// =====================================================================
//
// Built on @klyp/ui/DropdownMenu (RAC `Menu` under the hood) so keyboard /
// focus / typeahead / ARIA come for free. ONE data-driven surface that
// covers:
//   - action menus       (selectionMode="none", default)  — ProfileMenu, kebabs, share
//   - single-select menu (selectionMode="single")         — value pickers
//   - multi-select menu  (selectionMode="multiple")       — Library Source/Type filter
//
// Selection is driven by RAC's NATIVE selection manager (selectionMode +
// selectedKeys + onSelectionChange on the Menu). Selectable rows reuse the
// primitive's checkbox/radio indicator visuals via `[data-selected]` — we do
// NOT pass `onAction` to them, so a multi-select menu stays OPEN while you
// toggle rows (the classic RAC close-on-action gotcha is avoided).
//
// The reveal animation (staggered per-item fade/rise) is scoped to the
// `.klyp-Dropdown` class in Dropdown.scss, driven by an inline `--i` RENDER-
// ORDER index per row AND per section header (+ `--n` total rendered elements)
// so the cascade stays continuous across group headers and reverses bottom→top
// when the menu opens upward. The step itself is adaptive: `--stagger-count`
// (the option count) is set on the surface and shrinks the per-row delay as the
// list grows, so a long list never crawls (see Dropdown.scss).
//
// NOTE: the selectable rows intentionally borrow the primitive's INTERNAL
// classes (`klyp-DropdownMenu__item--checkbox/--radio` + `__item-indicator`)
// so the indicator visuals + selected-state styling come from DropdownMenu.scss
// for free. A rename there would break this wrapper silently — keep them in sync.
//
// For rich/custom menus (submenus, mixed hero content) reach for the compound
// `@klyp/ui/DropdownMenu` parts directly; this data-driven wrapper covers the
// common "trigger + option list" case.

/** "Our" checkmark — identical path to `@klyp/ui` Checkbox `__check` (rounded
 *  caps/joins, drawn). Inlined (the Checkbox glyph isn't a standalone export);
 *  keep this path in sync with Checkbox.tsx. */
function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 8.5L6.5 11.5L12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export type DropdownSelectionMode = 'none' | 'single' | 'multiple'

export type DropdownIndicator = 'checkmark' | 'dot' | 'none'

export type DropdownOption = {
  /** Stable key — also the selection key. */
  id: string
  /** Primary row label. */
  label: ReactNode
  /**
   * Compact label for a value-picker TRIGGER when this option is selected
   * (e.g. the popover row reads "Portrait (9:16)" but the pill shows "9:16").
   * Read by the CALLER when it computes the pill's `triggerLabel`; falls back
   * to `label`. No effect on the in-menu row.
   */
  short?: string
  /** Muted caption rendered under the label. */
  description?: ReactNode
  /** Leading glyph (Iconsax outline or any node). */
  icon?: ReactNode
  /** Trailing meta text (pricing, "Latest", a tier badge…). */
  meta?: ReactNode
  /** Trailing keyboard hint (⌘K). Only meaningful for action menus. */
  shortcut?: ReactNode
  /** Section name — options sharing a value render under one header. */
  group?: string
  /** `danger` paints the row red (destructive action). */
  variant?: 'default' | 'danger'
  /** Non-selectable, dimmed. */
  isDisabled?: boolean
  /** Render a divider ABOVE this row — action-menu grouping (e.g. before Delete). */
  separator?: boolean
  /**
   * Typeahead / accessible-name override. Defaults to `label` when it's a
   * plain string. Set explicitly when `label` is a non-string node.
   */
  textValue?: string
}

export interface DropdownProps {
  /** Accessible name for the menu surface. */
  'aria-label'?: string
  /**
   * Trigger CONTENT — rendered inside the menu's button (text / glyph).
   * Omit when using `triggerLabel` (the built-in pill). For a fully custom
   * trigger element use the compound DropdownMenu parts.
   */
  trigger?: ReactNode
  /**
   * Built-in SELECT-style PILL trigger — a labelled chip (label + chevron),
   * used INSTEAD of `trigger`. Pass the filter AXIS name ("Type") for
   * multi-select filters, or the CURRENT VALUE's label for single-select
   * value pickers.
   */
  triggerLabel?: ReactNode
  /**
   * Leading logo/icon for the pill trigger — e.g. a colored provider logo on a
   * model picker (`<ProviderIcon provider="kling" />`). Rendered before
   * `triggerLabel`; sized by the icon wrapper. No effect without `triggerLabel`.
   */
  triggerIcon?: ReactNode
  /**
   * Hide the trailing chevron on the built-in pill trigger. Default `false`
   * (chevron shown). Opt-in for compact pills where the affordance is implied
   * (e.g. the composer setting pills). No effect without `triggerLabel`.
   */
  hideChevron?: boolean
  /**
   * Active-selection count — when > 0 a small NEUTRAL dot shows on the pill
   * trigger (a "has active filters" cue; no number, no gold).
   */
  activeCount?: number
  /**
   * Props forwarded to the trigger BUTTON — `aria-label` (required for
   * icon-only kebabs, WCAG 4.1.2), `className`, `onClick` (e.g. stopPropagation
   * so opening the menu doesn't also activate an enclosing card), etc.
   */
  triggerProps?: Omit<DropdownMenuTriggerProps, 'children' | 'render'>
  /** Data-driven option list. */
  options: readonly DropdownOption[]

  /** Selection behaviour. Default `none` (action menu). */
  selectionMode?: DropdownSelectionMode
  /** Controlled selected ids. */
  selectedKeys?: Iterable<string>
  /** Initial selected ids (uncontrolled). */
  defaultSelectedKeys?: Iterable<string>
  /** Fires with the full selected-id set on change. */
  onSelectionChange?: (ids: Set<string>) => void
  /**
   * Indicator shape for selectable rows. Defaults to `dot` for single
   * selection (radio feel) and `checkmark` for multiple (checkbox feel).
   */
  indicator?: DropdownIndicator

  /** Fires when a non-selectable (action) item is activated. */
  onAction?: (id: string) => void

  /** Popover side relative to the trigger. */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Cross-axis alignment. */
  align?: 'start' | 'center' | 'end'
  /** Main-axis offset. */
  sideOffset?: number

  /** Controlled open state. */
  open?: boolean
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean
  /** Open-state change handler. */
  onOpenChange?: (open: boolean) => void

  /**
   * Opt-in DETAIL side-card — rich info for the hovered / keyboard-focused
   * option (model specs, voice preview…), rendered BESIDE the menu, top-aligned
   * with the popover (21st.dev model-selector pattern). Return `null` for
   * options that have nothing to show. The card:
   *   - tracks pointer hover AND arrow-key focus (RAC hover/focus events),
   *     with a small hover-intent delay so sweeping the list doesn't flicker;
   *   - shows the SELECTED option's card on open, before any hover;
   *   - renders INSIDE the menu popover (an absolutely-positioned sibling of
   *     the menu via the primitive's `aside` slot) — NOT a body portal. RAC's
   *     modal popover makes everything outside `inert`
   *     (`ariaHideOutside({ shouldUseInert: true })` in usePopover), so an
   *     outside layer would be click-dead; inside, it stays interactive,
   *     scales/fades with the popover's own entrance/exit, and needs no
   *     interact-outside guard. The root's scroll moves to the inner menu in
   *     this mode (see Dropdown.scss `[data-has-aside]`) so the card isn't
   *     clipped;
   *   - flips to the LEFT edge when the right side lacks viewport room
   *     (measured), hides when neither side fits, and is skipped entirely on
   *     hover-less touch devices (mobile presentation is a separate task).
   * The wrapper is positioning-only chrome — the returned node brings its own
   * card surface (e.g. `<ModelInfoCard>`). No effect when omitted.
   */
  renderDetail?: (option: DropdownOption) => ReactNode

  /** Extra className appended to the popover surface. */
  className?: string
}

/** Detail side-card geometry. The card WIDTH policy lives here (single
 *  source): `detailWidthPx()` feeds both the fits-right/fits-left flip math
 *  and the `--dropdown-detail-width` custom prop the SCSS consumes. Gap
 *  mirrors `--space-8`; the margin is the viewport breathing room. */
const DETAIL_WIDTH_REM = 20
const DETAIL_GAP = 8
const DETAIL_VIEWPORT_MARGIN = 12
/** Hover-intent delay — sweeping the pointer across rows should not remount
 *  the card per row; one step under the row stagger tempo reads as intent. */
const DETAIL_HOVER_INTENT_MS = 60

function detailWidthPx(): number {
  const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return Math.min(DETAIL_WIDTH_REM * rem, window.innerWidth * 0.4)
}

function toIdSet(selection: RacSelection, options: readonly DropdownOption[]): Set<string> {
  if (selection === 'all') return new Set(options.map((o) => o.id))
  // RAC selection keys are string|number; our ids are strings — normalise.
  return new Set(Array.from(selection, (k) => String(k)))
}

export function Dropdown({
  'aria-label': ariaLabel,
  trigger,
  triggerLabel,
  triggerIcon,
  hideChevron = false,
  activeCount,
  triggerProps,
  options,
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  indicator,
  onAction,
  side = 'bottom',
  align = 'start',
  sideOffset,
  open,
  defaultOpen,
  onOpenChange,
  renderDetail,
  className,
}: DropdownProps) {
  const selectable = selectionMode !== 'none'
  const indicatorShape: DropdownIndicator =
    indicator ?? (selectionMode === 'single' ? 'dot' : 'checkmark')

  // ── Detail side-card state (only active when `renderDetail` is passed) ──
  // Touch devices have no hover to drive the card — skip the whole pipeline
  // (mobile presentation is a separate task, Val 2026-07-02). Static per
  // mount: hover capability doesn't change mid-session.
  const canHover = useMemo(
    () => typeof window === 'undefined' || window.matchMedia('(hover: hover)').matches,
    [],
  )
  const hasDetail = typeof renderDetail === 'function' && canHover
  const popoverRef = useRef<HTMLElement | null>(null)
  // Open state mirrored locally so the flip measurement knows when the
  // popover exists, even uncontrolled (onOpenChange fires for RAC-driven
  // closes too). Only mirrored in detail mode — zero extra state churn for
  // every other Dropdown consumer.
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const isOpen = open ?? internalOpen
  // Hovered/focused row id. `null` = nothing hovered yet → fall back to the
  // current selection so the card is visible the moment the menu opens.
  const [detailId, setDetailId] = useState<string | null>(null)
  // Which side of the menu fits the card; `null` = neither → card hidden.
  const [detailSide, setDetailSide] = useState<'right' | 'left' | null>(null)
  const [detailWidth, setDetailWidth] = useState<number | null>(null)
  const hoverTimer = useRef<number | undefined>(undefined)

  // Reset the hover to the selection on every open — sanctioned render-phase
  // adjust, so it covers BOTH RAC-driven opens and programmatic `open` prop
  // toggles (a stale hover from the previous open would flash otherwise).
  const [prevOpen, setPrevOpen] = useState(isOpen)
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen)
    if (isOpen) setDetailId(null)
  }

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (hasDetail) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [hasDetail, onOpenChange],
  )

  const firstSelectedId = useMemo(() => {
    // Guarded by hasDetail so plain consumers' selectedKeys iterables are
    // never consumed here (a one-shot iterator must reach RAC untouched).
    if (!hasDetail) return null
    const keys = selectedKeys ?? defaultSelectedKeys
    if (!keys) return null
    for (const k of keys) return String(k)
    return null
  }, [hasDetail, selectedKeys, defaultSelectedKeys])

  const activeDetailOption = hasDetail
    ? (options.find((o) => o.id === (detailId ?? firstSelectedId)) ?? null)
    : null
  const detailRef = useRef<HTMLDivElement | null>(null)
  // Read by the imperative position tracker below without re-subscribing.
  const activeDetailIdRef = useRef<string | null>(null)
  activeDetailIdRef.current = activeDetailOption?.id ?? null

  // Decide which side of the menu the card renders on. The card itself is
  // CSS-anchored to the popover (absolute sibling of the menu — it moves,
  // scales and exits WITH the popover), so the only measured decision is the
  // horizontal flip: right of the menu when the viewport has room, else left,
  // else hidden. Width comes from the same single source the SCSS consumes.
  const measureDetail = useCallback(() => {
    const el = popoverRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const width = detailWidthPx()
    const fitsRight = rect.right + DETAIL_GAP + width <= window.innerWidth - DETAIL_VIEWPORT_MARGIN
    const fitsLeft = rect.left - DETAIL_GAP - width >= DETAIL_VIEWPORT_MARGIN
    setDetailWidth(width)
    setDetailSide(fitsRight ? 'right' : fitsLeft ? 'left' : null)
  }, [])

  // Vertically align the card to the hovered row — centres match, clamped to
  // the VIEWPORT (Val 2026-07-03: the card follows the list, is NEVER
  // height-capped or scrolled, and may extend past the menu's own box — so
  // the only hard bound is the screen). Imperative: writes the
  // --dropdown-detail-y custom prop directly (no React state per menu-scroll
  // frame); the SCSS glides between values via a transform transition.
  const positionDetail = useCallback(() => {
    const root = popoverRef.current
    const card = detailRef.current
    const id = activeDetailIdRef.current
    if (!root || !card || id == null) return
    const row = root.querySelector<HTMLElement>(`[data-option-id="${CSS.escape(id)}"]`)
    if (!row) return
    const rootRect = root.getBoundingClientRect()
    const rowRect = row.getBoundingClientRect()
    const cardH = card.offsetHeight
    const rowCenter = rowRect.top + rowRect.height / 2 - rootRect.top
    // Viewport bounds expressed in root-relative y (y may go NEGATIVE — the
    // card rises above a short menu instead of clipping).
    const minY = DETAIL_VIEWPORT_MARGIN - rootRect.top
    const maxY = window.innerHeight - DETAIL_VIEWPORT_MARGIN - cardH - rootRect.top
    const y = Math.min(Math.max(rowCenter - cardH / 2, minY), Math.max(maxY, minY))
    card.style.setProperty('--dropdown-detail-y', `${Math.round(y)}px`)
  }, [])

  useLayoutEffect(() => {
    if (!hasDetail || !isOpen) return
    // rAF-defer event-driven re-measures so RAC repositions the popover
    // first (listener registration order is not guaranteed).
    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        measureDetail()
        positionDetail()
      })
    }
    measureDetail()
    // The entrance animation scales the surface (~140ms) — a rect taken
    // mid-animation is slightly narrow; settle with one late re-measure.
    const settle = window.setTimeout(() => {
      measureDetail()
      positionDetail()
    }, 200)
    window.addEventListener('resize', schedule)
    // The card follows its row when the MENU scrolls (rows move, card rides).
    const menu = popoverRef.current?.querySelector('.klyp-DropdownMenu__menu')
    menu?.addEventListener('scroll', schedule, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(settle)
      window.removeEventListener('resize', schedule)
      menu?.removeEventListener('scroll', schedule)
    }
  }, [hasDetail, isOpen, measureDetail, positionDetail])

  // Re-align after every hovered-option change (the keyed inner remounts, so
  // the card height may differ) — layout effect keeps it pre-paint.
  const activeDetailId = activeDetailOption?.id ?? null
  useLayoutEffect(() => {
    if (!hasDetail || !isOpen || !detailSide || activeDetailId == null) return
    positionDetail()
  }, [hasDetail, isOpen, detailSide, activeDetailId, positionDetail])

  // Row-level tracking — RAC MenuItem fires hover AND arrow-key focus events
  // (menus move focus on hover, but wiring both keeps pointer + keyboard
  // parity even if that behaviour changes). Hover-intent debounce: sweeping
  // the pointer down the list must not remount the card per row.
  const trackDetailRow = useCallback((id: string) => {
    window.clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => setDetailId(id), DETAIL_HOVER_INTENT_MS)
  }, [])
  useEffect(() => () => window.clearTimeout(hoverTimer.current), [])

  const detailRowProps = (opt: DropdownOption) =>
    hasDetail
      ? {
          // DOM marker the vertical follow reads (positionDetail querySelector).
          'data-option-id': opt.id,
          onHoverStart: () => trackDetailRow(opt.id),
          onFocusChange: (focused: boolean) => {
            if (focused) trackDetailRow(opt.id)
          },
        }
      : {}

  // Flatten options into a RENDER PLAN in visual order — section header, then
  // its items, then the next header, … . Each plan entry carries a sequential
  // `renderIndex` that increments for EVERY rendered element (headers included),
  // so the staggered reveal delay (`--i`) is continuous across sections and the
  // headers animate in their own visual slot. `renderTotal` (= header count +
  // option count) is the `--n` the SCSS reverses against when opening upward.
  //
  // Grouping preserves first-occurrence order. Options with no `group` render
  // flush (no header) under a synthetic `__nogroup__` bucket — so non-grouped
  // menus (action menus, filters) look/behave exactly as before.
  const { plan, renderTotal } = useMemo(() => {
    const groupMap = new Map<string | '__nogroup__', DropdownOption[]>()
    for (const opt of options) {
      const key = opt.group ?? '__nogroup__'
      const list = groupMap.get(key) ?? []
      list.push(opt)
      groupMap.set(key, list)
    }

    type PlanGroup = {
      groupKey: string | '__nogroup__'
      headerIndex: number | null
      items: { opt: DropdownOption; renderIndex: number }[]
    }

    const planGroups: PlanGroup[] = []
    let cursor = 0
    for (const [groupKey, groupOptions] of groupMap) {
      const isLabelled = groupKey !== '__nogroup__'
      const headerIndex = isLabelled ? cursor++ : null
      const items = groupOptions.map((opt) => ({ opt, renderIndex: cursor++ }))
      planGroups.push({ groupKey, headerIndex, items })
    }

    return { plan: planGroups, renderTotal: cursor }
  }, [options])

  const variantOf = (opt: DropdownOption) =>
    opt.variant === 'danger' ? ('destructive' as const) : ('default' as const)

  const textValueOf = (opt: DropdownOption) =>
    opt.textValue ?? (typeof opt.label === 'string' ? opt.label : undefined)

  const renderRowContent = (opt: DropdownOption) => (
    <>
      {opt.icon ? (
        <span className="klyp-Dropdown__icon" aria-hidden>
          {opt.icon}
        </span>
      ) : null}
      <span className="klyp-Dropdown__text">
        <span className="klyp-Dropdown__label">{opt.label}</span>
        {opt.description ? <span className="klyp-Dropdown__desc">{opt.description}</span> : null}
      </span>
      {opt.meta ? <span className="klyp-Dropdown__meta">{opt.meta}</span> : null}
      {opt.shortcut ? <RootShortcut>{opt.shortcut}</RootShortcut> : null}
    </>
  )

  const renderItem = (opt: DropdownOption, renderIndex: number) => {
    // `--i` = this row's RENDER-ORDER index (headers counted), `--n` = total
    // rendered elements — together they let the SCSS reverse the stagger
    // (bottom→top) when the menu opens upward.
    const rowStyle = {
      '--i': renderIndex,
      '--n': renderTotal,
    } as CSSProperties

    let item: ReactNode
    if (!selectable) {
      item = (
        <RootItem
          id={opt.id}
          textValue={textValueOf(opt)}
          isDisabled={opt.isDisabled}
          variant={variantOf(opt)}
          onAction={onAction ? () => onAction(opt.id) : undefined}
          className="klyp-Dropdown__item"
          style={rowStyle}
          {...detailRowProps(opt)}
        >
          {renderRowContent(opt)}
        </RootItem>
      )
    } else {
      // Selectable row — reuse the primitive's checkbox/radio indicator visuals,
      // but DRIVE selection from RAC's Menu-level manager (no onAction, so a
      // multi-select menu stays open while toggling).
      const indicatorClass =
        indicatorShape === 'none'
          ? 'klyp-Dropdown__item--value'
          : indicatorShape === 'dot'
            ? 'klyp-DropdownMenu__item--radio'
            : 'klyp-DropdownMenu__item--checkbox'
      item = (
        <RootItem
          id={opt.id}
          textValue={textValueOf(opt)}
          isDisabled={opt.isDisabled}
          variant={variantOf(opt)}
          className={`${indicatorClass} klyp-Dropdown__item`}
          style={rowStyle}
          {...detailRowProps(opt)}
        >
          {/* Checkbox → "our" rounded checkmark SVG (mirrors @klyp/ui Checkbox);*/}
          {/* radio → empty box, the dot is drawn via box-shadow in Dropdown.scss;*/}
          {/* none → no indicator, the selected row reads via a background tint.*/}
          {indicatorShape !== 'none' && (
            <span className="klyp-DropdownMenu__item-indicator" aria-hidden>
              {indicatorShape === 'dot' ? null : <CheckGlyph />}
            </span>
          )}
          {renderRowContent(opt)}
        </RootItem>
      )
    }

    return (
      <Fragment key={opt.id}>
        {opt.separator ? <RootSeparator /> : null}
        {item}
      </Fragment>
    )
  }

  // Pill trigger (filter / value-picker) vs custom `trigger` content.
  const isPill = triggerLabel != null
  const triggerInner = isPill ? (
    <>
      {triggerIcon ? (
        <span className="klyp-Dropdown-pill__icon" aria-hidden>
          {triggerIcon}
        </span>
      ) : null}
      <span className="klyp-Dropdown-pill__label">{triggerLabel}</span>
      {hideChevron ? null : (
        <ChevronDownOutline className="klyp-Dropdown-pill__chevron" aria-hidden />
      )}
      {typeof activeCount === 'number' && activeCount > 0 ? (
        <span className="klyp-Dropdown-pill__dot" aria-hidden />
      ) : null}
    </>
  ) : (
    trigger
  )
  const mergedTriggerClassName =
    [isPill ? 'klyp-Dropdown-pill' : null, triggerProps?.className].filter(Boolean).join(' ') ||
    undefined

  // Detail card content for the active row — `null` from renderDetail means
  // "nothing to show for this option" (no empty card shell). Rendered as an
  // absolutely-positioned SIBLING of the menu inside the popover (the
  // primitive's `aside` slot): inside RAC's modal popover it stays
  // interactive (everything OUTSIDE gets `inert`), rides the popover's own
  // entrance/exit, and can never stack under other overlays.
  const detailNode =
    renderDetail && hasDetail && activeDetailOption ? renderDetail(activeDetailOption) : null
  // The wrapper stays MOUNTED for the whole detail session (not just while a
  // card has content) so the popover's scroll structure ([data-has-aside])
  // doesn't flip when hovering an option without info. It is pointer-inert;
  // only the inner content accepts interaction (Dropdown.scss).
  const detailAside =
    hasDetail && detailSide ? (
      <div
        ref={detailRef}
        className="klyp-Dropdown__detail"
        data-side={detailSide}
        // Width policy lives in detailWidthPx() (single source) — emitted as
        // a custom prop for the SCSS, same idiom as the rows' --i/--n.
        style={
          detailWidth != null
            ? ({ '--dropdown-detail-width': `${detailWidth}px` } as CSSProperties)
            : undefined
        }
      >
        {detailNode ? (
          <div className="klyp-Dropdown__detailInner" key={activeDetailOption?.id}>
            {detailNode}
          </div>
        ) : null}
      </div>
    ) : undefined

  return (
    <RootMenu open={open} defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>
      <RootTrigger {...triggerProps} className={mergedTriggerClassName}>
        {triggerInner}
      </RootTrigger>
      <RootContent
        aria-label={ariaLabel}
        ref={hasDetail ? popoverRef : undefined}
        aside={detailAside}
        className={['klyp-Dropdown', className].filter(Boolean).join(' ')}
        // `--stagger-count` = option count → the SCSS divides a fixed total
        // reveal budget by it, so the per-row step SHRINKS as the list grows
        // (a 20-row list never crawls) while staying visible on short lists.
        style={{ '--stagger-count': options.length } as CSSProperties}
        side={side}
        align={align}
        {...(sideOffset !== undefined ? { sideOffset } : {})}
        {...(selectable
          ? {
              selectionMode,
              ...(selectedKeys !== undefined ? { selectedKeys } : {}),
              ...(defaultSelectedKeys !== undefined ? { defaultSelectedKeys } : {}),
              onSelectionChange: (sel: RacSelection) => onSelectionChange?.(toIdSet(sel, options)),
            }
          : {})}
      >
        {plan.map(({ groupKey, headerIndex, items }) => {
          if (groupKey === '__nogroup__') {
            return items.map(({ opt, renderIndex }) => renderItem(opt, renderIndex))
          }
          // Header carries its OWN render-order `--i` (+ shared `--n`) so it
          // joins the stagger in its visual slot — the SCSS gives `__label` the
          // same reveal animation as the rows.
          const headerStyle = {
            '--i': headerIndex ?? 0,
            '--n': renderTotal,
          } as CSSProperties
          return (
            <RootGroup key={groupKey}>
              <RootLabel style={headerStyle}>{groupKey}</RootLabel>
              {items.map(({ opt, renderIndex }) => renderItem(opt, renderIndex))}
            </RootGroup>
          )
        })}
      </RootContent>
    </RootMenu>
  )
}

export default Dropdown
