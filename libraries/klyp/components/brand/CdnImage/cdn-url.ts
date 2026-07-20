/**
 * Cloudflare Image Transformation URL helpers — extracted from `CdnImage` so
 * non-`<img>` consumers can reuse the exact same transform (e.g. a `<video>`
 * `poster` attribute, which takes a URL string, not a React element).
 *
 * Billing note: unique transforms are billed per (src × params) pair, so
 * callers pick from the four fixed `CdnImageSize` widths — never arbitrary px.
 */

export type CdnImageSize = 'chip' | 'card' | 'grid' | 'modal'

export const SIZE_TO_WIDTH: Record<CdnImageSize, number> = {
  chip: 160,
  card: 320,
  grid: 640,
  modal: 1280,
}

// 1× + 2× DPR for each slot — covers retina + zoomed-out without exploding the
// unique-transform count. AVIF encoder caps at 1600px; we stay ≤1600 so
// format=auto reliably negotiates AVIF on capable browsers.
export const SIZE_TO_SRCSET: Record<CdnImageSize, readonly number[]> = {
  chip: [160, 320],
  card: [320, 640],
  grid: [640, 1280],
  modal: [1280, 1600],
}

// Legacy r2.dev public hostnames written to the DB before the CDN domain
// existed. Same underlying R2 bucket, different access point — safe to rewrite
// through the CDN domain. Add new ones as buckets move.
const LEGACY_R2_HOSTS = ['https://pub-a23eed752bab4d59833b249e84efe648.r2.dev']

/**
 * Extract the bucket key from a URL we can serve through the CDN. Returns null
 * when the URL is external (e.g. a third-party provider CDN) and must be
 * rendered raw.
 */
export function extractKey(src: string, cdnBase: string): string | null {
  if (cdnBase && src.startsWith(cdnBase)) {
    return src.slice(cdnBase.length).replace(/^\//, '')
  }
  for (const legacy of LEGACY_R2_HOSTS) {
    if (src.startsWith(legacy)) {
      return src.slice(legacy.length).replace(/^\//, '')
    }
  }
  return null
}

// Quality 72 = visually equivalent to JPEG q80 for AVIF/WebP at much smaller
// size + faster cold-miss encode (AVIF encoder slows non-linearly past q80).
export function buildTransformUrl(
  src: string,
  cdnBase: string,
  width: number,
  quality = 72,
): string {
  const key = extractKey(src, cdnBase)
  if (!cdnBase || key === null) return src
  return `${cdnBase}/cdn-cgi/image/format=auto,width=${width},quality=${quality},fit=scale-down/${key}`
}

export function buildSrcSet(
  src: string,
  cdnBase: string,
  widths: readonly number[],
): string | undefined {
  const key = extractKey(src, cdnBase)
  if (!cdnBase || key === null) return undefined
  return widths.map((w) => `${buildTransformUrl(src, cdnBase, w)} ${w}w`).join(', ')
}
