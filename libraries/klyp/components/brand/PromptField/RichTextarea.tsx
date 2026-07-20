/**
 * `RichTextarea` — the TipTap-backed alternative to `<PromptField.Textarea>`'s
 * plain `<textarea>`, used when the consumer opts into inline `@`-mention PILLS
 * (`<PromptField.Textarea mentions />`). Lazily loaded by PromptField so the
 * TipTap runtime only ships to surfaces that ask for it.
 *
 * Contract parity with the legacy textarea (so nothing else in the composer
 * changes): it is a CONTROLLED plain-string field. The doc is the live source
 * of truth; on every edit it serialises to a string (`editor.getText`, with
 * mention nodes rendered as `@label` — same token the model saw before) and
 * pushes it up via the context `setValue`. External string changes (clear
 * after submit, to-prompt prefill, dictation append) flow back in and rebuild
 * the doc — those arrive as plain text, so a prefill never resurrects pills
 * (only the picker creates them), which is the intended behaviour.
 *
 * Mentions: the editor forwards the active `@`-query and the insert command to
 * the consumer via `onMentionQueryChange` / `onMentionCommand`; the consumer
 * renders its own `<MentionPicker>` and calls the command with the picked item.
 */

import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useMemo, useRef } from 'react'
import type { PromptMentionInsert, PromptMentionItem } from './PromptField.types'
import { usePromptField } from './prompt-field-context'
import { buildPromptMention, type PromptMentionBridge } from './prompt-mention'

export interface RichTextareaProps {
  placeholder: string
  ariaLabel: string
  minRows?: number
  maxRows?: number
  onMentionQueryChange?: (query: string | null) => void
  mentionPickerOpen?: boolean
  /** Receives the active insert command (or `null`) so the consumer's picker
   *  can turn the typed `@query` into a pill. */
  onMentionCommand?: (insert: PromptMentionInsert) => void
  className?: string
  id?: string
}

/** Build a ProseMirror doc from a plain string — one paragraph per `\n`. */
function textToDoc(text: string) {
  const lines = text.split('\n')
  const content = lines.map((line) =>
    line.length > 0
      ? { type: 'paragraph', content: [{ type: 'text', text: line }] }
      : { type: 'paragraph' },
  )
  return { type: 'doc', content: content.length > 0 ? content : [{ type: 'paragraph' }] }
}

const LINE_HEIGHT = 1.5

export function RichTextarea({
  placeholder,
  ariaLabel,
  minRows = 1,
  maxRows = 8,
  onMentionQueryChange,
  mentionPickerOpen = false,
  onMentionCommand,
  className,
  id,
}: RichTextareaProps) {
  const { value, setValue, submit, setMentionOpen } = usePromptField()

  // Callbacks reached through refs so the editor (and its extensions) are built
  // exactly once — a changing bridge would rebuild the whole editor and lose
  // focus / selection on every parent render.
  const submitRef = useRef(submit)
  submitRef.current = submit
  const onQueryRef = useRef(onMentionQueryChange)
  onQueryRef.current = onMentionQueryChange
  const onCommandRef = useRef(onMentionCommand)
  onCommandRef.current = onMentionCommand
  const setValueRef = useRef(setValue)
  setValueRef.current = setValue

  // Last string WE emitted upward — guards the value→editor sync so our own
  // keystrokes don't round-trip back in and nuke the selection.
  const lastEmittedRef = useRef(value)
  // Suggestion active? Driven by the same lifecycle that opens the picker, so
  // it's always in sync — the Enter/Arrow keys defer to the suggestion plugin
  // (and the picker's window listener) while a query is live.
  const suggestionActiveRef = useRef(false)

  const bridge = useMemo<PromptMentionBridge>(
    () => ({
      onQueryChange: (q) => {
        suggestionActiveRef.current = q !== null
        onQueryRef.current?.(q)
      },
      setActiveCommand: (cmd) => {
        const insert: PromptMentionInsert = cmd ? (item: PromptMentionItem) => cmd(item) : null
        onCommandRef.current?.(insert)
      },
    }),
    [],
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Plain prompt surface — no block/mark formatting or markdown input
        // rules (typing "# " / "- " must NOT become a heading / list here).
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        bold: false,
        italic: false,
        strike: false,
        code: false,
      }),
      Placeholder.configure({ placeholder }),
      buildPromptMention(bridge),
    ],
    content: textToDoc(value),
    editorProps: {
      attributes: {
        // Keeps the container's focus handoff working — the chat queries
        // `[data-slot="prompt-field-textarea"]` to focus after a starter pick.
        'data-slot': 'prompt-field-textarea',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': ariaLabel,
        class: 'klyp-PromptField__editorContent',
        ...(id ? { id } : {}),
      },
      handleKeyDown: (_view, event) => {
        // While a mention query is live, Enter/Arrows/Tab belong to the picker
        // (handled by the suggestion plugin + its window listener) — defer.
        if (suggestionActiveRef.current) return false
        if (event.key !== 'Enter' || event.isComposing) return false
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault()
          submitRef.current()
          return true
        }
        if (event.shiftKey) return false // newline
        // Touch keyboards give no Shift+Enter — leave plain Enter as newline,
        // submit only via the button (parity with the legacy textarea).
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
          return false
        }
        event.preventDefault()
        submitRef.current()
        return true
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText({ blockSeparator: '\n' })
      lastEmittedRef.current = text
      setValueRef.current(text)
    },
  })

  // Block Enter→submit at the context level too (mirrors the legacy Textarea's
  // mentionOpen flag) and let the picker's Esc close reach the field.
  useEffect(() => {
    setMentionOpen(mentionPickerOpen)
  }, [mentionPickerOpen, setMentionOpen])

  // External string → editor. Only when it differs from what we last emitted
  // (i.e. a genuine programmatic change: clear-after-submit, prefill,
  // dictation append) — never on our own keystroke echo.
  useEffect(() => {
    if (!editor) return
    if (value === lastEmittedRef.current) return
    editor.commands.setContent(textToDoc(value), { emitUpdate: false })
    lastEmittedRef.current = value
    if (value.length > 0 && editor.isFocused) {
      editor.commands.focus('end')
    }
  }, [editor, value])

  // Serialisation renders mentions as `@label`; when the editor unmounts we
  // don't need to flush — the parent already holds the latest string.
  const rootClass = useMemo(
    () => ['klyp-PromptField__editor', className].filter(Boolean).join(' '),
    [className],
  )

  // Computed (not literal) — min/max height track the row caps like the
  // textarea's JS autoResize, with the browser growing the field in between.
  const style = useMemo(
    () => ({
      minHeight: `calc(1em * ${LINE_HEIGHT} * ${minRows})`,
      maxHeight: `calc(1em * ${LINE_HEIGHT} * ${maxRows})`,
    }),
    [minRows, maxRows],
  )

  return <EditorContent editor={editor} className={rootClass} style={style} />
}

export default RichTextarea
