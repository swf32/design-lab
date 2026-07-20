import './Waveform.scss'

import { type HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Minimal mm:ss / h:mm:ss formatter for aria-valuetext.
// Duplicated from AudioPlayer.tsx to avoid a cross-file import inside @klyp/ui.
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return '--:--'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const mm = String(mins).padStart(2, '0')
  const ss = String(secs).padStart(2, '0')
  return hrs > 0 ? `${hrs}:${mm}:${ss}` : `${mins}:${ss}`
}

// =====================================================================
// Waveform + AudioScrubber — Klyp canonical primitives
// =====================================================================
//
// Ported from elevenlabs/ui waveform.tsx (MIT). Logic preserved;
// presentation rewritten for Klyp token system.
//
// Two exports:
//   <Waveform>      — static canvas bar renderer, DPR-aware, ResizeObserver
//   <AudioScrubber> — waveform + click/drag scrub + position handle
//
// Color strategy:
//   - Unplayed bars: var(--color-bg-surface-solid) (neutral)
//   - Played overlay: var(--color-accent) tint via CSS on the fill div
//   - Colors intentionally token-only; no inline hex.

// ------------------------------------------------------------------ //
// Types
// ------------------------------------------------------------------ //

export interface WaveformProps extends HTMLAttributes<HTMLDivElement> {
  /** Normalised peak data (0..1). Generates synthetic bars when absent. */
  peaks?: number[]
  /** Bar width in logical pixels. Default 3. */
  barWidth?: number
  /** Minimum bar height in logical pixels. Default 3. */
  barMinHeight?: number
  /** Gap between bars in logical pixels. Default 1. */
  barGap?: number
  /** Bar corner radius in logical pixels. Default 1. */
  barRadius?: number
  /** Height of the canvas container. Default 40. */
  height?: number | string
  /** Fade out left/right edges. Default true. */
  fadeEdges?: boolean
  /** Width of the edge fade in logical pixels. Default 20. */
  fadeWidth?: number
}

export interface AudioScrubberProps extends WaveformProps {
  /** Playback position (0..1). Default 0. */
  progress?: number
  /** Total duration in seconds — used for aria-valuenow in seconds. */
  duration?: number
  /** Called with new progress (0..1) when user scrubs. */
  onSeek?: (progress: number) => void
  /** Show circular handle at the current position. Default true. */
  showHandle?: boolean
  /** Called once when the user starts a drag (pointer down + capture). */
  onScrubStart?: () => void
  /** Called once when the drag ends (pointer up or cancel). */
  onScrubEnd?: () => void
}

// ------------------------------------------------------------------ //
// Synthetic peaks (seeded pseudo-random — stable across renders)
// ------------------------------------------------------------------ //

function syntheticPeak(index: number, seed = 42): number {
  const x = Math.sin(seed + index * 137.508) * 10000
  const r = x - Math.floor(x)
  return 0.2 + r * 0.6
}

// ------------------------------------------------------------------ //
// Canvas drawing utility — shared by both components
// ------------------------------------------------------------------ //

interface DrawOptions {
  ctx: CanvasRenderingContext2D
  peaks: number[]
  width: number
  height: number
  barWidth: number
  barMinHeight: number
  barGap: number
  barRadius: number
  /** Bar colour CSS string resolved from the element or token. */
  barColor: string
  fadeEdges: boolean
  fadeWidth: number
}

function drawWaveform({
  ctx,
  peaks,
  width,
  height,
  barWidth,
  barMinHeight,
  barGap,
  barRadius,
  barColor,
  fadeEdges,
  fadeWidth,
}: DrawOptions) {
  ctx.clearRect(0, 0, width, height)

  const barCount = Math.floor(width / (barWidth + barGap))
  const centerY = height / 2

  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor((i / barCount) * peaks.length)
    const value = peaks[dataIndex] ?? syntheticPeak(i)
    const barHeight = Math.max(barMinHeight, value * height * 0.8)
    const x = i * (barWidth + barGap)
    const y = centerY - barHeight / 2

    ctx.globalAlpha = 0.3 + value * 0.7
    ctx.fillStyle = barColor

    if (barRadius > 0) {
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, barRadius)
      ctx.fill()
    } else {
      ctx.fillRect(x, y, barWidth, barHeight)
    }
  }

  if (fadeEdges && fadeWidth > 0 && width > 0) {
    const fadePercent = Math.min(0.25, fadeWidth / width)
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    // Use destination-out to mask edges to transparent
    gradient.addColorStop(0, 'rgba(0,0,0,1)')
    gradient.addColorStop(fadePercent, 'rgba(0,0,0,0)')
    gradient.addColorStop(1 - fadePercent, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.globalAlpha = 1
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'source-over'
  }

  ctx.globalAlpha = 1
}

