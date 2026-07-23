const previewStyles = String.raw`
.preview-table {
  width: min(230px, 100%);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-medium);
  overflow: hidden;
}
.preview-table div {
  min-height: 27px;
  padding: 0 9px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.8fr;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 6px;
}
.preview-table div:first-child {
  min-height: 22px;
  background: var(--color-surface-secondary);
  color: var(--color-text-disabled);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.preview-table div:last-child {
  border-bottom: 0;
  background: color-mix(in srgb, var(--color-accent-primary) 8%, transparent);
  box-shadow: inset 2px 0 var(--color-accent-primary);
}
`

export function TablePreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-table" aria-label="Sortable table illustration">
        <div>
          <span>Name ↑</span>
          <span>Status</span>
          <span>Updated</span>
        </div>
        <div>
          <span>Button</span>
          <span>Ready</span>
          <span>Today</span>
        </div>
        <div>
          <span>Dialog</span>
          <span>Review</span>
          <span>Yesterday</span>
        </div>
        <div>
          <span>Input</span>
          <span>Ready</span>
          <span>2 days</span>
        </div>
      </div>
    </>
  )
}
