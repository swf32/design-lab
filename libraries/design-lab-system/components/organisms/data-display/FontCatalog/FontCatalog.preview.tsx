const previewStyles = String.raw`
.preview-font-catalog {
  display: grid;
  gap: 9px;
  padding: 12px;
  color: var(--color-text-primary);
}
.preview-font-catalog strong {
  font-size: 18px;
  font-weight: 600;
}
.preview-font-catalog p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 25px;
  line-height: 1;
}
.preview-font-catalog small {
  color: var(--color-text-muted);
  font-size: 10px;
}
`

export function FontCatalogPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-font-catalog">
        <strong>Interface Sans</strong>
        <p>Hamburgefontsiv 012345</p>
        <small>400 Regular · 600 Semibold</small>
      </div>
    </>
  )
}
