const previewStyles = String.raw`
.user-flow-canvas-preview {
  width: 100%;
  height: 150px;
  background-image:
    linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px);
  background-size: 16px 16px;
  position: relative;
}
.user-flow-canvas-preview::before {
  width: 40%;
  height: 1px;
  background: var(--color-border-strong);
  content: '';
  position: absolute;
  top: 50%;
  left: 30%;
}
.user-flow-canvas-preview__node {
  width: 39%;
  height: 104px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-primary);
  overflow: hidden;
  position: absolute;
  top: calc(50% - 52px);
  display: grid;
  grid-template-rows: 1fr 30px;
}
.user-flow-canvas-preview__node:first-child {
  left: 3%;
}
.user-flow-canvas-preview__node:last-child {
  right: 3%;
  border-color: var(--color-accent-primary);
}
.user-flow-canvas-preview__screens {
  padding: 6px;
  background: var(--color-surface-secondary);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 25%;
  gap: 5px;
}
.user-flow-canvas-preview__screen {
  border: 1px solid var(--color-border-subtle);
  border-radius: 2px;
  background:
    linear-gradient(
        90deg,
        var(--color-surface-raised) 0 30%,
        transparent 30% 34%,
        var(--color-accent-primary) 34% 66%,
        transparent 66% 70%,
        var(--color-surface-raised) 70% 100%
      )
      8px 72% / calc(100% - 16px) 22px no-repeat,
    linear-gradient(
        var(--color-text-disabled) 5px,
        transparent 5px 11px,
        var(--color-border-default) 11px 14px,
        transparent 14px
      )
      8px 10px / 68% 24px no-repeat,
    var(--color-canvas);
}
.user-flow-canvas-preview__screen--mobile {
  background:
    linear-gradient(
        var(--color-text-disabled) 4px,
        transparent 4px 9px,
        var(--color-border-default) 9px 12px,
        transparent 12px
      )
      4px 6px / calc(100% - 8px) 20px no-repeat,
    linear-gradient(
        var(--color-accent-primary) 0 31%,
        transparent 31% 35%,
        var(--color-surface-raised) 35% 66%,
        transparent 66% 70%,
        var(--color-surface-raised) 70% 100%
      )
      4px 34px / calc(100% - 8px) calc(100% - 40px) no-repeat,
    var(--color-canvas);
}
.user-flow-canvas-preview__meta {
  padding: 6px 8px;
  border-top: 1px solid var(--color-border-subtle);
  display: grid;
  gap: 4px;
}
.user-flow-canvas-preview__meta i,
.user-flow-canvas-preview__meta b {
  height: 3px;
  border-radius: 99px;
  background: var(--color-text-muted);
}
.user-flow-canvas-preview__meta i {
  width: 42%;
}
.user-flow-canvas-preview__meta b {
  width: 68%;
  background: var(--color-border-default);
}
`

export function UserFlowCanvasPreview() {
  return (
    <div className="user-flow-canvas-preview" aria-hidden="true">
      <style>{previewStyles}</style>
      {[false, true].map((selected) => (
        <div className="user-flow-canvas-preview__node" key={String(selected)}>
          <div className="user-flow-canvas-preview__screens">
            <div className="user-flow-canvas-preview__screen" />
            <div className="user-flow-canvas-preview__screen user-flow-canvas-preview__screen--mobile" />
          </div>
          <div className="user-flow-canvas-preview__meta">
            <i />
            <b />
          </div>
        </div>
      ))}
    </div>
  )
}
