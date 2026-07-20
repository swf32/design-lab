import './AudioPlayer.scss'

import {
  createContext,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button as RACButton } from 'react-aria-components'

// AudioPlayer lives in @klyp/ui (tier 2 — no brand deps).
// It is consumed from both klyp and unreals builds via brand-neutral import.
// The audio element accessible label is supplied as a prop so the consumer
// (tier 4/5) can pass a brand-aware string without polluting this primitive.
// Default falls back to English so standalone stories still work.
const DEFAULT_AUDIO_LABEL = 'Generated audio'

import { AudioScrubber } from '../Waveform/Waveform'

// =====================================================================
// AudioPlayer — Klyp canonical primitive
// =====================================================================
//
// Ported from elevenlabs/ui audio-player.tsx (MIT). Logic preserved;
// presentation rewritten for Klyp stack:
//   - React Aria ToggleButton/Button for play-pause + rate cycling
//   - AudioScrubber (Waveform.tsx) for the track scrubber
//   - BEM + data-attrs, tokens only in SCSS
//   - No lucide / shadcn / Radix / cn() / cva()
//
// Architecture:
//   AudioPlayerProvider — hidden <audio>, rAF sync, play-promise guard
//   useAudioPlayer()    — consumer hook for state + actions
//   useAudioPlayerTime()— separate low-cost time context (high-frequency)
//   AudioPlayer         — composed component (play btn + scrubber + times)

// ------------------------------------------------------------------ //
// Helpers
// ------------------------------------------------------------------ //

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return '--:--'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const mm = String(mins).padStart(2, '0')
  const ss = String(secs).padStart(2, '0')
  return hrs > 0 ? `${hrs}:${mm}:${ss}` : `${mins}:${ss}`
}

// ------------------------------------------------------------------ //
// useAnimationFrame — rAF loop utility (ported from elevenlabs/ui)
// ------------------------------------------------------------------ //

type RafCallback = (delta: number) => void

function useAnimationFrame(callback: RafCallback) {
  const requestRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number | null>(null)
  const callbackRef = useRef<RafCallback>(callback)
  callbackRef.current = callback

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        callbackRef.current(time - previousTimeRef.current)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current)
      previousTimeRef.current = null
    }
  }, [])
}

// ------------------------------------------------------------------ //
// ReadyState / NetworkState constants (mirrors HTMLMediaElement)
// ------------------------------------------------------------------ //

const ReadyState = {
  HaveNothing: 0,
  HaveMetadata: 1,
  HaveCurrentData: 2,
  HaveFutureData: 3,
  HaveEnoughData: 4,
} as const

const NetworkState = {
  Empty: 0,
  Idle: 1,
  Loading: 2,
  NoSource: 3,
} as const

// ------------------------------------------------------------------ //
// Context API types
// ------------------------------------------------------------------ //

export interface AudioPlayerApi {
  ref: React.RefObject<HTMLAudioElement | null>
  duration: number | undefined
  error: MediaError | null
  isPlaying: boolean
  isBuffering: boolean
  playbackRate: number
  play: () => Promise<void>
  pause: () => Promise<void>
  seek: (time: number) => void
  setPlaybackRate: (rate: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerApi | null>(null)
const AudioPlayerTimeContext = createContext<number>(0)

export function useAudioPlayer(): AudioPlayerApi {
  const api = useContext(AudioPlayerContext)
  if (!api) throw new Error('useAudioPlayer must be used inside AudioPlayerProvider')
  return api
}

export function useAudioPlayerTime(): number {
  return useContext(AudioPlayerTimeContext)
}

// ------------------------------------------------------------------ //
// AudioPlayerProvider
// ------------------------------------------------------------------ //

export interface AudioPlayerProviderProps {
  /** Audio URL to load. Changing `src` resets playback. */
  src: string
  children: ReactNode
  /**
   * Accessible name for the hidden `<audio>` element.
   * Pass a brand-aware string from the consumer tier.
   * Defaults to "Generated audio" for standalone stories.
   */
  audioLabel?: string
}

export function AudioPlayerProvider({ src, children, audioLabel }: AudioPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  const srcRef = useRef(src)

  const [readyState, setReadyState] = useState<number>(0)
  const [networkState, setNetworkState] = useState<number>(NetworkState.Empty)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState<number | undefined>(undefined)
  const [error, setError] = useState<MediaError | null>(null)
  const [paused, setPaused] = useState(true)
  const [playbackRate, setPlaybackRateState] = useState(1)

  // Swap src when it changes
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    // Guard: don't reload if src didn't change
    if (srcRef.current === src && el.src) return
    srcRef.current = src
    const currentRate = el.playbackRate
    el.pause()
    el.currentTime = 0
    el.src = src
    el.load()
    el.playbackRate = currentRate
  }, [src])

