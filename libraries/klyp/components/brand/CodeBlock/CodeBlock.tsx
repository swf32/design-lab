/**
 * CodeBlock — branded chrome wrapping fenced code (rendered by streamdown's
 * Shiki plugin in Phase 3). Header layout: lang badge LEFT, optional
 * filename, action rail RIGHT (wrap toggle + copy + optional to-prompt).
 *
 * Adaptive: at <320px container width, filename + wrap toggle hide so the
 * essential `[lang][copy][to-prompt]` row survives.
 *
 * Streaming-aware: when `streaming` is true, hide the to-prompt button
 * (action only safe once the fence is complete). The wrap toggle stays
 * visible because layout doesn't change.
 */

import './CodeBlock.scss'

import { CheckOutline, CopyOutline, MagicStarOutline, WrapOutline } from '@klyp/icons/outline'
import { ToolButton } from '@klyp/ui/ToolButton'
import { Toolbar } from '@klyp/ui/Toolbar'
import { type ReactNode, useEffect, useRef, useState } from 'react'

export interface CodeBlockProps {
  /** Programming language slug (lowercase, e.g. 'tsx', 'python'). Optional. */
  language?: string
  /** Optional filename hint shown next to the lang badge. */
  filename?: string
  /** Raw source code — used by Copy + To-prompt. The visual body is the
   *  `children` (e.g. Shiki-highlighted spans from streamdown). */
  source: string
  /** Children rendered inside <pre>. Typically Shiki HTML output. */
  children: ReactNode
  /** True while the surrounding stream is mid-flight (incomplete fence).
   *  Hides To-prompt; copy stays. */
  streaming?: boolean
  /** Called when user clicks "Use as prompt". Optional — if omitted, the
   *  to-prompt button is not rendered. */
  onToPrompt?: (source: string, language?: string) => void
  className?: string
}

export function CodeBlock({
  language,
  filename,
  source,
  children,
  streaming = false,
  onToPrompt,
  className,
}: CodeBlockProps) {
  const [wrap, setWrap] = useState(false)
  const [overflow, setOverflow] = useState(false)
  // Body is a <div>, not a <pre>, because Shiki injects its own <pre> as the
  // child — `<pre>` cannot legally nest another `<pre>` (pre accepts only
  // phrasing content; pre is flow). The visual `pre`-like behaviour
  // (whitespace + monospace) lives in CSS on the wrapper.
  const bodyRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLElement>(null)

  // Detect horizontal overflow to gate the wrap toggle visibility.
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setOverflow(el.scrollWidth > el.clientWidth)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <figure
      ref={rootRef}
      data-streaming={streaming ? '' : undefined}
      data-wrap={wrap ? '' : undefined}
      data-overflow={overflow ? '' : undefined}
      className={['klyp-CodeBlock', className].filter(Boolean).join(' ')}
    >
      <header className="klyp-CodeBlock__header">
        {language ? <span className="klyp-CodeBlock__lang">{language}</span> : null}
        {filename ? <code className="klyp-CodeBlock__filename">{filename}</code> : null}
        <span className="klyp-CodeBlock__spacer" aria-hidden />
        <Toolbar aria-label="Code block actions" className="klyp-CodeBlock__actions">
          {overflow ? (
            <ToolButton
              icon={WrapOutline}
              label={wrap ? 'Disable wrap' : 'Enable wrap'}
              onPress={() => setWrap((w) => !w)}
              data-active={wrap ? '' : undefined}
              className="klyp-CodeBlock__wrapToggle"
            />
          ) : null}
          <ToolButton
            icon={CopyOutline}
            confirmIcon={CheckOutline}
            label="Copy code"
            confirmLabel="Copied"
            onPress={() => navigator.clipboard.writeText(source)}
          />
          {onToPrompt && !streaming ? (
            <ToolButton
              icon={MagicStarOutline}
              label="Use as prompt"
              onPress={() => onToPrompt(source, language)}
            />
          ) : null}
        </Toolbar>
      </header>
      <div ref={bodyRef} className="klyp-CodeBlock__body">
        {children}
      </div>
    </figure>
  )
}

export default CodeBlock
