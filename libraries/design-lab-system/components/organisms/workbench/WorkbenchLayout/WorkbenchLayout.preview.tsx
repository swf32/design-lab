const previewStyles = String.raw`
.preview-workbench-layout {
  width: min(218px, 100%);
  height: 122px;
  box-sizing: border-box;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  overflow: hidden;
  background: var(--color-surface-primary);
}
.preview-workbench-layout__header {
  height: 24px;
  padding: 8px 12px 0;
  border-bottom: 1px solid var(--color-border-subtle);
}
.preview-workbench-layout__header::before,
.preview-workbench-layout__rail span {
  content: '';
  display: block;
  width: 48%;
  height: 4px;
  border-radius: 2px;
  background: var(--color-text-muted);
}
.preview-workbench-layout__canvas {
  height: 52px;
  background: var(--color-surface-secondary);
  border-bottom: 1px solid var(--color-border-subtle);
}
.preview-workbench-layout__rail {
  padding: 10px 12px;
  display: grid;
  gap: 7px;
}
.preview-workbench-layout__rail span:nth-child(2) {
  width: 78%;
  opacity: 0.55;
}
.preview-workbench-layout__rail span:nth-child(3) {
  width: 62%;
  opacity: 0.4;
}
`

export function WorkbenchLayoutPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-workbench-layout" aria-label="Workbench layout illustration">
        <div className="preview-workbench-layout__header" />
        <div className="preview-workbench-layout__canvas" />
        <div className="preview-workbench-layout__rail">
          <span />
          <span />
          <span />
        </div>
      </div>
    </>
  )
}
