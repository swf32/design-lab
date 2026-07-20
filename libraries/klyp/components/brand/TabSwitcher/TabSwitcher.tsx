import { Tooltip, TooltipContent } from '@klyp/ui/Tooltip'
import { MotionConfig, motion } from 'motion/react'
import {
  Children,
  type ComponentType,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type SVGProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  ToggleButton as RACToggleButton,
  ToggleButtonGroup as RACToggleButtonGroup,
  type ToggleButtonProps as RACToggleButtonProps,
} from 'react-aria-components'
import './TabSwitcher.scss'

/**
 * Segmented "tab" switcher with a **sliding pill indicator**.
 *
 * Architecture: RAC `ToggleButtonGroup` underneath (single-select, disallows
 * empty) provides keyboard a11y (roving tabindex + arrow nav + screen-reader
 * roles).
 *
 * The selection indicator is a SINGLE persistent `<motion.span>` rendered as
 * the first child of the group (NOT one-per-option), positioned absolutely and
 * animated to the active option's **container-relative offset box**
 * (`offsetLeft` / `offsetTop` / `offsetWidth` / `offsetHeight`, accumulated up
 * to the group root). When `value` changes we re-measure and Motion springs
 * the pill's `x` / `width` to the new slot; on layout reflow / resize we snap
 * (no spring) so it tracks instantly.
 *
 * Why offsets and NOT Motion's shared-layout `layoutId` FLIP (the previous
 * technique): `layoutId` measures the pill in **viewport coordinates**
 * (`getBoundingClientRect`). Whenever an ANCESTOR moves the pill on screen —
 * a popover's entrance `translateY`, an `animateHeight` morph, a stagger
 * reflow, collision repositioning — Motion reads the changed screen rect as a
 * "layout change" and springs the pill to catch up, so the pill visibly trails
 * the rest of the control vertically as the parent slides into place. Offsets
 * are relative to the group itself and are **transform-independent**, so they
 * don't change when the parent moves on screen — the pill stays welded to its
 * track and only slides on a genuine tab switch. (Prior band-aids — a 200ms
 * "defer until parent settles" timer, `layoutDependency={value}`, and an
 * `overflow-x: clip` overshoot guard — were all attempts at this same bug;
 * the offset measurement removes the whole class.)
 *
 * Visual contract (unchanged):
 *   - Outer pill height fixed per size (`block-size`), `--r-chip` corners,
 *     1px subtle stroke, 2px padding + 2px gap between options
 *   - Option corner-radius 8px, content-sized horizontally (consumers can
 *     stretch via `fullWidth`)
 *   - Hover (inactive) → fg lifts to primary, no bg paint (pill rules bg)
 *   - Active → fg primary, pill paints `--color-bg-surface-solid` +
 *     1px `--color-border-subtle` stroke, springs into place
 *
 * Per-instance pill (single node per `<TabSwitcher>`) so multiple instances
 * on the same page are independent. Reduced motion respected via
 * `<MotionConfig reducedMotion="user">` (Motion skips the transform spring).
 *
 * Public API mirrors `<ChipToggle>` — compound children, single-select:
 *
 *   <TabSwitcher value={mode} onValueChange={setMode} ariaLabel="Mode">
 *     <TabSwitcher.Item value="text">Text</TabSwitcher.Item>
 *     <TabSwitcher.Item value="image">Image</TabSwitcher.Item>
 *     <TabSwitcher.Item value="video">Video</TabSwitcher.Item>
 *   </TabSwitcher>
 *
 * Sizes — FIXED outer height per size (set via `block-size`, not derived from
 * option + padding + border), mapped onto the canonical DS control ladder
 * (`control.size` 24/32/36/44/56, retuned 2026-06-30): `sm` (32px =
 * `--control-size-sm`), `md` (36px = `--control-size-md`, default — the DS
 * control-height baseline, matches BrandSelect / Submit / settings-trigger /
 * buttons), `lg` (44px = `--control-size-lg`).
 *
 * Disabled options: `<TabSwitcher.Item isDisabled>` forwards to the RAC
 * toggle — not selectable, `data-disabled` dims it (SCSS --opacity-50).
 * Pair with a gray `badge` for the "coming soon" pattern (chat top bar).
 */

export type TabSwitcherSize = 'sm' | 'md' | 'lg'

/**
 * Outer corner shape:
 *   • `'card'` (default) — `--r-card` (12px) corners, matches generic
 *     segmented control surfaces across the app.
 *   • `'pill'` — `--radius-full` corners, fully-rounded outer + inner;
 *     used for the `<BillingToggle>` Monthly/Annual switch and similar
 *     "pure pill" segmented controls.
 */
