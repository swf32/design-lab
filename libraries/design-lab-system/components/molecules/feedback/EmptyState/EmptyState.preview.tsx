const previewStyles = String.raw`
.preview-empty-state {
  width: min(180px, 100%);
  display: grid;
  place-items: center;
  gap: var(--space-8);
}
.preview-empty-state__icon {
  width: 24px;
  height: 24px;
  border: 1px solid var(--color-border-default);
  border-radius: 50%;
}
.preview-empty-state__title,
.preview-empty-state__copy,
.preview-empty-state__action {
  height: 7px;
  border-radius: var(--corner-control);
  background: var(--color-text-disabled);
}
.preview-empty-state__title {
  width: 96px;
  background: var(--color-text-secondary);
}
.preview-empty-state__copy {
  width: 142px;
  opacity: 0.65;
}
.preview-empty-state__action {
  width: 66px;
  height: 20px;
  margin-top: var(--space-4);
  background: var(--color-accent-primary);
}
`

export function EmptyStatePreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-empty-state" aria-label="Empty state illustration">
        <i className="preview-empty-state__icon" aria-hidden="true" />
        <i className="preview-empty-state__title" aria-hidden="true" />
        <i className="preview-empty-state__copy" aria-hidden="true" />
        <i className="preview-empty-state__action" aria-hidden="true" />
      </div>
    </>
  )
}
