/**
 * VideoPlayer — branded, presentational custom video player (skiper97 port).
 *
 * Library-grade extraction of the former academy article-cover player into
 * @klyp/brand. Fully props-driven (poster + sources); no academy / Convex /
 * router coupling. Controls render white over a dark video scrim via the
 * always-white `--alpha-white-*` primitives — correct on both brands, since
 * they sit on the video, not the page background.
 *
 *  - Motion 12 (`motion/react`) for the controls fade + smooth render-free
 *    timeline updates via MotionValues.
 *  - @klyp/icons (PlayOutline / ExpandOutline) + inline pause / volume glyphs
 *    (the Iconsax outline set has no Pause; the volume glyph is the reference's
 *    own SVG). All glyphs use `currentColor` so they inherit the white control
 *    colour over the scrim.
 *  - Timeline hover THUMBNAIL preview: a hidden offscreen <video> (same source)
 *    seeks to the hovered time; each `seeked` frame is drawn into a small 16:9
 *    <canvas> shown above the cursor (MDN no-sprite-sheet approach — right for
 *    UI, production would precompute a storyboard sprite + WebVTT).
 *  - prefers-reduced-motion: the controls-bar enter/exit transition collapses
 *    to an instant cut (no slide / fade) when the user requests reduced motion.
 */

import { ExpandOutline, PlayOutline } from '@klyp/icons'
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import {
  type ComponentPropsWithRef,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import './VideoPlayer.scss'

export type VideoSource = { src: string; type: string }

export interface VideoPlayerProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Ordered list of `<source>` candidates (first playable wins). */
  sources: VideoSource[]
  /** Poster frame shown before playback / while metadata loads. */
  poster?: string
  /** Accessible label for the player region. Defaults to `'Video player'`. */
  label?: string
  /** Ref to the underlying `<video>` element (autoplay control, etc.). */
  videoRef?: Ref<HTMLVideoElement>
}

