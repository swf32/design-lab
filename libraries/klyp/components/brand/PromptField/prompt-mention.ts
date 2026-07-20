/**
 * TipTap Mention extension for the rich `<PromptField>` input — the inline
 * `@`-mention PILL (thumbnail + kind-tinted label) that replaces the plain
 * `@Name` text of the legacy textarea.
 *
 * Deliberately a BRAND-LOCAL copy of the pattern the script-editor uses
 * (`apps/web/src/features/script-editor/extensions/mention-extension.ts`) —
 * `@klyp/brand` (tier 3) may not import app/feature code (tier 5), so the two
 * can't share a module yet. Differences from the script-editor variant:
 *
 *   - the pill renders WITHOUT the leading `@` (design ask — the `@` is the
 *     trigger, not part of the chip), but `renderText` still emits `@label`
 *     so the serialised prompt the model receives keeps mention parity with
 *     the old textarea behaviour;
 *   - Backspace immediately after a pill turns it BACK into editable `@label`
 *     text (and the suggestion re-fires, reopening the picker) instead of
 *     deleting the whole node — the design ask's "поставил курсор справа,
 *     стёр — снова обычный текст, снова выбор".
 *
 * The popup itself is NOT rendered here: the consumer owns a `<MentionPicker>`
 * and drives it from the `bridge` callbacks (query + active command), exactly
 * like the script editor. Keeps popup styling single-source and avoids a
 * tippy.js dependency.
 */

import { mergeAttributes, type Range } from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import type { Editor } from '@tiptap/react'
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion'
import type { PromptMentionItem } from './PromptField.types'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Defense-in-depth URL guard for the pill `thumbnail` attr. `<img src>` does
 * not execute `javascript:` in modern browsers, but pasted HTML could plant a
 * hostile `data-thumb` that later flows into another sink — restrict to
 * `http(s):` and `data:image/` at the parse/render boundary. Mirrors the
 * script-editor guard.
 */