// Resolve the bar colour from CSS custom properties on the canvas element.
// Falls back to a token-compatible string so it works in stories without
// the full token CSS loaded.
function resolveBarColor(el: HTMLCanvasElement): string {
  const style = getComputedStyle(el)
  return (
    style.getPropertyValue('--waveform-bar-color').trim() ||
    style.getPropertyValue('--color-bg-surface-solid').trim() ||
    'rgba(255,255,255,0.25)'
  )
}

// ------------------------------------------------------------------ //
// Waveform — static canvas renderer
// ------------------------------------------------------------------ //

export function Waveform({
  peaks = [],
  barWidth = 3,
  barMinHeight = 3,
  barGap = 1,
  barRadius = 1,
  height = 40,
  fadeEdges = true,
  fadeWidth = 20,
  className,
  style,
  ...rest
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const heightStyle = typeof height === 'number' ? `${height}px` : height

  // Stable peaks reference to avoid re-creating the effect when peak
  // array identity changes but values are the same (story re-renders).
  const peaksRef = useRef(peaks)
  peaksRef.current = peaks

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Check if user prefers reduced motion — skip ResizeObserver animation.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const render = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)

      const currentPeaks =
        peaksRef.current.length > 0
          ? peaksRef.current
          : Array.from({ length: 60 }, (_, i) => syntheticPeak(i))

      drawWaveform({
        ctx,
        peaks: currentPeaks,
        width: rect.width,
        height: rect.height,
        barWidth,
        barMinHeight,
        barGap,
        barRadius,
        barColor: resolveBarColor(canvas),
        fadeEdges,
        fadeWidth,
      })
    }

    const observer = new ResizeObserver(() => {
      if (!prefersReduced) render()
    })
    observer.observe(container)
    render()

    return () => observer.disconnect()
  }, [barWidth, barMinHeight, barGap, barRadius, fadeEdges, fadeWidth])

  return (
    <div
      {...rest}
      ref={containerRef}
      className={`klyp-Waveform${className ? ` ${className}` : ''}`}
      style={{ ...style, height: heightStyle }}
    >
      {/* Decorative render surface — no accessible content (a11y comes from the
          parent: AudioScrubber's role=slider, or the wrapper's aria-hidden). */}
      <canvas ref={canvasRef} className="klyp-Waveform__canvas" />
    </div>
  )
}

// ------------------------------------------------------------------ //
// AudioScrubber — waveform + scrub interaction
// ------------------------------------------------------------------ //

