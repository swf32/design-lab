const previewStyles = String.raw`
.preview-radio-buttons {
  min-height: 96px;
  display: grid;
  place-content: center;
  gap: 12px;
}
.preview-radio-button {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 9px;
  line-height: 1;
}
.preview-radio-button > i {
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  border: 1px solid var(--color-border-strong);
  border-radius: 50%;
  background: var(--color-surface-secondary);
  display: grid;
  place-items: center;
}
.preview-radio-button.is-selected > i {
  border-color: var(--color-accent-primary);
}
.preview-radio-button.is-selected > i::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent-primary);
}
`

export function RadioButtonPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-radio-buttons"
        role="img"
        aria-label="Unselected and selected radio options"
      >
        <span className="preview-radio-button">
          <i />
          Draft
        </span>
        <span className="preview-radio-button is-selected">
          <i />
          Published
        </span>
      </div>
    </>
  )
}
