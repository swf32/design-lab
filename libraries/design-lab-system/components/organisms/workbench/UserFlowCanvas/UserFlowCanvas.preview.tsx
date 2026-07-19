const previewStyles = String.raw`
.user-flow-canvas-preview {
  width: 100%;
  height: 150px;
  position: relative;
}

.user-flow-canvas-preview::before {
  width: 54%;
  height: 1px;
  background: var(--color-border-strong);
  content: '';
  position: absolute;
  top: 50%;
  left: 23%;
}

.user-flow-canvas-preview__node {
  width: 32%;
  height: 74px;
  padding: 10px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-primary);
  position: absolute;
  top: calc(50% - 37px);
  display: grid;
  align-content: center;
  gap: 7px;
}

.user-flow-canvas-preview__node:first-child {
  left: 4%;
}

.user-flow-canvas-preview__node:last-child {
  right: 4%;
  border-color: var(--color-accent-primary);
}

.user-flow-canvas-preview i {
  width: 64%;
  height: 6px;
  border-radius: 99px;
  background: var(--color-text-muted);
}

.user-flow-canvas-preview b {
  width: 84%;
  height: 5px;
  border-radius: 99px;
  background: var(--color-border-default);
}
`

export function UserFlowCanvasPreview() {
  return (
    <div className="user-flow-canvas-preview">
      <style>{previewStyles}</style>
      <div className="user-flow-canvas-preview__node">
        <i />
        <b />
      </div>
      <div className="user-flow-canvas-preview__node">
        <i />
        <b />
      </div>
    </div>
  )
}
