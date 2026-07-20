import './Button.scss'

import { CheckOutline, CloseCircleOutline } from '@klyp/icons'
import {
  AnimatePresence,
  animate,
  MotionConfig,
  motion,
  useReducedMotion,
  useTime,
  useTransform,
} from 'motion/react'
import {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type SVGProps,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components'

// =====================================================================
// Button — Klyp canonical primitive
// =====================================================================
//
// Two render branches:
//
//   1. Static (no `state`) — renders `iconLeft` (prefix) + children +
//      `iconRight` (suffix). Zero motion hooks, no measure-on-mount cost.
//
//   2. State machine (`state` set) — the action icon morphs through
//      Spinner → Check → CloseCircle as state flips
//      idle/processing/success/error. The morphing icon sits on the
//      LEFT or RIGHT depending on which of iconLeft/iconRight you pass.
//      The button's WIDTH is locked to the widest state's content, and
//      the content (icon + gap + label) stays centred as one group — so
//      when the label changes length the icon and text re-centre together
//      and the gap between them never changes. Shake on error, pop on
//      success — both gated off by `quietState` for paired layouts.
//
//      Swap timings/distances mirror MeshButton's design-lead-tuned values
//      (icon swap 0.1s / y±14, label swap 0.1s / y±8, mode="wait" on both)
//      — the original motion.dev demo values (y±40 / ±20) read as a
//      "scrolling ticker" on our 20px-icon / 14px-text geometry.
//
// Palette is neutral across every variant — primary/secondary/ghost/
// outline differ in surface strength (solid → bordered → transparent)
// rather than colour. Destructive keeps red semantics; link keeps
// accent for text underline. Tune via tokens in Button.scss.
//
// ⚠ Icon-only: `size='icon*'` renders a square here, but for a true
// icon-only control prefer the dedicated `ToolButton` (@klyp/ui) — it's
// the common, purpose-built one (different design + hit-area). Re-check
// whether you actually need Button-as-icon before reaching for it.

// === Public API types ===============================================
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'destructive'
  | 'link'
  | 'accent'

export type ButtonSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon'
  | 'icon-lg'

export type ButtonState = 'idle' | 'processing' | 'success' | 'error'

export type ButtonGlow = 'accent' | 'neutral'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export interface ButtonProps extends Omit<RACButtonProps, 'children' | 'render'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /**
   * **`variant='accent'` only.** Colour of the glow treatment (radial bg +
   * inset inner-glow): `'accent'` (default) = brand accent (gold klyp / blue
   * unreals), `'neutral'` = white-alpha — reads as a silver/gray glow on the
   * dark surface. Ignored by every other variant.
   */
  glow?: ButtonGlow
  /** Backward-compat alias for `isDisabled`. */
  disabled?: boolean
  /** Native HTML title (tooltip). */
  title?: string
  /**
   * Slot-based width: the button fills the width of the section it's placed
   * in (default is inline, sized to content). When the label can't fit, it
   * truncates with an ellipsis (icon-padding compensation still applies).
   */
  fill?: boolean
  /** @deprecated Renamed to `fill`. Kept as an alias so existing callsites work. */
  fullWidth?: boolean
  /**
   * Multi-state animated mode. When set, the component swaps between
   * idle/processing/success/error with built-in icons + label spring.
   * Width is locked to the widest state's content at mount (no reflow
   * during transitions).
   */
  state?: ButtonState
  /** Override labels per state. Merged on top of `BUTTON_STATE_LABELS`. */
  labels?: Partial<Record<ButtonState, string>>
  /**
   * **State-machine only.** When `true`, suppresses the imperative
   * `success` pop (scale 1→1.2→1) and the `error` shake (x ±6px). Icon
   * swap and label swap stay active — only the bbox-disrupting transforms
   * are gated.
   *
   * Use when the button is part of a paired layout (input + Send, URL
   * field + Copy) where a 1.2× scale visually breaks alignment with the
   * sibling control. Standalone CTAs should leave this off so the success
   * feedback stays punchy.
   */
  quietState?: boolean
  /**
   * **State-machine only.** When `true`, the width springs to fit the
   * CURRENT state's content, like MeshButton — the button visibly
   * grows/shrinks as `idle → processing → success → error` swap.
   *
   * Default (`false`) = fixed: the width is locked to the widest state's
   * content (measured at mount) so the button never reflows during
   * transitions. Opt into `fluidWidth` for standalone CTAs where the
   * width change reads as intentional motion.
   */
  fluidWidth?: boolean
  /**
   * **Static mode only** (no `state`). Slot-aware fluid width: the button
   * sizes to its content but clamps to its slot (`max-width:100%`) and
   * SPRINGS its width whenever the content changes — e.g. a picker pill
   * whose summary label swaps as you change a setting. When the slot is too
   * narrow the label truncates with an ellipsis (like `fill` in its slot).
   * Supersedes `fill` / `fullWidth` — those are ignored in this mode. Off =
   * the static button snaps to the new width instantly (default; zero motion
   * cost). Measures via a hidden duplicate of the content, so children
   * should be presentational (icon + text). `prefers-reduced-motion` →
   * instant.
   */
  animateWidth?: boolean
  /**
   * Prefix icon — rendered on the LEFT of the label. In state-machine
   * mode this is the slot that morphs into the spinner/check/cross
   * (unless only `iconRight` is set, then the right slot morphs).
   */
  iconLeft?: IconComponent
  /**
   * Suffix icon — rendered on the RIGHT of the label. In state-machine
   * mode, if `iconLeft` is absent the right slot is the morphing one;
   * if both are set, left morphs and right stays a static suffix.
   */
  iconRight?: IconComponent
  children?: ReactNode
  /** Forwarded to the underlying RAC Button — React 19 ref-as-prop. */
  ref?: Ref<HTMLButtonElement>
}

