import './PromptIntentToolbar.scss'

import type { ComponentProps, ReactNode } from 'react'

// =====================================================================
// PromptIntentToolbar — Klyp brand molecule (Phase 3 of Tailwind → SCSS migration)
// =====================================================================
//
// Toolbar above the prompt editor that switches the intent of the next typed
// fragment — Action / Dialogue / Description — and exposes the `@`-insert
// shortcut. Trailing slot shows the character counter (or any caller-supplied
// meta) right-aligned, mono.
//
// Pure presentation: parent owns the active intent, the click handlers, and
// the counter formatting. Adaptive: wraps onto a second row if the counter
// doesn't fit. Container-query agnostic — uses `flex-wrap`.
//
// Migration note (Phase 3): Tailwind classes + cn() were dropped. Visual
// state lives in PromptIntentToolbar.scss; active button uses `data-active`.
// Pattern reference: ../Chip/Chip.tsx

export type PromptIntent = 'action' | 'dialogue' | 'description'

const INTENT_LABEL: Record<PromptIntent, string> = {
  action: 'Action',
  dialogue: 'Dialogue',
  description: 'Description',
}

const INTENTS: PromptIntent[] = ['action', 'dialogue', 'description']

type PromptIntentToolbarProps = Omit<ComponentProps<'div'>, 'onSelect'> & {
  /** Active intent. When undefined, no button is highlighted. */
  intent?: PromptIntent
  onIntentChange?: (intent: PromptIntent) => void
  /** Called when the user clicks the `@ insert` shortcut. */
  onMentionInsert?: () => void
  /** Right-aligned trailing slot. Typical: counter `142 / 2000`. */
  trailing?: ReactNode
}

export function PromptIntentToolbar({
  intent,
  onIntentChange,
  onMentionInsert,
  trailing,
  className,
  ...props
}: PromptIntentToolbarProps) {
  return (
    <div
      data-slot="prompt-intent-toolbar"
      className={
        typeof className === 'string'
          ? `klyp-PromptIntentToolbar ${className}`
          : 'klyp-PromptIntentToolbar'
      }
      {...props}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: <fieldset> would inject legend semantics + form-group styles we don't want for a non-form button row. role=group is the documented WAI-ARIA pattern for a labeled toolbar group. */}
      <div role="group" aria-label="Insert intent" className="klyp-PromptIntentToolbar__group">
        {INTENTS.map((id) => {
          const active = id === intent
          return (
            <button
              key={id}
              type="button"
              data-active={active || undefined}
              aria-pressed={active ? 'true' : 'false'}
              onClick={() => onIntentChange?.(id)}
              className="klyp-PromptIntentToolbar__intent"
            >
              {INTENT_LABEL[id]}
            </button>
          )
        })}
      </div>

      <span aria-hidden className="klyp-PromptIntentToolbar__divider" />

      <button type="button" onClick={onMentionInsert} className="klyp-PromptIntentToolbar__mention">
        <span className="klyp-PromptIntentToolbar__mentionSymbol">@</span> insert
      </button>

      {trailing && <span className="klyp-PromptIntentToolbar__trailing">{trailing}</span>}
    </div>
  )
}
