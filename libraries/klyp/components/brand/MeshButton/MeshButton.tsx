/**
 * `<MeshButton>` — premium CTA с golden goo-blob mesh.
 *
 * Поддерживает два режима без breaking change для existing callsite'ов:
 *
 * 1) **Legacy / static** — `state` НЕ задан. Контент = `children`. Всё как было:
 *    `<MeshButton size="md" busy={isBusy}><Icon /> Send</MeshButton>`.
 *
 * 2) **State machine** — `state` задан. Внутренние animated иконки (Iconsax
 *    `CheckOutline` / `CloseCircleOutline` / `RotateCcwOutline`) свапаются
 *    через `<AnimatePresence>`, label width пружинит к натуральной ширине
 *    следующей строки, на `error` — shake, на `success` — pop-scale.
 *    Children + iconLeft видны только в state='idle' (если переданы).
 *
 * Тех (mesh stack):
 *   • SVG goo filter (Gaussian blur 5 + alpha-clamp colorMatrix) → 4 blob'а
 *     сливаются в "жидкий металл"
 *   • `mix-blend-mode: hard-light` per blob → colour shift на overlap
 *   • Post `blur(6px)` → soft silhouette
 *   • `mix-blend-mode: plus-lighter` на `__content` → текст «горит» поверх mesh
 *   • Keyframes (drift-a/b/c/d) — в `packages/brand/src/_mesh-keyframes.scss`
 *
 * Palette: gold-200 / gold-300 / gold-800 + pure white. NO orange.
 *
 * State machine animation values (источник: motion.dev "Multi state badge"
 * production bundle, deminified 2026-05-11 — y-distances tightened
 * 2026-05-17 per design lead: demo values felt like a scrolling ticker on our
 * 20px-icon / 14px-text geometry, others kept 1:1):
 *   • shake (error):    x[0,-6,6,-6,0], 0.3s easeInOut, delay 0.1s
 *   • pop (success):    scale[1,1.2,1], 0.3s easeInOut
 *   • icon swap:        0.1s easeInOut (was 0.15s), y±14 (was ±40) + scale 0.5↔1 + blur 6px↔0
 *   • label swap:       0.1s easeInOut (was 0.2s),  y±8 (was ±20) + opacity 0↔1 + blur 10px↔0
 *                       (durations unified + halved 2026-05-17 per design lead: 2× snappier + same speed feel)
 *   • width spring:     spring(600, 30) — icon container + label width
 *   • spinner rotate:   useTime → useTransform([0,1000]→[0,360]) linear
 *
 * a11y:
 *   • RAC <Button> — keyboard, focus-visible, aria-disabled автоматом
 *   • State machine: content wrapper получает `aria-live="polite"`
 *     (`assertive` на error) + `aria-atomic="true"` — SR users слышат
 *     каждый state-flip
 *   • Reduced motion (triple-gated):
 *       1. `<MotionConfig reducedMotion="user">` гасит всё nested motion
 *       2. Imperative `animate()` (shake/pop) гейтен через `useReducedMotion()`
 *       3. CSS `@media (prefers-reduced-motion: reduce)` останавливает blob
 *          keyframes
 *
 * Компонент parent-controlled — `state` не самоуправляется. Wire от parent
 * state machine: idle → 'processing' on submit → 'success'/'error' on resolve.
 */

import './MeshButton.scss'

import { CheckOutline, CloseCircleOutline } from '@klyp/icons/outline'
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
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button as RACButton } from 'react-aria-components'
import { useBrand } from '../_brand-context'
import { SolidButton, type SolidButtonProps } from '../SolidButton/SolidButton'

export type MeshButtonTone = 'gold' | 'neutral' | 'purple' | 'blue'
export type MeshButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type BadgeState = 'idle' | 'processing' | 'success' | 'error'

// Default labels reflect the most common MeshButton use case (Generate CTA).
// Consumer overrides via `labels` prop or — for idle only — via `children`.
// In particular `idle` here is just a placeholder; most callsites will pass
// their own action verb via children (`Send`, `Save`, `Submit`, etc.).
export const BADGE_LABELS: Record<BadgeState, string> = {
  idle: 'Generate',
  processing: 'Working',
  success: 'Done',
  error: 'Failed',
}

