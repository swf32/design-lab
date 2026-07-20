/**
 * useAssetAttachments — local state hook for managing AssetAttachment[] in
 * a Klyp PromptInput instance. Uncontrolled pattern (per principle §1).
 *
 * Operations:
 *   - add(att) — append, dedup by id
 *   - remove(id) — remove by id
 *   - clear() — reset to []
 *   - reorder(fromId, toId) — move within array
 *
 * Returns stable callbacks via useCallback.
 */

import { useCallback, useState } from 'react'
import type { AssetAttachment } from './types'

export type UseAssetAttachmentsReturn = {
  items: AssetAttachment[]
  add: (att: AssetAttachment) => void
  remove: (id: string) => void
  clear: () => void
  reorder: (fromId: string, toId: string) => void
  setItems: React.Dispatch<React.SetStateAction<AssetAttachment[]>>
}

export function useAssetAttachments(initial: AssetAttachment[] = []): UseAssetAttachmentsReturn {
  const [items, setItems] = useState<AssetAttachment[]>(initial)

  const add = useCallback((att: AssetAttachment) => {
    setItems((prev) => (prev.find((a) => a.id === att.id) ? prev : [...prev, att]))
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const reorder = useCallback((fromId: string, toId: string) => {
    setItems((prev) => {
      const fromIdx = prev.findIndex((a) => a.id === fromId)
      const toIdx = prev.findIndex((a) => a.id === toId)
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      if (moved) next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  return { items, add, remove, clear, reorder, setItems }
}