export const BUTTON_STATE_LABELS: Record<ButtonState, string> = {
  idle: 'Submit',
  processing: 'Working',
  success: 'Done',
  error: 'Failed',
}

const BUTTON_STATE_ORDER: readonly ButtonState[] = ['idle', 'processing', 'success', 'error']

// === Internal mappings ==============================================
const VARIANT_MAP: Record<ButtonVariant, string> = {
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'ghost',
  outline: 'outline',
  destructive: 'destructive',
  link: 'link',
  accent: 'accent',
}

const SIZE_MAP: Record<ButtonSize, string> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  'icon-xs': 'icon-xs',
  'icon-sm': 'icon-sm',
  icon: 'icon',
  'icon-lg': 'icon-lg',
}

// === Motion constants — locked, do not tweak without re-checking ====
const SHAKE_KEYFRAMES = { x: [0, -6, 6, -6, 0] }
const SHAKE_OPTIONS = {
  duration: 0.3,
  ease: 'easeInOut' as const,
  times: [0, 0.25, 0.5, 0.75, 1],
  repeat: 0,
  delay: 0.1,
}
const POP_KEYFRAMES = { scale: [1, 1.2, 1] }
const POP_OPTIONS = {
  duration: 0.3,
  ease: 'easeInOut' as const,
  times: [0, 0.5, 1],
  repeat: 0,
}
// Width spring for the fluid content box — same feel as MeshButton.
const WIDTH_SPRING = { type: 'spring', stiffness: 600, damping: 30 } as const
// Width-morph transition for `animateWidth`. A TWEEN on the real `width`
// property (NOT a spring, NOT a FLIP scale) — so it physically cannot overshoot
// or wobble: the width eases to its new size and stops. easeInOut = smooth
// accelerate→decelerate (the "Motion-y, springy-but-no-bounce" feel). Swap the
// `ease` to taste: 'easeInOut' · 'easeOut' (snappier settle) · 'circInOut'
// (a touch more energetic). Change `duration` for speed. Never a spring here.
const WIDTH_MORPH = { type: 'tween', duration: 0.16, ease: 'easeInOut' } as const