export type TabSwitcherShape = 'card' | 'pill'

/**
 * Active-pill tone:
 *   • `'neutral'` (default) — active pill paints `--color-bg-surface-solid`,
 *     the segmented-control standard used everywhere in the app.
 *   • `'accent'` — active pill paints the brand accent (`--color-accent`,
 *     iris) with a solid-white active label. Reserved for the chat-composer
 *     modality switcher, where the active output type is a brand-forward
 *     pick. Do NOT blanket-apply across every segmented control (single-
 *     accent rule — gold/iris is reserved for true accents).
 */
export type TabSwitcherTone = 'neutral' | 'accent'

type TabSwitcherProps = {
  /** Currently selected option value. */
  value: string
  /** Called when the user picks a different option. */
  onValueChange: (next: string) => void
  /** Required for screen readers — describes the group's purpose. */
  ariaLabel: string
  /** Outer pill height (incl. inner padding). Default `md` (40px). */
  size?: TabSwitcherSize
  /** Outer corner shape. Default `'card'`. */
  shape?: TabSwitcherShape
  /** Active-pill tone. Default `'neutral'` (surface-solid pill); `'accent'`
   *  paints the active pill in the brand accent. See {@link TabSwitcherTone}. */
  tone?: TabSwitcherTone
  /**
   * Layout mode. Default `false` — outer pill is **content-sized** (each
   * option fits its label naturally). Set to `true` for **slot-based**
   * layout where the outer pill stretches to its parent and options share
   * equal-width slots — useful inside chat composer / navbar / fixed grid
   * rows where you want all options aligned regardless of label length.
   */
  fullWidth?: boolean
  /**
   * Icon-only mode. Default `false`. When `true`:
   *   • Option labels are visually hidden (still rendered in the DOM so
   *     screen readers get them) — option chrome shrinks to icon + padding.
   *   • Every option is wrapped in `<Tooltip>` so the label surfaces on
   *     hover / focus (300ms delay, matching the rest of the system).
   * Requires every `<TabSwitcher.Item>` to carry an `icon`.
   */
  iconOnly?: boolean
  /**
   * Allow no option to be selected. Default `false` (RAC's
   * `disallowEmptySelection`). When `true`, `value` may be the empty
   * string or any value that doesn't match an item — the sliding
   * pill simply doesn't render and no option carries `data-active`.
   * Use this for hybrid nav rows where one selection lives outside
   * the TabSwitcher (e.g. a sibling "All" chip in Library shell —
   * when "All" is active, the iconOnly switcher is unselected).
   */
  allowEmpty?: boolean
  /** Optional className appended to the root pill. */
  className?: string
  /** Compound `<TabSwitcher.Item>` children. Other children ignored. */
  children: ReactNode
}

type ItemProps = Omit<RACToggleButtonProps, 'id'> & {
  /** Unique identifier for this option — also the value reported by
   *  `onValueChange` when this item is selected. */
  value: string
  /**
   * Optional Iconsax outline icon rendered to the left of the label.
   * Sized automatically per `<TabSwitcher size>` (sm 14 / md 16 / lg 18).
   * Color inherits via `currentColor` — follows the label's
   * inactive→hover→active treatment.
   */
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  /**
   * Optional ReactNode rendered AFTER the label inside the option slot.
   * Treated as a styling-agnostic slot — pass a fully-styled component
   * (e.g. `<Badge intent="green" variant="outline">Save 10%</Badge>`),
   * the wrapper only handles inline positioning and a 6px gap from the
   * label. When set, the option also gets `data-has-badge` so SCSS can
   * tighten the trailing padding to match the outer pill's 4px gutter.
   */
  badge?: ReactNode
  children: ReactNode
}

// Spring tuned per design lead v8 → v9 brief: snappier than motion.dev default
// (stiffness 700 / damping 30) so the pill arrives without overshoot on
// short hops between adjacent options. Damping 44 ≈ 2·√500 = critical for
// stiffness 500 — any lower (was 35, ratio ~0.78) introduces a 1-5px right
// overshoot on long hops that briefly pushes the pill past the root's right
// edge; the root's `overflow-x: clip` (see .scss) absorbs any residual settle.
const PILL_SPRING = { type: 'spring', stiffness: 500, damping: 44 } as const

// Reflow / resize updates snap (no spring) — the pill must track an ancestor
// reflow or a container resize instantly, only a genuine tab switch springs.
const PILL_SNAP = { duration: 0 } as const

