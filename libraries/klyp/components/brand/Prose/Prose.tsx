/**
 * Prose — long-form reading-column typography for rendered Markdown / rich text.
 *
 * Lifted out of the academy article route (`.klyp-route-Article__prose`) into a
 * reusable, library-grade `@klyp/brand` molecule. It owns the reading recipe —
 * 18px body at 1.55 line-height, a full heading scale on tight leading,
 * blockquote, table, inline code, image, hr, and `em → medium weight` (Klyp
 * canon forbids italic) — and wraps everything in `@klyp/ui`'s
 * `MarkdownBoundary` (error boundary + shadcn→Klyp CSS-var shim).
 *
 * Engine-agnostic by design. The Markdown→React engine (Streamdown + Shiki +
 * the branded `<CodeBlock>`) lives in the app layer, where `streamdown` / `shiki`
 * are dependencies — NOT in this package. Consumers inject the rendered tree via
 * the `render(content)` slot, or pass it directly as `children`:
 *
 *   // app side (has streamdown + shiki):
 *   <Prose content={md} render={(c) => <Streamdown components={...}>{c}</Streamdown>} />
 *
 *   // or pre-rendered children:
 *   <Prose content={md}>{renderedNode}</Prose>
 *
 * `content` is always the raw Markdown string — it feeds `MarkdownBoundary`'s
 * fallback (renders raw text if the engine throws mid-stream) and is passed to
 * `render`. Router-agnostic, brand-agnostic: no @tanstack/react-router, no
 * @/lib/brand. Brand-specific knobs (e.g. Shiki theme) are the consumer's job.
 *
 * ── Required class-name contract for links + fenced code ──────────────────
 * Most prose styling (headings, body, lists, blockquote, table, inline code,
 * images, hr, em→medium) targets the plain semantic tags your renderer emits
 * and needs NO classes. But three rules style nothing Prose renders itself —
 * they only apply if YOUR renderer tags its nodes with these EXACT classes:
 *
 *   • `<a>`              → className="klyp-Prose__link"          (accent + underline)
 *   • highlighted block  → className="klyp-Prose__shiki"         (Shiki <pre> wrapper)
 *   • <pre> fallback     → className="klyp-Prose__shikiFallback" (un-highlighted code)
 *
 * If you port an older renderer (the academy one emitted
 * `klyp-route-Article__link` / `__shiki` / `__shikiFallback`), re-class those
 * nodes to `klyp-Prose__*` or links and code blocks render UNSTYLED with no
 * error. A copy-paste reference renderer lives in `Prose.stories.tsx`
 * (`PROSE_MD_COMPONENTS`) — start from there to keep visual parity.
 */

import './Prose.scss'

import { MarkdownBoundary } from '@klyp/ui'
import type { ReactNode } from 'react'

export type ProseSize = 'comfortable' | 'compact'

export interface ProseProps {
  /** Raw Markdown source. Feeds the MarkdownBoundary fallback and `render`. */
  content?: string
  /** Engine slot — receives `content`, returns the rendered React tree.
   *  Inject your Streamdown / Shiki / CodeBlock renderer here. If omitted,
   *  `children` is rendered instead.
   *
   *  Class-name contract — for Prose styling to land, your renderer MUST apply:
   *    • `klyp-Prose__link`          on every `<a>`
   *    • `klyp-Prose__shiki`         on the Shiki-highlighted block wrapper
   *    • `klyp-Prose__shikiFallback` on the `<pre>` fallback (un-highlighted code)
   *  Everything else (headings, lists, blockquote, table, inline code, img, hr,
   *  em) styles bare tags and needs no classes. See `PROSE_MD_COMPONENTS` in
   *  `Prose.stories.tsx` for a copy-paste reference renderer. */
  render?: (content: string) => ReactNode
  /** Pre-rendered Markdown tree. Used when `render` is not supplied. */
  children?: ReactNode
  /** Reading density. `comfortable` (default) = 18px article body;
   *  `compact` = 16px for denser surfaces (panels, previews). */
  size?: ProseSize
  /** Forwarded to MarkdownBoundary's default raw-text `<pre>` fallback.
   *  Defaults to `content`. */
  rawText?: string
  className?: string
  ref?: React.Ref<HTMLDivElement>
}

/**
 * Renders the engine output BELOW the MarkdownBoundary. Kept as a child
 * component (not an inline `render(content)` in Prose's body) on purpose: if the
 * injected engine throws — a partial-Markdown parser bug mid-stream, an unclosed
 * code fence — the throw now originates inside the boundary's subtree, so
 * MarkdownBoundary catches it and falls back to raw text. Computing `body` in
 * Prose's own body (the previous shape) threw ABOVE the not-yet-mounted
 * boundary, so the boundary never got the chance and the whole message blanked.
 */
function ProseBody({
  render,
  content,
  children,
}: Pick<ProseProps, 'render' | 'content' | 'children'>) {
  return <>{render ? render(content ?? '') : children}</>
}

export function Prose({
  content = '',
  render,
  children,
  size = 'comfortable',
  rawText,
  className,
  ref,
}: ProseProps) {
  return (
    <div ref={ref} data-size={size} className={['klyp-Prose', className].filter(Boolean).join(' ')}>
      <MarkdownBoundary rawText={rawText ?? content} className="klyp-Prose__boundary">
        <ProseBody render={render} content={content}>
          {children}
        </ProseBody>
      </MarkdownBoundary>
    </div>
  )
}

export default Prose