const BADGE_STATE_ORDER: readonly BadgeState[] = ['idle', 'processing', 'success', 'error']

export interface MeshButtonProps
  extends Omit<ComponentProps<typeof RACButton>, 'children' | 'className'> {
  tone?: MeshButtonTone
  size?: MeshButtonSize
  busy?: boolean
  /**
   * Active = the trigger is "armed" (e.g. prompt has been typed and is
   * ready to send). Visually flips the button to gold-200 surface with
   * black label + icon; mesh blobs activate on hover only when active.
   */
  active?: boolean
  /**
   * Multi-state badge mode. When set, the component drives an animated
   * state machine (idle/processing/success/error) using built-in Iconsax
   * icons + label swap. When `undefined`, the component renders `children`
   * statically (legacy behaviour).
   */
  state?: BadgeState
  /** Override labels per state. Merged on top of `BADGE_LABELS`. */
  labels?: Partial<Record<BadgeState, string>>
  /**
   * Iconsax outline icon shown on the LEFT (prefix). In static mode it sits
   * before the label; in state-machine mode it's the idle icon that morphs
   * into the spinner/check/cross on state flips.
   */
  iconLeft?: ComponentType<SVGProps<SVGSVGElement>>
  /**
   * Iconsax outline icon shown on the RIGHT (suffix). **Static mode only** —
   * sits after the label. In state-machine mode the morphing icon is always
   * on the left, so `iconRight` is ignored there.
   */
  iconRight?: ComponentType<SVGProps<SVGSVGElement>>
  /**
   * **State-machine only.** When `true`, the width animates fluidly via
   * spring(600,30) to fit the CURRENT state's label — the button visibly
   * grows/shrinks as `idle → processing → success → error` swap.
   *
   * Default (`false`) = fixed: the width is locked to the widest state's
   * label (pre-measured at mount), the icon slot is always reserved, and the
   * gap is constant — so the button never reflows during transitions. Opt
   * into `fluidWidth` for standalone CTAs where the width change reads as
   * intentional motion.
   *
   * Naming matches Button (`fluidWidth`, fixed default) — the two components
   * expose the same toggle the same way.
   */
  fluidWidth?: boolean
  /**
   * **State-machine only.** When `true`, suppresses the imperative
   * `success` pop (scale 1→1.2→1) and the `error` shake (x ±6px). Icon
   * swap, label swap, and mesh shimmer stay active — only the
   * bbox-disrupting transforms are gated.
   *
   * Use when the button is part of a paired layout (URL field + Copy,
   * input + Send) where a 1.2x scale visually breaks alignment with the
   * sibling control. Standalone CTAs (Generate, Submit) should leave this
   * off so the success feedback stays punchy.
   */
  quietState?: boolean
  /**
   * Slot-based width: the button fills the width of the section it's placed
   * in (default is inline, sized to content). When the label can't fit, it
   * truncates with an ellipsis (static mode).
   */
  fill?: boolean
  /** Optional className for the outer button (e.g. for layout positioning). */
  className?: string
  children?: ReactNode
}

// Per-instance random seed → unique mesh phase + speed jitter so two
// buttons on the same page never animate in lockstep.
//   delay  ∈ [-15s, 0s]      (negative → animation pre-rolled; phase shift)
//   mult   ∈ [0.85, 1.20]   (±17.5% duration jitter around base 10/13/14/11s)
type MeshSeed = {
  delays: [number, number, number, number]
  mults: [number, number, number, number]
}

function createMeshSeed(): MeshSeed {
  const r = Math.random
  return {
    delays: [-(r() * 15), -(r() * 15), -(r() * 15), -(r() * 15)],
    mults: [0.85 + r() * 0.35, 0.85 + r() * 0.35, 0.85 + r() * 0.35, 0.85 + r() * 0.35],
  }
}

// Bundle constants — DO NOT TWEAK without re-checking motion.dev demo.
// Keyframes objects intentionally NOT `as const` — motion v12+'s `animate()`
// expects mutable arrays in DOMKeyframesDefinition; readonly tuples break
// the overload (ObjectTarget vs DOMKeyframes resolution).
const WIDTH_SPRING = { type: 'spring', stiffness: 600, damping: 30 } as const
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

