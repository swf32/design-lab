import './RuntimeFrameSurface.scss'
import { forwardRef, type ComponentProps } from 'react'

export type RuntimeFrameState = 'ready' | 'loading' | 'refreshing' | 'error'

export type RuntimeFrameSurfaceProps = Omit<ComponentProps<'iframe'>, 'children'> & {
  state?: RuntimeFrameState
  heading?: string
  message?: string
}

export const RuntimeFrameSurface = forwardRef<HTMLIFrameElement, RuntimeFrameSurfaceProps>(
  function RuntimeFrameSurface(
    { state = 'ready', heading, message, className = '', ...props },
    ref,
  ) {
    if (state !== 'ready')
      return (
        <div
          className={`dl-runtime-frame-surface__state${className ? ` ${className}` : ''}`}
          role={state === 'error' ? 'alert' : 'status'}
        >
          {heading && <strong>{heading}</strong>}
          {message && <span>{message}</span>}
        </div>
      )

    return (
      <iframe
        ref={ref}
        className={`dl-runtime-frame-surface${className ? ` ${className}` : ''}`}
        {...props}
      />
    )
  },
)
