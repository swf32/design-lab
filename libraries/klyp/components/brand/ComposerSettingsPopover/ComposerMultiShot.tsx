/**
 * ComposerMultiShot — Kling storyboard ("AI Director") cut editor, co-located
 * with ComposerSettingsPopover (single callsite — rendered inside the video
 * section when multi-shot is toggled on). NOT a standalone DS component / not a
 * catalog entry / not barrel-exported on its own; its public types
 * (`MultiShotValue` etc.) are re-exported from ComposerSettingsPopover.
 *
 * Two shot types (mirror the Kling dev-API `shot_type`):
 *   - `intelligence` — the model auto-segments the single main prompt into
 *     cuts. No per-cut input.
 *   - `customize` — the user authors up to 6 cuts, each with its own prompt and
 *     duration. The sum of cut durations must equal the total clip duration;
 *     the running total surfaces live (a mismatch warns).
 *
 * Presentational: composes DS primitives only (Textarea + Button from @klyp/ui,
 * Dropdown + TabSwitcher from the sibling brand packages, AddOutline /
 * CloseCircleOutline from @klyp/icons). Copy comes via `labels` (EN defaults
 * inline) — NO `@/lib/brand`, the brand package is app-agnostic.
 */

import './ComposerMultiShot.scss'

import { AddOutline, CloseCircleOutline } from '@klyp/icons'
import { Button } from '@klyp/ui/Button'
import { Textarea } from '@klyp/ui/Textarea'
import { Dropdown, type DropdownOption } from '../Dropdown'
import { TabSwitcher } from '../TabSwitcher'

export type MultiShotShotType = 'intelligence' | 'customize'
export type MultiShotShot = { prompt: string; duration: number }
export type MultiShotValue = {
  on: boolean
  shotType: MultiShotShotType
  shots: MultiShotShot[]
}

/** Up to 6 storyboards per the Kling dev-API multi_prompt cap. */
export const MULTI_SHOT_MAX = 6

export interface ComposerMultiShotLabels {
  type: string
  auto: string
  autoHint: string
  custom: string
  cutN: (n: number) => string
  cutPlaceholder: string
  addCut: string
  remove: string
  total: string
  sumOk: (sum: number, total: number) => string
  sumOff: (sum: number, total: number) => string
  seconds: (n: number) => string
}

const DEFAULT_LABELS: ComposerMultiShotLabels = {
  type: 'Cuts',
  auto: 'Auto',
  autoHint: 'Model splits your prompt into shots',
  custom: 'Custom',
  cutN: (n) => `Cut ${n}`,
  cutPlaceholder: 'What happens in this shot…',
  addCut: 'Add cut',
  remove: 'Remove cut',
  total: 'Total',
  sumOk: (sum, total) => `${sum}s / ${total}s`,
  sumOff: (sum, total) => `${sum}s / ${total}s — must match`,
  seconds: (n) => `${n}s`,
}

export interface ComposerMultiShotProps {
  value: MultiShotValue
  /** The composer's total clip duration — cut durations must sum to this. */
  totalDuration: number
  onChange: (next: MultiShotValue) => void
  disabled?: boolean
  /** Copy override (EN defaults inside). */
  labels?: Partial<ComposerMultiShotLabels>
}

/** Per-cut duration options: 1 … totalDuration seconds. */
function durationOptions(total: number, seconds: (n: number) => string): DropdownOption[] {
  return Array.from({ length: Math.max(1, total) }, (_, i) => i + 1).map((n) => ({
    id: String(n),
    label: seconds(n),
  }))
}

