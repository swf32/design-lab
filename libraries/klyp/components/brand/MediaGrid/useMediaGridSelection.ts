import { useCallback, useMemo, useRef, useState } from 'react'

export type MediaGridSelectionModifiers = {
  meta?: boolean
  shift?: boolean
}

export type MediaGridSelectionApi = {
  /** Current selection set — readonly view, never mutate. */
  selectedIds: ReadonlySet<string>
  /** Convenience boolean — true when >= 1 item selected. Drives selectionMode UI. */
  hasSelection: boolean
  /** Total count — direct read of `selectedIds.size`. */
  count: number
  /** Predicate for an item. */
  isSelected: (id: string) => boolean
  /**
   * Toggle / range / replace based on modifiers.
   * - no modifier OR meta/ctrl → toggle just this id
   * - shift → range from last-clicked anchor to this id
   * Range semantics: items between anchor and target (inclusive) are added —
   * we don't deselect outside the range (Magnific behaviour, not Finder's).
   */
  handleItemClick: (id: string, modifiers?: MediaGridSelectionModifiers) => void
  /** Imperative: clear everything. */
  clear: () => void
  /** Imperative: select-all helper (e.g. wired to Cmd-A). */
  selectAll: (ids: string[]) => void
  /** Direct set — for external sync (URL params, store hydration). */
  setSelectedIds: (next: Set<string>) => void
}

export type UseMediaGridSelectionOptions = {
  /** Ordered list of all item ids — required for shift-range to know which items lie between anchor and target. */
  orderedIds: readonly string[]
  /** Optional controlled mode — external state owner (e.g. Zustand store). When omitted, hook owns internal state. */
  value?: ReadonlySet<string>
  /** Called when selection changes. Receives a fresh Set. */
  onChange?: (next: Set<string>) => void
}

/**
 * Selection state machine for `<MediaGrid>`.
 *
 * Click semantics mirror Magnific:
 * - plain click → toggle single item (and become the new range anchor)
 * - meta/ctrl click → toggle single item (same as plain — Magnific doesn't
 *   distinguish; we keep the modifier for future "open without selecting"
 *   intent)
 * - shift click → range from anchor to target, inclusive, additive
 *
 * Anchor: the id last single-clicked. Re-set on any non-shift click. Cleared
 * when selection becomes empty.
 */
export function useMediaGridSelection(
  options: UseMediaGridSelectionOptions,
): MediaGridSelectionApi {
  const { orderedIds, value, onChange } = options
  const [internal, setInternal] = useState<Set<string>>(() => new Set<string>())
  const selectedIds: ReadonlySet<string> = value ?? internal

  const anchorRef = useRef<string | null>(null)

  const commit = useCallback(
    (next: Set<string>) => {
      if (next.size === 0) anchorRef.current = null
      if (value === undefined) setInternal(next)
      onChange?.(next)
    },
    [value, onChange],
  )

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])

  const handleItemClick = useCallback(
    (id: string, modifiers?: MediaGridSelectionModifiers) => {
      const isShift = Boolean(modifiers?.shift)

      if (isShift && anchorRef.current && anchorRef.current !== id) {
        const anchorIdx = orderedIds.indexOf(anchorRef.current)
        const targetIdx = orderedIds.indexOf(id)
        if (anchorIdx >= 0 && targetIdx >= 0) {
          const [from, to] =
            anchorIdx <= targetIdx ? [anchorIdx, targetIdx] : [targetIdx, anchorIdx]
          const next = new Set(selectedIds)
          for (let i = from; i <= to; i++) next.add(orderedIds[i] as string)
          commit(next)
          return
        }
      }

      // Plain or meta click → toggle
      const next = new Set(selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      anchorRef.current = id
      commit(next)
    },
    [orderedIds, selectedIds, commit],
  )

  const clear = useCallback(() => {
    commit(new Set())
  }, [commit])

  const selectAll = useCallback(
    (ids: string[]) => {
      commit(new Set(ids))
    },
    [commit],
  )

  const setSelectedIds = useCallback(
    (next: Set<string>) => {
      commit(next)
    },
    [commit],
  )

  return useMemo<MediaGridSelectionApi>(
    () => ({
      selectedIds,
      hasSelection: selectedIds.size > 0,
      count: selectedIds.size,
      isSelected,
      handleItemClick,
      clear,
      selectAll,
      setSelectedIds,
    }),
    [selectedIds, isSelected, handleItemClick, clear, selectAll, setSelectedIds],
  )
}
