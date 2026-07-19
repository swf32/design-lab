const previewStyles = String.raw`
.preview-color-picker {
  width: 150px;
  max-width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-raised);
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  gap: 8px;
}
.preview-color-picker > span {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-accent-secondary);
  box-shadow: 0 0 0 1px var(--color-border-default);
}
.preview-color-picker > div {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
}
.preview-color-picker i {
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--color-status-danger);
}
.preview-color-picker i:nth-child(2) {
  background: var(--color-accent-primary);
}
.preview-color-picker i:nth-child(3) {
  background: var(--color-status-success);
}
.preview-color-picker i:nth-child(4) {
  background: var(--color-accent-secondary);
}
.preview-color-picker i:nth-child(5) {
  background: var(--color-accent-primary);
}
.preview-color-picker i:nth-child(6) {
  background: var(--color-text-muted);
}
.preview-color-picker code {
  grid-column: 1/-1;
  height: 24px;
  padding: 0 7px;
  border: 1px solid var(--color-border-subtle);
  border-radius: 4px;
  background: var(--color-surface-secondary);
  color: var(--color-code);
  display: flex;
  align-items: center;
  font-size: 8px;
}
`
export function ColorPickerPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-color-picker" aria-label="Color Picker illustration">
        <span />
        <div>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <code>#3b82f6</code>
      </div>
    </>
  )
}
