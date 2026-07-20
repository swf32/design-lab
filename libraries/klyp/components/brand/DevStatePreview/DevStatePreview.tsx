import { CloseCircleOutline, SettingsOutline } from '@klyp/icons'
import { Checkbox } from '@klyp/ui/Checkbox'
import { Radio, RadioGroup } from '@klyp/ui/RadioGroup'
import { type KeyboardEvent, useState } from 'react'
import { Button as RACButton } from 'react-aria-components'
import './DevStatePreview.scss'

// =====================================================================
// DevStatePreview — floating dev panel for switching page states.
// =====================================================================
//
// Used on `/pricing`, `/billing`, `/referrals` (and the global
// SubscriptionStatePreview) to preview different page states without
// faking auth / data / network. Renders a small FAB pinned bottom-right;
// clicking it toggles a compact floating PANEL above it.
//
// Why a panel, not a DropdownMenu (changed 2026-06-27): a RAC Menu closes
// on every selection, so switching a tier dismissed the menu and you
// couldn't see the page react or flip several states in a row. This panel
// is built from real form controls (RadioGroup / Checkbox) and is
// deliberately:
//   • STAY-OPEN — picking an option never closes it; it closes only via
//     the Dev button, the ✕, or Escape.
//   • NON-MODAL — it's a plain positioned element (no overlay / underlay),
//     so the page underneath stays interactive and re-renders live while
//     the panel is open.
//   • NARROW — fixed compact width with wrapping descriptions, instead of
//     a menu that stretched to the longest single-line label.
//
// **Production gating**: callers MUST gate this component behind
// `import.meta.env.PROD` (or equivalent). The component itself does NOT
// inspect build mode — keeping it pure makes stories simple. Production
// users never see this widget.
//
// API shapes (unchanged):
//   • Backward-compat single-group: pass `modes` + `value` + `onValueChange`.
//   • Multi-group: pass `groups: DevStatePreviewGroup[]` for radio groups
//     + `checkboxes: DevStatePreviewCheckbox[]` for multi-select flags.
//
// A11y:
//   • FAB is a focusable RAC Button with `aria-label` + `aria-expanded`.
//   • Each group is a RAC RadioGroup (roving tabindex, arrow-key nav,
//     `aria-label` from the group label); checkboxes are RAC Checkboxes.
//   • Escape closes the panel.

export interface DevStatePreviewMode {
  /** Stable identifier used as React key + reported through `onValueChange`. */
  value: string
  /** Display label inside the panel. */
  label: string
  /** Optional one-line description shown muted under the label. */
  description?: string
}

/** Radio-style group of mutually-exclusive options. */
export interface DevStatePreviewGroup {
  /** Stable identifier for the group (React key). */
  id: string
  /** Group header rendered above its options. */
  label: string
  /** Available options in the group. Order is preserved. */
  modes: readonly DevStatePreviewMode[]
  /** Currently active option value. */
  value: string
  /** Called when the user picks a different option in this group. */
  onValueChange: (next: string) => void
}

/** Checkbox-style multi-select flag (each independent). */
export interface DevStatePreviewCheckbox {
  /** Stable identifier (React key + URL-flag-style id). */
  value: string
  /** Display label. */
  label: string
  /** Optional muted description. */
  description?: string
  /** Current checked state. */
  checked: boolean
  /** Called with the new checked state on toggle. */
  onCheckedChange: (next: boolean) => void
}

export interface DevStatePreviewProps {
  /** Backward-compat single-group API. Mutually exclusive with `groups`. */
  modes?: readonly DevStatePreviewMode[]
  /** Backward-compat single-group value. Required when `modes` is set. */
  value?: string
  /** Backward-compat single-group change handler. Required when `modes` is set. */
  onValueChange?: (next: string) => void
  /** Multiple radio groups stacked in the panel. */
  groups?: readonly DevStatePreviewGroup[]
  /** Multi-select checkboxes appended after the radio groups. */
  checkboxes?: readonly DevStatePreviewCheckbox[]
  /** Optional panel header (default: `'Dev preview'`). */
  title?: string
  /** Optional className appended to the floating wrapper. */
  className?: string
  /** Optional FAB chip label override (default: shows current single-group value). */
  fabValueLabel?: string
}

