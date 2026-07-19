const previewStyles = String.raw`
.preview-canvas-control {
  width: 164px;
  min-height: 100px;
  padding: 7px;
  box-sizing: border-box;
  border: 0;
  border-radius: var(--radius-small);
  background: transparent;
  display: grid;
  grid-template-columns: 62px 1fr;
  align-items: start;
  gap: 7px;
}
.preview-canvas-control__modes {
  padding: 4px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-secondary);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}
.preview-canvas-control__modes > i {
  width: 15px;
  height: 22px;
  margin: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: 3px;
}
.preview-canvas-control__modes > i.is-dark {
  background-color: var(--color-canvas-grid-dark-a);
  background-image:
    linear-gradient(var(--color-canvas-grid-dark-b) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-canvas-grid-dark-b) 1px, transparent 1px);
  background-size: 5px 5px;
}
.preview-canvas-control__modes > i.is-light {
  background-color: var(--color-canvas-grid-light-a);
  background-image:
    linear-gradient(var(--color-canvas-grid-light-b) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-canvas-grid-light-b) 1px, transparent 1px);
  background-size: 5px 5px;
}
.preview-canvas-control__modes > i.is-color {
  border-color: var(--color-text-primary);
  background: var(--color-accent-secondary);
  box-shadow:
    0 0 0 1px var(--color-surface-secondary),
    0 0 0 2px var(--color-border-strong);
}
.preview-canvas-control__picker {
  position: relative;
  padding: 5px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-raised);
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 5px;
  box-shadow: 0 7px 16px color-mix(in srgb, var(--color-canvas) 24%, transparent);
}
.preview-canvas-control__picker::before {
  content: '';
  position: absolute;
  top: 7px;
  left: -4px;
  width: 7px;
  height: 7px;
  border-left: 1px solid var(--color-border-default);
  border-bottom: 1px solid var(--color-border-default);
  background: var(--color-surface-raised);
  transform: rotate(45deg);
}
.preview-canvas-control__picker > strong {
  width: 28px;
  height: 28px;
  border-radius: 3px;
  background: var(--color-accent-secondary);
}
.preview-canvas-control__picker > code {
  height: 14px;
  padding: 0 4px;
  border: 1px solid var(--color-border-subtle);
  border-radius: 3px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  font-size: 5px;
}
.preview-canvas-control__picker > span {
  grid-column: 1/-1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
}
.preview-canvas-control__picker > span > i {
  width: auto;
  height: 10px;
  margin: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: 2px;
  background: var(--color-canvas-grid-dark-a);
}
.preview-canvas-control__picker > span > i:nth-child(2) {
  background: var(--color-accent-secondary);
}
.preview-canvas-control__picker > span > i:nth-child(3) {
  background: var(--color-status-danger);
}
.preview-canvas-control__picker > span > i:nth-child(4) {
  background: var(--color-status-success);
}
`
export function CanvasBackgroundControlPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-canvas-control"
        role="img"
        aria-label="Canvas background modes and solid color picker"
      >
        <div className="preview-canvas-control__modes">
          <i className="is-dark" />
          <i className="is-light" />
          <i className="is-color" />
        </div>
        <div className="preview-canvas-control__picker">
          <strong />
          <code>#6D3BE8</code>
          <span>
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    </>
  )
}
