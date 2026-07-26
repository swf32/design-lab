const previewStyles = String.raw`
.preview-component-thumbnail {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
}
.preview-component-thumbnail span {
  box-sizing: border-box;
  width: 52px;
  height: 24px;
  border-radius: var(--corner-control);
  background: var(--color-accent-primary);
  color: var(--color-canvas);
  display: grid;
  place-items: center;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.01em;
}
.preview-component-thumbnail span.is-ghost {
  background: transparent;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-secondary);
}
`

export function ComponentThumbnailPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-component-thumbnail"
        aria-label="Button kind catalog thumbnail silhouette"
      >
        <span>Save</span>
        <span className="is-ghost">Edit</span>
      </div>
    </>
  )
}