/**
 * `<DevStatePreview>` — floating FAB + stay-open panel for previewing
 * page-state variations in dev. Pin to a page (gate with
 * `import.meta.env.PROD` so it never ships).
 */
export function DevStatePreview({
  modes,
  value,
  onValueChange,
  groups,
  checkboxes,
  title = 'Dev preview',
  className,
  fabValueLabel,
}: DevStatePreviewProps) {
  const [open, setOpen] = useState(false)
  const composed = ['klyp-DevStatePreview', className].filter(Boolean).join(' ')

  // Resolve the FAB chip label — caller can override; otherwise show the
  // active value of the single-group API (backward compat) or of the first
  // group when the multi-group API is used.
  const resolvedFabLabel =
    fabValueLabel ??
    (modes && value
      ? modes.find((m) => m.value === value)?.label
      : groups?.[0]?.modes.find((m) => m.value === groups[0].value)?.label)

  // Normalise the radio-group list — old API (`modes` + `value` +
  // `onValueChange`) gets converted to a single-group shape so the render
  // path is uniform.
  const renderGroups: DevStatePreviewGroup[] = groups
    ? [...groups]
    : modes && value !== undefined && onValueChange
      ? [{ id: 'default', label: title, modes, value, onValueChange }]
      : []

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <section
      className={composed}
      data-dev
      data-open={open || undefined}
      aria-label="Developer preview panel"
    >
      {open && (
        <div className="klyp-DevStatePreview__panel" onKeyDown={handleKeyDown}>
          <header className="klyp-DevStatePreview__header">
            <span className="klyp-DevStatePreview__title">{title}</span>
            <RACButton
              type="button"
              className="klyp-DevStatePreview__close"
              aria-label="Close dev preview panel"
              onPress={() => setOpen(false)}
            >
              <CloseCircleOutline width={16} height={16} aria-hidden />
            </RACButton>
          </header>

          <div className="klyp-DevStatePreview__body">
            {renderGroups.map((group) => (
              <div className="klyp-DevStatePreview__group" key={group.id}>
                {renderGroups.length > 1 && (
                  <span className="klyp-DevStatePreview__groupLabel">{group.label}</span>
                )}
                <RadioGroup
                  aria-label={group.label}
                  layout="rows"
                  value={group.value}
                  onChange={group.onValueChange}
                >
                  {group.modes.map((mode) => (
                    <Radio key={mode.value} value={mode.value} data-variant="menu-row">
                      {/* Descriptions truncate to one line for a compact,
                       *  no-scroll panel; the full text shows on hover via
                       *  `title` so nothing is lost. */}
                      <span className="klyp-DevStatePreview__itemBody" title={mode.description}>
                        <span className="klyp-DevStatePreview__itemLabel">{mode.label}</span>
                        {mode.description && (
                          <span className="klyp-DevStatePreview__itemDesc">{mode.description}</span>
                        )}
                      </span>
                    </Radio>
                  ))}
                </RadioGroup>
              </div>
            ))}

            {checkboxes && checkboxes.length > 0 && (
              <div className="klyp-DevStatePreview__group">
                <span className="klyp-DevStatePreview__groupLabel">Offer flags</span>
                <div className="klyp-DevStatePreview__checks">
                  {checkboxes.map((cb) => (
                    <Checkbox
                      key={cb.value}
                      size="sm"
                      isSelected={cb.checked}
                      onChange={cb.onCheckedChange}
                      description={cb.description}
                    >
                      {cb.label}
                    </Checkbox>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <RACButton
        type="button"
        className="klyp-DevStatePreview__fab"
        aria-label={`Toggle dev preview panel${resolvedFabLabel ? `. Current: ${resolvedFabLabel}` : ''}`}
        aria-expanded={open}
        onPress={() => setOpen((v) => !v)}
      >
        <SettingsOutline width={16} height={16} aria-hidden />
        <span className="klyp-DevStatePreview__fabLabel">Dev</span>
        {resolvedFabLabel && (
          <span className="klyp-DevStatePreview__fabValue">{resolvedFabLabel}</span>
        )}
      </RACButton>
    </section>
  )
}

export default DevStatePreview