// Motion-wrapped RAC Button — created ONCE at module scope (creating it inside
// render would remount the button each render, dropping focus/animation state).
// ButtonFluidStatic uses it so the button's BOX can FLIP-animate its width via
// `layout`. Motion consumes the layout/transition props itself (does not forward
// them to RAC); RAC still consumes its own context (press, aria, DialogTrigger
// wiring) and applies the motion transform + ref.
const MotionRACButton = motion.create(RACButton)

// === Component ======================================================
export function Button({
  variant = 'primary',
  size = 'md',
  glow = 'accent',
  isDisabled,
  disabled,
  title,
  fill,
  fullWidth,
  className,
  children,
  state,
  labels: labelsOverride,
  quietState = false,
  fluidWidth = false,
  animateWidth = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...props
}: ButtonProps) {
  const v = VARIANT_MAP[variant] ?? 'primary'
  const s = SIZE_MAP[size] ?? 'md'
  const effectivelyDisabled = isDisabled || disabled
  // `fullWidth` is the deprecated alias for `fill`.
  const filled = fill || fullWidth

  const composed = typeof className === 'string' ? `klyp-Button ${className}` : 'klyp-Button'

  // data-glow lands only when non-default; SCSS reacts to it only under
  // [data-variant='accent'], so it's inert on every other variant.
  const glowAttr = glow === 'accent' ? undefined : glow

  // Static branch — no motion hooks, no measure cost.
  if (state === undefined) {
    // Opt-in fluid width (still no state machine): springs the width when the
    // content changes, clamps + truncates in its slot. Off → plain static.
    if (animateWidth) {
      return (
        <ButtonFluidStatic
          variant={v}
          size={s}
          glowAttr={glowAttr}
          effectivelyDisabled={effectivelyDisabled}
          title={title}
          className={composed}
          IconLeft={IconLeft}
          IconRight={IconRight}
          restProps={props}
        >
          {children}
        </ButtonFluidStatic>
      )
    }
    return (
      <RACButton
        {...props}
        isDisabled={effectivelyDisabled || undefined}
        {...(title ? { title } : {})}
        className={composed}
        data-variant={v}
        data-size={s}
        data-glow={glowAttr}
        data-fill={filled || undefined}
        data-icon-left={IconLeft ? '' : undefined}
        data-icon-right={IconRight ? '' : undefined}
      >
        {IconLeft ? <IconLeft aria-hidden="true" focusable="false" /> : null}
        {/* Wrap a TEXT label so it can truncate (ellipsis) when `fill`
            constrains the width below content. Only string/number children
            are wrapped — an icon-only child (svg element) stays a direct
            `> svg` so the existing icon sizing rules keep matching. */}
        {typeof children === 'string' || typeof children === 'number' ? (
          <span className="klyp-Button__text">{children}</span>
        ) : (
          (children as ReactNode)
        )}
        {IconRight ? <IconRight aria-hidden="true" focusable="false" /> : null}
      </RACButton>
    )
  }

  // State-machine branch — locked width, centred animated content.
  return (
    <ButtonAnimated
      variant={v}
      size={s}
      glowAttr={glowAttr}
      effectivelyDisabled={effectivelyDisabled}
      title={title}
      fill={filled}
      className={composed}
      state={state}
      labelsOverride={labelsOverride}
      quietState={quietState}
      fluidWidth={fluidWidth}
      IconLeft={IconLeft}
      IconRight={IconRight}
      idleChildren={children}
      restProps={props}
    />
  )
}

