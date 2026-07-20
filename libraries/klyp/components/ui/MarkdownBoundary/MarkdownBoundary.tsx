/**
 * MarkdownBoundary — error boundary + CSS-var shim host for streamdown.
 *
 * Two responsibilities, deliberately bundled (always paired in practice):
 *
 *   1. Error boundary — if a markdown render throws (partial-MD parser bug
 *      mid-stream, e.g. unclosed code fence), render the raw text as <pre>
 *      instead of blanking the whole message. Recovers automatically when
 *      `rawText` changes (e.g. next streamed chunk arrives).
 *
 *   2. CSS-var shim — defines shadcn-style vars (--background / --card /
 *      --primary / --muted / --border / --ring / --radius / etc.) mapped
 *      to Klyp DTCG tokens. Streamdown's bundled chrome reads these
 *      shadcn names; the shim makes them resolve to OUR tokens, scoped
 *      to this subtree. NOT global — gold doesn't leak elsewhere.
 *
 * Single-accent rule: --primary maps to fg-default (NOT gold). Gold goes
 * on --ring (focus-visible only, max one at a time).
 */

import './MarkdownBoundary.scss'

import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface MarkdownBoundaryProps {
  children: ReactNode
  /** Optional fallback override. Default: <pre>{rawText}</pre>. */
  fallback?: (error: Error) => ReactNode
  /** Raw text used by the default fallback. Pass the original markdown string. */
  rawText?: string
  /** Optional callback fired when a markdown render throws — for logging to an
   *  analytics / error tracker (Sentry etc.). The built-in `console.warn`
   *  diagnostic still fires regardless. */
  onError?: (error: Error, info: ErrorInfo) => void
  className?: string
}

interface State {
  error: Error | null
}

export class MarkdownBoundary extends Component<MarkdownBoundaryProps, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console -- diagnostic
      console.warn('[MarkdownBoundary] markdown render failed:', error, info)
    }
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prev: MarkdownBoundaryProps) {
    if (this.state.error && prev.rawText !== this.props.rawText) {
      this.setState({ error: null })
    }
  }

  render() {
    const { children, fallback, rawText, className } = this.props
    if (this.state.error) {
      if (fallback) return fallback(this.state.error)
      return (
        <div
          className="klyp-MarkdownBoundary klyp-MarkdownBoundary--fallback"
          role="article"
          data-state="fallback"
        >
          <pre className="klyp-MarkdownBoundary__raw">{rawText ?? ''}</pre>
        </div>
      )
    }
    return (
      <div
        role="article"
        className={['klyp-MarkdownBoundary', className].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    )
  }
}

export default MarkdownBoundary
