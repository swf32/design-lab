const previewStyles = String.raw`
.preview-tab-switchers {
  min-height: 92px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--color-text-muted);
  font-size: 8px;
}
.preview-tab-switchers > div,
.preview-tab-switchers > aside {
  padding: 3px;
  border: 1px solid var(--color-border-default);
  background: var(--color-surface-secondary);
  display: flex;
  gap: 2px;
}
.preview-tab-switchers > div {
  border-radius: var(--radius-small);
}
.preview-tab-switchers > div span {
  padding: 5px 8px;
  border-radius: 4px;
  font-weight: 500;
  transition:
    background var(--transition-preview) var(--easing-preview),
    color var(--transition-preview) var(--easing-preview),
    box-shadow var(--transition-preview) var(--easing-preview);
}
.preview-tab-switchers > div .is-first {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  box-shadow: 0 0 0 1px var(--color-border-subtle);
}
.preview-tab-switchers > aside {
  position: relative;
  border-radius: 14px;
}
.preview-tab-switchers > aside i {
  position: absolute;
  z-index: 0;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface-hover);
  box-shadow: 0 0 0 1px var(--color-border-subtle);
  transition: transform var(--transition-preview) var(--easing-preview);
}
.preview-tab-switchers > aside span {
  width: 22px;
  height: 20px;
  padding: 0;
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  transition: color var(--transition-preview) var(--easing-preview);
}
.preview-tab-switchers > aside span:first-of-type {
  color: var(--color-text-primary);
}
@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-tab-switchers
    > div
    .is-first {
    background: transparent;
    color: var(--color-text-muted);
    box-shadow: none;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-tab-switchers
    > div
    .is-second {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
    box-shadow: 0 0 0 1px var(--color-border-subtle);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible) .preview-tab-switchers > aside i {
    transform: translateX(22px);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-tab-switchers
    > aside
    span:first-of-type {
    color: var(--color-text-muted);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-tab-switchers
    > aside
    span:last-of-type {
    color: var(--color-text-primary);
  }
}
`
export function TabSwitcherPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-tab-switchers"
        data-preview-motion="state-transition"
        aria-label="Tab Switcher illustration"
      >
        <div>
          <span className="is-first">Tokens</span>
          <span className="is-second">Palette</span>
        </div>
        <aside>
          <i />
          <span>☼</span>
          <span>◐</span>
        </aside>
      </div>
    </>
  )
}
