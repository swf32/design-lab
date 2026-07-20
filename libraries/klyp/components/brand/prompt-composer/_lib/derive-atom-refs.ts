/**
 * derive-atom-refs.ts
 *
 * Helper that derives the prompt's `atomRefs[]` from composer state at
 * submit time. Phase B (2026-05-03): the server resolves DNA via
 * `internal.atoms._resolveAtomsForAction` (action-internal) at Generate
 * time; the Drawer preview uses `api.atoms.previewBuiltPrompt` (read-only).
 *
 * Order:
 *   1. Walk text, splitting at @-mention occurrences →
 *      free-text runs become `user_text` atoms,
 *      mentions become `<kind>_dna` atoms.
 *   2. Each attachment with a `thumbnailUrl` → `attached_image_ref` atom.
 *   3. Single `format_image` OR `format_video` atom for settings.
 *
 * The shape is intentionally minimal — server validates per atomId.
 */

import type { AssetAttachment } from './types'

/** AtomRef — wire-only shape sent to Convex. Server validates per atomId. */
export type AtomRef = { atomId: string; input: unknown }

export type DeriveInput = {
  text: string
  attachments: AssetAttachment[]
  /** Resolved mention map — composer collects via `pickedMentions` state. */
  mentions: ReadonlyArray<{ token: string; kind: string; id: string }>
  mediaType: 'image' | 'video'
  aspectRatio: string
  model: string
  imageSize?: string
  durationSec?: number
  videoResolution?: '480p' | '720p' | '1080p'
}

/**
 * Derives the prompt's atom representation from composer state.
 *
 * NOTE: we sort mentions by their first occurrence in `text` so that
 * duplicates resolve "first appearance wins" — the loop's `cursor` advances
 * past the consumed token so subsequent identical tokens become plain
 * user_text. This keeps the wire payload deterministic and small.
 */
export function deriveAtomRefs(input: DeriveInput): AtomRef[] {
  const refs: AtomRef[] = []

  // 1. Text + mentions
  const txt = input.text
  // Sort by token first occurrence in text — first appearance wins on dup.
  const occurrences = input.mentions
    .map((m) => ({ ...m, idx: txt.indexOf(m.token) }))
    .filter((m) => m.idx >= 0)
    .sort((a, b) => a.idx - b.idx)

  let cursor = 0
  for (const m of occurrences) {
    if (m.idx < cursor) continue // duplicate token already consumed earlier
    if (m.idx > cursor) {
      const slice = txt.slice(cursor, m.idx).trim()
      if (slice) refs.push({ atomId: 'user_text', input: { text: slice } })
    }
    const dnaAtomId =
      m.kind === 'character'
        ? 'character_dna'
        : m.kind === 'location'
          ? 'location_dna'
          : m.kind === 'vibe'
            ? 'vibe_dna'
            : null
    if (dnaAtomId) refs.push({ atomId: dnaAtomId, input: { id: m.id } })
    cursor = m.idx + m.token.length
  }
  if (cursor < txt.length) {
    const tail = txt.slice(cursor).trim()
    if (tail) refs.push({ atomId: 'user_text', input: { text: tail } })
  } else if (cursor === 0 && txt.trim()) {
    // No mentions at all — emit the whole text as one user_text atom.
    refs.push({ atomId: 'user_text', input: { text: txt.trim() } })
  }

  // 2. Attachments
  for (const att of input.attachments) {
    if (att.thumbnailUrl) {
      refs.push({ atomId: 'attached_image_ref', input: { url: att.thumbnailUrl } })
    }
  }

  // 3. Single format atom
  if (input.mediaType === 'image') {
    refs.push({
      atomId: 'format_image',
      input: {
        aspectRatio: input.aspectRatio,
        model: input.model,
        ...(input.imageSize ? { imageSize: input.imageSize } : {}),
      },
    })
  } else {
    refs.push({
      atomId: 'format_video',
      input: {
        aspectRatio: input.aspectRatio,
        model: input.model,
        duration: input.durationSec ?? 5,
        resolution: input.videoResolution ?? '720p',
      },
    })
  }

  return refs
}