  // rAF sync — mirrors elevenlabs/ui exactly
  useAnimationFrame(() => {
    const el = audioRef.current
    if (!el) return
    setReadyState(el.readyState)
    setNetworkState(el.networkState)
    setTime(el.currentTime)
    setDuration(Number.isFinite(el.duration) ? el.duration : undefined)
    setPaused(el.paused)
    setError(el.error)
    setPlaybackRateState(el.playbackRate)
  })

  const play = useCallback(async () => {
    const el = audioRef.current
    if (!el) return
    // Await any pending play promise to avoid AbortError race
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current
      } catch (_e) {
        /* ignore */
      }
    }
    const p = el.play()
    playPromiseRef.current = p
    return p
  }, [])

  const pause = useCallback(async () => {
    const el = audioRef.current
    if (!el) return
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current
      } catch (_e) {
        /* ignore */
      }
    }
    el.pause()
    playPromiseRef.current = null
  }, [])

  const seek = useCallback((t: number) => {
    const el = audioRef.current
    if (!el) return
    el.currentTime = t
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    const el = audioRef.current
    if (!el) return
    el.playbackRate = rate
    setPlaybackRateState(rate)
  }, [])

  const isPlaying = !paused
  const isBuffering =
    readyState < ReadyState.HaveFutureData && networkState === NetworkState.Loading

  const api = useMemo<AudioPlayerApi>(
    () => ({
      ref: audioRef,
      duration,
      error,
      isPlaying,
      isBuffering,
      playbackRate,
      play,
      pause,
      seek,
      setPlaybackRate,
    }),
    [duration, error, isPlaying, isBuffering, playbackRate, play, pause, seek, setPlaybackRate],
  )

  return (
    <AudioPlayerContext.Provider value={api}>
      <AudioPlayerTimeContext.Provider value={time}>
        {/* Hidden audio element — crossOrigin="anonymous" for potential Web Audio use. */}
        {/* biome-ignore lint/a11y/useMediaCaption: generated TTS/audio has no captions to ship */}
        <audio
          ref={audioRef}
          style={{ display: 'none' }}
          crossOrigin="anonymous"
          aria-label={audioLabel ?? DEFAULT_AUDIO_LABEL}
        />
        {children}
      </AudioPlayerTimeContext.Provider>
    </AudioPlayerContext.Provider>
  )
}

// ------------------------------------------------------------------ //
// PlaybackRate cycling button
// ------------------------------------------------------------------ //

const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2, 0.5, 0.75] as const

function formatRateLabel(rate: number): string {
  return rate === 1 ? '1×' : `${rate}×`
}

// Widest label in the cycle, rendered as a hidden in-flow sizer inside the
// button — the label's glyph count flips 2↔5 ('1×' vs '1.25×') on almost every
// press, and without a reserved width the content-sized button resizes, the
// flex:1 scrubber absorbs the delta and the whole player row visibly jumps.
const WIDEST_RATE_LABEL = PLAYBACK_RATES.map(formatRateLabel).reduce((a, b) =>
  b.length > a.length ? b : a,
)

function PlaybackRateButton({ ref }: { ref?: Ref<HTMLButtonElement> }) {
  const { playbackRate, setPlaybackRate } = useAudioPlayer()

  const cycle = useCallback(() => {
    const idx = PLAYBACK_RATES.indexOf(playbackRate as (typeof PLAYBACK_RATES)[number])
    const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length] ?? 1
    setPlaybackRate(next)
  }, [playbackRate, setPlaybackRate])

  const label = formatRateLabel(playbackRate)

  return (
    <RACButton
      ref={ref}
      className="klyp-AudioPlayer__rateBtn"
      aria-label={`Playback speed: ${label}. Press to change.`}
      onPress={cycle}
    >
      <span className="klyp-AudioPlayer__rateLabel" aria-hidden="true">
        {label}
      </span>
      <span className="klyp-AudioPlayer__rateSizer" aria-hidden="true">
        {WIDEST_RATE_LABEL}
      </span>
    </RACButton>
  )
}

