/**
 * `<ViewToggle>` — Tier 4 brand molecule.
 *
 * Two-option icon toggle for switching between **Grid** and **Line** (list)
 * presentations of a collection. Built on top of `<TabSwitcher>` (the same
 * segmented control used in the chat composer for `text / image / video`),
 * so the active state is the canonical flat fill + 1px subtle stroke — NOT
 * the gold-gradient pill `<ChipToggle>` carries (design lead 2026-05-07).
 *
 * Used on Episodes (`/series/$slug`) and Scenes (`/series/$slug/$ep`)
 * section headers. URL-driven via `?view=grid|line`; default falls back to
 * `useUiPrefs.{episodeViewMode,sceneViewMode}`.
 *
 * Design contract:
 *   - Outer pill 40px (`size="md"`) — matches composer's modality switcher.
 *   - Each option is `<icon /> + <label />`. Icons inline, 16×16, stroke 1.5,
 *     `currentColor` (Iconsax-style: 4 rounded squares for Grid, 3 stripes
 *     for Line).
 *   - Adaptive: under `@container (max-width: 360px)` the labels collapse
 *     to icon-only. Each Item still carries an `aria-label` so screen
 *     readers announce "Grid view" / "Line view" regardless.
 */

import { TabSwitcher } from '../TabSwitcher'
import './ViewToggle.scss'

export type ViewMode = 'grid' | 'line'

export type ViewToggleProps = {
  /** Current view mode. */
  value: ViewMode
  /** Called when the user picks a new mode. */
  onValueChange: (next: ViewMode) => void
  /**
   * `aria-label` for the toggle group. Required — describes WHICH collection
   * is being switched (e.g. `"Episodes view"`, `"Scenes view"`).
   */
  ariaLabel: string
  /** Optional extra class on the root. */
  className?: string
  /** Disable both options (passed through to each `<TabSwitcher.Item>`). */
  isDisabled?: boolean
}

export function ViewToggle({
  value,
  onValueChange,
  ariaLabel,
  className,
  isDisabled,
}: ViewToggleProps) {
  const rootClass = className ? `klyp-ViewToggle ${className}` : 'klyp-ViewToggle'

  return (
    <TabSwitcher
      value={value}
      onValueChange={(v) => onValueChange(v as ViewMode)}
      ariaLabel={ariaLabel}
      size="md"
      className={rootClass}
    >
      {/* Pass the icon via TabSwitcher's `icon` prop — NOT as a child.
          The host renders `icon` inside its own `__optionIcon` + `__inner`
          flex-row (icon | label, center-aligned, --space-4 gap, icon pinned
          to --tab-switcher-icon-size 16px on md). Passing the SVG as a child
          instead bundles it into the single `__label` span, which lays out
          inline and stacks the 16px glyph above the 13px label inside the
          narrow option slot — the two-row bug this component had. */}
      <TabSwitcher.Item value="grid" icon={GridIcon} aria-label="Grid view" isDisabled={isDisabled}>
        Grid
      </TabSwitcher.Item>
      <TabSwitcher.Item value="line" icon={LineIcon} aria-label="Line view" isDisabled={isDisabled}>
        Line
      </TabSwitcher.Item>
    </TabSwitcher>
  )
}

export default ViewToggle

// ============================================================================
//  Inline icons (Iconsax-style, 16×16, stroke 1.5, currentColor)
// ============================================================================

function GridIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="klyp-ViewToggle__icon"
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  )
}

function LineIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="klyp-ViewToggle__icon"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}
