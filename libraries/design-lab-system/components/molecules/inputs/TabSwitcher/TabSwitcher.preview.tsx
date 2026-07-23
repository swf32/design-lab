import { CardsViewIcon, ListViewIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.preview-tab-switcher {
  padding: 3px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-secondary);
  display: flex;
  gap: 2px;
  color: var(--color-text-muted);
  font-size: 8px;
}
.preview-tab-switcher span {
  min-width: 62px;
  height: 26px;
  padding-inline: 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition:
    background var(--transition-preview) var(--easing-preview),
    color var(--transition-preview) var(--easing-preview),
    box-shadow var(--transition-preview) var(--easing-preview);
}
.preview-tab-switcher svg {
  display: block;
}
.preview-tab-switcher .is-first {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  box-shadow: 0 0 0 1px var(--color-border-subtle);
}
@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible) .preview-tab-switcher .is-first {
    background: transparent;
    color: var(--color-text-muted);
    box-shadow: none;
  }
  .dl-component-card--preview-animated:is(:hover, :focus-visible) .preview-tab-switcher .is-second {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
    box-shadow: 0 0 0 1px var(--color-border-subtle);
  }
}
`

export function TabSwitcherPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-tab-switcher"
        data-preview-motion="state-transition"
        aria-label="Segmented icon and text selector illustration"
      >
        <span className="is-first">
          <CardsViewIcon size={13} aria-hidden="true" />
          Cards
        </span>
        <span className="is-second">
          <ListViewIcon size={13} aria-hidden="true" />
          List
        </span>
      </div>
    </>
  )
}