// === Fluid-width static branch ======================================
// Static button (no state machine) whose WIDTH morphs when its content changes.
// It animates the REAL `width` property (not a FLIP transform/scale), so there
// is no scale and no second correction layer — which means it physically cannot
// overshoot / wobble / bounce. An inner cluster is `width:max-content` (its
// offsetWidth is the true content width); after every render we measure it in a
// useLayoutEffect (synchronous, pre-paint) and animate the button's width to
// content+padding+border, so the morph starts the same frame the text changes
// (no lag). Single render of the content (no stamp) keeps the provider icon's
// gradient ids unique. `max-width:100%` clamps to the slot (hard-clips when
// narrower — no ellipsis in this mode).
interface ButtonFluidStaticProps {
  variant: string
  size: string
  glowAttr: string | undefined
  effectivelyDisabled: boolean | undefined
  title: string | undefined
  className: string
  IconLeft?: IconComponent
  IconRight?: IconComponent
  children?: ReactNode
  restProps: Omit<RACButtonProps, 'children' | 'render' | 'className' | 'isDisabled'>
}

function ButtonFluidStatic({
  variant,
  size,
  glowAttr,
  effectivelyDisabled,
  title,
  className,
  IconLeft,
  IconRight,
  children,
  restProps,
}: ButtonFluidStaticProps) {
  const reduceMotion = useReducedMotion()
  const innerRef = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | undefined>(undefined)

  // Measure the natural content width after every render (a label swap changes
  // it) and animate the button's width to it. useLayoutEffect runs before paint,
  // so the morph starts the SAME frame the new text commits — no lag. Target =
  // the button's natural offsetWidth = inner content + the button's own padding
  // + border (read live so it's correct across sizes / variants / box-sizing).
  useLayoutEffect(() => {
    const inner = innerRef.current
    const btn = inner?.parentElement
    if (!inner || !btn) return
    const cs = getComputedStyle(btn)
    const chrome =
      Number.parseFloat(cs.paddingLeft) +
      Number.parseFloat(cs.paddingRight) +
      Number.parseFloat(cs.borderLeftWidth) +
      Number.parseFloat(cs.borderRightWidth)
    setWidth(cs.boxSizing === 'border-box' ? inner.offsetWidth + chrome : inner.offsetWidth)
  })

  // motion.create redefines onAnimationStart + the hover gesture handlers
  // (onHoverStart/onHoverEnd) + style to its own signatures, which clash with
  // RAC's when spread. Strip them — this fluid trigger never sets them (RAC's
  // own press/hover data-attributes still drive SCSS state).
  const {
    onAnimationStart: _onAnimationStart,
    onHoverStart: _onHoverStart,
    onHoverEnd: _onHoverEnd,
    style: _style,
    ...motionSafeRest
  } = restProps

  return (
    <MotionRACButton
      {...motionSafeRest}
      animate={width != null ? { width } : undefined}
      initial={false}
      transition={reduceMotion ? { duration: 0 } : { width: WIDTH_MORPH }}
      isDisabled={effectivelyDisabled || undefined}
      {...(title ? { title } : {})}
      className={className}
      data-variant={variant}
      data-size={size}
      data-glow={glowAttr}
      data-animate-width=""
      data-icon-left={IconLeft ? '' : undefined}
      data-icon-right={IconRight ? '' : undefined}
    >
      {/* Inner cluster is width:max-content → its offsetWidth is the true
          content width regardless of the button's animated width. The button
          widens to fit it; the cluster is clipped by the button's overflow when
          the slot is narrower. Icons sized by CSS (the &__fluidContent > svg). */}
      <span ref={innerRef} className="klyp-Button__fluidContent">
        {IconLeft ? <IconLeft aria-hidden="true" focusable="false" /> : null}
        {typeof children === 'string' || typeof children === 'number' ? (
          <span className="klyp-Button__text">{children}</span>
        ) : (
          (children as ReactNode)
        )}
        {IconRight ? <IconRight aria-hidden="true" focusable="false" /> : null}
      </span>
    </MotionRACButton>
  )
}

