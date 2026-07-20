import './Tooltip.scss'

import type { ComponentType, CSSProperties, ReactElement, ReactNode, SVGProps } from 'react'
import {
  OverlayArrow as RACOverlayArrow,
  Tooltip as RACTooltip,
  type TooltipProps as RACTooltipProps,
  TooltipTrigger as RACTooltipTrigger,
  type TooltipTriggerComponentProps as RACTooltipTriggerProps,
} from 'react-aria-components'

// =====================================================================
// Tooltip — Klyp canonical primitive (React Aria)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
// Variant ramp (2026-05-24): tone / shape / arrow / maxWidth — covers
// every watermelon.sh Tooltip 1-10 pattern via DTCG tokens + Iconsax.
//
// RAC mapping (drop-in compat for legacy Base UI surface):
//   Legacy <TooltipProvider>     -> no-op Fragment (RAC manages context
//                                   via TooltipTrigger; Provider not needed)
//   Legacy <Tooltip>             -> RAC <TooltipTrigger>
//   Legacy <TooltipTrigger>      -> Fragment / render-as passthrough
//   Legacy <TooltipContent>      -> RAC <Tooltip> + optional <OverlayArrow>
//
// Side mapping (legacy -> RAC placement):
//   top/bottom/left/right     -> as-is
//   inline-start              -> left   (LTR assumption)
//   inline-end                -> right
//
// State styling via RAC data-attrs:
//   [data-placement='top|bottom|left|right'], [data-entering], [data-exiting].
//
// Custom data-attrs (this primitive):
//   [data-tone='default|danger|warning|success|info']
//   [data-shape='default|pill']
//
// In Phase 5 the legacy Provider / Trigger / render aliases will be removed.

// === TooltipProvider — legacy no-op =================================
export interface TooltipProviderProps {
  /** Open delay (ms). RAC manages this per-trigger via TooltipTrigger.delay. */
  delay?: number
  /** Close delay (ms). RAC manages this per-trigger via TooltipTrigger.closeDelay. */
  closeDelay?: number
  children?: ReactNode
}

/**
 * @deprecated Phase 2 compat shim. RAC's `<TooltipTrigger>` manages context
 * per-pair — no Provider is needed. Will be removed in Phase 5.
 */
export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

// === Tooltip (root) — wraps RAC TooltipTrigger ======================
export interface TooltipProps extends Omit<RACTooltipTriggerProps, 'children'> {
  /** Open delay (ms). Default 0 for immediate show. */
  delay?: number
  /** Close delay (ms). */
  closeDelay?: number
  /** Controlled open state. */
  isOpen?: boolean
  /** Default open state (uncontrolled). */
  defaultOpen?: boolean
  /** Open state change callback. */
  onOpenChange?: (isOpen: boolean) => void
  children?: ReactNode
}

export function Tooltip({ delay = 0, children, ...props }: TooltipProps) {
  return (
    <RACTooltipTrigger delay={delay} {...props}>
      {children}
    </RACTooltipTrigger>
  )
}

// === TooltipTrigger — legacy passthrough ============================
export interface TooltipTriggerProps {
  /**
   * Legacy Base-UI render-as element (e.g. `render={<Button/>}`). When
   * provided, this element becomes the trigger. The wrapped element MUST
   * be a focusable RAC component (Button, Link, etc.) — RAC injects
   * hover/focus props onto it.
   */
  render?: ReactElement
  children?: ReactNode
}

/**
 * @deprecated Phase 2 compat shim. In RAC the trigger element is simply
 * a child of `<TooltipTrigger>` — no separate wrapper component is needed.
 * Will be removed in Phase 5; callsites migrate to placing the trigger
 * directly inside the parent `<Tooltip>` (= RAC TooltipTrigger).
 */
export function TooltipTrigger({ render, children }: TooltipTriggerProps) {
  if (render) return render
  return <>{children}</>
}

// === TooltipContent — RAC Tooltip popup =============================
export type TooltipSide = 'top' | 'right' | 'bottom' | 'left' | 'inline-start' | 'inline-end'
export type TooltipTone = 'default' | 'danger' | 'warning' | 'success' | 'info'
export type TooltipShape = 'default' | 'pill'

export interface TooltipContentProps extends Omit<RACTooltipProps, 'children' | 'placement'> {
  /** Legacy side prop. Mapped to RAC `placement`. */
  side?: TooltipSide
  /**
   * Distance (px) from the trigger to the tooltip body. Default 8 —
   * leaves ~3px of clearance between the arrow tip (which extends
   * ~5px beyond the body) and the trigger so the tooltip never
   * touches the element it labels.
   */
  sideOffset?: number
  /**
   * Visual tone. Default `'default'` (neutral surface).
   * - `danger` — destructive surface for warning/error context (watermelon T7).
   * - `warning` — amber for soft cautions.
   * - `success` — green confirmations.
   * - `info` — blue for in-progress / helpful hints.
   */
  tone?: TooltipTone
  /**
   * Shape. `'default'` = `--radius-md`. `'pill'` = fully rounded (watermelon T9).
   */
  shape?: TooltipShape
  /** Show pointer arrow. Default `true` (watermelon T1). Set `false` for T3. */
  arrow?: boolean
  /** Max width override (px). Default 280. */
  maxWidth?: number
  /**
   * Optional leading status icon (caller-provided, keeping this primitive
   * `@klyp/icons`-free). Renders before children so a `tone` is signalled
   * by more than colour alone — WCAG 1.4.1 Use of Color.
   */
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

const SIDE_MAP: Record<TooltipSide, 'top' | 'right' | 'bottom' | 'left'> = {
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
  'inline-start': 'left',
  'inline-end': 'right',
}

export function TooltipContent({
  side = 'top',
  sideOffset = 8,
  tone = 'default',
  shape = 'default',
  arrow = true,
  maxWidth,
  icon: IconComp,
  className,
  style,
  children,
  ...props
}: TooltipContentProps) {
  const placement = SIDE_MAP[side] ?? 'top'
  const mergedClass = ['klyp-Tooltip', typeof className === 'string' ? className : '']
    .filter(Boolean)
    .join(' ')
  const mergedStyle: CSSProperties | undefined = maxWidth
    ? { ...style, maxWidth: `${maxWidth}px` }
    : style

  return (
    <RACTooltip
      {...props}
      placement={placement}
      offset={sideOffset}
      className={mergedClass}
      style={mergedStyle}
      data-tone={tone}
      data-shape={shape}
    >
      {arrow ? (
        <RACOverlayArrow className="klyp-Tooltip__arrow">
          {/* Two-shape SVG: a filled polygon for the body, plus a polyline*/}
          {/* for the border that traces only the two slanted sides (NOT*/}
          {/* the top edge). This is the standard Radix arrow trick — it*/}
          {/* prevents the body border from showing as a seam above the*/}
          {/* arrow tip while still rendering a continuous outline from*/}
          {/* tooltip body down to the arrow point.*/}
          <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden="true">
            <polygon className="klyp-Tooltip__arrow-fill" points="0,0 5,5 10,0" />
            <polyline className="klyp-Tooltip__arrow-stroke" points="0,0 5,5 10,0" />
          </svg>
        </RACOverlayArrow>
      ) : null}
      {IconComp ? (
        <span className="klyp-Tooltip__icon" aria-hidden="true">
          <IconComp focusable={false} />
        </span>
      ) : null}
      {children}
    </RACTooltip>
  )
}
