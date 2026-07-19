import { SearchIcon } from '../../../../assets/icons/SearchIcon'

const previewStyles = String.raw`
.preview-input {
  width: 184px;
  height: 85px;
  display: grid;
  grid-template-columns: minmax(0, 0.94fr) minmax(0, 1.06fr);
  gap: 8px;
  align-items: stretch;
  color: var(--color-text-secondary);
  font-family: var(--typography-interface-family);
}
.preview-input__column {
  min-width: 0;
  display: grid;
  grid-template-rows: 40px 37px;
  gap: 8px;
}
.preview-input__specimen {
  min-width: 0;
  display: grid;
  grid-template-rows: 7px minmax(0, 1fr);
  gap: 3px;
}
.preview-input__specimen > span {
  color: var(--color-text-muted);
  font-size: 5.5px;
  line-height: 7px;
  font-weight: 600;
}
.preview-input__control {
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
  padding: 0 8px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
  transition:
    border-color var(--transition-preview) var(--easing-preview),
    background var(--transition-preview) var(--easing-preview),
    box-shadow var(--transition-preview) var(--easing-preview),
    color var(--transition-preview) var(--easing-preview);
}
.preview-input__control b {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 6.5px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-input__specimen--focused .preview-input__control {
  border-color: var(--color-accent-primary);
  background: var(--color-surface-raised);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent-primary) 14%, transparent);
}
.preview-input__specimen--focused .preview-input__control i {
  width: 1px;
  height: 11px;
  margin-left: 1px;
  background: var(--color-accent-primary);
  transition: opacity var(--transition-preview) var(--easing-preview);
}
.preview-input__specimen--search .preview-input__control {
  padding-inline: 7px;
  color: var(--color-text-muted);
}
.preview-input__specimen--search svg {
  flex: 0 0 auto;
  transition: color var(--transition-preview) var(--easing-preview);
}
.preview-input__specimen--textarea .preview-input__control {
  min-height: 0;
  padding: 7px 8px 6px;
  align-items: flex-start;
  flex-direction: column;
  gap: 3px;
}
.preview-input__specimen--textarea .preview-input__control b {
  width: 100%;
  line-height: 1.25;
  white-space: normal;
}
.preview-input__specimen--textarea .preview-input__control small {
  margin-top: auto;
  align-self: flex-end;
  color: var(--color-text-disabled);
  font-size: 4.5px;
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-input__specimen--focused
    .preview-input__control {
    border-color: var(--color-border-default);
    background: var(--color-surface-secondary);
    box-shadow: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-input__specimen--focused
    .preview-input__control
    i {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-input__specimen--search
    .preview-input__control {
    border-color: var(--color-accent-primary);
    background: var(--color-surface-raised);
    color: var(--color-accent-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent-primary) 14%, transparent);
  }
}
`

export function InputPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-input"
        data-preview-motion="state-transition"
        role="img"
        aria-label="Text, search, and textarea input family illustration"
      >
        <div className="preview-input__column">
          <div className="preview-input__specimen preview-input__specimen--focused">
            <span>Component name</span>
            <div className="preview-input__control">
              <b>Input</b>
              <i />
            </div>
          </div>
          <div className="preview-input__specimen preview-input__specimen--search">
            <span>Search</span>
            <div className="preview-input__control">
              <SearchIcon size={10} />
              <b>Find…</b>
            </div>
          </div>
        </div>
        <div className="preview-input__specimen preview-input__specimen--textarea">
          <span>Description</span>
          <div className="preview-input__control">
            <b>Reusable text field</b>
            <small>19 / 160</small>
          </div>
        </div>
      </div>
    </>
  )
}