export function ComposerMultiShot({
  value,
  totalDuration,
  onChange,
  disabled,
  labels,
}: ComposerMultiShotProps) {
  const copy = { ...DEFAULT_LABELS, ...labels }
  const opts = durationOptions(totalDuration, copy.seconds)

  function setShotType(next: string) {
    const shotType = next as MultiShotShotType
    if (shotType === value.shotType) return
    // Entering customize with no cuts yet → seed one cut at the full duration
    // (a valid 1-cut storyboard that already sums to the total).
    if (shotType === 'customize' && value.shots.length === 0) {
      onChange({ ...value, shotType, shots: [{ prompt: '', duration: totalDuration }] })
      return
    }
    onChange({ ...value, shotType })
  }

  function updateShot(idx: number, patch: Partial<MultiShotShot>) {
    onChange({
      ...value,
      shots: value.shots.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    })
  }

  function addShot() {
    if (value.shots.length >= MULTI_SHOT_MAX) return
    const sum = value.shots.reduce((n, s) => n + s.duration, 0)
    const remaining = Math.max(1, totalDuration - sum)
    onChange({ ...value, shots: [...value.shots, { prompt: '', duration: remaining }] })
  }

  function removeShot(idx: number) {
    onChange({ ...value, shots: value.shots.filter((_, i) => i !== idx) })
  }

  const sum = value.shots.reduce((n, s) => n + s.duration, 0)
  const mismatch = sum !== totalDuration

  return (
    <div className="klyp-ComposerMultiShot">
      <TabSwitcher
        value={value.shotType}
        onValueChange={setShotType}
        ariaLabel={copy.type}
        size="md"
        fullWidth
      >
        <TabSwitcher.Item value="intelligence">{copy.auto}</TabSwitcher.Item>
        <TabSwitcher.Item value="customize">{copy.custom}</TabSwitcher.Item>
      </TabSwitcher>

      {value.shotType === 'intelligence' ? (
        <p className="klyp-ComposerMultiShot__hint">{copy.autoHint}</p>
      ) : (
        <>
          <ul className="klyp-ComposerMultiShot__list">
            {value.shots.map((shot, idx) => (
              // Cut order is the identity here (no stable id) — index key is
              // correct: reordering isn't supported, only append/remove-by-index.
              // biome-ignore lint/suspicious/noArrayIndexKey: cuts are positional
              <li key={idx} className="klyp-ComposerMultiShot__row">
                <span className="klyp-ComposerMultiShot__rowLabel">{copy.cutN(idx + 1)}</span>
                <Textarea
                  autoGrow
                  className="klyp-ComposerMultiShot__prompt"
                  value={shot.prompt}
                  onValueChange={(v) => updateShot(idx, { prompt: v })}
                  placeholder={copy.cutPlaceholder}
                  minRows={1}
                  maxRows={3}
                  maxLength={512}
                  aria-label={copy.cutN(idx + 1)}
                  disabled={disabled}
                />
                <div className="klyp-ComposerMultiShot__rowDuration">
                  <Dropdown
                    aria-label={`${copy.cutN(idx + 1)} — ${copy.total}`}
                    options={opts}
                    selectionMode="single"
                    selectedKeys={new Set([String(shot.duration)])}
                    onSelectionChange={(ids) => {
                      const [id] = ids
                      if (id) updateShot(idx, { duration: Number(id) })
                    }}
                    triggerLabel={copy.seconds(shot.duration)}
                    indicator="none"
                    side="top"
                    align="start"
                  />
                </div>
                <Button
                  className="klyp-ComposerMultiShot__remove"
                  variant="ghost"
                  size="icon-sm"
                  onPress={() => removeShot(idx)}
                  isDisabled={disabled || value.shots.length <= 1}
                  aria-label={copy.remove}
                >
                  <CloseCircleOutline aria-hidden width={18} height={18} />
                </Button>
              </li>
            ))}
          </ul>

          <div className="klyp-ComposerMultiShot__footer">
            <Button
              className="klyp-ComposerMultiShot__add"
              variant="outline"
              size="sm"
              iconLeft={AddOutline}
              onPress={addShot}
              isDisabled={disabled || value.shots.length >= MULTI_SHOT_MAX}
            >
              {copy.addCut}
            </Button>
            <span
              className="klyp-ComposerMultiShot__sum"
              data-mismatch={mismatch ? 'true' : undefined}
            >
              {copy.total}:{' '}
              {mismatch ? copy.sumOff(sum, totalDuration) : copy.sumOk(sum, totalDuration)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default ComposerMultiShot
