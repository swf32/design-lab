import './CompiledPromptCard.scss'

import type { ComponentProps, ReactNode } from 'react'
import { CostFooter } from '../CostFooter'

/**
 * "Final prompt" preview card — what the model actually receives after
 * `@`-pills are resolved into character DNA / location refs / system
 * directives. Header (eyebrow + meta + action slot), mono body slot, footer
 * with token count + cost estimate.
 *
 * Body is the caller's responsibility — pass a `<pre>`, syntax-highlighted
 * span tree, or any node. Use `collapsed` to hide the body without
 * unmounting (parent persists the toggle state).
 *
 * Phase 3 SCSS migration: Tailwind classes removed, BEM `klyp-CompiledPromptCard`.
 * All values via Klyp DTCG tokens — no magic numbers, no Tailwind, no cn().
 */
type CompiledPromptCardProps = Omit<ComponentProps<'section'>, 'children' | 'title'> & {
  /** Default: "Final prompt". */
  title?: ReactNode
  /** Sub-line under the title in the header. */
  subtitle?: ReactNode
  /** Right-aligned slot in the header — typically Copy / Diff / Collapse buttons. */
  actions?: ReactNode
  /** Mono body — compiled prompt. Pass `<pre>` / spans / anything. */
  children?: ReactNode
  /** Hide the body (header + footer stay visible). Parent owns the toggle. */
  collapsed?: boolean
  /** Compiled-token count for footer ("compiled · 847 tokens · v4"). */
  tokens?: number
  /** Version label appended after token count. */
  version?: string
  /** Generation cost — passed through to `<CostFooter>`. */
  cost?: string
  /** Generation duration in seconds — passed through to `<CostFooter>`. */
  durationSec?: number
}

export function CompiledPromptCard({
  title = 'Final prompt',
  subtitle,
  actions,
  children,
  collapsed,
  tokens,
  version,
  cost,
  durationSec,
  className,
  ...props
}: CompiledPromptCardProps) {
  const showFooter = tokens != null || version || cost || durationSec != null
  const composedClassName =
    typeof className === 'string' && className.length > 0
      ? `klyp-CompiledPromptCard ${className}`
      : 'klyp-CompiledPromptCard'

  return (
    <section data-slot="compiled-prompt-card" className={composedClassName} {...props}>
      <header className="klyp-CompiledPromptCard__header">
        <span className="klyp-CompiledPromptCard__title">{title}</span>
        {subtitle && <span className="klyp-CompiledPromptCard__subtitle">{subtitle}</span>}
        {actions && <div className="klyp-CompiledPromptCard__actions">{actions}</div>}
      </header>

      {!collapsed && children && <div className="klyp-CompiledPromptCard__body">{children}</div>}

      {showFooter && (
        <footer className="klyp-CompiledPromptCard__footer">
          <span className="klyp-CompiledPromptCard__meta">
            {tokens != null && (
              <>
                compiled ·{' '}
                <span className="klyp-CompiledPromptCard__tokens">{tokens.toLocaleString()}</span>{' '}
                tokens
              </>
            )}
            {tokens != null && version && ' · '}
            {version && <span className="klyp-CompiledPromptCard__version">{version}</span>}
          </span>
          {(cost || durationSec != null) && (
            <CostFooter
              cost={cost ?? ''}
              durationSec={durationSec ?? 0}
              align="right"
              className="klyp-CompiledPromptCard__cost"
            />
          )}
        </footer>
      )}
    </section>
  )
}
