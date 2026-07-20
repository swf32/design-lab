import './VoiceDictation.scss'

import { MicrophoneBulk } from '@klyp/icons/bulk'
import { CheckOutline, CloseCircleOutline, MicrophoneSlashOutline } from '@klyp/icons/outline'
import { Spinner } from '@klyp/ui/Spinner'
import { ToolButton } from '@klyp/ui/ToolButton'
import { useReducedMotion } from 'motion/react'
import {
  memo,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useBrand } from '../_brand-context'
import { type AudioCaptureResult, type RecorderError, useAudioRecorder } from './useAudioRecorder'

// ============================================================================
// VoiceDictation — composer mic button + recording pill (speech → editable text)
// ============================================================================
//
// A SELF-CONTAINED, reusable dictation control. It is NOT "Voice Mode"
// (speech-to-speech) — it captures a chunk of speech and hands back editable
// text. The mic is a permanent control: it never morphs into Send, and the
// transcript is APPENDED at the cursor (the consumer decides how) — never
// auto-sent.
//
// Trigger: tap-toggle (tap to start, ✓/Esc/Cancel to stop) OR hold-to-talk
// (press & hold, release to finish; slide away while holding to cancel). The
// decision is made on press-release by the press duration vs `holdThresholdMs`.
//
// Decoupled from the backend: the consumer supplies `onTranscribe` (calls the
// STT action and resolves text) and `onResult` (inserts the text). This package
// (`@klyp/brand`) must not know about Convex/the app.

const COPY = {
  klyp: {
    dictate: 'Start dictation',
    stop: 'Stop dictation',
    hint: 'Tap to dictate, hold to talk',
    requesting: 'Requesting microphone access',
    recording: 'Recording',
    transcribing: 'Transcribing…',
    cancel: 'Cancel',
    done: 'Done',
    slideCancel: 'Slide away to cancel',
    releaseCancel: 'Release to cancel',
    noSpeech: 'Didn’t catch that',
    denied: 'Microphone access denied',
    noDevice: 'No microphone found',
    unsupported: 'Recording isn’t supported here',
    failed: 'Couldn’t transcribe — tap to record again',
  },
  unreals: {
    dictate: 'Начать диктовку',
    stop: 'Остановить диктовку',
    hint: 'Тап — диктовать, зажми — говорить',
    requesting: 'Запрашиваю доступ к микрофону',
    recording: 'Идёт запись',
    transcribing: 'Расшифровываю…',
    cancel: 'Отмена',
    done: 'Готово',
    slideCancel: 'Отведи палец — отмена',
    releaseCancel: 'Отпусти — отмена',
    noSpeech: 'Не расслышал',
    denied: 'Нет доступа к микрофону',
    noDevice: 'Микрофон не найден',
    unsupported: 'Запись тут не поддерживается',
    failed: 'Не удалось расшифровать — нажми, чтобы записать снова',
  },
} as const

export type VoiceDictationView =
  | 'idle'
  | 'permission'
  | 'holding'
  | 'toggle'
  | 'transcribing'
  | 'error'

type View = VoiceDictationView

/** Pointer travel (px) past which a hold gesture is read as "slide to cancel". */
const SLIDE_CANCEL_PX = 64
/** Warn (tint the timer) in the final stretch before the auto-stop cap. */
const CAP_WARN_MS = 10_000

