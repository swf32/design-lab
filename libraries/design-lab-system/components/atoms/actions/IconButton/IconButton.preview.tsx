const previewStyles = String.raw`
.preview-icon-buttons {
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.preview-icon-buttons span {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  display: grid;
  place-items: center;
  color: var(--color-text-muted);
  font-size: 11px;
}
`
export function IconButtonPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-icon-buttons" aria-label="Icon Button illustration">
        <span>＋</span>
        <span>↗</span>
        <i />
      </div>
    </>
  )
}
