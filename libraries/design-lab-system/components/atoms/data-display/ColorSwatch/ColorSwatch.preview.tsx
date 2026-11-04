const previewStyles = String.raw`
.preview-color-swatch {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.preview-color-swatch i {
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-canvas) 28%, transparent);
  background: var(--color-accent-primary);
}
.preview-color-swatch i:last-child {
  background: var(--color-surface-raised);
}
`

export function ColorSwatchPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-color-swatch" role="img" aria-label="Two resolved color swatches">
        <i />
        <i />
      </div>
    </>
  )
}