export function AudioScrubber({
  peaks = [],
  progress = 0,
  duration,
  onSeek,
  showHandle = true,
  onScrubStart,
  onScrubEnd,
  barWidth = 3,
  barMinHeight = 3,
  barGap = 1,
  barRadius = 1,
  height = 40,
  fadeEdges = false,
  fadeWidth = 0,
  className,
  style,
  // Destructure pointer/key events out of rest so they cannot clobber
  // the internal handlers placed explicitly in the JSX below.
  onPointerDown: _onPointerDown,
  onPointerMove: _onPointerMove,
  onPointerUp: _onPointerUp,
  onPointerCancel: _onPointerCancel,
  onKeyDown: _onKeyDown,
  ...rest
}: AudioScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localProgress, setLocalProgress] = useState(progress)
  const wasDraggingRef = useRef(false)

  // Keep localProgress in sync when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress)
    }
  }, [progress, isDragging])

  const handleScrub = useCallback(
    (clientX: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      const p = x / rect.width
      setLocalProgress(p)
      onSeek?.(p)
    },
    [onSeek],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      containerRef.current?.setPointerCapture(e.pointerId)
      wasDraggingRef.current = false
      setIsDragging(true)
      handleScrub(e.clientX)
      onScrubStart?.()
    },
    [handleScrub, onScrubStart],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      wasDraggingRef.current = true
      handleScrub(e.clientX)
    },
    [isDragging, handleScrub],
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    onScrubEnd?.()
  }, [onScrubEnd])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = 0.01
      const bigStep = 0.1 // PageUp / PageDown jump ±10%
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        const p = Math.min(1, localProgress + step)
        setLocalProgress(p)
        onSeek?.(p)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        const p = Math.max(0, localProgress - step)
        setLocalProgress(p)
        onSeek?.(p)
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        const p = Math.min(1, localProgress + bigStep)
        setLocalProgress(p)
        onSeek?.(p)
      } else if (e.key === 'PageDown') {
        e.preventDefault()
        const p = Math.max(0, localProgress - bigStep)
        setLocalProgress(p)
        onSeek?.(p)
      } else if (e.key === 'Home') {
        e.preventDefault()
        setLocalProgress(0)
        onSeek?.(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setLocalProgress(1)
        onSeek?.(1)
      }
    },
    [localProgress, onSeek],
  )

  const heightStyle = typeof height === 'number' ? `${height}px` : height
  const pct = `${localProgress * 100}%`

  // Synthetic peaks when none provided — stable via useMemo
  const resolvedPeaks = useMemo(
    () => (peaks.length > 0 ? peaks : Array.from({ length: 100 }, (_, i) => syntheticPeak(i))),
    [peaks],
  )

  return (
    <div
      {...rest}
      ref={containerRef}
      role="slider"
      aria-label="Audio scrubber"
      aria-valuemin={0}
      aria-valuemax={duration !== undefined ? duration : 100}
      aria-valuenow={
        duration !== undefined ? localProgress * duration : Math.round(localProgress * 100)
      }
      aria-valuetext={duration !== undefined ? formatTime(localProgress * duration) : undefined}
      aria-disabled={duration === undefined ? true : undefined}
      tabIndex={0}
      className={`klyp-Waveform klyp-Waveform--scrubber${className ? ` ${className}` : ''}`}
      style={{ ...style, height: heightStyle }}
      data-dragging={isDragging ? '' : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      {/* Waveform bars rendered inline without the outer wrapper */}
      <WaveformCanvas
        peaks={resolvedPeaks}
        barWidth={barWidth}
        barMinHeight={barMinHeight}
        barGap={barGap}
        barRadius={barRadius}
        fadeEdges={fadeEdges}
        fadeWidth={fadeWidth}
      />

      {/* Played-portion tint overlay */}
      <div className="klyp-Waveform__playedFill" aria-hidden="true" style={{ width: pct }} />

      {/* Playhead line */}
      <div className="klyp-Waveform__playhead" aria-hidden="true" style={{ left: pct }} />

      {/* Circular handle */}
      {showHandle && (
        <div className="klyp-Waveform__handle" aria-hidden="true" style={{ left: pct }} />
      )}
    </div>
  )
}

// ------------------------------------------------------------------ //
// WaveformCanvas — internal canvas sub-element used by AudioScrubber
// ------------------------------------------------------------------ //

interface WaveformCanvasProps {
  peaks: number[]
  barWidth: number
  barMinHeight: number
  barGap: number
  barRadius: number
  fadeEdges: boolean
  fadeWidth: number
}

function WaveformCanvas({
  peaks,
  barWidth,
  barMinHeight,
  barGap,
  barRadius,
  fadeEdges,
  fadeWidth,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const peaksRef = useRef(peaks)
  peaksRef.current = peaks

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Skip redundant ResizeObserver redraws under reduced motion,
    // mirroring the guard in the static Waveform component above.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const render = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)

      drawWaveform({
        ctx,
        peaks: peaksRef.current,
        width: rect.width,
        height: rect.height,
        barWidth,
        barMinHeight,
        barGap,
        barRadius,
        barColor: resolveBarColor(canvas),
        fadeEdges,
        fadeWidth,
      })
    }

    const observer = new ResizeObserver(() => {
      if (!prefersReduced) render()
    })
    observer.observe(container)
    render()
    return () => observer.disconnect()
  }, [barWidth, barMinHeight, barGap, barRadius, fadeEdges, fadeWidth])

  return (
    <div ref={containerRef} className="klyp-Waveform__canvasWrap" aria-hidden="true">
      {/* Decorative render surface — no accessible content (a11y comes from the
          parent: AudioScrubber's role=slider, or the wrapper's aria-hidden). */}
      <canvas ref={canvasRef} className="klyp-Waveform__canvas" />
    </div>
  )
}

export default Waveform
