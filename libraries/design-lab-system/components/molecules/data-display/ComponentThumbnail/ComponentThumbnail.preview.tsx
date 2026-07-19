const previewStyles = String.raw`
.preview-component-thumbnail {
  width: 150px;
  height: 92px;
  padding: 12px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  display: grid;
  gap: 7px;
}
.preview-component-thumbnail i {
  border-radius: 4px;
  background: var(--color-surface-hover);
}
.preview-component-thumbnail span {
  width: 70%;
  height: 5px;
  background: var(--color-text-muted);
}
.preview-component-thumbnail span:last-child {
  width: 44%;
  background: var(--color-text-disabled);
}
`
export function ComponentThumbnailPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-component-thumbnail" aria-label="Component Thumbnail illustration">
        <i />
        <span />
        <span />
      </div>
    </>
  )
}