// === Animated branch ================================================
interface ButtonAnimatedProps {
  variant: string
  size: string
  glowAttr: string | undefined
  effectivelyDisabled: boolean | undefined
  title: string | undefined
  fill: boolean | undefined
  className: string
  state: ButtonState
  labelsOverride?: Partial<Record<ButtonState, string>>
  quietState: boolean
  fluidWidth: boolean
  IconLeft?: IconComponent
  IconRight?: IconComponent
  idleChildren: ReactNode
  restProps: Omit<RACButtonProps, 'children' | 'render' | 'className' | 'isDisabled'>
}

function ButtonAnimated({
  variant,
  size,
  glowAttr,
  effectivelyDisabled,
  title,
  fill,
  className,
  state,
  labelsOverride,
  quietState,
  fluidWidth,
  IconLeft,
  IconRight,
  idleChildren,
  restProps,
}: ButtonAnimatedProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()
  const labels = { ...BUTTON_STATE_LABELS, ...(labelsOverride ?? {}) }

  const iconPx = ICON_SIZE_BY_BUTTON_SIZE[size] ?? 20
  const hasLeft = !!IconLeft
  const hasRight = !!IconRight
  // The morphing slot: left by default; right only when right is the
  // sole icon. When both are set, left morphs and right stays static.
  const stateSide: 'left' | 'right' = !hasLeft && hasRight ? 'right' : 'left'
  const leftSlot = stateSide === 'left' || hasLeft
  const rightSlot = stateSide === 'right' || hasRight

  const resolveLabel = (s: ButtonState): ReactNode =>
    s === 'idle' && idleChildren !== undefined ? idleChildren : labels[s]

  // Measure every state's full content (icon spacer + gap + label) once, so
  // the content box can animate its width. Fixed mode (default) locks to the
  // widest state; fluidWidth springs to the CURRENT state. Either way the
  // icon + label cluster centres via `justify-content: center` (constant gap).
  const measureRefs = useRef<Partial<Record<ButtonState, HTMLSpanElement | null>>>({})
  const [widths, setWidths] = useState<Record<ButtonState, number>>({
    idle: 0,
    processing: 0,
    success: 0,
    error: 0,
  })
  useLayoutEffect(() => {
    const next: Record<ButtonState, number> = { idle: 0, processing: 0, success: 0, error: 0 }
    for (const s of BUTTON_STATE_ORDER) {
      const el = measureRefs.current[s]
      if (el) next[s] = el.getBoundingClientRect().width
    }
    setWidths(next)
  }, [labels.idle, labels.processing, labels.success, labels.error])

  const maxWidth = Math.max(widths.idle, widths.processing, widths.success, widths.error)
  // fluidWidth → spring to fit the current state; fixed (default) → lock to
  // the widest label. `0` until first measure → fall back to `auto`.
  const targetWidth = fluidWidth ? widths[state] : maxWidth

  // Imperative shake / pop on state transition. Cleanup cancels the
  // prior animation if state churns faster than it finishes.
  // `quietState` skips both — used in paired layouts (input + Send) where
  // a 1.2× scale visually breaks alignment with the sibling control.
  useEffect(() => {
    if (!ref.current || reduceMotion || quietState) return
    let controls: ReturnType<typeof animate> | undefined
    if (state === 'error') {
      controls = animate(ref.current, SHAKE_KEYFRAMES, SHAKE_OPTIONS)
    } else if (state === 'success') {
      controls = animate(ref.current, POP_KEYFRAMES, POP_OPTIONS)
    }
    return () => controls?.stop()
  }, [state, reduceMotion, quietState])

  const isBusy = state === 'processing'

  const morphIcon = (
    <ButtonStateIcon
      state={state}
      size={size}
      idleIcon={stateSide === 'left' ? IconLeft : IconRight}
    />
  )
  const leftNode =
    stateSide === 'left' ? (
      morphIcon
    ) : hasLeft && IconLeft ? (
      <StaticIcon Icon={IconLeft} size={size} />
    ) : null
  const rightNode =
    stateSide === 'right' ? (
      morphIcon
    ) : hasRight && IconRight ? (
      <StaticIcon Icon={IconRight} size={size} />
    ) : null

  const inner = (
    <>
      {leftNode}
      <ButtonStateLabel state={state} label={resolveLabel(state)} />
      {rightNode}
    </>
  )

  // Hidden per-state stamps mirror the real content (icon spacers + gap +
  // label) so the measured width matches exactly.
  const stamps = BUTTON_STATE_ORDER.map((s) => (
    <span
      key={s}
      aria-hidden
      className="klyp-Button__content klyp-Button__measure"
      ref={(el) => {
        measureRefs.current[s] = el
      }}
    >
      {leftSlot ? (
        <span className="klyp-Button__iconSpacer" style={iconSpacerStyle(iconPx)} />
      ) : null}
      <span style={NOWRAP_STYLE}>{resolveLabel(s)}</span>
      {rightSlot ? (
        <span className="klyp-Button__iconSpacer" style={iconSpacerStyle(iconPx)} />
      ) : null}
    </span>
  ))

  // aria-live needs a literal value (Biome rejects dynamic attribute value).
  // Error = attention-needing failure → assertive; everything else → polite.
  return (
    <MotionConfig reducedMotion="user">
      <RACButton
        {...restProps}
        ref={ref}
        isDisabled={effectivelyDisabled || undefined}
        {...(title ? { title } : {})}
        className={className}
        data-variant={variant}
        data-size={size}
        data-glow={glowAttr}
        data-fill={fill || undefined}
        data-icon-left={leftSlot ? '' : undefined}
        data-icon-right={rightSlot ? '' : undefined}
        data-loading={isBusy ? '' : undefined}
        data-state={state}
      >
        {stamps}
        {state === 'error' ? (
          <motion.span
            className="klyp-Button__content"
            animate={targetWidth ? { width: targetWidth } : undefined}
            transition={WIDTH_SPRING}
            aria-live="assertive"
            aria-atomic="true"
          >
            {inner}
          </motion.span>
        ) : (
          <motion.span
            className="klyp-Button__content"
            animate={targetWidth ? { width: targetWidth } : undefined}
            transition={WIDTH_SPRING}
            aria-live="polite"
            aria-atomic="true"
          >
            {inner}
          </motion.span>
        )}
      </RACButton>
    </MotionConfig>
  )
}

