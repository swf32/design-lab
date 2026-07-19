const previewStyles = String.raw`
.northstar-button-preview {
  width: 100%;
  display: grid;
  place-items: center;
}

.northstar-button-preview span {
  min-height: 40px;
  padding: 0 18px;
  border-radius: var(--radius-small);
  background: var(--color-accent-primary);
  color: var(--color-canvas);
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
}
`

export function ButtonPreview() {
  return (
    <div className="northstar-button-preview">
      <style>{previewStyles}</style>
      <span>Search flights</span>
    </div>
  )
}
