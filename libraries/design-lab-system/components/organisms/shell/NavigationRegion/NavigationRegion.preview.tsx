const previewStyles = String.raw`
.preview-navigation-region {
  width: min(210px, 100%);
  height: 112px;
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  background: var(--shell-navigation-surface);
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
}
.preview-navigation-region__rail {
  padding: var(--space-8) var(--space-6);
  border-right: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
  display: grid;
  align-content: start;
  gap: var(--space-6);
}
.preview-navigation-region__rail i {
  height: 16px;
  border-radius: var(--corner-control);
  background: var(--color-surface-hover);
}
.preview-navigation-region__directory {
  padding: var(--space-10);
  display: grid;
  align-content: start;
  gap: var(--space-8);
}
.preview-navigation-region__directory i {
  width: 100%;
  height: 8px;
  border-radius: var(--corner-control);
  background: var(--color-border-subtle);
}
.preview-navigation-region__directory i:nth-child(2) {
  width: 76%;
}
.preview-navigation-region__directory i:nth-child(3) {
  width: 88%;
}
`

export function NavigationRegionPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-navigation-region" aria-label="Navigation region illustration">
        <div className="preview-navigation-region__rail" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="preview-navigation-region__directory" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
    </>
  )
}