// === Icon slots =====================================================
// Per-size icon px — sm gets 16, md/lg get 20 (mirrors MeshButton).
const ICON_SIZE_BY_BUTTON_SIZE: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 20,
  xl: 22,
}

const ICON_SLOT_STYLE: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}
// Inset:0 + flex centering — `position: absolute` children opt out of the
// parent's flex centering, so without an explicit alignment they pin to
// (0,0) and the glyph visually sticks to the top-left corner of the slot.
// Stretching the abs span over the full slot and centering its child puts
// the glyph at the optical centre regardless of SVG height.
const ICON_ABS_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
const NOWRAP_STYLE: CSSProperties = { whiteSpace: 'nowrap' }

const iconSpacerStyle = (px: number): CSSProperties => ({ width: px, height: px, flexShrink: 0 })

/** Static (non-morphing) prefix/suffix icon for the non-state side. */
function StaticIcon({ Icon, size }: { Icon: IconComponent; size: string }) {
  const px = ICON_SIZE_BY_BUTTON_SIZE[size] ?? 20
  return (
    <span className="klyp-Button__iconSlot" style={{ ...ICON_SLOT_STYLE, width: px, height: px }}>
      <Icon width={px} height={px} aria-hidden="true" focusable="false" />
    </span>
  )
}

