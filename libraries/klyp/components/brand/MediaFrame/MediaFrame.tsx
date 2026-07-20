import './MediaFrame.scss'

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'

import { SnakeBorder } from '../SnakeBorder'

export type MediaFrameAspect =
  | '1:1'
  | '16:9'
  | '9:16'
  | '3:2'
  | '2:3'
  | '21:9'
  | '9:21'
  | '4:3'
  | '3:4'

export interface MediaFrameProps {
  /** Which media is being generated / shown — drives default aspect + label. */
  modality: 'image' | 'video'
  /** Frame aspect ratio. Defaults: image 1:1, video 9:16. Covers every gen format. */
  aspect?: MediaFrameAspect
  /** Optional ETA (seconds) shown as a pill while generating. */
  etaSec?: number
  /**
   * The asset URL for the BUILT-IN media (catalog standalone). ABSENT (and no
   * `children`) → generating state (snake + breathing colored overlay + label).
   * PRESENT → the media mounts behind the overlay and the overlay reveals it:
   * backdrop blur 24px→0 + opacity 100%→0 over ~1.2s. The frame is the SAME
   * size in both states (no swap / no remount). When `children` are passed they
   * take precedence over `src` for the revealed media (see `children`).
   */
  src?: string
  alt?: string
  /** Override the generating label. */
  label?: string
  className?: string
  /**
   * The REVEALED interactive media (e.g. a lightbox-trigger button wrapping the
   * thumbnail, or a `<video controls>`). When present it is rendered inside the
   * de-blurring `__media` slot INSTEAD of the built-in `<img>` / `<video>` from
   * `src` — so the same frame both develops the asset AND hands over a fully
   * interactive element once revealed. When absent, the built-in `src` media is
   * used (catalog standalone). Presence is treated like `src` for reveal: a
   * mount WITH children does not animate; the blur-reveal only runs on the
   * absent→present transition.
   */
  children?: ReactNode
  /**
   * For the `children` slot: whether the caller's media has actually LOADED
   * (painted). The reveal (de-blur + overlay fade) waits for this so it never
   * dissolves onto a still-blank frame (image downloading / decoding) — the
   * "fade to nothing, picture never appears" bug. Pass `true` from the media's
   * `onLoad` AND `onError` (an error still reveals, to surface the fallback).
   * Ignored for the built-in `src` media, which MediaFrame tracks via its own
   * onLoad.
   */
  mediaReady?: boolean
}

const COPY = { image: 'Generating image', video: 'Generating video' } as const

/**
 * `<MediaFrame>` — one fixed-size frame for the whole generation lifecycle.
 *
 * Generating (`src` absent): the SnakeBorder accent ring runs around a colored
 * surface with a slow breathing glow + label. When `src` arrives, the media is
 * mounted UNDER the overlay and the overlay dissolves — the media de-blurs
 * (24px→0) while the colored surface fades (100%→0) over ~1.2s, so the picture
 * "develops" in place. The frame never swaps to a different component.
 *
 * The snake settles to `idle` once revealed (its ring fades out).
 */