function isSafeImageUrl(value: string): boolean {
  if (value.startsWith('data:')) {
    return /^data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(value)
  }
  try {
    const u = new URL(value, window.location.origin)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/** What the consumer supplies to drive the picker from the editor's suggestion
 *  lifecycle. */
export interface PromptMentionBridge {
  /** Called when the user types after `@`. `null` = picker should close. */
  onQueryChange: (query: string | null) => void
  /** Relays the active insert command (+ its trigger range) to the parent so
   *  the picker's onPick can insert a pill. `null` on exit. */
  setActiveCommand: (
    command: ((item: PromptMentionItem) => void) | null,
    range: Range | null,
  ) => void
}

/** Build the Mention extension instance bound to a bridge. */
export function buildPromptMention(bridge: PromptMentionBridge) {
  const suggestion: Omit<SuggestionOptions<PromptMentionItem>, 'editor'> = {
    char: '@',
    allowSpaces: false,
    // The parent owns filtering (via its own suggestions query) and renders the
    // popover — items() stays empty; inserts happen through command().
    items: () => [],

    // Fired when the popover invokes its command — delete the typed `@query`
    // range and insert a `mention` node followed by a trailing space.
    command: ({ editor, range, props }) => {
      const item = props as PromptMentionItem
      ;(editor as Editor)
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: 'mention',
            attrs: {
              id: item.id,
              label: item.label,
              kind: item.kind,
              thumbnail: item.thumbnail ?? null,
            },
          },
          { type: 'text', text: ' ' },
        ])
        .run()
    },

    render: () => ({
      onStart: (props: SuggestionProps<PromptMentionItem>) => {
        bridge.onQueryChange(props.query)
        bridge.setActiveCommand((item) => props.command(item), props.range)
      },
      onUpdate: (props: SuggestionProps<PromptMentionItem>) => {
        bridge.onQueryChange(props.query)
        bridge.setActiveCommand((item) => props.command(item), props.range)
      },
      onKeyDown: (props: { event: KeyboardEvent }) => {
        // Nav / activation keys belong to the popover (which listens on
        // `window`). Returning `true` tells ProseMirror "handled" — it skips
        // its keymap (no newline / caret move) AND preventDefaults, while the
        // event still bubbles to `window` for the picker. Esc also closes.
        const k = props.event.key
        if (k === 'Escape') {
          bridge.onQueryChange(null)
          return true
        }
        return k === 'ArrowUp' || k === 'ArrowDown' || k === 'Enter' || k === 'Tab'
      },
      onExit: () => {
        bridge.onQueryChange(null)
        bridge.setActiveCommand(null, null)
      },
    }),
  }

  return Mention.extend({
    addAttributes() {
      return {
        id: {
          default: null,
          parseHTML: (el: HTMLElement) => el.getAttribute('data-id'),
          renderHTML: (attrs: { id?: string | null }) => (attrs.id ? { 'data-id': attrs.id } : {}),
        },
        label: {
          default: null,
          parseHTML: (el: HTMLElement) => el.getAttribute('data-label'),
          renderHTML: (attrs: { label?: string | null }) =>
            attrs.label ? { 'data-label': attrs.label } : {},
        },
        kind: {
          default: 'character',
          parseHTML: (el: HTMLElement) => el.getAttribute('data-kind') ?? 'character',
          renderHTML: (attrs: { kind?: string }) => ({ 'data-kind': attrs.kind ?? 'character' }),
        },
        thumbnail: {
          default: null,
          parseHTML: (el: HTMLElement) => {
            const v = el.getAttribute('data-thumb')
            return v && isSafeImageUrl(v) ? v : null
          },
          renderHTML: (attrs: { thumbnail?: string | null }) =>
            attrs.thumbnail ? { 'data-thumb': attrs.thumbnail } : {},
        },
      }
    },

    // Backspace immediately after a pill → revert it to editable `@label` text
    // (which re-fires the suggestion → picker reopens), instead of the default
    // whole-node delete. If the char before the cursor isn't a mention, fall
    // through to the default handler.
    addKeyboardShortcuts() {
      return {
        Backspace: () =>
          this.editor.commands.command(({ tr, state }) => {
            const { selection } = state
            if (!selection.empty) return false
            const { $from } = selection
            const before = $from.nodeBefore
            if (!before || before.type.name !== this.name) return false
            const label = (before.attrs.label as string | null) ?? (before.attrs.id as string) ?? ''
            const end = $from.pos
            const start = end - before.nodeSize
            tr.replaceWith(start, end, state.schema.text(`@${label}`))
            return true
          }),
      }
    },
  }).configure({
    HTMLAttributes: {
      class: 'klyp-PromptField__mention',
      'data-mention': 'true',
    },
    // We own Backspace above — don't let the built-in delete the trigger too.
    deleteTriggerWithBackspace: false,
    renderText({ node }) {
      const label = (node.attrs.label as string | null) ?? (node.attrs.id as string | null) ?? ''
      return `@${label}`
    },
    renderHTML({ options, node }) {
      const label = (node.attrs.label as string | null) ?? ''
      const id = (node.attrs.id as string | null) ?? ''
      const kind = (node.attrs.kind as string | undefined) ?? 'character'
      const rawThumb = (node.attrs.thumbnail as string | null) ?? ''
      const thumb = rawThumb && isSafeImageUrl(rawThumb) ? rawThumb : ''

      const wrapperAttrs = mergeAttributes(options.HTMLAttributes, {
        'data-id': id,
        'data-label': label,
        'data-kind': kind,
        ...(thumb ? { 'data-thumb': thumb } : {}),
      })

      // No `@` in the pill (design ask) — just thumbnail (optional) + label.
      if (!thumb) {
        return [
          'span',
          wrapperAttrs,
          ['span', { class: 'klyp-PromptField__mentionLabel' }, label || id],
        ]
      }
      return [
        'span',
        wrapperAttrs,
        [
          'span',
          { class: 'klyp-PromptField__mentionThumb', 'aria-hidden': 'true' },
          ['img', { src: thumb, alt: '', loading: 'lazy', decoding: 'async' }],
        ],
        ['span', { class: 'klyp-PromptField__mentionLabel' }, label || id],
      ]
    },
    suggestion,
  })
}
