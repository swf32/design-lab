const previewStyles = String.raw`
.preview-feature-grid {
  width: 150px;
  height: 108px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-feature-grid__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.preview-feature-grid__eyebrow {
  width: 36px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-text-disabled);
  opacity: 0.65;
}

.preview-feature-grid__title {
  width: 72px;
  height: 5px;
  border-radius: 999px;
  background: var(--color-text-primary);
}

.preview-feature-grid__desc {
  width: 56px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-text-muted);
  opacity: 0.55;
}

.preview-feature-grid__cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 3px;
  flex: 1;
  min-height: 0;
}

.preview-feature-grid__card {
  min-width: 0;
  padding: 4px 3px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: color-mix(in srgb, var(--color-surface-primary) 94%, transparent);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.preview-feature-grid__icon {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--color-accent-primary) 16%, transparent);
}

.preview-feature-grid__line {
  display: block;
  height: 2px;
  border-radius: 999px;
  background: var(--color-text-primary);
  opacity: 0.75;
}

.preview-feature-grid__line--muted {
  background: var(--color-text-muted);
  opacity: 0.45;
}

.preview-feature-grid__line:nth-child(2) {
  width: 88%;
}

.preview-feature-grid__line:nth-child(3) {
  width: 64%;
}
`

export function FeatureGridPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-feature-grid" role="img" aria-label="Feature grid section">
        <span className="preview-feature-grid__header">
          <span className="preview-feature-grid__eyebrow" aria-hidden="true" />
          <span className="preview-feature-grid__title" aria-hidden="true" />
          <span className="preview-feature-grid__desc" aria-hidden="true" />
        </span>
        <span className="preview-feature-grid__cards" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className="preview-feature-grid__card">
              <span className="preview-feature-grid__icon" />
              <i className="preview-feature-grid__line" />
              <i className="preview-feature-grid__line preview-feature-grid__line--muted" />
            </span>
          ))}
        </span>
      </div>
    </>
  )
}
