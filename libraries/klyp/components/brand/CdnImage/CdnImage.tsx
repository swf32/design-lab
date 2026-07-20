import { ImageOutline } from '@klyp/icons/outline'
import { type ImgHTMLAttributes, useState } from 'react'

import { useBrand } from '../_brand-context'
import {
  buildSrcSet,
  buildTransformUrl,
  type CdnImageSize,
  SIZE_TO_SRCSET,
  SIZE_TO_WIDTH,
} from './cdn-url'
import './CdnImage.scss'

// Size→width maps + CDN transform helpers live in ./cdn-url so a `<video>`
// poster (URL string, not a React element) can reuse the exact same transform.
export type { CdnImageSize } from './cdn-url'

type ImgPassthrough = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet' | 'sizes' | 'loading' | 'decoding' | 'fetchPriority' | 'width' | 'height' | 'alt'
>

export interface CdnImageProps extends ImgPassthrough {
  /** Canonical asset URL, e.g. from Convex `outputUrl` / `imageUrl`. */
  src: string
  alt: string
  size: CdnImageSize
  /** Intrinsic width — used for CLS reservation. Defaults to `SIZE_TO_WIDTH[size]`. */
  width?: number
  /** Intrinsic height — used for CLS reservation. Defaults to `SIZE_TO_WIDTH[size]` (square). */
  height?: number
  /** Mark as LCP-critical (eager + fetchpriority=high). Use sparingly. */
  priority?: boolean
}

export function CdnImage({
  src,
  alt,
  size,
  width,
  height,
  priority = false,
  className,
  onError,
  ...rest
}: CdnImageProps) {
  // Frontend CDN base — base URL of our CDN-enabled R2 custom domain
  // (e.g. https://cdn.klypapp.com), injected at runtime via <BrandProvider>
  // (was the VITE_R2_CDN_BASE build-time env). Required for transforms;
  // without it (empty string), all URLs render as raw <img>.
  const { cdnBase } = useBrand()
  const CDN_BASE = cdnBase.replace(/\/$/, '')

  // Tracks the specific src that failed. `erroredSrc === src` (rather than a
  // bare boolean) self-resets when the consumer swaps in a new src, without a
  // useEffect — a later successful src re-renders the real <img>.
  const [erroredSrc, setErroredSrc] = useState<string | null>(null)

  const targetWidth = SIZE_TO_WIDTH[size]
  const srcSet = buildSrcSet(src, CDN_BASE, SIZE_TO_SRCSET[size])
  const transformedSrc = buildTransformUrl(src, CDN_BASE, targetWidth)

  // CLS reservation: when the consumer doesn't pass dimensions, fall back
  // to the slot's nominal width (square). Browsers use these HTML attrs as
  // an intrinsic-ratio hint while the image loads, eliminating layout
  // shift without needing a CSS aspect-ratio default that would fight
  // every consumer's CSS-based sizing.
  const resolvedWidth = width ?? targetWidth
  const resolvedHeight = height ?? targetWidth

  // Graceful fallback when the image fails to load (CDN cold-miss timeout,
  // transform/encode error, deleted object) — a neutral placeholder instead
  // of the browser's broken-image chrome. Keeps the consumer's className +
  // a CLS-preserving aspect-ratio so layout doesn't shift.
  if (erroredSrc === src) {
    return (
      <span
        className={`klyp-CdnImage${className ? ` ${className}` : ''}`}
        data-size={size}
        data-error=""
        role="img"
        aria-label={alt}
        style={{ aspectRatio: `${resolvedWidth} / ${resolvedHeight}` }}
      >
        <ImageOutline width={24} height={24} aria-hidden />
      </span>
    )
  }

  return (
    <img
      {...rest}
      className={`klyp-CdnImage${className ? ` ${className}` : ''}`}
      data-size={size}
      src={transformedSrc}
      srcSet={srcSet}
      sizes={`${targetWidth}px`}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={(e) => {
        setErroredSrc(src)
        onError?.(e)
      }}
    />
  )
}

export default CdnImage
