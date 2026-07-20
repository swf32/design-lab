import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

// ============================================================================
// useAudioRecorder — mic capture for <VoiceDictation>
// ============================================================================
//
// Pure browser-audio capture: getUserMedia → MediaRecorder → Blob, with a live
// AnalyserNode exposed via ref so a <canvas> can paint the waveform OUTSIDE the
// React render loop (never put 60fps level data in state — it would re-render
// the whole composer every frame). Owns permission, the recording lifecycle,
// the elapsed timer (ticked ~5×/s, cheap), an auto-stop cap, and reliable
// track + AudioContext cleanup (so the OS mic indicator goes off).
//
// Tap-vs-hold interaction is NOT here — the component owns the pointer handlers
// and decides when to call start / stop / cancel. This hook stays pure-capture
// so it can be reused by any trigger affordance.

export type RecorderErrorKind =
  | 'unsupported' // no mediaDevices / MediaRecorder in this browser
  | 'insecure-context' // page is not https / localhost
  | 'permission-denied' // user blocked the mic
  | 'no-device' // no microphone present
  | 'capture-failed' // getUserMedia / MediaRecorder threw for another reason

export interface RecorderError {
  kind: RecorderErrorKind
  message: string
}

export type RecorderStatus = 'idle' | 'requesting' | 'recording'

export interface AudioCaptureResult {
  blob: Blob
  mimeType: string
  durationMs: number
}

export interface UseAudioRecorderOptions {
  /** Fired once on stop() with the captured audio. NOT fired on cancel(). */
  onComplete: (result: AudioCaptureResult) => void
  /** Fired on any capture / permission error. */
  onError?: (error: RecorderError) => void
  /** Auto-stop (and finalise via onComplete) after this many ms. Default 120000. */
  maxDurationMs?: number
}

export interface UseAudioRecorderReturn {
  status: RecorderStatus
  /** Elapsed recording time in ms, updated ~5×/s — for the mm:ss timer only. */
  elapsedMs: number
  error: RecorderError | null
  /** Live analyser for the waveform canvas. Read via getByteTimeDomainData in rAF. */
  analyserRef: RefObject<AnalyserNode | null>
  /** Begin capture. Resolves once recording started (or an error was surfaced). */
  start: () => Promise<void>
  /** Finalise the take → onComplete. */
  stop: () => void
  /** Discard the take → no onComplete. */
  cancel: () => void
  /** Clear a surfaced error (e.g. on Retry). */
  clearError: () => void
}

// webm/opus is the broadest + smallest; mp4 is the Safari fallback.
const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
] as const

function pickSupportedMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  for (const m of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(m)) return m
  }
  return undefined
}

