const previewStyles = String.raw`
.preview-workbench-playground {
  min-height: 100px;
  display: grid;
  grid-template-columns: 1fr 42px;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-canvas-grid-dark-a);
}
.preview-workbench-playground > div {
  padding: 14px 9px 9px;
  display: grid;
  place-items: center;
  background-image: radial-gradient(var(--color-canvas-grid-dark-b) 0.6px, transparent 0.6px);
  background-size: 10px 10px;
}
.preview-workbench-playground > div strong {
  width: 62px;
  height: 22px;
  border: 1px solid var(--color-accent-primary);
  border-radius: 4px;
  background: var(--color-surface-secondary);
}
.preview-workbench-playground > div i {
  justify-self: end;
  width: 24px;
  height: 6px;
  border-radius: 3px;
  background: var(--color-border-default);
}
.preview-workbench-playground > div span {
  width: 70%;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border-subtle);
}
.preview-workbench-playground aside {
  padding: 12px 7px;
  border-left: 1px solid var(--color-border-subtle);
  background: var(--color-surface-secondary);
  display: grid;
  align-content: start;
  gap: 7px;
}
.preview-workbench-playground aside b {
  height: 10px;
  border-radius: 3px;
  background: var(--color-surface-hover);
}
`
export function WorkbenchPlaygroundPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-workbench-playground" aria-hidden="true">
        <div>
          <i />
          <strong />
          <span />
        </div>
        <aside>
          <b />
          <b />
          <b />
        </aside>
      </div>
    </>
  )
}
