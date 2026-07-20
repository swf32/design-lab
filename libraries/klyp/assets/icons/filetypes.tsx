/**
 * File-type + attachment glyphs — bespoke (non-Iconsax) duotone marks used by
 * the attachment surfaces. Extracted from `@klyp/brand` AttachmentSlot
 * (2026-06-28) so they have one canonical home alongside the conversation
 * glyphs, and can be surfaced on /components/icons.
 *
 * Two fill conventions, both SOLID (zero alpha — per-shape alpha
 * double-composites on overlaps; see .claude/rules/frontend.md "Icon
 * transparency"):
 *   - GalleryAddGlyph (empty-slot "add image"): dim body = var(--neutral-400);
 *     content (sun + mountains + plus) = var(--color-fg-on-active-nav)
 *     (theme-aware solid white, flips dark on Unreals light theme). Draw order
 *     matters — body FIRST (behind), content ON TOP.
 *   - File-type glyphs (FileDocGlyph … FileFolderGlyph): dim silhouette =
 *     var(--neutral-400) drawn first; bright marks = currentColor on top.
 */

import type { SVGProps } from 'react'

// ── GalleryAddGlyph — gallery + plus, the empty-slot "add image" placeholder ─
export function GalleryAddGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {/* gallery body/card — dim solid gray, BEHIND */}
      <path
        fill="var(--neutral-400)"
        d="M15 2.42c.9 0 1.75.217 2.5.6v.4h-1a2 2 0 1 0 0 4h1v1a2 2 0 0 0 3 1.73v6.77a5.5 5.5 0 0 1-5.5 5.5H6a5.5 5.5 0 0 1-5.5-5.5v-9A5.5 5.5 0 0 1 6 2.42h9Z"
      />
      {/* sun + gallery mountains — solid white CONTENT, on top */}
      <path
        fill="var(--color-fg-on-active-nav)"
        d="M6.353 10.303a1.999 1.999 0 1 0 0-3.998 1.999 1.999 0 0 0 0 3.998Zm12.797 4.09v2a4.933 4.933 0 0 1-2.091 4.038c-.032.021-.052.042-.083.052-.886.525-2.071.845-3.637.845H6.63c-1.67 0-3.256-.845-4.111-2.288a7.101 7.101 0 0 1-.35-.68 1.117 1.117 0 0 1 .39-1.329l4.081-2.998c.68-.464 1.67-.412 2.288.123l.288.248c.67.587 1.772.587 2.442.01l3.637-3.112c.67-.577 1.773-.577 2.442 0a4.086 4.086 0 0 1 1.412 3.091Z"
      />
      {/* plus — solid white, sits in the body's top-right notch */}
      <path
        fill="var(--color-fg-on-active-nav)"
        d="M19.5 1.42a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2h-2a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1Z"
      />
    </svg>
  )
}

// ── Shared path constants ────────────────────────────────────────────
// document-text body + fold + two text lines (pdf / doc / txt / document)
const DOC_BODY =
  'M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z'
const DOC_FOLD =
  'M18.5 9.25H16.5C14.98 9.25 13.75 8.02 13.75 6.5V4.5C13.75 4.09 14.09 3.75 14.5 3.75C14.91 3.75 15.25 4.09 15.25 4.5V6.5C15.25 7.19 15.81 7.75 16.5 7.75H18.5C18.91 7.75 19.25 8.09 19.25 8.5C19.25 8.91 18.91 9.25 18.5 9.25Z'
const DOC_L1 =
  'M12 13.75H8C7.59 13.75 7.25 13.41 7.25 13C7.25 12.59 7.59 12.25 8 12.25H12C12.41 12.25 12.75 12.59 12.75 13C12.75 13.41 12.41 13.75 12 13.75Z'
const DOC_L2 =
  'M16 17.75H8C7.59 17.75 7.25 17.41 7.25 17C7.25 16.59 7.59 16.25 8 16.25H16C16.41 16.25 16.75 16.59 16.75 17C16.75 17.41 16.41 17.75 16 17.75Z'

// rounded-square body shared by audio + video
const SQ_BODY =
  'M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2Z'

// ── FileDocGlyph — document-text (pdf / doc / txt / document share this) ─
export function FileDocGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path fill="var(--neutral-400)" d={DOC_BODY} />
      <path fill="currentColor" d={DOC_FOLD} />
      <path fill="currentColor" d={DOC_L1} />
      <path fill="currentColor" d={DOC_L2} />
    </svg>
  )
}

// ── FileSheetGlyph — grid-1 checkerboard (xls) ─
export function FileSheetGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path fill="var(--neutral-400)" d="M8.51 8.5H2V15.5H8.51V8.5Z" />
      <path fill="var(--neutral-400)" d="M21.9998 8.5H15.5098V15.5H21.9998V8.5Z" />
      <path fill="var(--neutral-400)" d="M15.5098 2H8.50977V8.5H15.5098V2Z" />
      <path fill="var(--neutral-400)" d="M15.5098 15.5H8.50977V22H15.5098V15.5Z" />
      <path fill="currentColor" d="M8.51 2V8.5H2V7.81C2 4.17 4.17 2 7.81 2H8.51Z" />
      <path
        fill="currentColor"
        d="M21.9998 7.81V8.5H15.5098V2H16.1898C19.8298 2 21.9998 4.17 21.9998 7.81Z"
      />
      <path
        fill="currentColor"
        d="M21.9998 15.5V16.19C21.9998 19.83 19.8298 22 16.1898 22H15.5098V15.5H21.9998Z"
      />
      <path fill="currentColor" d="M8.51 15.5V22H7.81C4.17 22 2 19.83 2 16.19V15.5H8.51Z" />
      <path fill="currentColor" d="M15.5098 8.5H8.50977V15.5H15.5098V8.5Z" />
    </svg>
  )
}

