/**
 * PromptField context — extracted into its own module so the lazily-loaded
 * `RichTextarea` (TipTap) can consume it WITHOUT a circular import back into
 * `PromptField.tsx` (which lazy-imports RichTextarea). Both files import the
 * context from here; neither imports the other at module-eval time.
 */

import { createContext, useContext } from 'react'
import type { PromptFieldAttachment } from './PromptField.types'

export interface PromptFieldCtx {
  value: string
  setValue: (next: string) => void
  attachments: PromptFieldAttachment[]
  setAttachments: (next: PromptFieldAttachment[]) => void
  removeAttachment: (id: string) => void
  busy: boolean
  canSubmit: boolean
  submit: () => void
  onFiles: (files: File[]) => void
  /** True while a drag-over of files is happening on the field. */
  dragOver: boolean
  /** Set by Textarea when @-mention picker is open — blocks Enter→submit. */
  mentionOpen: boolean
  setMentionOpen: (open: boolean) => void
  /** External stream status — drives Submit glyph swap. */
  status: 'idle' | 'submitting' | 'streaming' | 'error'
  /** Called when Submit is clicked while status='streaming'. */
  onStop?: () => void
}

export const Ctx = createContext<PromptFieldCtx | null>(null)

export function usePromptField(): PromptFieldCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('PromptField sub-component used outside <PromptField>')
  return c
}
