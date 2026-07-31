const previewStyles = String.raw`
.preview-typed-controls {
  width: min(180px, 100%);
  display: grid;
  gap: var(--space-10);
}
.preview-typed-controls__header {
  padding-bottom: var(--space-8);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
}
.preview-typed-controls__header i,
.preview-typed-controls__label,
.preview-typed-controls__field {
  border-radius: var(--corner-control);
  background: var(--color-text-disabled);
}
.preview-typed-controls__header i {
  width: 54px;
  height: 6px;
}
.preview-typed-controls__header i:last-child {
  width: 12px;
}
.preview-typed-controls__row {
  display: grid;
  gap: var(--space-4);
}
.preview-typed-controls__label {
  width: 42px;
  height: 5px;
}
.preview-typed-controls__field {
  width: 100%;
  height: 22px;
  border: 1px solid var(--color-border-default);
  background: var(--color-surface-secondary);
}
`

export function TypedPlaygroundControlsPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-typed-controls" aria-label="Typed controls illustration">
        <div className="preview-typed-controls__header" aria-hidden="true">
          <i />
          <i />
        </div>
        {[0, 1, 2].map((item) => (
          <div className="preview-typed-controls__row" key={item} aria-hidden="true">
            <i className="preview-typed-controls__label" />
            <i className="preview-typed-controls__field" />
          </div>
        ))}
      </div>
    </>
  )
}