// ------------------------------------------------------------------ //
// PlayPauseButton — uses RAC Button (not ToggleButton) for simplicity
// ------------------------------------------------------------------ //

// NOTE: No PauseOutline in packages/icons/src/outline.tsx as of 2026-05-31.
// Using inline SVG for pause (two vertical bars) consistent with how
// Button.tsx uses inline SVGs for its state icons. Play uses PlayOutline
// from @klyp/icons — but @klyp/icons is a @klyp/brand tier dep, not
// available in @klyp/ui (tier 2). Using inline SVGs for both to stay
// within the tier boundary (same pattern as Button.tsx's inline SVGs).

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.87 21.28C7.08 21.28 6.33 21.09 5.67 20.71C4.11 19.81 3.25 17.98 3.25 15.57V8.44C3.25 6.02 4.11 4.2 5.67 3.3C7.23 2.4 9.24 2.57 11.34 3.78L17.51 7.34C19.6 8.55 20.76 10.21 20.76 12.01C20.76 13.81 19.61 15.47 17.51 16.68L11.34 20.24C10.13 20.93 8.95 21.28 7.87 21.28Z" />
    </svg>
  )
}

function PauseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="5" y="3" width="4" height="18" rx="2" />
      <rect x="15" y="3" width="4" height="18" rx="2" />
    </svg>
  )
}

function SpinnerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="klyp-AudioPlayer__spinnerSvg"
    >
      <path
        d="M21 12a9 9 0 1 1-6.219-8.56"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  )
}

interface PlayPauseButtonProps {
  ref?: Ref<HTMLButtonElement>
}

function PlayPauseButton({ ref }: PlayPauseButtonProps) {
  const { isPlaying, isBuffering, play, pause } = useAudioPlayer()

  const handlePress = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  return (
    <RACButton
      ref={ref}
      className="klyp-AudioPlayer__playBtn"
      aria-label={isPlaying ? 'Pause' : 'Play'}
      aria-pressed={isPlaying}
      onPress={handlePress}
    >
      {isBuffering && isPlaying ? (
        <SpinnerIcon size={16} />
      ) : isPlaying ? (
        <PauseIcon size={16} />
      ) : (
        <PlayIcon size={16} />
      )}
    </RACButton>
  )
}

// ------------------------------------------------------------------ //
// Time readout sub-components
// ------------------------------------------------------------------ //

/** Current playback position readout — updates at rAF rate via context.
 *  Hidden sizers reserve the widest width this readout can reach — the full
 *  duration (current time never exceeds it) and the pre-metadata '--:--'
 *  placeholder — so the flex row doesn't shift when metadata resolves or the
 *  minute digit count grows (9:59 → 10:00). */
export function AudioPlayerCurrentTime({
  label = 'Current time',
}: {
  /** Accessible label. Pass a brand-aware string (e.g. "Текущее время"). */
  label?: string
}) {
  const time = useAudioPlayerTime()
  const { duration } = useAudioPlayer()
  return (
    <span
      role="status"
      className="klyp-AudioPlayer__time"
      data-align="end"
      aria-live="off"
      aria-label={label}
    >
      <span className="klyp-AudioPlayer__timeValue">{formatTime(time)}</span>
      {duration !== undefined && (
        <span className="klyp-AudioPlayer__timeSizer" aria-hidden="true">
          {formatTime(duration)}
        </span>
      )}
      <span className="klyp-AudioPlayer__timeSizer" aria-hidden="true">
        --:--
      </span>
    </span>
  )
}

/** Total duration readout. The '--:--' sizer keeps the reserved width from
 *  shrinking below the pre-metadata placeholder once the real duration lands. */
export function AudioPlayerDuration({
  label = 'Duration',
}: {
  /** Accessible label. Pass a brand-aware string (e.g. "Длительность"). */
  label?: string
}) {
  const { duration } = useAudioPlayer()
  return (
    <span role="status" className="klyp-AudioPlayer__time" aria-label={label}>
      <span className="klyp-AudioPlayer__timeValue">
        {duration !== undefined ? formatTime(duration) : '--:--'}
      </span>
      <span className="klyp-AudioPlayer__timeSizer" aria-hidden="true">
        --:--
      </span>
    </span>
  )
}

