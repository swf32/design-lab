/**
 * Conversation-history date grouping — the relative-date bucketing shared by
 * the `ConversationHistory` shell (this package) AND the in-app feature
 * (`apps/web/src/features/chat/`). Single source of truth so the two surfaces
 * can't drift in how rows bucket into Today / Yesterday / Previous 7 days / …
 *
 * Pure + brand-agnostic (no labels, no copy, no router) — labels live with the
 * consumer (the feature resolves EN/RU copy in `conversations.copy.ts`; the
 * shell takes them via props). The feature imports these from `@klyp/brand`.
 */

export type ConversationGroupKey = 'today' | 'yesterday' | 'prev7' | 'prev30' | 'older'

export const CONVERSATION_GROUP_ORDER: readonly ConversationGroupKey[] = [
  'today',
  'yesterday',
  'prev7',
  'prev30',
  'older',
]

/** Bucket a timestamp into a relative date group. Day-difference based (not
 *  calendar-boundary) — sufficient for a history list, matches ChatGPT/Linear. */
export function groupOf(ms: number): ConversationGroupKey {
  const days = Math.floor((Date.now() - ms) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return 'prev7'
  if (days < 30) return 'prev30'
  return 'older'
}