// ── FileAudioGlyph — square body + waveform note (audio) ─
export function FileAudioGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path fill="var(--neutral-400)" d={SQ_BODY} />
      <path
        fill="currentColor"
        d="M15.6201 7.09947L13.3301 6.33952C12.7501 6.13952 12.1601 6.21947 11.7101 6.53947C11.2601 6.85947 11.0101 7.39951 11.0101 8.00951V8.61949V12.7995C10.6101 12.5795 10.1601 12.4495 9.6701 12.4495C8.13011 12.4495 6.87012 13.7095 6.87012 15.2495C6.87012 16.7895 8.13011 18.0495 9.6701 18.0495C11.2101 18.0495 12.4701 16.7895 12.4701 15.2495V10.6995C12.4801 10.7095 12.5001 10.7095 12.5101 10.7195L14.8001 11.4795C15.0101 11.5495 15.2301 11.5895 15.4401 11.5895C15.8001 11.5895 16.1401 11.4895 16.4201 11.2795C16.8701 10.9595 17.1201 10.4195 17.1201 9.80949V9.19951C17.1201 8.28951 16.4801 7.38947 15.6201 7.09947ZM9.6701 16.5895C8.9301 16.5895 8.34015 15.9895 8.34015 15.2595C8.34015 14.5195 8.9401 13.9195 9.6701 13.9195C10.4101 13.9195 11.0101 14.5195 11.0101 15.2595C11.0101 15.9895 10.4101 16.5895 9.6701 16.5895Z"
      />
    </svg>
  )
}

// ── FileImageGlyph — gallery silhouette + sun/landscape (image) ─
export function FileImageGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        fill="var(--neutral-400)"
        d="M22 7.81V13.9L20.37 12.5C19.59 11.83 18.33 11.83 17.55 12.5L13.39 16.07C12.61 16.74 11.35 16.74 10.57 16.07L10.23 15.79C9.52 15.17 8.39 15.11 7.59 15.65L2.67 18.95L2.56 19.03C2.19 18.23 2 17.28 2 16.19V7.81C2 4.17 4.17 2 7.81 2H16.19C19.83 2 22 4.17 22 7.81Z"
      />
      <path
        fill="currentColor"
        d="M9.00012 10.3801C10.3146 10.3801 11.3801 9.31456 11.3801 8.00012C11.3801 6.68568 10.3146 5.62012 9.00012 5.62012C7.68568 5.62012 6.62012 6.68568 6.62012 8.00012C6.62012 9.31456 7.68568 10.3801 9.00012 10.3801Z"
      />
      <path
        fill="currentColor"
        d="M22.0001 13.8996V16.1896C22.0001 19.8296 19.8301 21.9996 16.1901 21.9996H7.81006C5.26006 21.9996 3.42006 20.9296 2.56006 19.0296L2.67006 18.9496L7.59006 15.6496C8.39006 15.1096 9.52006 15.1696 10.2301 15.7896L10.5701 16.0696C11.3501 16.7396 12.6101 16.7396 13.3901 16.0696L17.5501 12.4996C18.3301 11.8296 19.5901 11.8296 20.3701 12.4996L22.0001 13.8996Z"
      />
    </svg>
  )
}

// ── FileVideoGlyph — square body + play triangle (video) ─
export function FileVideoGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path fill="var(--neutral-400)" d={SQ_BODY} />
      <path
        fill="currentColor"
        d="M9.1001 12.0005V10.5205C9.1001 8.61048 10.4501 7.84048 12.1001 8.79048L13.3801 9.53048L14.6601 10.2705C16.3101 11.2205 16.3101 12.7805 14.6601 13.7305L13.3801 14.4705L12.1001 15.2105C10.4501 16.1605 9.1001 15.3805 9.1001 13.4805V12.0005Z"
      />
    </svg>
  )
}

// ── FileFolderGlyph — folder-2 (generic "file" fallback) ─
export function FileFolderGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {/* tab — dim, behind */}
      <path
        fill="var(--neutral-400)"
        d="M15.7201 2H8.28008C7.90008 2 7.58008 2.32 7.58008 2.7C7.58008 3.08 7.90008 3.4 8.28008 3.4H11.5401L12.9401 5.26C13.2501 5.67 13.2901 5.73 13.8701 5.73H17.5901C17.9701 5.73 18.3401 5.78 18.7001 5.88C18.7401 6.06 18.7601 6.24 18.7601 6.43V6.78C18.7601 7.16 19.0801 7.48 19.4601 7.48C19.8401 7.48 20.1601 7.16 20.1601 6.78V6.42C20.1401 3.98 18.1601 2 15.7201 2Z"
      />
      {/* body — bright, on top */}
      <path
        fill="currentColor"
        d="M20.14 6.54C19.71 6.23 19.22 6 18.69 5.87C18.34 5.77 17.96 5.72 17.58 5.72H13.86C13.28 5.72 13.24 5.66 12.93 5.25L11.53 3.39C10.88 2.53 10.37 2 8.74 2H6.42C3.98 2 2 3.98 2 6.42V17.58C2 20.02 3.98 22 6.42 22H17.58C20.02 22 22 20.02 22 17.58V10.14C22 8.65 21.27 7.34 20.14 6.54ZM14.33 16H9.67C9.28 16 8.97 15.69 8.97 15.3C8.97 14.92 9.28 14.6 9.67 14.6H14.32C14.7 14.6 15.02 14.92 15.02 15.3C15.02 15.69 14.71 16 14.33 16Z"
      />
    </svg>
  )
}