// ------------------------------------------------------------------ //
// AudioPlayerScrubber — wires AudioScrubber to the player context
// ------------------------------------------------------------------ //

interface AudioPlayerScrubberProps {
  peaks?: number[]
  height?: number
}

function AudioPlayerScrubber({ peaks, height = 32 }: AudioPlayerScrubberProps) {
  const { isPlaying, duration, play, pause, seek } = useAudioPlayer()
  const time = useAudioPlayerTime()
  const wasPlayingRef = useRef(false)

  const progress = duration && duration > 0 ? time / duration : 0

  const handleScrubStart = useCallback(() => {
    wasPlayingRef.current = isPlaying
    if (isPlaying) pause()
  }, [isPlaying, pause])

  const handleSeek = useCallback(
    (p: number) => {
      if (duration !== undefined) {
        seek(p * duration)
      }
    },
    [duration, seek],
  )

  const handleScrubEnd = useCallback(() => {
    if (wasPlayingRef.current) play()
  }, [play])

  return (
    <AudioScrubber
      peaks={peaks}
      progress={progress}
      duration={duration}
      height={height}
      onSeek={handleSeek}
      onScrubStart={handleScrubStart}
      onScrubEnd={handleScrubEnd}
    />
  )
}

// ------------------------------------------------------------------ //
// AudioPlayer — composed component
// ------------------------------------------------------------------ //

export interface AudioPlayerProps {
  /** Audio source URL. */
  src: string
  /** Pre-computed waveform peaks (0..1). Synthetic fallback when absent. */
  peaks?: number[]
  /** Extra class name on the root element. */
  className?: string
  /**
   * Accessible name for the hidden `<audio>` element.
   * Brand-aware: pass "Generated audio" (EN) or "Сгенерированное аудио" (RU).
   * Defaults to "Generated audio".
   */
  audioLabel?: string
  /**
   * Accessible label for the current-time readout span.
   * Brand-aware: "Current time" (EN) / "Текущее время" (RU).
   */
  currentTimeLabel?: string
  /**
   * Accessible label for the duration readout span.
   * Brand-aware: "Duration" (EN) / "Длительность" (RU).
   */
  durationLabel?: string
}

/**
 * Fully-composed inline audio player for TTS results.
 *
 * Layout: [PlayPause] [Scrubber    ] [CurrentTime / Duration] [Rate]
 *
 * Wraps its own AudioPlayerProvider — suitable as a standalone drop-in.
 * For playlist / multi-track use, compose your own tree with
 * `AudioPlayerProvider` + `useAudioPlayer`.
 */
export function AudioPlayer({
  src,
  peaks,
  className,
  audioLabel,
  currentTimeLabel,
  durationLabel,
}: AudioPlayerProps) {
  return (
    <AudioPlayerProvider src={src} audioLabel={audioLabel}>
      <AudioPlayerInner
        peaks={peaks}
        className={className}
        currentTimeLabel={currentTimeLabel}
        durationLabel={durationLabel}
      />
    </AudioPlayerProvider>
  )
}

// Inner — reads from context (must be a child of AudioPlayerProvider)
function AudioPlayerInner({
  peaks,
  className,
  currentTimeLabel,
  durationLabel,
}: {
  peaks?: number[]
  className?: string
  currentTimeLabel?: string
  durationLabel?: string
}) {
  const { isPlaying, isBuffering, duration } = useAudioPlayer()
  const disabled = duration === undefined

  return (
    <div
      className={`klyp-AudioPlayer${className ? ` ${className}` : ''}`}
      data-playing={isPlaying ? '' : undefined}
      data-loading={isBuffering ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      <PlayPauseButton />
      <div className="klyp-AudioPlayer__track">
        <AudioPlayerScrubber peaks={peaks} />
      </div>
      <div className="klyp-AudioPlayer__times">
        <AudioPlayerCurrentTime label={currentTimeLabel} />
        <span className="klyp-AudioPlayer__timeSep" aria-hidden="true">
          /
        </span>
        <AudioPlayerDuration label={durationLabel} />
      </div>
      <PlaybackRateButton />
    </div>
  )
}

export default AudioPlayer
