import { useEffect, useMemo, useRef, useState } from 'react'
import { prepareComponentRuntime, type ManagedComponentRuntime } from '../../api/projects'
import './ManagedRuntimeFrame.scss'

export function ManagedRuntimeFrame({
  sourceId,
  componentId,
  view,
  story,
  mode,
  args,
  variant,
  values,
  title,
  className = '',
  onRuntime,
}: {
  sourceId: string
  componentId: string
  view: 'info' | 'preview' | 'story' | 'playground' | 'draft'
  story?: string
  mode?: string
  args?: Record<string, unknown>
  variant?: string
  values?: Record<string, unknown>
  title: string
  className?: string
  onRuntime?: (runtime: ManagedComponentRuntime) => void
}) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [runtime, setRuntime] = useState<ManagedComponentRuntime | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const serializedArgs = useMemo(() => JSON.stringify(args ?? {}), [args])
  const serializedValues = useMemo(() => JSON.stringify(values ?? {}), [values])

  useEffect(() => {
    let cancelled = false
    setError(null)
    setAttempt(0)
    prepareComponentRuntime(sourceId, componentId, {
      view,
      story,
      mode,
      args: JSON.parse(serializedArgs) as Record<string, unknown>,
      variant,
      values: JSON.parse(serializedValues) as Record<string, unknown>,
    })
      .then((result) => {
        if (cancelled) return
        setRuntime(result)
        onRuntime?.(result)
      })
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(reason instanceof Error ? reason.message : 'Runtime could not start')
      })
    return () => {
      cancelled = true
    }
  }, [componentId, mode, serializedArgs, serializedValues, sourceId, story, variant, view])

  useEffect(() => {
    if (!runtime || attempt >= 2) return
    let retryTimer: number | null = null
    const handleRuntimeMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return
      const message = event.data as { type?: string; runtimeId?: string } | null
      if (message?.runtimeId !== runtime.profile.id || message.type !== 'error') return
      retryTimer = window.setTimeout(() => setAttempt((current) => current + 1), 500)
    }
    window.addEventListener('message', handleRuntimeMessage)
    return () => {
      window.removeEventListener('message', handleRuntimeMessage)
      if (retryTimer !== null) window.clearTimeout(retryTimer)
    }
  }, [attempt, runtime])

  if (error)
    return (
      <div className={`managed-runtime-frame__state ${className}`} role="alert">
        <strong>Vue preview unavailable</strong>
        <span>{error}</span>
      </div>
    )
  if (!runtime)
    return <div className={`managed-runtime-frame__state ${className}`}>Preparing Vue preview…</div>
  return (
    <iframe
      ref={frameRef}
      className={`managed-runtime-frame ${className}`}
      src={`${runtime.url}&attempt=${attempt}`}
      title={title}
      sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups"
    />
  )
}
