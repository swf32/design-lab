import './WorkbenchPlayground.scss'
import type { CSSProperties, ReactNode } from 'react'
import {
  CanvasBackgroundControl,
  type CanvasMode,
} from '../../../molecules/workbench/CanvasBackgroundControl/CanvasBackgroundControl'

export type WorkbenchPlaygroundPadding = 'none' | 'compact' | 'comfortable'
export type WorkbenchPlaygroundControlsPosition = 'start' | 'end'

export type WorkbenchPlaygroundProps = {
  children: ReactNode
  controls?: ReactNode
  mode: CanvasMode
  color: string
  onModeChange: (mode: CanvasMode) => void
  onColorChange: (color: string) => void
  label?: string
  padding?: WorkbenchPlaygroundPadding
  controlsPosition?: WorkbenchPlaygroundControlsPosition
  eventLog?: ReactNode
  className?: string
}

export function WorkbenchPlayground({
  children,
  controls,
  mode,
  color,
  onModeChange,
  onColorChange,
  label = 'Playground',
  padding = 'comfortable',
  controlsPosition = 'end',
  eventLog,
  className,
}: WorkbenchPlaygroundProps) {
  const hasControls = controls != null
  const style = { '--canvas-solid': color } as CSSProperties
  const layoutClass = hasControls
    ? `dl-workbench-playground--controls-${controlsPosition}`
    : 'dl-workbench-playground--canvas-only'
  return (
    <section
      className={`dl-workbench-playground ${layoutClass}${className ? ` ${className}` : ''}`}
    >
      <div
        className={`dl-workbench-playground__canvas dl-workbench-playground__canvas--${mode} dl-workbench-playground__canvas--padding-${padding}`}
        style={style}
      >
        <div className="dl-workbench-playground__tools">
          <span>{label}</span>
          <CanvasBackgroundControl
            mode={mode}
            color={color}
            onModeChange={onModeChange}
            onColorChange={onColorChange}
          />
        </div>
        <div className="dl-workbench-playground__stage">{children}</div>
        {eventLog && <output className="dl-workbench-playground__event-log">{eventLog}</output>}
      </div>
      {hasControls ? <div className="dl-workbench-playground__controls">{controls}</div> : null}
    </section>
  )
}