/** Morphing icon: idle shows `idleIcon`, other states swap to spinner/check/cross. */
function ButtonStateIcon({
  state,
  size,
  idleIcon: IdleIcon,
}: {
  state: ButtonState
  size: string
  idleIcon?: IconComponent
}) {
  const iconPx = ICON_SIZE_BY_BUTTON_SIZE[size] ?? 20

  let icon: ReactNode
  switch (state) {
    case 'idle':
      icon = IdleIcon ? <IdleIcon width={iconPx} height={iconPx} /> : null
      break
    case 'processing':
      icon = <SpinnerSvg size={iconPx} />
      break
    case 'success':
      icon = <CheckSvg size={iconPx} />
      break
    case 'error':
      icon = <CloseSvg size={iconPx} />
      break
  }

  return (
    <motion.span
      className="klyp-Button__iconSlot"
      style={{ ...ICON_SLOT_STYLE, width: iconPx, height: iconPx }}
    >
      {/* mode="wait" — without it the exiting and entering icons mount
       * simultaneously at the same absolute position for the transition
       * window, reading as a "double-icon ghost" on idle ↔ success flips.
       * 'wait' makes the swap sequential: exit fully, then enter.
       * y±14 (was ±40 demo value) — ±40 was tuned for a much taller demo
       * badge; on our 20px icon slot it looked like a ribbon scroll.
       * ±14 keeps the soft drift without the glyph leaving the bounds. */}
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          style={ICON_ABS_STYLE}
          initial={{ y: -14, scale: 0.5, filter: 'blur(6px)' }}
          animate={{ y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ y: 14, scale: 0.5, filter: 'blur(6px)' }}
          transition={{ duration: 0.1, ease: 'easeInOut' }}
        >
          {icon}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}

// === State label slot ===============================================
// No fixed width here — the BUTTON locks its width (see ButtonAnimated),
// so the label sizes to its current text and re-centres with the icon as
// one group. `layout` glides the width change so the cluster re-centres
// smoothly; the current text crossfades (y / blur / opacity) while the
// exiting copy goes absolute so the width tracks the entering text.
function ButtonStateLabel({ state, label }: { state: ButtonState; label: ReactNode }) {
  return (
    <span className="klyp-Button__label" style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Invisible sizer — keeps the label box width = current text. No*/}
      {/* `layout` here: Motion's layout animation interpolates size via a*/}
      {/* scale transform, which visibly STRETCHES the text. The width is*/}
      {/* already stable (content box is locked to the widest state), so the*/}
      {/* text just crossfades vertically in place.*/}
      <span aria-hidden style={{ visibility: 'hidden', ...NOWRAP_STYLE }}>
        {label}
      </span>
      {/* Both crossfade layers are absolute + centred over the box, so the*/}
      {/* exiting text leaves STRAIGHT DOWN from the centre (no rightward*/}
      {/* drift) and the entering text arrives straight from the top.*/}
      {/* mode="wait" — sequential swap (exit fully, then enter): with sync
       * both copies are visible at once, and the vertical crossfade reads
       * as a flicker / double-ghost. The content box is width-locked
       * (see ButtonAnimated), so 'wait' costs no layout shift.
       * y±8 (was ±20 demo value) — ±20 felt like a scrolling ticker on our
       * 14px text; ±8 ≈ 60% of the text size gives the soft slide without
       * the text traversing the whole button height. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          style={{ ...LABEL_LAYER_STYLE, ...NOWRAP_STYLE }}
          initial={{ y: -8, opacity: 0, filter: 'blur(10px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: 8, opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.1, ease: 'easeInOut' }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const LABEL_LAYER_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

// === Inline SVGs (no @klyp/icons dep in @klyp/ui tier) ==============
function SpinnerSvg({ size = 16 }: { size?: number }) {
  const time = useTime()
  const rotate = useTransform(time, [0, 1000], [0, 360], { clamp: false })
  return (
    <motion.div
      style={{
        rotate,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
        <path
          d="M21 12a9 9 0 1 1-6.219-8.56"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  )
}

function CheckSvg({ size }: { size: number }) {
  return <CheckOutline width={size} height={size} aria-hidden focusable="false" />
}

function CloseSvg({ size }: { size: number }) {
  return <CloseCircleOutline width={size} height={size} aria-hidden focusable="false" />
}

export default Button
