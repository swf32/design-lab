const previewStyles = String.raw`
.preview-control-field {
  width: 150px;
  display: grid;
  gap: 6px;
}
.preview-control-field b {
  width: 42px;
  height: 4px;
  background: var(--color-text-disabled);
}
.preview-control-field span {
  height: 26px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-secondary);
}
.preview-control-field i {
  width: 72%;
  height: 3px;
  background: var(--color-border-subtle);
}
`
export function ControlFieldPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-control-field" aria-label="Control Field illustration">
        <b />
        <span />
        <i />
      </div>
    </>
  )
}
