/**
 * ToolButton — square icon-only button with built-in RAC tooltip.
 * The base building block for any action toolbar (chat actions, code-block
 * header, etc.). Caller passes an Iconsax outline component + a label.
 *
 * Variants:
 *   • ghost   — transparent → hover wash one tone above the dark bg (default)
 *   • bare    — NO background at any state; the glyph alone brightens. For
 *     icon actions riding an already-washed row (e.g. the sidebar Chat-row
 *     quick actions) where a second wash would double-stack.
 *   • subtle  — always shows that soft bg
 *   • solid   — a standalone boxed button: solid surface + 1px border, full
 *     opacity (matches the composer footer controls — mic / model pill / +)
 *   • outline — solid's border with NO fill at rest (transparent bg); hover
 *     lifts a subtle surface + brightens the border. For boxed chrome riding
 *     directly on the page bg (chat top-bar Back / New chat).
 *   • danger  — destructive action; red glyph, red wash on hover.
 * Sizes: xs 24 · sm 32 · md 40 · lg 48 · xl 56 (runtime control-size tokens),
 * with a per-size radius ramp mirroring Button (xs/sm 6 · md 10 · lg/xl 12).
 *
 * Two-axis sizing (2026-06-22): `size` drives the container; the glyph is a
 * constant 16px by default. Pass `iconSize="auto"` to let it scale WITH the
 * container (16/20/24/28/32 ramp), or `iconSize={n}` for an exact px — the
 * two axes are decoupled either way.
 *
 * Pending (2026-06-22): `isPending` swaps the glyph for a spinner, sets
 * `[data-pending]` + `aria-busy`, and blocks the press.
 *
 * Transient confirm-state (2026-06-19): pass `confirmIcon` / `confirmLabel`
 * to get a "press → swap icon + tooltip for `confirmMs` → revert" feedback
 * loop for free. `onPress` may be async — the confirm window opens after it
 * resolves; on throw it stays idle (the caller owns error UX).
 *
 * Pure UI — no brand colours. The accent CTA is `<MeshButton>` (brand tier),
 * a rare, pointed accent; an icon action button never carries the gold mesh.
 */

import './ToolButton.scss'

import {
  type ComponentType,
  type ReactNode,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Button, type ButtonProps } from 'react-aria-components'

import { Tooltip, TooltipContent } from '../Tooltip/Tooltip'

export type ToolButtonVariant = 'ghost' | 'bare' | 'subtle' | 'solid' | 'outline' | 'danger'
export type ToolButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Base glyph px — what you get when `iconSize` is omitted. 16 is the canonical
// action-icon weight; it stays constant across container sizes by default.
const DEFAULT_ICON_PX = 16

// Opt-in ramp (`iconSize="auto"`) — glyph scales WITH the container, holding a
// steady ~60% fill across the range (16/24, 20/32, 24/40, 28/48, 32/56).
const ICON_SIZE_BY_SIZE: Record<ToolButtonSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
}

export interface ToolButtonProps extends Omit<ButtonProps, 'children' | 'onPress'> {
  /** Icon component (Iconsax outline). Receives width/height props. */
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Aria-label — the accessible name. Also the tooltip text unless `tooltip` is set. */
  label: string
  /** Tooltip text. Defaults to `label`. Use when the visible hint should differ
   *  from the accessible name (e.g. tooltip "Copy", aria-label "Copy message"). */
  tooltip?: string
  variant?: ToolButtonVariant
  size?: ToolButtonSize
  /** Glyph sizing. Omit → 16px (constant). `'auto'` → scales with the
   *  container via the ramp (16/20/24/28/32). A number → that exact px. */
  iconSize?: number | 'auto'
  /** Toggle / "armed" state — sets `[data-active]` + `aria-pressed`. */
  isActive?: boolean
  /** Loading state — swaps the glyph for a spinner, sets `[data-pending]`
   *  + `aria-busy`, and blocks the press. */
  isPending?: boolean
  /** Optional badge / status dot rendered as a child overlay. */
  overlay?: ReactNode
  /** Press handler. May be async — when `confirmIcon`/`confirmLabel` is set,
   *  the confirm window opens once this resolves. */
  onPress?: () => void | Promise<void>
  /** Icon shown during the transient confirm window after a successful press. */
  confirmIcon?: ComponentType<SVGProps<SVGSVGElement>>
  /** Tooltip shown during the confirm window. Defaults to the idle tooltip. */
  confirmLabel?: string
  /** Confirm window in ms. Default 1500. */
  confirmMs?: number
}

/** Inline CSS-rotated spinner — 270° arc, round caps. No motion dep. */
function Spinner({ size }: { size: number }) {
  return (
    <svg
      className="klyp-ToolButton__spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <path
        d="M21 12a9 9 0 1 1-6.219-8.56"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ToolButton({
  icon: Icon,
  label,
  tooltip,
  variant = 'ghost',
  size = 'sm',
  iconSize,
  isActive = false,
  isPending = false,
  overlay,
  onPress,
  confirmIcon: ConfirmIcon,
  confirmLabel,
  confirmMs = 1500,
  className,
  ...rest
}: ToolButtonProps) {
  const [confirmed, setConfirmed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const hasConfirm = Boolean(ConfirmIcon || confirmLabel)

  const handlePress = async () => {
    try {
      await onPress?.()
      if (!hasConfirm) return
      setConfirmed(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setConfirmed(false), confirmMs)
    } catch {
      // Confirm only on success — the caller owns error UX (toast etc.).
    }
  }

  const iconPx =
    iconSize === undefined
      ? DEFAULT_ICON_PX
      : iconSize === 'auto'
        ? ICON_SIZE_BY_SIZE[size]
        : iconSize
  const ActiveIcon = confirmed && ConfirmIcon ? ConfirmIcon : Icon
  const idleTip = tooltip ?? label
  const tipText = confirmed ? (confirmLabel ?? idleTip) : idleTip

  return (
    <Tooltip delay={400}>
      <Button
        {...rest}
        aria-label={label}
        aria-pressed={isActive || undefined}
        aria-busy={isPending || undefined}
        data-variant={variant}
        data-size={size}
        data-active={isActive ? '' : undefined}
        data-state={confirmed ? 'confirmed' : undefined}
        className={['klyp-ToolButton', className].filter(Boolean).join(' ')}
        // `isPending` routes through RAC's native pending (sets [data-pending]
        // + aria, blocks press) instead of folding into isDisabled — the
        // button stays focusable while busy (mirrors Button's loading fix).
        isDisabled={rest.isDisabled || undefined}
        isPending={isPending || undefined}
        onPress={onPress ? handlePress : undefined}
      >
        <span className="klyp-ToolButton__content">
          {isPending ? (
            <Spinner size={iconPx} />
          ) : (
            <ActiveIcon width={iconPx} height={iconPx} aria-hidden />
          )}
          {overlay}
        </span>
      </Button>
      <TooltipContent side="top">{tipText}</TooltipContent>
    </Tooltip>
  )
}

export default ToolButton