/**
 * Brand-gate wrapper. Klyp keeps the mesh-blob CTA (signature visual);
 * non-klyp brands (currently Unreals) render `<SolidButton>` instead —
 * MeshButton's mesh aesthetic is dark-surface-only and doesn't translate
 * to light themes. Strips mesh-specific props (tone, active, state,
 * labels, iconLeft, iconRight, fluidWidth, quietState) before delegating, so
 * all MeshButton callsites work unchanged on both brands.
 *
 * Long-term-cleaner alternative: extract `<PrimaryCta>` wrapper into
 * `apps/web/src/components/branding/` (Tier 4) and migrate callsites.
 * Solo-developer pragmatism wins for now — one if-check in one file vs
 * 13 callsite edits.
 */
export function MeshButton(props: MeshButtonProps) {
  const { brandId } = useBrand()
  if (brandId !== 'klyp') {
    const {
      tone: _tone,
      active: _active,
      state: _state,
      labels: _labels,
      iconLeft: _iconLeft,
      iconRight: _iconRight,
      fluidWidth: _fluidWidth,
      quietState: _quietState,
      size,
      busy,
      fill,
      className,
      children,
      style,
      ...rest
    } = props
    const solidProps: SolidButtonProps = {
      ...rest,
      size,
      busy,
      fill,
      className,
      children,
      style: typeof style === 'function' ? undefined : style,
    }
    return <SolidButton {...solidProps} />
  }
  return <KlypMeshButton {...props} />
}

