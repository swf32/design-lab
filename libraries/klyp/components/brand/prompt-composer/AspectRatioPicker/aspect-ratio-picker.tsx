/**
 * AspectRatioPicker — row of aspect ratio buttons, each showing a proportional
 * rectangle SVG. Active state uses bg-surface-elev highlight.
 *
 * Image mode shows all 5 ratios; Video mode shows only 9:16 and 16:9.
 */

import './aspect-ratio-picker.scss'
import type { AspectRatio, MediaType } from './types'

// Dimensions for the inline SVG rectangle per ratio.
// Values chosen to fit in a 20×16 viewport while remaining visually distinct.
const RATIO_SVG: Record<AspectRatio, { w: number; h: number }> = {
  '9:16': { w: 9, h: 16 },
  '16:9': { w: 16, h: 9 },
  '1:1': { w: 12, h: 12 },
  '4:3': { w: 16, h: 12 },
  '3:4': { w: 12, h: 16 },
}

const ALL_RATIOS: AspectRatio[] = ['9:16', '16:9', '1:1', '4:3', '3:4']
const VIDEO_RATIOS: AspectRatio[] = ['9:16', '16:9']

type Props = {
  value: AspectRatio
  onChange: (ratio: AspectRatio) => void
  mediaType?: MediaType
  className?: string
}

export function AspectRatioPicker({ value, onChange, mediaType = 'image', className }: Props) {
  const ratios = mediaType === 'video' ? VIDEO_RATIOS : ALL_RATIOS

  return (
    <div
      data-slot="aspect-ratio-picker"
      role="toolbar"
      aria-label="Aspect ratio"
      className={['klyp-PromptComposer-AspectPicker', className].filter(Boolean).join(' ')}
    >
      {ratios.map((ratio) => {
        const active = value === ratio
        const { w, h } = RATIO_SVG[ratio]
        // Normalise so the longest side is 14px, shortest proportional.
        const maxDim = 14
        const scale = maxDim / Math.max(w, h)
        const svgW = Math.round(w * scale)
        const svgH = Math.round(h * scale)

        return (
          <button
            key={ratio}
            type="button"
            aria-label={ratio}
            aria-pressed={active}
            data-active={active}
            onClick={() => onChange(ratio)}
            className="klyp-PromptComposer-AspectPicker__btn"
          >
            {/* Proportional rectangle — aria-hidden, parent button has aria-label */}
            <svg
              aria-hidden="true"
              role="presentation"
              width={svgW}
              height={svgH}
              viewBox={`0 0 ${svgW} ${svgH}`}
              fill="none"
              className="klyp-PromptComposer-AspectPicker__svg"
            >
              <title>Aspect ratio</title>
              <rect
                x="0.5"
                y="0.5"
                width={svgW - 1}
                height={svgH - 1}
                rx="1"
                stroke="currentColor"
                strokeWidth="1"
                fill={active ? 'currentColor' : 'none'}
                fillOpacity={active ? 0.15 : 0}
              />
            </svg>
            {/* Label */}
            <span className="klyp-PromptComposer-AspectPicker__label">{ratio}</span>
          </button>
        )
      })}
    </div>
  )
}