export function useAudioRecorder({
  onComplete,
  onError,
  maxDurationMs = 120_000,
}: UseAudioRecorderOptions): UseAudioRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [error, setError] = useState<RecorderError | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTsRef = useRef(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const capRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledRef = useRef(false)
  // Distinct from cancelledRef (which start() resets mid-flow): once the hook
  // unmounts this stays true for good, so a getUserMedia grant that resolves
  // AFTER unmount can't start a live, un-releasable recording (mic stuck on).
  const disposedRef = useRef(false)

  // Latest callbacks without re-binding MediaRecorder listeners each render.
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
  })

  // Release the stream + AudioContext + timers (NOT the recorder — callers stop
  // it; this runs from the recorder's own `stop` event or from cancel).
  const releaseMedia = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
    if (capRef.current) {
      clearTimeout(capRef.current)
      capRef.current = null
    }
    for (const track of streamRef.current?.getTracks() ?? []) track.stop()
    streamRef.current = null
    const ctx = audioCtxRef.current
    if (ctx && ctx.state !== 'closed') void ctx.close()
    audioCtxRef.current = null
    analyserRef.current = null
  }, [])

  const surfaceError = useCallback((e: RecorderError) => {
    setStatus('idle')
    setElapsedMs(0)
    setError(e)
    onErrorRef.current?.(e)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (status !== 'idle') return

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      surfaceError({ kind: 'unsupported', message: 'Audio recording is not supported here.' })
      return
    }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      surfaceError({ kind: 'insecure-context', message: 'Microphone needs a secure (https) page.' })
      return
    }

    setStatus('requesting')

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      const kind: RecorderErrorKind =
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'permission-denied'
          : name === 'NotFoundError' || name === 'OverconstrainedError'
            ? 'no-device'
            : 'capture-failed'
      surfaceError({ kind, message: 'Could not access the microphone.' })
      return
    }
    // The component may have unmounted while the permission prompt was open — a
    // late grant must NOT start a recording on a dead component. Drop the stream
    // + bail so the OS mic indicator goes straight back off (no leak).
    if (disposedRef.current) {
      for (const track of stream.getTracks()) track.stop()
      return
    }
    streamRef.current = stream

    const preferredMime = pickSupportedMime()
    let recorder: MediaRecorder
    try {
      recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream)
    } catch {
      // Some browsers reject the explicit mimeType — fall back to the default.
      recorder = new MediaRecorder(stream)
    }
    recorderRef.current = recorder
    chunksRef.current = []
    cancelledRef.current = false

    recorder.addEventListener('dataavailable', (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data)
    })
    recorder.addEventListener('stop', () => {
      const wasCancelled = cancelledRef.current
      const type = recorder.mimeType || preferredMime || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type })
      const durationMs = startTsRef.current ? Date.now() - startTsRef.current : 0
      recorderRef.current = null
      releaseMedia()
      setStatus('idle')
      setElapsedMs(0)
      // Fire even for an empty blob (size 0) — the consumer surfaces a
      // "didn't catch that" hint rather than dead-ending silently.
      if (!wasCancelled) {
        onCompleteRef.current({ blob, mimeType: type, durationMs })
      }
    })

    // Device loss mid-recording (unplugged / OS-revoked) or a recorder fault:
    // MediaRecorder fires 'error' and the track fires 'ended', but the 'stop'
    // event is NOT guaranteed — without this the UI would hang with a frozen
    // timer and the OS mic indicator stuck on. Tear down + surface an error.
    const onHardFail = () => {
      if (!recorderRef.current && !streamRef.current) return // already torn down
      cancelledRef.current = true // suppress onComplete from any late stop event
      const rec = recorderRef.current
      recorderRef.current = null
      try {
        if (rec && rec.state !== 'inactive') rec.stop()
      } catch {
        // already stopping — ignore
      }
      releaseMedia()
      surfaceError({ kind: 'capture-failed', message: 'Recording stopped unexpectedly.' })
    }
    recorder.addEventListener('error', onHardFail)
    for (const track of stream.getTracks()) track.addEventListener('ended', onHardFail)

    // Live analyser for the waveform — optional; capture still works without it.
    try {
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AudioCtor) {
        const ctx = new AudioCtor()
        audioCtxRef.current = ctx
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.6
        ctx.createMediaStreamSource(stream).connect(analyser)
        analyserRef.current = analyser
        if (ctx.state === 'suspended') void ctx.resume()
      }
    } catch {
      // Waveform is decorative — ignore analyser setup failures.
    }

    startTsRef.current = Date.now()
    setElapsedMs(0)
    recorder.start(100) // timeslice → periodic dataavailable so chunks accrue
    setStatus('recording')
    tickRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTsRef.current)
    }, 200)
    capRef.current = setTimeout(() => {
      const rec = recorderRef.current
      if (rec && rec.state !== 'inactive') {
        cancelledRef.current = false
        rec.stop()
      }
    }, maxDurationMs)
  }, [status, maxDurationMs, surfaceError, releaseMedia])

  const stop = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') {
      cancelledRef.current = false
      rec.stop()
    }
  }, [])

  const cancel = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') {
      cancelledRef.current = true
      rec.stop()
    } else {
      releaseMedia()
      setStatus('idle')
      setElapsedMs(0)
    }
  }, [releaseMedia])

  const clearError = useCallback(() => setError(null), [])

  // Unmount / navigation: stop everything, never fire onComplete.
  useEffect(() => {
    // (Re)mounted — clear the disposed latch. React StrictMode double-invokes
    // this effect in dev (mount → cleanup → mount); without this reset the first
    // cleanup leaves disposedRef=true and every start() would bail right after
    // getUserMedia (status stuck on 'requesting', no recording bar).
    disposedRef.current = false
    return () => {
      disposedRef.current = true
      cancelledRef.current = true
      const rec = recorderRef.current
      if (rec && rec.state !== 'inactive') {
        try {
          rec.stop()
        } catch {
          // already stopping — ignore
        }
      }
      recorderRef.current = null
      releaseMedia()
    }
  }, [releaseMedia])

  return { status, elapsedMs, error, analyserRef, start, stop, cancel, clearError }
}

export default useAudioRecorder
