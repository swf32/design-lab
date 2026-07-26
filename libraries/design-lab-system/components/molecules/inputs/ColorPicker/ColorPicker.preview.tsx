const previewStyles = String.raw`
.preview-color-picker {
  width: min(148px, 100%);
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-surface);
  background: var(--color-surface-raised);
  display: grid;
  gap: 7px;
}
.preview-color-picker__spectrum {
  position: relative;
  height: 78px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  background:
    linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, transparent),
    #087edb;
}
.preview-color-picker__spectrum::after {
  content: '';
  position: absolute;
  top: 14%;
  right: 8%;
  width: 8px;
  height: 8px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
}
.preview-color-picker__hue {
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
}
.preview-color-picker__presets {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
}
.preview-color-picker__presets i {
  aspect-ratio: 1;
  border: 1px solid var(--color-border-strong);
  border-radius: 50%;
  background: var(--color-status-danger);
}
.preview-color-picker__presets i:nth-child(2) {
  background: var(--color-status-warning);
}
.preview-color-picker__presets i:nth-child(3) {
  background: var(--color-status-success);
}
.preview-color-picker__presets i:nth-child(4) {
  background: var(--color-accent-primary);
  outline: 2px solid var(--color-text-primary);
  outline-offset: 1px;
}
.preview-color-picker__presets i:nth-child(5) {
  background: var(--color-accent-secondary);
}
.preview-color-picker__presets i:nth-child(6) {
  background: var(--color-category-violet);
}
.preview-color-picker__presets i:nth-child(7) {
  background: var(--color-category-orange);
}
.preview-color-picker__presets i:nth-child(8) {
  background: var(--color-text-muted);
}
.preview-color-picker__hex {
  height: 22px;
  padding: 0 6px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 7px;
  text-transform: lowercase;
}
`

export function ColorPickerPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-color-picker" aria-label="Color picker popover illustration">
        <span className="preview-color-picker__spectrum" />
        <span className="preview-color-picker__hue" />
        <div className="preview-color-picker__presets" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <code className="preview-color-picker__hex">#26d9c7</code>
      </div>
    </>
  )
}
