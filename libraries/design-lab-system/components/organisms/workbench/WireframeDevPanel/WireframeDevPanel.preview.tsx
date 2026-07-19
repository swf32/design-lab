const previewStyles = String.raw`
.wireframe-dev-panel-preview {
  width: 100%;
  max-width: 260px;
  padding: 12px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-primary);
  display: grid;
  gap: 10px;
}

.wireframe-dev-panel-preview__header {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
}

.wireframe-dev-panel-preview i,
.wireframe-dev-panel-preview b {
  display: block;
  border-radius: 999px;
  background: var(--color-border-default);
}

.wireframe-dev-panel-preview i {
  width: 74px;
  height: 7px;
}

.wireframe-dev-panel-preview b {
  width: 34px;
  height: 7px;
  background: var(--color-accent-primary);
}

.wireframe-dev-panel-preview__control {
  height: 32px;
  padding: 0 9px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-small);
  display: flex;
  align-items: center;
  gap: 8px;
}

.wireframe-dev-panel-preview__control::before {
  width: 12px;
  height: 12px;
  border: 1px solid var(--color-accent-primary);
  border-radius: 50%;
  content: '';
}
`

export function WireframeDevPanelPreview() {
  return (
    <div className="wireframe-dev-panel-preview">
      <style>{previewStyles}</style>
      <div className="wireframe-dev-panel-preview__header">
        <i />
        <b />
      </div>
      <div className="wireframe-dev-panel-preview__control">
        <i />
      </div>
      <div className="wireframe-dev-panel-preview__control">
        <i />
      </div>
    </div>
  )
}
