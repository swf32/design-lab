import './ModelInfoCard.scss'

import type { ReactNode, Ref } from 'react'
import { TabSwitcher } from '../TabSwitcher'

/**
 * `<ModelInfoCard>` — rich model detail card (21st.dev model-selector
 * pattern, Val 2026-07-02): name + provider glyph, a short description,
 * segment-bar metrics (Intelligence / Speed / Context / Cost…), capability
 * fact chips ("up to 15s", "1080p") and an optional Configuration section
 * (e.g. a Reasoning Low/Medium/High switcher).
 *
 * PRESENTATIONAL and model-agnostic — the host supplies every value (the
 * chat feature feeds it demo data today; the plan is backend-driven model
 * metadata via `listModels` once the model-analysis pass lands). Designed
 * to ride in the brand `Dropdown`'s `renderDetail` side-card slot next to
 * the composer model picker, but renders standalone anywhere.
 *
 * Metric tones map onto the EXISTING status tokens only (single-accent
 * rule — no new colours): success (quality), warning (speed), danger
 * (cost), info (context), neutral.
 */

export type ModelInfoTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface ModelInfoMetric {
  /** Metric name, sentence case ("Intelligence", "Speed"). */
  label: string
  /** Filled segments, clamped to `0..max`. */
  value: number
  /** Segment colour — existing status tokens. Default `neutral`. */
  tone?: ModelInfoTone
  /** Total segment count. Default 10. */
  max?: number
}

export interface ModelInfoConfigOption {
  id: string
  label: string
}

/** Controlled configuration row — one labelled segmented switcher. */
export interface ModelInfoConfig {
  /** Row label, e.g. "Reasoning". */
  label: string
  options: readonly ModelInfoConfigOption[]
  value: string
  onChange?: (id: string) => void
}

export interface ModelInfoCardProps {
  /** Model display name ("Kling 3.0"). */
  name: ReactNode
  /** Provider glyph — host passes a `<ProviderIcon>` / `<ModelProviderIcon>`. */
  icon?: ReactNode
  /** Provider display name ("Anthropic") under the model name. */
  provider?: ReactNode
  /** 1–2 sentence model description. */
  description?: ReactNode
  /** Segment-bar metrics, rendered in a 2-column grid. */
  metrics?: readonly ModelInfoMetric[]
  /** Capability fact chips ("up to 15s", "1080p", "audio"). */
  facts?: readonly string[]
  /** Optional configuration section (host-controlled). */
  config?: ModelInfoConfig
  /** Heading above the configuration row. */
  configHeading?: string
  className?: string
  /** React 19 ref-as-prop — the card root. */
  ref?: Ref<HTMLDivElement>
}

const DEFAULT_MAX = 10

export function ModelInfoCard({
  name,
  icon,
  provider,
  description,
  metrics,
  facts,
  config,
  configHeading = 'Configuration',
  className,
  ref,
}: ModelInfoCardProps) {
  return (
    <div ref={ref} className={['klyp-ModelInfoCard', className].filter(Boolean).join(' ')}>
      <header className="klyp-ModelInfoCard__header">
        {icon ? (
          <span className="klyp-ModelInfoCard__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <div className="klyp-ModelInfoCard__titles">
          <span className="klyp-ModelInfoCard__name">{name}</span>
          {provider ? <span className="klyp-ModelInfoCard__provider">{provider}</span> : null}
        </div>
      </header>

      {description ? <p className="klyp-ModelInfoCard__desc">{description}</p> : null}

      {metrics && metrics.length > 0 ? (
        <div className="klyp-ModelInfoCard__metrics">
          {metrics.map((m) => {
            const max = m.max ?? DEFAULT_MAX
            const filled = Math.max(0, Math.min(max, Math.round(m.value)))
            return (
              <div className="klyp-ModelInfoCard__metric" key={m.label}>
                <span className="klyp-ModelInfoCard__metricLabel">{m.label}</span>
                {/* The bar is decorative repetition — one img whose accessible
                    name carries the value replaces 10 meaningless spans. */}
                <div
                  className="klyp-ModelInfoCard__metricBar"
                  role="img"
                  aria-label={`${m.label}: ${filled} of ${max}`}
                >
                  {Array.from({ length: max }, (_, i) => (
                    <span
                      key={i}
                      className="klyp-ModelInfoCard__seg"
                      data-tone={m.tone ?? 'neutral'}
                      data-filled={i < filled || undefined}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {facts && facts.length > 0 ? (
        <ul className="klyp-ModelInfoCard__facts">
          {facts.map((f) => (
            <li key={f} className="klyp-ModelInfoCard__fact">
              {f}
            </li>
          ))}
        </ul>
      ) : null}

      {config ? (
        <div className="klyp-ModelInfoCard__config">
          <span className="klyp-ModelInfoCard__configHeading">{configHeading}</span>
          <span className="klyp-ModelInfoCard__configLabel">{config.label}</span>
          <TabSwitcher
            value={config.value}
            onValueChange={(v) => config.onChange?.(v)}
            ariaLabel={config.label}
            size="sm"
            fullWidth
          >
            {config.options.map((o) => (
              <TabSwitcher.Item key={o.id} value={o.id}>
                {o.label}
              </TabSwitcher.Item>
            ))}
          </TabSwitcher>
        </div>
      ) : null}
    </div>
  )
}

export default ModelInfoCard
