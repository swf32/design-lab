const previewStyles = String.raw`
.preview-checkbox {
  min-height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.preview-checkbox > span {
  position: relative;
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  border: 1px solid var(--color-border-strong);
  border-radius: 4px;
  background: var(--color-surface-secondary);
}
.preview-checkbox > span.is-checked,
.preview-checkbox > span.is-indeterminate {
  border-color: var(--color-accent-primary);
  background: var(--color-accent-primary);
}
.preview-checkbox .is-checked::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 8px;
  border: solid var(--color-canvas);
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -59%) rotate(45deg);
  transform-origin: center;
}
.preview-checkbox .is-indeterminate::after {
  content: '';
  position: absolute;
  left: 3px;
  right: 3px;
  top: 50%;
  height: 2px;
  border-radius: 2px;
  background: var(--color-canvas);
  transform: translateY(-50%);
}
`
export function CheckboxPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-checkbox" aria-hidden="true">
        <span className="is-checked" />
        <span />
        <span className="is-indeterminate" />
      </div>
    </>
  )
}