export interface VoiceDictationProps {
  /**
   * Transcribe a captured audio chunk → text. Supplied by the consumer (wires
   * it to the STT backend). Reject to surface an error state.
   */
  onTranscribe: (audio: AudioCaptureResult) => Promise<string>
  /** Receives the final transcript to insert (the consumer appends at cursor). */
  onResult: (text: string) => void
  /** Disable the control (e.g. while the composer is busy submitting). */
  disabled?: boolean
  /**
   * Stretch to fill the container width — the recording bar's waveform grows
   * and its bar count scales with width. For full-width surfaces; default is
   * intrinsic width (a square mic button inline next to other controls).
   */
  fluid?: boolean
  /**
   * While recording, lift the bar into a full-width ABSOLUTE overlay that
   * covers its (position:relative) parent — e.g. the composer footer, so the
   * Send button is hidden and can't be hit by accident. Implies fluid.
   * The ✗ / ✓ cluster mirrors the footer geometry in pure CSS: ✗ takes the
   * mic's exact slot, ✓ takes Send's. Contract: the mic sits immediately
   * before a square --control-size-md control at the end of the row.
   */
  cover?: boolean
  /** Auto-stop a recording after this many ms. Default 120000 (2 min). */
  maxDurationMs?: number
  /** Press shorter than this = tap (toggle); longer = hold (push-to-talk). Default 500. */
  holdThresholdMs?: number
  /** Optional sink for permission / capture / transcription errors (message is brand-localized). */
  onError?: (error: RecorderError) => void
  /**
   * Story / catalog only — force a visual state for preview (the live states
   * are runtime-driven by the mic). Disables capture. Ignored in normal use.
   */
  previewState?: VoiceDictationView
  /** Extra class on the root wrapper. */
  className?: string
  /** React 19 ref-as-prop. */
  ref?: Ref<HTMLDivElement>
}

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VoiceDictation({
  onTranscribe,
  onResult,
  disabled = false,
  fluid = false,
  cover = false,
  maxDurationMs = 120_000,
  holdThresholdMs = 500,
  onError,
  previewState,
  className,
  ref,
}: VoiceDictationProps) {
  const { brandId } = useBrand()
  const t = COPY[brandId]
  const reduce = useReducedMotion() ?? false

  const [transcribing, setTranscribing] = useState(false)
  const [toggleActive, setToggleActive] = useState(false)
  const [nothingHeard, setNothingHeard] = useState(false)
  // While holding, a swipe arms ✗ (cancel) or ✓ (done) — the released gesture
  // fires that action. Highlights the corresponding icon.
  const [armed, setArmed] = useState<'cancel' | 'done' | null>(null)
  const [err, setErr] = useState<RecorderError | null>(null)
  // Set the instant the user hits ✗ / ✓ so the bar collapses to the mic at once
  // (no flash of the `holding` dot while the recorder asynchronously stops).
  const [closing, setClosing] = useState(false)

  const pressStartRef = useRef(0)
  const abandonRef = useRef(false)
  const stopWhenReadyRef = useRef(false)
  const pressPointRef = useRef<{ x: number; y: number } | null>(null)
  const armedRef = useRef<'cancel' | 'done' | null>(null)
  const noSpeechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // The in-flight window pointerup/cancel handler, so unmount mid-press can
  // detach it (it normally self-removes on release).
  const pointerUpRef = useRef<(() => void) | null>(null)

  const internalRootRef = useRef<HTMLDivElement>(null)
  const prevViewRef = useRef<View>('idle')

  // Merge the forwarded ref with an internal one so focus management can find
  // the mic / pill controls by class (ToolButton doesn't forward a ref).
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      internalRootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node
    },
    [ref],
  )

  const onErrorRef = useRef(onError)
  useEffect(() => {
    onErrorRef.current = onError
  })

  const localizedError = useCallback(
    (e: RecorderError): string => {
      switch (e.kind) {
        case 'permission-denied':
          return t.denied
        case 'no-device':
          return t.noDevice
        case 'unsupported':
        case 'insecure-context':
          return t.unsupported
        default:
          return t.failed
      }
    },
    [t],
  )

  const flashNothingHeard = useCallback(() => {
    setNothingHeard(true)
    if (noSpeechTimerRef.current) clearTimeout(noSpeechTimerRef.current)
    noSpeechTimerRef.current = setTimeout(() => setNothingHeard(false), 2200)
  }, [])

  const handleComplete = useCallback(
    async (audio: AudioCaptureResult) => {
      setToggleActive(false)
      // NB: abandonRef is reset in beginPress (not here) so a Cancel arriving
      // between stop() and the stop event is honoured.
      if (audio.blob.size === 0) {
        if (!abandonRef.current) flashNothingHeard()
        return
      }
      setTranscribing(true)
      try {
        const text = await onTranscribe(audio)
        if (!abandonRef.current) {
          const trimmed = text.trim()
          if (trimmed) onResult(trimmed)
          else flashNothingHeard()
        }
      } catch {
        if (!abandonRef.current) {
          const re: RecorderError = { kind: 'capture-failed', message: t.failed }
          setErr(re)
          onErrorRef.current?.(re)
        }
      } finally {
        setTranscribing(false)
      }
    },
    [onTranscribe, onResult, t, flashNothingHeard],
  )

  const handleError = useCallback(
    (e: RecorderError) => {
      setErr(e)
      // Forward a brand-localized message so consumers (toasts) never leak EN.
      onErrorRef.current?.({ kind: e.kind, message: localizedError(e) })
    },
    [localizedError],
  )

  const { status, elapsedMs, analyserRef, start, stop, cancel } = useAudioRecorder({
    onComplete: handleComplete,
    onError: handleError,
    maxDurationMs,
  })

  const beginPress = useCallback(() => {
    if (previewState || disabled || transcribing) return
    if (status !== 'idle') return
    setErr(null)
    setNothingHeard(false)
    setClosing(false)
    pressStartRef.current = Date.now()
    stopWhenReadyRef.current = false
    abandonRef.current = false
    setToggleActive(false)
    void start()
  }, [previewState, disabled, transcribing, status, start])

  const handleCancel = useCallback(() => {
    abandonRef.current = true
    stopWhenReadyRef.current = false
    setClosing(true)
    setToggleActive(false)
    setTranscribing(false)
    cancel()
  }, [cancel])

  const endPress = useCallback(() => {
    const dur = Date.now() - pressStartRef.current
    pressStartRef.current = 0
    if (dur >= holdThresholdMs) {
      // Hold released. Swiped toward ✗ → cancel; otherwise (toward ✓ or neutral)
      // finish + transcribe. Collapse the bar to the mic at once either way.
      if (armedRef.current === 'cancel') {
        handleCancel()
        return
      }
      setClosing(true)
      if (status === 'recording') stop()
      else stopWhenReadyRef.current = true
    } else {
      // Quick tap → keep recording in toggle mode. Decided on duration alone, so
      // an ultra-fast tap (before getUserMedia resolves) still lands in toggle.
      // Clear any swipe-arm caught mid-press so ✗/✓ don't stay highlighted.
      armedRef.current = null
      setArmed(null)
      setToggleActive(true)
    }
  }, [status, holdThresholdMs, stop, handleCancel])

  // Hold released while the permission prompt was still open → stop once live.
  useEffect(() => {
    if (status === 'recording' && stopWhenReadyRef.current) {
      stopWhenReadyRef.current = false
      stop()
    }
  }, [status, stop])

  const handleDone = useCallback(() => {
    // Collapse to the mic the instant ✓ is hit; transcription runs in the
    // background and the consumer inserts the text when it resolves.
    setClosing(true)
    stop()
  }, [stop])

  // Clear the closing / armed latches once the recorder settles back to idle.
  useEffect(() => {
    if (status === 'idle') {
      setClosing(false)
      setArmed(null)
      armedRef.current = null
    }
  }, [status])

  // The press lives on the stable face container (not the mic glyph), so the
  // collapsed→expanded morph never unmounts the pressed element mid-hold.
  // `endPressRef` keeps the window-pointerup closure on the latest endPress
  // (status changes between press-down and release).
  const endPressRef = useRef(endPress)
  useEffect(() => {
    endPressRef.current = endPress
  }, [endPress])

  // Cover mode needs NO runtime positioning: the bar's ✗ ✓ cluster mirrors the
  // footer's own geometry in CSS (same --control-size-md squares, same --space-8
  // gap, flush right edge), so ✗ lands on the mic slot and ✓ on the Send slot at
  // any width — see the [data-cover] rule in VoiceDictation.scss. (The previous
  // press-time getBoundingClientRect measurement was off by the face border +
  // gap mismatch and went stale on resize.)

  const onFacePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // Only the collapsed (idle) face starts a press; once expanded the ✗ / ✓
      // controls own the interaction.
      if (previewState || disabled || transcribing || status !== 'idle') return
      pressPointRef.current = { x: e.clientX, y: e.clientY }
      armedRef.current = null
      setArmed(null)
      beginPress()
      const onUp = () => {
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        pointerUpRef.current = null
        endPressRef.current()
      }
      pointerUpRef.current = onUp
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [previewState, disabled, transcribing, status, beginPress],
  )

  const onFaceKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return
      if (previewState || disabled || transcribing || status !== 'idle') return
      e.preventDefault()
      pressStartRef.current = Date.now()
      beginPress()
      // Keyboard can't express a hold → a key activation is always a tap (toggle).
      setToggleActive(true)
    },
    [previewState, disabled, transcribing, status, beginPress],
  )

  const view: View =
    previewState ??
    (err
      ? 'error'
      : transcribing
        ? 'transcribing'
        : status === 'recording'
          ? closing
            ? 'idle' // ✗ / ✓ pressed → collapse at once, no `holding` flash
            : toggleActive
              ? 'toggle'
              : 'holding'
          : status === 'requesting'
            ? 'permission'
            : 'idle')

  // Swipe-to-act tracking — only while holding (push-to-talk in progress).
  // Past the threshold, the dominant axis picks the action: right / up = ✓ (done),
  // left / down = ✗ (cancel). The armed icon highlights; release fires it.
  useEffect(() => {
    if (view !== 'holding') return
    const onMove = (e: PointerEvent) => {
      const p = pressPointRef.current
      if (!p) return
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      let next: 'cancel' | 'done' | null = null
      if (Math.hypot(dx, dy) > SLIDE_CANCEL_PX) {
        next =
          Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'done' : 'cancel') : dy < 0 ? 'done' : 'cancel'
      }
      if (next !== armedRef.current) {
        armedRef.current = next
        setArmed(next)
      }
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [view])

  // Esc cancels an in-flight recording / transcription.
  useEffect(() => {
    if (status !== 'recording' && !transcribing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, transcribing, handleCancel])

  // Managed focus across the mic↔pill swap (the mic unmounts in toggle/
  // transcribing). Only acts on real view transitions, never on mount — so it
  // doesn't steal focus when the component first renders.
  useEffect(() => {
    // Story / catalog preview forces a view — don't grab focus there.
    if (previewState) return
    const prev = prevViewRef.current
    prevViewRef.current = view
    if (prev === view) return
    const root = internalRootRef.current
    if (!root) return
    const focus = (sel: string) => (root.querySelector(sel) as HTMLElement | null)?.focus()
    if (view === 'toggle') focus('.klyp-VoiceDictation__done')
    // transcribing is collapsed (no ✗/✓) → keep focus on the busy face button.
    else if (view === 'transcribing') focus('.klyp-VoiceDictation__face')
    else if ((view === 'idle' || view === 'error') && prev !== 'idle')
      focus('.klyp-VoiceDictation__face')
  }, [view, previewState])

  useEffect(
    () => () => {
      if (noSpeechTimerRef.current) clearTimeout(noSpeechTimerRef.current)
      // Detach a still-attached press listener if we unmount mid-press.
      const onUp = pointerUpRef.current
      if (onUp) {
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
      }
    },
    [],
  )

  // Expanded = the recording bar is showing; collapsed = the mic button.
  // `transcribing` stays collapsed (it runs in the background after ✓). The
  // press lives on the stable face so a held gesture survives the swap.
  const expanded = view === 'holding' || view === 'toggle'
  const collapsed = !expanded
  const micRecording = view === 'holding'
  const nearCap = status === 'recording' && maxDurationMs - elapsedMs <= CAP_WARN_MS
  // The error message is carried by the role=alert span; keep the focused face's
  // accessible name generic so a screen reader doesn't read the error twice.
  const micLabel = view === 'transcribing' ? t.transcribing : micRecording ? t.stop : t.dictate

  // Single, stable announcement source (the visual pill must NOT be a live
  // region — its ticking timer would spam the screen reader every ~200ms).
  const liveMessage =
    view === 'permission'
      ? t.requesting
      : view === 'transcribing'
        ? t.transcribing
        : view === 'holding' || view === 'toggle'
          ? t.recording
          : nothingHeard
            ? t.noSpeech
            : ''

  return (
    <div
      ref={setRootRef}
      className={['klyp-VoiceDictation', className].filter(Boolean).join(' ')}
      data-view={view}
      data-fluid={fluid ? '' : undefined}
      data-cover={cover && expanded ? '' : undefined}
    >
      <span className="klyp-VoiceDictation__sr" role="status" aria-live="polite">
        {liveMessage}
      </span>

      {view === 'error' && err ? (
        <span role="alert" className="klyp-VoiceDictation__error">
          {localizedError(err)}
        </span>
      ) : nothingHeard && view === 'idle' ? (
        <span className="klyp-VoiceDictation__notice">{t.noSpeech}</span>
      ) : null}

      {/* One face: a square mic button when collapsed, the full-width recording */}
      {/* bar when expanded — an INSTANT swap, no morph. The press lives here */}
      {/* (stable mount) so a held gesture survives the swap. */}
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role is always button|group — both support aria-label */}
      <div
        className="klyp-VoiceDictation__face"
        data-view={view}
        data-armed={armed ?? undefined}
        data-disabled={disabled ? '' : undefined}
        onPointerDown={onFacePointerDown}
        onKeyDown={collapsed ? onFaceKeyDown : undefined}
        role={collapsed ? 'button' : 'group'}
        tabIndex={collapsed && !disabled ? 0 : undefined}
        aria-label={collapsed ? micLabel : t.recording}
        aria-disabled={collapsed && disabled ? true : undefined}
        aria-busy={view === 'transcribing' || undefined}
        title={view === 'idle' ? t.hint : undefined}
      >
        {expanded ? (
          // Recording bar: waveform fills the left, controls pinned right (✗ ✓).
          <>
            <Waveform analyserRef={analyserRef} active={!previewState} reduce={reduce} />
            <span
              className="klyp-VoiceDictation__time"
              data-warn={nearCap ? '' : undefined}
              aria-hidden
            >
              {formatTime(previewState ? 7_000 : elapsedMs)}
            </span>
            {/* ✗ ✓ are shown in BOTH hold + toggle so the layout never shifts. */}
            {/* In hold, a swipe arms one (highlighted) and release fires it; in */}
            {/* toggle they're tap targets. */}
            <ToolButton
              variant="solid"
              size="md"
              className="klyp-VoiceDictation__cancel"
              icon={CloseCircleOutline}
              label={t.cancel}
              onPress={handleCancel}
            />
            <ToolButton
              variant="solid"
              size="md"
              className="klyp-VoiceDictation__done"
              icon={CheckOutline}
              label={t.done}
              onPress={handleDone}
            />
          </>
        ) : (
          <span className="klyp-VoiceDictation__micGlyph" aria-hidden>
            {view === 'transcribing' ? (
              <Spinner size="sm" />
            ) : view === 'error' ? (
              <MicrophoneSlashOutline focusable="false" />
            ) : (
              <MicrophoneBulk focusable="false" />
            )}
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Waveform — live level bars painted on <canvas>, OUTSIDE the React render loop
// ============================================================================

interface WaveformProps {
  analyserRef: RefObject<AnalyserNode | null>
  active: boolean
  reduce: boolean
}

const BAR_DUTY = 0.42 // bar width as a fraction of its slot (thin "running" ticks)
const GAIN = 2.4 // soft-knee sensitivity
const BAR_PITCH = 7 // target slot width (CSS px) — bar COUNT scales with width
const MIN_BARS = 12
const MAX_BARS = 96
const PUSH_MS = 55 // how often a new sample scrolls in (the "running" speed)
const REST_AMP = 0.1 // resting bar height — a quiet row of dots

// A frozen, deterministic waveform silhouette for the catalog preview / reduced-
// motion state (no live audio to drive it) — varied, rising gently to the right.
function sampleAmp(i: number, n: number): number {
  const t = n > 1 ? i / (n - 1) : 1
  return 0.14 + 0.46 * (0.5 + 0.5 * Math.sin(i * 0.9 + 0.5)) * (0.35 + 0.65 * t)
}

const Waveform = memo(function Waveform({ analyserRef, active, reduce }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const color = getComputedStyle(canvas).color || 'white'
    // A scrolling HISTORY of loudness samples (newest on the right, older bars
    // slide left) — like the Claude composer's "running" waveform, not a centred
    // real-time pulse. Geometry recomputes on resize; bar COUNT scales with width.
    let w = 0
    let h = 0
    let bars = MIN_BARS
    let slot = 0
    let barW = 0
    let radius = 0
    let history: number[] = []

    const measure = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, Math.round(rect.width * dpr))
      h = Math.max(1, Math.round(rect.height * dpr))
      canvas.width = w
      canvas.height = h
      let count = Math.round(rect.width / BAR_PITCH)
      count = Math.max(MIN_BARS, Math.min(MAX_BARS, count))
      bars = count
      slot = w / bars
      barW = slot * BAR_DUTY
      radius = barW / 2
      if (reduce || !active) {
        // Frozen sample silhouette for the preview / reduced-motion state.
        history = Array.from({ length: bars }, (_, i) => sampleAmp(i, bars))
      } else {
        // Resize the history ring to the new bar count (keep the recent tail).
        if (history.length > bars) history = history.slice(history.length - bars)
        while (history.length < bars) history.unshift(REST_AMP)
      }
    }

    const paint = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      for (let i = 0; i < bars; i++) {
        const amp = history[i] ?? REST_AMP
        const bh = Math.max(barW, amp * h) // floor = bar width → silence = dots
        const x = i * slot + (slot - barW) / 2
        const y = (h - bh) / 2
        // Older samples (left) fade a touch → a gentle "scrolling-out" trail.
        const age = bars > 1 ? i / (bars - 1) : 1
        ctx.globalAlpha = Math.min(1, (0.5 + 0.5 * amp) * (0.5 + 0.5 * age))
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, barW, bh, radius)
        else ctx.rect(x, y, barW, bh)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    measure()
    const ro = new ResizeObserver(() => {
      measure()
      if (reduce || !active) paint()
    })
    ro.observe(canvas)

    if (reduce || !active) {
      paint() // measure() already filled the frozen sample silhouette
      return () => ro.disconnect()
    }

    let bins: Uint8Array<ArrayBuffer> | null = null
    let raf = 0
    let lastPush = Date.now()
    let curPeak = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const a = analyserRef.current
      if (a) {
        if (!bins || bins.length !== a.fftSize) bins = new Uint8Array(a.fftSize)
        // Time-domain peak deviation from the 128 mid-line → loudness this frame.
        a.getByteTimeDomainData(bins)
        let peak = 0
        for (let j = 0; j < bins.length; j++) {
          const dev = Math.abs((bins[j] ?? 128) - 128) / 128
          if (dev > peak) peak = dev
        }
        const amp = Math.max(REST_AMP, 1 - Math.exp(-peak * GAIN)) // soft knee
        if (amp > curPeak) curPeak = amp
      }
      // Push the loudest sample since the last step, then scroll the ring left.
      const now = Date.now()
      if (now - lastPush >= PUSH_MS) {
        history.push(curPeak || REST_AMP)
        if (history.length > bars) history.shift()
        curPeak = 0
        lastPush = now
      }
      paint()
    }
    frame()
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [analyserRef, active, reduce])

  return <canvas ref={canvasRef} className="klyp-VoiceDictation__wave" aria-hidden />
})

export default VoiceDictation
