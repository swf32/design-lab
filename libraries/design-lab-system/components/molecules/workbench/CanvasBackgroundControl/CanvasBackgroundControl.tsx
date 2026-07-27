import './CanvasBackgroundControl.scss'
import { useEffect, useRef, useState } from 'react'
import { useDesignLabI18n } from '../../../../i18n'
import { ColorPicker } from '../../inputs/ColorPicker/ColorPicker'
import { TabSwitcher } from '../../inputs/TabSwitcher/TabSwitcher'

export type CanvasMode = 'dark-grid' | 'light-grid' | 'solid'
export type CanvasBackgroundControlProps = {
  mode: CanvasMode
  color: string
  onModeChange: (mode: CanvasMode) => void
  onColorChange: (color: string) => void
  themes?: string[]
  theme?: string
  onThemeChange?: (theme: string) => void
}

const presets = ['#111111', '#f2f1ed', '#264653', '#6d3be8', '#d96c52', '#2a9d8f']
export function CanvasBackgroundControl({
  mode,
  color,
  onModeChange,
  onColorChange,
  themes = [],
  theme,
  onThemeChange,
}: CanvasBackgroundControlProps) {
  const { t } = useDesignLabI18n()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [touchExpanded, setTouchExpanded] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const hasThemeControl = themes.length > 1 && theme && onThemeChange

  useEffect(() => {
    if (!touchExpanded) return

    const collapseOutside = (event: PointerEvent) => {
      const root = rootRef.current
      if (!root?.contains(event.target as Node)) {
        setTouchExpanded(false)
        if (root?.contains(document.activeElement)) (document.activeElement as HTMLElement).blur()
      }
    }

    document.addEventListener('pointerdown', collapseOutside)
    return () => document.removeEventListener('pointerdown', collapseOutside)
  }, [touchExpanded])

  const chooseMode = (next: CanvasMode) => {
    onModeChange(next)
    if (next !== 'solid') setPickerOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className={`dl-canvas-control dl-canvas-control--${mode}${hasThemeControl ? ' dl-canvas-control--with-themes' : ''}${pickerOpen ? ' dl-canvas-control--picker-open' : ''}${touchExpanded ? ' dl-canvas-control--touch-expanded' : ''}`}
      role="group"
      aria-label={t('canvas.appearance')}
      onPointerDownCapture={(event) => {
        if (event.pointerType === 'mouse' || touchExpanded) return
        event.preventDefault()
        setTouchExpanded(true)
      }}
    >
      <div className="dl-canvas-control__row dl-canvas-control__background-row">
        <span className="dl-canvas-control__label">{t('canvas.background')}</span>
        <div className="dl-canvas-control__background-options">
          <TabSwitcher
            ariaLabel={t('canvas.background')}
            variant="segmented"
            size="small"
            className="dl-canvas-control__grid-options"
            value={mode}
            onChange={chooseMode}
            options={[
              {
                value: 'dark-grid',
                label: (
                  <span className="dl-canvas-control__sample dl-canvas-control__sample--dark" />
                ),
                accessibleLabel: t('canvas.dark'),
              },
              {
                value: 'light-grid',
                label: (
                  <span className="dl-canvas-control__sample dl-canvas-control__sample--light" />
                ),
                accessibleLabel: t('canvas.light'),
              },
            ]}
          />
          <ColorPicker
            className={`dl-canvas-control__solid${mode === 'solid' ? ' is-active' : ''}`}
            label={t('canvas.dialog')}
            value={color}
            presets={presets}
            allowClear={false}
            open={pickerOpen}
            onOpenChange={(nextOpen) => {
              setPickerOpen(nextOpen)
              if (nextOpen) onModeChange('solid')
            }}
            onChange={(next) => {
              if (next) onColorChange(next)
            }}
            trigger={<span className="dl-canvas-control__sample" style={{ background: color }} />}
          />
        </div>
      </div>
      {hasThemeControl ? (
        <div className="dl-canvas-control__row dl-canvas-control__theme-row">
          <span className="dl-canvas-control__label">{t('canvas.theme')}</span>
          <TabSwitcher
            ariaLabel={t('canvas.theme')}
            variant="segmented"
            size="small"
            className="dl-canvas-control__theme-options"
            value={theme}
            onChange={onThemeChange}
            overflow="scroll"
            options={themes.map((item) => ({ value: item, label: item }))}
          />
        </div>
      ) : null}
    </div>
  )
}