export function MediaFrame({
  modality,
  aspect = modality === 'video' ? '9:16' : '1:1',
  etaSec,
  src,
  alt,
  label,
  className,
  children,
  mediaReady,
}: MediaFrameProps) {
  // Content present = either the built-in `src` media OR caller-provided
  // interactive `children`. Either one occupies the de-blurring `__media` slot.
  const hasContent = Boolean(src) || children != null

  // Has the media actually PAINTED? The reveal must wait for the real pixels —
  // gating on `hasContent` alone (src merely present in props) dissolves the
  // overlay onto a frame whose <img> is still downloading/decoding → you see a
  // fade to nothing and the picture never shows. For the `children` slot the
  // caller owns the <img>/<video> and signals readiness via `mediaReady` (load
  // OR error). For the built-in `src` media MediaFrame tracks its own onLoad.
  const [selfLoaded, setSelfLoaded] = useState(false)
  useEffect(() => {
    setSelfLoaded(false)
  }, [src])
  const mediaLoaded = children != null ? Boolean(mediaReady) : selfLoaded

  // Reveal = content present AND actually loaded. The de-blur + overlay fade run
  // on the next frame so the CSS transition plays. If the media never loads
  // (e.g. a failed fetch with no onError signal), the overlay simply stays — the
  // breathing "still working" state — instead of fading to a blank frame.
  //
  // Reveal is LATCHED: once shown, it never un-reveals. Without the latch a
  // transient prop blip — a URL swap mid-stream (temp/base64 → R2), a Convex
  // re-render that momentarily drops the file part — would flip the overlay back
  // OPAQUE for a frame, so the picture flashes and vanishes ("appeared for a
  // millisecond then disappeared"). The latch keeps the surface dissolved.
  const [revealed, setRevealed] = useState(false)
  const revealedOnceRef = useRef(false)
  useEffect(() => {
    if (hasContent && mediaLoaded) {
      revealedOnceRef.current = true
      const raf = requestAnimationFrame(() => setRevealed(true))
      return () => cancelAnimationFrame(raf)
    }
    if (!hasContent) {
      // Genuinely back to the generating state (no src AND no children at all,
      // e.g. a fresh regenerate on this instance) — reset the latch and re-cover.
      revealedOnceRef.current = false
      setRevealed(false)
      return
    }
    // Content present but not (yet) loaded — e.g. the URL swapped mid-stream and
    // the <img> is reloading. If we already revealed, STAY revealed (no overlay
    // re-cover flash); only cover if we have never revealed.
    if (!revealedOnceRef.current) setRevealed(false)
  }, [hasContent, mediaLoaded])

  // Retire the SnakeBorder once the reveal fade has finished. The ring fades to
  // opacity 0 over ~1s (overlay over 1.2s) WHILE still rotating — the deliberate
  // graceful exit. But `state="generating"` keeps an infinite conic-gradient
  // repaint + a 4-layer drop-shadow filter compositing over the media FOREVER;
  // on a playing <video> that dropped frames ("воспроизведение оч сильно лагает").
  // Waiting for the fade to complete (ring already invisible), then flipping to
  // `settled` stops both — with no visible angle-jump flash. Timeout (not
  // onTransitionEnd) so it also fires under prefers-reduced-motion, where the
  // fade is instant and the transition event never comes.
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (!revealed) {
      setSettled(false)
      return
    }
    const t = setTimeout(() => setSettled(true), 1250)
    return () => clearTimeout(t)
  }, [revealed])

  const cssVars = { '--mf-aspect': aspect } as CSSProperties

  return (
    <SnakeBorder
      // While generating, the bold accent ring rotates + glows. On reveal it
      // gracefully fades to opacity 0 over ~1s (still rotating as it fades — see
      // .scss `[data-revealed]`). AFTER that fade we flip to `settled`, which
      // STOPS the infinite conic rotation + 4-layer drop-shadow filter so nothing
      // keeps compositing over the now-playing media. Flipping only once the ring
      // is already invisible avoids the angle-jump-to-0 flash that made the old
      // code pin `generating` forever (which dropped video playback frames).
      state={settled ? 'settled' : 'generating'}
      intensity="bold"
      glow
      color="var(--color-accent)"
      duration="3.6s"
      className="klyp-MediaFrame__snake"
    >
      <div
        className={['klyp-MediaFrame', className].filter(Boolean).join(' ')}
        data-aspect={aspect}
        data-modality={modality}
        data-revealed={revealed ? 'true' : undefined}
        style={cssVars}
      >
        {children != null ? (
          // Caller-provided interactive media (lightbox button + thumbnail, or a
          // <video controls>) occupies the de-blurring slot. The wrapper carries
          // the blur + reveal transition so the picture "develops" in place AND
          // stays fully interactive once revealed.
          <div className="klyp-MediaFrame__media klyp-MediaFrame__media--slot">{children}</div>
        ) : src ? (
          modality === 'video' ? (
            <video
              className="klyp-MediaFrame__media"
              src={src}
              muted
              loop
              playsInline
              autoPlay
              aria-label={alt}
              onLoadedData={() => setSelfLoaded(true)}
              onError={() => setSelfLoaded(true)}
            />
          ) : (
            <img
              className="klyp-MediaFrame__media"
              src={src}
              alt={alt ?? ''}
              onLoad={() => setSelfLoaded(true)}
              onError={() => setSelfLoaded(true)}
            />
          )
        ) : null}
        <div aria-hidden className="klyp-MediaFrame__overlay">
          <div className="klyp-MediaFrame__labelWrap">
            <span className="klyp-MediaFrame__label">
              {label ?? (modality === 'image' ? COPY.image : COPY.video)}
            </span>
            {etaSec ? <p className="klyp-MediaFrame__eta">≈{etaSec}s</p> : null}
          </div>
        </div>
      </div>
    </SnakeBorder>
  )
}

export default MediaFrame
