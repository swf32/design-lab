/**
 * Story-layout — token-driven showcase primitives for `*.stories.tsx`.
 *
 * Replaces the ad-hoc `style={{ display:'flex', gap:24, ... }}` literal objects
 * that every story file used to hand-roll (a `components.md` / `styles.md`
 * violation: inline-style literals + raw px). Stories compose these instead, so
 * the showcase scaffolding stays token-driven and consistent.
 *
 * Catalog/dev-only — never shipped to consumers. Mirrors the per-package
 * `__shared/stories-types.ts` split (one copy in @klyp/ui, one in @klyp/brand)
 * so neither package reaches across the boundary for a dev helper.
 *
 *   <StoryStack gap="2xl">         vertical column (rows of variants)
 *   <StoryRow gap="lg">            horizontal cluster, wraps
 *   <StoryCell label="assistant">  labelled cell (caption + content)
 *   <StoryFrame width={280}>       width-bounded dashed frame (adaptive demos)
 *
 * `fill` (StoryStack + StoryCell) — opt-in for FULL-WIDTH content (a Prose
 * reading column). By default cells shrink-wrap (right for toolbars / chips);
 * a `container-type: inline-size` child (Prose) has no intrinsic width, so a
 * shrink-wrap parent collapses it. `fill` makes the stack span the stage and
 * stretch its cells so the child gets a definite width to resolve against.
 */

import './story-layout.scss'

import type { CSSProperties, ReactNode } from 'react'

export type StoryGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface StoryStackProps {
  children: ReactNode
  /** Token gap: xs 6 · sm 12 · md 16 · lg 24 · xl 32 · 2xl 48. Default md. */
  gap?: StoryGap
  /** Span the stage + stretch cells — for full-width content (a Prose column). */
  fill?: boolean
}

export function StoryStack({ children, gap = 'md', fill }: StoryStackProps) {
  return (
    <div className="klyp-story-stack" data-gap={gap} data-fill={fill ? '' : undefined}>
      {children}
    </div>
  )
}

export interface StoryRowProps {
  children: ReactNode
  /** Token gap (see StoryStack). Default lg. */
  gap?: StoryGap
}

export function StoryRow({ children, gap = 'lg' }: StoryRowProps) {
  return (
    <div className="klyp-story-row" data-gap={gap}>
      {children}
    </div>
  )
}

export interface StoryCellProps {
  /** Optional caption above the content (variant / state name). */
  label?: ReactNode
  children: ReactNode
  /** Stretch the content to the cell width — pair with `<StoryStack fill>`. */
  fill?: boolean
}

export function StoryCell({ label, children, fill }: StoryCellProps) {
  return (
    <div className="klyp-story-cell" data-fill={fill ? '' : undefined}>
      {label != null ? <span className="klyp-story-cell__label">{label}</span> : null}
      {children}
    </div>
  )
}

export interface StoryFrameProps {
  /** Exact pixel width of the frame (adaptive 280 / 600 / 1200 demos). Passed as
   *  a CSS custom property — dynamic data, not a literal style. */
  width: number
  children: ReactNode
}

export function StoryFrame({ width, children }: StoryFrameProps) {
  return (
    <div
      className="klyp-story-frame"
      style={{ '--klyp-story-frame-w': `${width}px` } as CSSProperties}
    >
      {children}
    </div>
  )
}
