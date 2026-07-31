import { useEffect, useMemo, useRef, useState } from 'react'
import { RuntimeFrameSurface } from '@design-lab/system/components'
import { prepareComponentRuntime, type ManagedComponentRuntime } from '../../api/projects'

function postRuntimeState(
  frame: HTMLIFrameElement | null,
  runtime: ManagedComponentRuntime | null,
  args: Record<string, unknown>,
  values: Record<string, unknown>,
  variant?: string,
) {
  if (!frame?.contentWindow || !runtime) return
  const base = {
    protocol: 'designlab.runtime',
    version: 1,
    runtimeId: runtime.profile.id,
  }
  frame.contentWindow.postMessage({ ...base, type: 'setArgs', payload: { args } }, '*')
  frame.contentWindow.postMessage({ ...base, type: 'setState', payload: { values, variant } }, '*')
}

function postRuntimeMode(
  frame: HTMLIFrameElement | null,
  runtime: ManagedComponentRuntime | null,
  mode: string | undefined,
  variables: Record<string, string | number>,
) {
  if (!frame?.contentWindow || !runtime || !mode) return
  frame.contentWindow.postMessage(
    {
      protocol: 'designlab.runtime',
      version: 1,
      runtimeId: runtime.profile.id,
      type: 'setMode',
      payload: { mode, variables },
    },
    '*',
  )
}

export function ManagedRuntimeFrame({
  sourceId,
  componentId,
  view,
  story,
  mode,
  modeVariables,
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
  modeVariables?: Record<string, string | number>
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
  const [runtimeError, setRuntimeError] = useState<string | null>(null)
  const [recovering, setRecovering] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const serializedArgs = useMemo(() => JSON.stringify(args ?? {}), [args])
  const serializedValues = useMemo(() => JSON.stringify(values ?? {}), [values])
  const serializedModeVariables = useMemo(
    () => JSON.stringify(modeVariables ?? {}),
    [modeVariables],
  )

  useEffect(() => {
    let cancelled = false
    setError(null)
    setRuntimeError(null)
    setRuntime(null)
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
  }, [componentId, sourceId, story, view])

  useEffect(() => {
    postRuntimeState(
      frameRef.current,
      runtime,
      JSON.parse(serializedArgs) as Record<string, unknown>,
      JSON.parse(serializedValues) as Record<string, unknown>,
      variant,
    )
  }, [runtime, serializedArgs, serializedValues, variant])

  useEffect(() => {
    postRuntimeMode(
      frameRef.current,
      runtime,
      mode,
      JSON.parse(serializedModeVariables) as Record<string, string | number>,
    )
  }, [mode, runtime, serializedModeVariables])

  useEffect(() => {
    if (!runtime) return
    let retryTimer: number | null = null
    const handleRuntimeMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return
      const message = event.data as {
        type?: string
        runtimeId?: string
        payload?: { message?: string }
      } | null
      if (message?.runtimeId !== runtime.profile.id) return
      if (message.type === 'ready') {
        setRecovering(false)
        setRuntimeError(null)
        postRuntimeState(
          frameRef.current,
          runtime,
          JSON.parse(serializedArgs) as Record<string, unknown>,
          JSON.parse(serializedValues) as Record<string, unknown>,
          variant,
        )
        postRuntimeMode(
          frameRef.current,
          runtime,
          mode,
          JSON.parse(serializedModeVariables) as Record<string, string | number>,
        )
        return
      }
      if (message.type !== 'error') return
      const messageText = message.payload?.message ?? 'Vue runtime could not render this view.'
      if (attempt >= 2) {
        setRecovering(false)
        setRuntimeError(messageText)
        return
      }
      setRecovering(true)
      retryTimer = window.setTimeout(() => {
        setAttempt((current) => current + 1)
        setRecovering(false)
      }, 250)
    }
    window.addEventListener('message', handleRuntimeMessage)
    return () => {
      window.removeEventListener('message', handleRuntimeMessage)
      if (retryTimer !== null) window.clearTimeout(retryTimer)
    }
  }, [attempt, mode, runtime, serializedArgs, serializedModeVariables, serializedValues, variant])

  if (error)
    return (
      <RuntimeFrameSurface
        state="error"
        className={className}
        heading="Vue preview unavailable"
        message={error}
        title={title}
      />
    )
  if (!runtime)
    return (
      <RuntimeFrameSurface
        state="loading"
        className={className}
        message="Preparing Vue preview…"
        title={title}
      />
    )
  if (runtimeError)
    return (
      <RuntimeFrameSurface
        state="error"
        className={className}
        heading="Vue preview unavailable"
        message={runtimeError}
        title={title}
      />
    )
  if (recovering)
    return (
      <RuntimeFrameSurface
        state="refreshing"
        className={className}
        message="Refreshing preview…"
        title={title}
      />
    )
  return (
    <RuntimeFrameSurface
      ref={frameRef}
      className={className}
      src={`${runtime.url}&attempt=${attempt}`}
      title={title}
      tabIndex={className.includes('managed-runtime-frame--catalog') ? -1 : undefined}
      sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups"
      onLoad={() => {
        postRuntimeState(
          frameRef.current,
          runtime,
          JSON.parse(serializedArgs) as Record<string, unknown>,
          JSON.parse(serializedValues) as Record<string, unknown>,
          variant,
        )
        postRuntimeMode(
          frameRef.current,
          runtime,
          mode,
          JSON.parse(serializedModeVariables) as Record<string, string | number>,
        )
      }}
    />
  )
}
