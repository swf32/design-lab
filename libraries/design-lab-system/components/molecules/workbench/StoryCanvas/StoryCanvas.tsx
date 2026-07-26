import './StoryCanvas.scss'
import type { CSSProperties, ReactNode } from 'react'
import { CodeBlock } from '../../data-display/CodeBlock/CodeBlock'
import {
  CanvasBackgroundControl,
  type CanvasMode,
} from '../CanvasBackgroundControl/CanvasBackgroundControl'

type StoryCanvasProps = {
  title: string
  description?: string
  children: ReactNode
  meta?: ReactNode
  canvasMode?: CanvasMode
  canvasColor?: string
  onCanvasModeChange?: (mode: CanvasMode) => void
  onCanvasColorChange?: (color: string) => void
  source?: string
  sourceLanguage?: string
}

export function StoryCanvas({
  title,
  description,
  children,
  meta,
  canvasMode,
  canvasColor = '#111111',
  onCanvasModeChange,
  onCanvasColorChange,
  source,
  sourceLanguage = 'tsx',
}: StoryCanvasProps) {
  const stageStyle = { '--canvas-solid': canvasColor } as CSSProperties
  return (
    <article className="dl-story-canvas">
      <header className="dl-story-canvas__header">
        <div className="dl-story-canvas__heading">
          <div className="dl-story-canvas__title-row">
            <h3>{title}</h3>
            {meta && <code>{meta}</code>}
          </div>
          {description && <p>{description}</p>}
        </div>
      </header>
      <div
        className={`dl-story-canvas__stage${canvasMode ? ` dl-story-canvas__stage--${canvasMode}` : ''}`}
        style={stageStyle}
      >
        {canvasMode && onCanvasModeChange && onCanvasColorChange && (
          <div className="dl-story-canvas__canvas-tools">
            <CanvasBackgroundControl
              mode={canvasMode}
              color={canvasColor}
              onModeChange={onCanvasModeChange}
              onColorChange={onCanvasColorChange}
            />
          </div>
        )}
        {children}
      </div>
      {source && (
        <footer className="dl-story-canvas__source">
          <CodeBlock
            code={source}
            variant="code-only"
            language={sourceLanguage}
            collapsedLines={3}
          />
        </footer>
      )}
    </article>
  )
}