const PREVIEW_W = 240
const PREVIEW_H = 135

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const total = Math.floor(value)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function VideoPlayer({
  sources,
  poster,
  label = 'Video player',
  className,
  videoRef: externalVideoRef,
  ref,
  ...rest
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const reduceMotion = useReducedMotion()

  // Smooth, render-free updates via MotionValues.
  const currentTime = useMotionValue(0)
  const duration = useMotionValue(0)
  const cursorX = useMotionValue(0)
  const hoverTime = useMotionValue(0)
  const cursorOpacity = useSpring(0, { stiffness: 400, damping: 40 })
  const progressPct = useMotionValue(0)
  const bufferPct = useMotionValue(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isVolumeOpen, setIsVolumeOpen] = useState(false)

  const isScrubbingRef = useRef(false)
  const wasPlayingBeforeScrubRef = useRef(false)
  const prevVolumeRef = useRef(1)

  const controlsVisible = !isPlaying || isHovered

  const currentTimeStr = useTransform(currentTime, formatTime)
  const remainingTimeStr = useTransform([currentTime, duration], ([c, d]: number[]) =>
    formatTime(Math.max(0, d - c)),
  )
  const hoverTimeStr = useTransform(hoverTime, formatTime)

  // Merge the internal <video> ref with an optional forwarded one.
  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node
      if (typeof externalVideoRef === 'function') externalVideoRef(node)
      else if (externalVideoRef) externalVideoRef.current = node
    },
    [externalVideoRef],
  )
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  // ── Video event sync ──────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateBuffer = () => {
      const { buffered } = video
      const dur = video.duration
      if (buffered.length > 0 && dur > 0 && Number.isFinite(dur)) {
        let end = 0
        for (let i = 0; i < buffered.length; i++) end = Math.max(end, buffered.end(i))
        bufferPct.set(Math.min(Math.max((end / dur) * 100, 0), 100))
      } else {
        bufferPct.set(0)
      }
    }
    const setPct = () => {
      const dur = duration.get()
      progressPct.set(dur ? Math.min(Math.max((currentTime.get() / dur) * 100, 0), 100) : 0)
    }
    const onLoaded = () => {
      duration.set(video.duration || 0)
      currentTime.set(video.currentTime || 0)
      setPct()
      updateBuffer()
    }
    const onTime = () => {
      if (!isScrubbingRef.current) currentTime.set(video.currentTime)
      setPct()
      updateBuffer()
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      currentTime.set(video.duration || 0)
    }

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    video.addEventListener('progress', updateBuffer)
    if (video.readyState >= 1) onLoaded()

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('progress', updateBuffer)
    }
  }, [currentTime, duration, progressPct, bufferPct])

  // ── Timeline thumbnail preview (offscreen seek → canvas) ──────────
  const pendingPreviewTime = useRef<number | null>(null)
  const drawPreview = useCallback(() => {
    const v = previewVideoRef.current
    const c = previewCanvasRef.current
    const ctx = c?.getContext('2d')
    if (!v || !c || !ctx) return
    try {
      ctx.drawImage(v, 0, 0, c.width, c.height)
    } catch {
      // Cross-origin frame before CORS settles — ignore, next seek redraws.
    }
  }, [])
  const seekPreview = useCallback((t: number) => {
    const v = previewVideoRef.current
    if (!v || !Number.isFinite(t)) return
    if (v.seeking) {
      pendingPreviewTime.current = t
      return
    }
    pendingPreviewTime.current = null
    v.currentTime = t
  }, [])
  useEffect(() => {
    const v = previewVideoRef.current
    if (!v) return
    const onSeeked = () => {
      drawPreview()
      if (pendingPreviewTime.current != null) seekPreview(pendingPreviewTime.current)
    }
    v.addEventListener('seeked', onSeeked)
    return () => v.removeEventListener('seeked', onSeeked)
  }, [drawPreview, seekPreview])

  // ── Playback ──────────────────────────────────────────────────────
  const play = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= video.duration) video.currentTime = 0
    try {
      await video.play()
    } catch (err) {
      if (
        err instanceof Error &&
        err.name !== 'AbortError' &&
        !err.message.includes('interrupted')
      ) {
        // Swallow expected play/pause races; surface anything else.
        console.error('video play failed', err)
      }
    }
  }, [])
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void play()
    else video.pause()
  }, [play])

  // ── Seek bar ──────────────────────────────────────────────────────
  const timeAtClientX = useCallback(
    (clientX: number): number | null => {
      const bar = barRef.current
      const dur = duration.get()
      if (!bar || !dur) return null
      const { left, width } = bar.getBoundingClientRect()
      const ratio = Math.min(Math.max((clientX - left) / width, 0), 1)
      return ratio * dur
    },
    [duration],
  )

  const onBarMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = barRef.current
      if (!bar) return
      const { left, width } = bar.getBoundingClientRect()
      const x = Math.min(Math.max(e.clientX - left, 0), width)
      cursorX.set(x)
      const dur = duration.get()
      if (dur) {
        const t = (x / width) * dur
        hoverTime.set(t)
        seekPreview(t)
      }
    },
    [cursorX, duration, hoverTime, seekPreview],
  )

  const onBarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const video = videoRef.current
      if (!video) return
      isScrubbingRef.current = true
      wasPlayingBeforeScrubRef.current = !video.paused
      video.pause()
      const t = timeAtClientX(e.clientX)
      if (t != null) {
        video.currentTime = t
        currentTime.set(t)
      }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [currentTime, timeAtClientX],
  )
  const onBarPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isScrubbingRef.current) return
      const video = videoRef.current
      const t = timeAtClientX(e.clientX)
      if (video && t != null) {
        video.currentTime = t
        currentTime.set(t)
      }
    },
    [currentTime, timeAtClientX],
  )
  const onBarPointerUp = useCallback(() => {
    isScrubbingRef.current = false
    if (wasPlayingBeforeScrubRef.current) void play()
  }, [play])

  // ── Volume ────────────────────────────────────────────────────────
  const volTrackRef = useRef<HTMLDivElement>(null)
  const isVolScrubRef = useRef(false)
  const applyVolume = useCallback((next: number) => {
    setVolume(next)
    const video = videoRef.current
    if (video) {
      video.volume = next
      video.muted = next === 0
    }
    setIsMuted(next === 0)
  }, [])
  const toggleMute = useCallback(() => {
    if (isMuted || volume === 0) {
      applyVolume(prevVolumeRef.current || 1)
    } else {
      prevVolumeRef.current = volume
      applyVolume(0)
    }
  }, [isMuted, volume, applyVolume])

  // Vertical volume scrub: y from the bottom of the track = level.
  const volAtClientY = useCallback((clientY: number): number => {
    const t = volTrackRef.current
    if (!t) return 0
    const { top, height } = t.getBoundingClientRect()
    return Math.min(Math.max(1 - (clientY - top) / height, 0), 1)
  }, [])
  const onVolumePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isVolScrubRef.current = true
      applyVolume(volAtClientY(e.clientY))
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [applyVolume, volAtClientY],
  )
  const onVolumePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isVolScrubRef.current) applyVolume(volAtClientY(e.clientY))
    },
    [applyVolume, volAtClientY],
  )
  const onVolumePointerUp = useCallback(() => {
    isVolScrubRef.current = false
  }, [])

  // ── Fullscreen ────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }, [])

  // Spacebar play/pause when the player is hovered/focused.
  useEffect(() => {
    if (!isHovered) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      e.preventDefault()
      togglePlay()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isHovered, togglePlay])

  // Reduced motion: collapse the controls slide/fade to an instant cut.
  const controlsMotion = reduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { y: 8, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 8, opacity: 0 },
        transition: { duration: 0.2, ease: 'easeOut' as const },
      }

  return (
    <div
      {...rest}
      ref={setRootRef}
      className={['klyp-VideoPlayer', className].filter(Boolean).join(' ')}
      role="region"
      aria-label={label}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: caption tracks are caller-provided via sources/poster; presentational player ships no built-in track */}
      <video
        ref={setVideoRef}
        className="klyp-VideoPlayer__video"
        poster={poster}
        onClick={togglePlay}
        loop
        playsInline
        preload="metadata"
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      {/* Offscreen seek target for the timeline thumbnail preview. */}
      <video
        ref={previewVideoRef}
        className="klyp-VideoPlayer__previewSource"
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      <AnimatePresence>
        {controlsVisible && (
          <motion.div className="klyp-VideoPlayer__controls" {...controlsMotion}>
            <button
              type="button"
              className="klyp-VideoPlayer__btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseGlyph /> : <PlayOutline width={18} height={18} />}
            </button>

            <div
              className="klyp-VideoPlayer__volume"
              onMouseEnter={() => setIsVolumeOpen(true)}
              onMouseLeave={() => setIsVolumeOpen(false)}
            >
              <button
                type="button"
                className="klyp-VideoPlayer__btn"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                <VolumeGlyph muted={isMuted || volume === 0} />
              </button>
              {isVolumeOpen && (
                <div className="klyp-VideoPlayer__volumePopover">
                  <div
                    ref={volTrackRef}
                    className="klyp-VideoPlayer__volumeTrack"
                    role="slider"
                    tabIndex={0}
                    aria-label="Volume"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round((isMuted ? 0 : volume) * 100)}
                    onPointerDown={onVolumePointerDown}
                    onPointerMove={onVolumePointerMove}
                    onPointerUp={onVolumePointerUp}
                  >
                    <div
                      className="klyp-VideoPlayer__volumeFill"
                      style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="klyp-VideoPlayer__range">
              <motion.span className="klyp-VideoPlayer__time">{currentTimeStr}</motion.span>
              <div
                ref={barRef}
                className="klyp-VideoPlayer__bar"
                onMouseMove={onBarMouseMove}
                onMouseEnter={() => cursorOpacity.set(1)}
                onMouseLeave={() => cursorOpacity.set(0)}
                onPointerDown={onBarPointerDown}
                onPointerMove={onBarPointerMove}
                onPointerUp={onBarPointerUp}
              >
                <div className="klyp-VideoPlayer__track">
                  <BarFill className="klyp-VideoPlayer__buffer" pct={bufferPct} />
                  <BarFill className="klyp-VideoPlayer__progress" pct={progressPct} />
                </div>
                <motion.div
                  className="klyp-VideoPlayer__cursor"
                  style={{ x: cursorX, opacity: cursorOpacity }}
                >
                  <div className="klyp-VideoPlayer__preview">
                    <canvas
                      ref={previewCanvasRef}
                      width={PREVIEW_W}
                      height={PREVIEW_H}
                      className="klyp-VideoPlayer__previewCanvas"
                    />
                    <motion.span className="klyp-VideoPlayer__previewTime">
                      {hoverTimeStr}
                    </motion.span>
                  </div>
                  <span className="klyp-VideoPlayer__cursorLine" />
                </motion.div>
              </div>
              <span className="klyp-VideoPlayer__time" data-remaining>
                <span aria-hidden="true">−</span>
                <motion.span>{remainingTimeStr}</motion.span>
              </span>
            </div>

            <button
              type="button"
              className="klyp-VideoPlayer__btn"
              onClick={toggleFullscreen}
              aria-label="Fullscreen"
            >
              <ExpandOutline width={18} height={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BarFill({ pct, className }: { pct: MotionValue<number>; className: string }) {
  const width = useTransform(pct, (p) => `${p}%`)
  return <motion.div className={className} style={{ width }} />
}

/** Two-bar pause glyph — the Iconsax outline set has no Pause. currentColor. */
function PauseGlyph() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
    </svg>
  )
}

/** Volume glyph (ported from the reference's inline SVG — not lucide).
 *  `currentColor` so it inherits the white control colour over the scrim. */
function VolumeGlyph({ muted }: { muted: boolean }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
      />
      <g opacity={muted ? 0.25 : 1}>
        <path
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
          d="M16 9a5 5 0 0 1 0 6"
        />
        <path
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke="currentColor"
          d="M19.364 18.364a9 9 0 0 0 0-12.728"
        />
      </g>
      {muted && (
        <path
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          d="M16 9.5 21 14.5 M21 9.5 16 14.5"
        />
      )}
    </svg>
  )
}

export default VideoPlayer