function KlypMeshButton({
  tone = 'gold',
  size = 'md',
  busy = false,
  active = false,
  state,
  labels: labelsOverride,
  iconLeft: IconLeft,
  iconRight: IconRight,
  fluidWidth = false,
  quietState = false,
  fill = false,
  className,
  children,
  style,
  ...rest
}: MeshButtonProps) {
  // Internal plumbing keys off `fixedWidth` (the inverse). Default is fixed.
  const fixedWidth = !fluidWidth
  const seed = useMemo(createMeshSeed, [])

  // Per-instance goo filter id. A shared static id was Safari roulette:
  // with N buttons mounted, duplicate <filter id> resolution is re-evaluated
  // per paint event and the last-parsed definition wins (also broke Yandex
  // Browser on many-instance pages). SCSS reads the reference via the
  // --mesh-goo var; quoted url() because React ids contain non-ident chars.
  const gooFilterId = `klyp-MeshButton-goo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const meshVars = {
    '--mesh-goo': `url("#${gooFilterId}")`,
    '--blob-a-delay': `${seed.delays[0]}s`,
    '--blob-b-delay': `${seed.delays[1]}s`,
    '--blob-c-delay': `${seed.delays[2]}s`,
    '--blob-d-delay': `${seed.delays[3]}s`,
    '--blob-a-mult': seed.mults[0],
    '--blob-b-mult': seed.mults[1],
    '--blob-c-mult': seed.mults[2],
    '--blob-d-mult': seed.mults[3],
  } as CSSProperties

  const composed = ['klyp-MeshButton', className].filter(Boolean).join(' ')

  // Static-mode branch — legacy behaviour, no state machine.
  if (state === undefined) {
    return (
      <RACButton
        {...rest}
        data-tone={tone}
        data-size={size}
        data-busy={busy ? '' : undefined}
        data-active={active ? '' : undefined}
        data-fill={fill ? '' : undefined}
        data-icon-left={IconLeft ? '' : undefined}
        data-icon-right={IconRight ? '' : undefined}
        className={composed}
        style={(renderProps) => {
          const userStyle = typeof style === 'function' ? style(renderProps) : style
          return { ...meshVars, ...userStyle }
        }}
      >
        <MeshButtonGooFilter id={gooFilterId} />
        <span aria-hidden className="klyp-MeshButton__mesh">
          <span className="klyp-MeshButton__meshInner">
            <span className="klyp-MeshButton__blob" data-blob="a" />
            <span className="klyp-MeshButton__blob" data-blob="b" />
            <span className="klyp-MeshButton__blob" data-blob="c" />
            <span className="klyp-MeshButton__blob" data-blob="d" />
          </span>
        </span>
        {/* iconLeft (prefix) + label + iconRight (suffix). A string label is
            wrapped in __text so `fill` can truncate (ellipsis); freeform
            children (icon-in-content) keep the existing single-line clip. */}
        <span className="klyp-MeshButton__content">
          {IconLeft ? (
            <IconLeft
              width={ICON_SIZE_BY_BUTTON_SIZE[size]}
              height={ICON_SIZE_BY_BUTTON_SIZE[size]}
              aria-hidden
              focusable="false"
            />
          ) : null}
          {typeof children === 'string' || typeof children === 'number' ? (
            <span className="klyp-MeshButton__text">{children}</span>
          ) : (
            children
          )}
          {IconRight ? (
            <IconRight
              width={ICON_SIZE_BY_BUTTON_SIZE[size]}
              height={ICON_SIZE_BY_BUTTON_SIZE[size]}
              aria-hidden
              focusable="false"
            />
          ) : null}
        </span>
      </RACButton>
    )
  }

  // State-machine branch — animated icon + label swap.
  return (
    <MeshButtonAnimated
      tone={tone}
      size={size}
      busy={busy}
      active={active}
      state={state}
      labels={labelsOverride}
      iconLeft={IconLeft}
      fixedWidth={fixedWidth}
      quietState={quietState}
      idleChildren={children}
      className={composed}
      style={style}
      meshVars={meshVars}
      gooFilterId={gooFilterId}
      restProps={rest}
    />
  )
}

/**
 * Internal — the state-machine branch.
 *
 * Lifted into a sub-component so the hooks below (`useRef`, `useReducedMotion`,
 * `useEffect`) only run when the consumer actually opts into state machine.
 * Legacy `<MeshButton>` callsites that don't pass `state` pay zero hook cost.
 */
type AnimatedProps = Omit<
  MeshButtonProps,
  | 'state'
  | 'labels'
  | 'iconLeft'
  | 'iconRight'
  | 'children'
  | 'className'
  | 'style'
  | 'fluidWidth'
  | 'fill'
  | 'quietState'
> & {
  state: BadgeState
  labels?: Partial<Record<BadgeState, string>>
  iconLeft?: ComponentType<SVGProps<SVGSVGElement>>
  fixedWidth: boolean
  quietState: boolean
  idleChildren?: ReactNode
  className: string
  style?: MeshButtonProps['style']
  meshVars: CSSProperties
  gooFilterId: string
  restProps: Record<string, unknown>
}

function MeshButtonAnimated({
  tone,
  size,
  busy,
  active,
  state,
  labels: labelsOverride,
  iconLeft: IconLeft,
  fixedWidth,
  quietState,
  idleChildren,
  className,
  style,
  meshVars,
  gooFilterId,
  restProps,
}: AnimatedProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()
  // Memoised so the `labels` object reference is stable across parent
  // re-renders. Without this, every parent render passes a fresh
  // `labelsOverride` object literal → labels merge fresh → BadgeLabel's
  // useLayoutEffect deps still equal (strings are stable) but the
  // `labels` prop drilled into BadgeLabel was a new reference each
  // time, contributing to churn signals downstream.
  const labels = useMemo(
    () => ({ ...BADGE_LABELS, ...(labelsOverride ?? {}) }),
    [
      labelsOverride?.idle,
      labelsOverride?.processing,
      labelsOverride?.success,
      labelsOverride?.error,
      labelsOverride,
    ],
  )

  // Imperative shake / pop on state transition. Cleanup cancels the prior
  // animation if state churns faster than the animation finishes.
  // `quietState` skips both — used when the button is in a paired layout
  // (URL field + Copy) where a 1.2x scale visually breaks alignment with
  // the sibling control.
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

  // `data-busy` фиксированно ставим при `state==='processing'` ИЛИ при
  // явном `busy={true}` — оба пути дают одинаковый visual (accelerated mesh
  // + cursor:progress).
  const isBusy = busy || state === 'processing'

  // In `fixedWidth` mode the icon slot is always reserved and gap is locked
  // so total content width can't shrink to 0 on `idle` (which would defeat
  // the whole point of width-locking). In fluid mode we mimic bundle: gap
  // collapses to 0 on `idle` if there's no `iconLeft` either.
  const hasIconAlways = fixedWidth // icon slot reserved
  const hasIconNow = state !== 'idle' || Boolean(IconLeft)
  const showsIcon = hasIconAlways || hasIconNow
  const contentGap = fixedWidth || state !== 'idle' ? '8px' : '0px'

  // `data-icon-left`: drive the tightened-left-padding rule from SCSS. The
  // legacy `:has(.klyp-MeshButton__content > svg:first-child)` selector
  // doesn't match the state-machine DOM tree (icon sits inside two
  // <motion.span> wrappers — first child is a span, not an svg). The
  // attribute makes the same padding intent explicit and works regardless
  // of DOM nesting.
  const iconLeftAttr = showsIcon ? '' : undefined

  return (
    <MotionConfig reducedMotion="user">
      <RACButton
        {...restProps}
        ref={ref}
        data-tone={tone}
        data-size={size}
        data-busy={isBusy ? '' : undefined}
        data-active={active ? '' : undefined}
        data-icon-left={iconLeftAttr}
        data-fixed-width={fixedWidth ? '' : undefined}
        className={className}
        style={(renderProps) => {
          const userStyle = typeof style === 'function' ? style(renderProps) : style
          return {
            ...meshVars,
            '--badge-content-gap': contentGap,
            ...userStyle,
          } as CSSProperties
        }}
      >
        <MeshButtonGooFilter id={gooFilterId} />
        <span aria-hidden className="klyp-MeshButton__mesh">
          <span className="klyp-MeshButton__meshInner">
            <span className="klyp-MeshButton__blob" data-blob="a" />
            <span className="klyp-MeshButton__blob" data-blob="b" />
            <span className="klyp-MeshButton__blob" data-blob="c" />
            <span className="klyp-MeshButton__blob" data-blob="d" />
          </span>
        </span>
        {/* aria-live: `error` is attention-needing failure → assertive;
            everything else → polite. aria-atomic ensures the SR reads
            the whole label fresh each time. Split into two branches because
            the JSX parser rejects a ternary expression on aria-live. */}
        {state === 'error' ? (
          <span className="klyp-MeshButton__content" aria-live="assertive" aria-atomic="true">
            <BadgeIcon
              state={state}
              size={size ?? 'md'}
              IconLeft={IconLeft}
              alwaysReserve={fixedWidth}
            />
            <BadgeLabel
              state={state}
              labels={labels}
              idleChildren={idleChildren}
              fixedWidth={fixedWidth}
            />
          </span>
        ) : (
          <span className="klyp-MeshButton__content" aria-live="polite" aria-atomic="true">
            <BadgeIcon
              state={state}
              size={size ?? 'md'}
              IconLeft={IconLeft}
              alwaysReserve={fixedWidth}
            />
            <BadgeLabel
              state={state}
              labels={labels}
              idleChildren={idleChildren}
              fixedWidth={fixedWidth}
            />
          </span>
        )}
      </RACButton>
    </MotionConfig>
  )
}

// ---- Icon slot --------------------------------------------------------

// Icon scales with the button: xs/sm get smaller glyphs (comfortable voids on
// the 24/32px buttons); md/lg keep 20px to match bundle proportions; xl gets 24.
const ICON_SIZE_BY_BUTTON_SIZE: Record<MeshButtonSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 20,
  xl: 24,
}

const ICON_SLOT_STYLE: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
// Inset:0 + flex centering — `position: absolute` children opt out of the
// parent's flex centering, so without an explicit alignment they pin to
// (0,0) and SVG glyphs visually stick to the top-left corner of the icon
// slot. Stretching the abs span over the full slot and centering its
// child puts the glyph at the optical centre regardless of SVG height.
const ICON_ABS_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

function BadgeIcon({
  state,
  size,
  IconLeft,
  alwaysReserve,
}: {
  state: BadgeState
  size: MeshButtonSize
  IconLeft?: ComponentType<SVGProps<SVGSVGElement>>
  alwaysReserve: boolean
}) {
  const iconPx = ICON_SIZE_BY_BUTTON_SIZE[size]

  // Render an EMPTY motion.span for idle when no `iconLeft` provided — that
  // preserves AnimatePresence child topology across state transitions
  // (1:1 with motion.dev bundle). With `iconLeft` provided, render it.
  let icon: ReactNode = null
  switch (state) {
    case 'idle':
      icon = IconLeft ? <IconLeft width={iconPx} height={iconPx} /> : null
      break
    case 'processing':
      icon = <SpinnerIcon size={iconPx} />
      break
    case 'success':
      icon = <CheckOutline width={iconPx} height={iconPx} />
      break
    case 'error':
      icon = <CloseCircleOutline width={iconPx} height={iconPx} />
      break
  }

  // Show the icon slot when there's a visible icon (non-idle OR idle+iconLeft).
  // In `fixedWidth` mode, ALWAYS reserve the slot so total width doesn't shift
  // between idle (no icon) and processing (icon) — that's the whole point of
  // a width-locked button.
  const reserveSlot = alwaysReserve || state !== 'idle' || Boolean(IconLeft)

  return (
    <motion.span
      style={{ ...ICON_SLOT_STYLE, height: iconPx }}
      animate={{ width: reserveSlot ? iconPx : 0 }}
      transition={WIDTH_SPRING}
    >
      {/* mode="wait" — without it (default 'sync' in motion v12) the
       * exiting and entering icons are mounted simultaneously at the
       * SAME absolute (0,0) position for the 0.15s transition window,
       * which on idle ↔ success flip reads as a "double-icon ghost"
       * (two glyphs cross-fading on top of each other). 'wait' makes
       * the transition sequential: exit fully, then enter. Adds ~0.15s
       * to the perceived duration but the swap is visually crisp. */}
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          style={ICON_ABS_STYLE}
          /* y±14 (was ±40 in motion.dev demo) — original was tuned for a
           * much taller demo badge; on our 20px icon slot ±40 looked like
           * a ribbon scroll. ±14 keeps the soft drift-in / drift-out feel
           * without the icon visibly leaving the button bounds. */
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

/**
 * Inline SVG spinner — 270° arc, stroke-based with round caps. Visually a
 * proper loader circle, not Iconsax `RotateCcwOutline` (which is a C-shape
 * with an arrow tip and doesn't read as a spinner under rotation). Stroke
 * weight `2` + round caps approximates the visual mass of Iconsax outline
 * fills at this scale so it sits cohesively next to CheckOutline /
 * CloseCircleOutline on the same button.
 */
function SpinnerIcon({ size }: { size: number }) {
  const time = useTime()
  // 1 revolution per 1000ms — matches motion.dev demo. Linear (no clamp).
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

// ---- Label slot --------------------------------------------------------

function BadgeLabel({
  state,
  labels,
  idleChildren,
  fixedWidth,
}: {
  state: BadgeState
  labels: Record<BadgeState, string>
  idleChildren?: ReactNode
  fixedWidth: boolean
}) {
  // One measure ref per state. We render ALL 4 invisible measure-stamps so we
  // can compute the widest label up-front for `fixedWidth` mode.
  const measureRefs = useRef<Partial<Record<BadgeState, HTMLDivElement | null>>>({})
  const [widths, setWidths] = useState<Record<BadgeState, number>>({
    idle: 0,
    processing: 0,
    success: 0,
    error: 0,
  })

  // `useLayoutEffect` runs synchronously after DOM mutation but before paint —
  // first paint shows correct width instead of `0` for one frame.
  useLayoutEffect(() => {
    const next: Record<BadgeState, number> = { idle: 0, processing: 0, success: 0, error: 0 }
    for (const s of BADGE_STATE_ORDER) {
      const el = measureRefs.current[s]
      if (el) next[s] = el.getBoundingClientRect().width
    }
    setWidths(next)
    // Deps: rerun if any label string changes OR consumer's idleChildren swaps
    // (e.g. localized text). Width spring picks up the new target on the next
    // frame.
  }, [])

  // Idle: consumer-provided children if present, else label from map.
  // Non-idle: always the state label.
  const resolveLabel = (s: BadgeState): ReactNode =>
    s === 'idle' && idleChildren !== undefined ? idleChildren : labels[s]

  const currentLabel = resolveLabel(state)
  const maxWidth = Math.max(widths.idle, widths.processing, widths.success, widths.error)
  // In fixedWidth mode the motion.span locks to the widest label; in fluid
  // mode it springs to the current label's measured width (bundle behaviour).
  const targetWidth = fixedWidth ? maxWidth : widths[state]

  return (
    <>
      {/* Hidden measure stamps — one per state. Each stamp is its OWN
          `position: absolute` element so it shrink-to-fits to its text
          content. A previous attempt wrapped them in a single absolute
          parent — that gave every block child the same auto-width (= max
          text length), defeating per-state measurement. Stacking them at
          (0,0) is harmless visually (visibility: hidden) and each one
          reports an independent `getBoundingClientRect().width`. */}
      {BADGE_STATE_ORDER.map((s) => (
        <div
          key={s}
          aria-hidden
          ref={(el) => {
            measureRefs.current[s] = el
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {resolveLabel(s)}
        </div>
      ))}
      {/* Outer span owns the width animation — explicit `animate={{ width }}`
       * via spring. The `layout` prop was REMOVED here (design lead 2026-05-17):
       * with explicit `animate={{ width }}` already driving the spring,
       * `layout` was double-snapshot-driving the same value off DOM
       * reflows, producing a visible "snap → settle" jitter on every
       * idle ↔ success flip and on first mount when measure widths
       * transitioned 0 → real. */}
      <motion.span
        style={{ position: 'relative', display: 'inline-block', height: '1em' }}
        animate={{ width: targetWidth }}
        transition={WIDTH_SPRING}
      >
        {/* mode="wait" — without it (sync = both children mounted) the
         * exiting and entering labels were visible simultaneously: one
         * sliding down + fading out while the other slid in + faded in.
         * Combined with `plus-lighter` blend on the parent, the overlap
         * read as a flicker / double-ghost. 'wait' makes it sequential.
         *
         * Inner motion.div uses PERMANENT `position: absolute` (no morph).
         * Original code morphed position absolute → relative on enter so
         * the entering element would consume natural width — but the
         * outer span is now explicitly width-locked, so we don't need
         * the morph. position is a discrete CSS property motion can't
         * interpolate; the snap caused a 1-frame layout flash. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={state}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              textWrap: 'nowrap',
            }}
            /* y±8 (was ±20 in motion.dev demo) — design lead 2026-05-17 feedback:
             * label felt like a scrolling ticker. ±8 ≈ 60% of 14px text
             * size — gives the soft slide-in feel without the text
             * visually traversing the whole button height. */
            initial={{ y: -8, opacity: 0, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: 8, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
          >
            {currentLabel}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    </>
  )
}

// ---- Goo filter --------------------------------------------------------

/**
 * SVG goo filter — defs only, hidden. Mounted once per button instance with a
 * useId-unique `id` (passed from `<KlypMeshButton>`): duplicate `<filter id>`s
 * across instances are documented Safari resolution-roulette (the last-parsed
 * definition wins, re-resolved per paint event) and broke Yandex Browser on
 * many-instance pages. SCSS consumes the reference via the `--mesh-goo` var
 * set in `meshVars`.
 */
function MeshButtonGooFilter({ id }: { id: string }) {
  return (
    <svg className="klyp-MeshButton__svgFilter" aria-hidden focusable="false">
      <defs>
        {/* Filter region uses the SVG spec default (x=-10% y=-10% 120%×120%).
         * Earlier this was clamped to 100% to keep blur halos from bleeding
         * past the rounded corners on iOS — but the iOS clip is now handled
         * by the rounded `__mesh` clip wrapper (overflow + border-radius +
         * self-mask, see MeshButton.scss), which clips the rasterised filter
         * output regardless of the filter region. Clamping the region was
         * redundant AND harmful: it killed
         * blur halo in the corners (feGaussianBlur convolution at the bbox
         * edge sums in transparent black for off-region samples, alpha drops
         * to ~25%, then `feColorMatrix 0 0 0 16 -7` alpha-clamps below the
         * 0.44 threshold = fully transparent corner wedges). Default region
         * lets halo extend naturally; clip-path on `.__mesh` does the iOS
         * containment work. */}
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 16 -7
            "
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  )
}

export default MeshButton
