const previewStyles = String.raw`
.preview-runtime-frame {
  width: min(210px, 100%);
  height: 104px;
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  background: var(--color-surface-secondary);
  display: grid;
  place-items: center;
}
.preview-runtime-frame__viewport {
  width: 74%;
  height: 58%;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  background: var(--color-surface-primary);
  display: grid;
  place-items: center;
}
.preview-runtime-frame__viewport::after {
  content: '';
  width: 42%;
  height: 8px;
  border-radius: var(--corner-control);
  background: var(--color-accent-primary);
}
`

export function RuntimeFrameSurfacePreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-runtime-frame" aria-label="Runtime frame illustration">
        <i className="preview-runtime-frame__viewport" aria-hidden="true" />
      </div>
    </>
  )
}