// Blur pulse on activation — label + icon momentarily defocus then snap
// back as the sliding pill arrives under them. Same recipe as motion.dev
// FluidTabs reference (design lead brief 2026-05-24).
const BLUR_PULSE = { duration: 0.3, ease: 'easeOut' } as const
// Mutable array (not `as const`) — Motion's `animate` filter keyframes
// expect a mutable `UnresolvedValueKeyframe[]`, not a readonly tuple.
const BLUR_PULSE_ACTIVE: string[] = ['blur(0px)', 'blur(4px)', 'blur(0px)']
const BLUR_PULSE_IDLE = 'blur(0px)' as const

/** Active-option geometry, relative to the group root's padding box. */
type PillBox = { x: number; y: number; width: number; height: number }

function TabSwitcherRoot({
  value,
  onValueChange,
  ariaLabel,
  size = 'md',
  shape = 'card',
  tone = 'neutral',
  fullWidth = false,
  iconOnly = false,
  allowEmpty = false,
  className,
  children,
}: TabSwitcherProps) {
  // The group root — the offset origin the pill is measured against.
  const rootRef = useRef<HTMLDivElement>(null)
  // Active-option geometry the pill animates to. `null` = nothing selected
  // (allowEmpty) → no pill rendered.
  const [pillBox, setPillBox] = useState<PillBox | null>(null)
  // Whether the next geometry change should spring (true, tab switch) or snap
  // (false, reflow / resize / mount).
  const [pillSpring, setPillSpring] = useState(false)
  // Previous `value` — lets the measure effect tell a real tab switch (spring)
  // from a geometry-only reflow (snap). null until first measured (mount snaps).
  const prevValueRef = useRef<string | null>(null)

  // Measure the active option's box RELATIVE TO the group root by walking the
  // offsetParent chain up to the root. Offsets are layout values — independent
  // of any ancestor CSS transform — so a popover's entrance translate / height
  // morph / reposition never shifts this number. That's the whole fix: the pill
  // is welded to its track, it can't trail the parent's on-screen movement.
  const measurePill = useCallback((spring: boolean) => {
    const root = rootRef.current
    if (!root) return
    const active = root.querySelector<HTMLElement>('.klyp-TabSwitcher__option[data-active]')
    if (!active) {
      setPillBox(null)
      return
    }
    let x = 0
    let y = 0
    let node: HTMLElement | null = active
    // Accumulate offsets up to (but not including) the root — robust to any
    // positioned wrapper between option and root (e.g. an iconOnly Tooltip).
    while (node && node !== root) {
      x += node.offsetLeft
      y += node.offsetTop
      node = node.offsetParent as HTMLElement | null
    }
    setPillSpring(spring)
    setPillBox({ x, y, width: active.offsetWidth, height: active.offsetHeight })
  }, [])

  // Translate compound children into RAC ToggleButton elements. We map
  // user-supplied `value` to RAC's `id` because RAC's selection model is
  // keyed by id, not by an arbitrary value prop.
  const items = Children.toArray(children).filter(
    (c): c is ReactElement<ItemProps> => isValidElement<ItemProps>(c) && c.type === Item,
  )
  const itemCount = items.length

  // Re-measure on mount and whenever a layout-affecting input changes. A real
  // tab switch (value changed) springs; every other trigger snaps (geometry
  // reflow — size / slot mode / item count). measurePill reads the resulting
  // DOM, so these props can't be "seen" as deps — they're intentional re-run
  // triggers.
  // biome-ignore lint/correctness/useExhaustiveDependencies: size/fullWidth/iconOnly/allowEmpty/itemCount are intentional re-measure triggers — they change the measured DOM layout, which measurePill reads (it doesn't read them directly).
  useLayoutEffect(() => {
    const prev = prevValueRef.current
    prevValueRef.current = value
    measurePill(prev !== null && prev !== value)
  }, [value, size, fullWidth, iconOnly, allowEmpty, itemCount, measurePill])

  // Runtime container resize (no prop change) → snap-measure. Observing the
  // root catches every reflow that changes the track's box; measurePill
  // re-queries the active option fresh each time.
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => measurePill(false))
    ro.observe(root)
    return () => ro.disconnect()
  }, [measurePill])

  const rootClass = [
    'klyp-TabSwitcher',
    typeof className === 'string' && className.length > 0 ? className : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <MotionConfig reducedMotion="user">
      <RACToggleButtonGroup
        ref={rootRef}
        selectionMode="single"
        disallowEmptySelection={!allowEmpty}
        selectedKeys={
          // In allowEmpty mode, only seed selectedKeys when `value`
          // matches a rendered item — otherwise RAC tries to select
          // a key that doesn't exist and warns. An empty Set means
          // "nothing selected", no pill, no `data-active`.
          allowEmpty && !items.some((c) => c.props.value === value)
            ? new Set<string>()
            : new Set([value])
        }
        onSelectionChange={(keys) => {
          // RAC ToggleButtonGroup with disallowEmptySelection always emits
          // a Set<Key> with exactly one entry. With allowEmpty the set
          // can be empty (user clicked the currently-active option to
          // deselect); we ignore that — the host owns "no selection".
          const first = keys.values().next().value
          if (typeof first === 'string') onValueChange(first)
        }}
        aria-label={ariaLabel}
        data-size={size}
        data-shape={shape}
        data-tone={tone === 'accent' ? 'accent' : undefined}
        data-fullwidth={fullWidth ? '' : undefined}
        data-icon-only={iconOnly ? '' : undefined}
        className={rootClass}
      >
        {/* Single sliding pill — first child of the group, painted behind the
            option labels. Absolutely positioned; Motion drives x / y / width /
            height to the active option's offset box. `initial={false}` so it
            appears at the measured slot with no enter animation. Springs on a
            tab switch, snaps on reflow. */}
        {pillBox && (
          <motion.span
            className="klyp-TabSwitcher__pill"
            aria-hidden
            initial={false}
            animate={{
              x: pillBox.x,
              y: pillBox.y,
              width: pillBox.width,
              height: pillBox.height,
            }}
            transition={pillSpring ? PILL_SPRING : PILL_SNAP}
          />
        )}
        {items.map((child) => {
          const itemValue = child.props.value
          const isActive = itemValue === value
          const Icon = child.props.icon
          const hasBadge = child.props.badge !== undefined && child.props.badge !== null
          const button = (
            <RACToggleButton
              key={itemValue}
              id={itemValue}
              className="klyp-TabSwitcher__option"
              // Forward the RAC disabled state (ItemProps extends the RAC
              // props, but rendering happens here — without this line
              // `isDisabled` was silently dropped). RAC blocks selection and
              // sets `data-disabled`; SCSS dims via --opacity-50. Use for
              // "coming soon" options, typically with a gray `badge`.
              isDisabled={child.props.isDisabled}
              data-active={isActive ? 'true' : undefined}
              data-has-icon={Icon ? '' : undefined}
              data-has-badge={hasBadge ? '' : undefined}
            >
              {/* Inner content carries the blur pulse — wrapping icon +
                  label in a single motion node lets the filter animate as
                  one layer (composited offscreen by the browser) instead
                  of applying per-element. Badge stays a sibling because
                  it shouldn't pulse on selection. */}
              <motion.span
                className="klyp-TabSwitcher__inner"
                initial={{ filter: BLUR_PULSE_IDLE }}
                animate={{ filter: isActive ? BLUR_PULSE_ACTIVE : BLUR_PULSE_IDLE }}
                transition={BLUR_PULSE}
              >
                {Icon ? (
                  <span className="klyp-TabSwitcher__optionIcon" aria-hidden>
                    <Icon />
                  </span>
                ) : null}
                <span className="klyp-TabSwitcher__label">{child.props.children}</span>
              </motion.span>
              {hasBadge && (
                <span className="klyp-TabSwitcher__badge" aria-hidden>
                  {child.props.badge}
                </span>
              )}
            </RACToggleButton>
          )
          // Icon-only mode: surface the label via Tooltip on hover/focus.
          // The label inside <span class="__label"> stays in the DOM so the
          // accessible name is preserved for screen readers; Tooltip carries
          // the same text as a visual cue for sighted users.
          if (iconOnly && Icon) {
            return (
              <Tooltip key={itemValue} delay={300} closeDelay={0}>
                {button}
                <TooltipContent side="bottom" sideOffset={6}>
                  {child.props.children}
                </TooltipContent>
              </Tooltip>
            )
          }
          return button
        })}
      </RACToggleButtonGroup>
    </MotionConfig>
  )
}

function Item(_props: ItemProps): null {
  // Pure marker component — actual rendering happens in TabSwitcherRoot
  // which reads props.value + props.children directly. Returning null
  // prevents accidental double-render if someone passes <Item> outside
  // of a <TabSwitcher>.
  return null
}

export const TabSwitcher = Object.assign(TabSwitcherRoot, { Item })
export type { TabSwitcherProps }
