const previewStyles = String.raw`
.dialog-preview {
  width: 146px;
  height: 96px;
  padding: 10px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-surface);
  background: var(--color-surface-raised);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 7px;
}
.dialog-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dialog-preview__header strong {
  width: 70px;
  height: 7px;
  border-radius: 2px;
  background: var(--color-text-secondary);
}
.dialog-preview__header i {
  width: 10px;
  height: 10px;
  position: relative;
}
.dialog-preview__header i::before,
.dialog-preview__header i::after {
  width: 9px;
  height: 1px;
  position: absolute;
  top: 4px;
  left: 1px;
  background: var(--color-text-muted);
  content: '';
  transform: rotate(45deg);
}
.dialog-preview__header i::after {
  transform: rotate(-45deg);
}
.dialog-preview > span {
  width: 106px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-text-disabled);
}
.dialog-preview__body {
  border: 1px solid var(--color-border-subtle);
  border-radius: 4px;
  background: var(--color-surface-secondary);
}
.dialog-preview footer {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
.dialog-preview footer b {
  width: 30px;
  height: 10px;
  border-radius: 3px;
  background: var(--color-surface-hover);
}
.dialog-preview footer b:last-child {
  background: var(--color-accent-primary);
}
`

export function DialogPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="dialog-preview" role="img" aria-label="Modal dialog illustration">
        <div className="dialog-preview__header">
          <strong />
          <i />
        </div>
        <span />
        <div className="dialog-preview__body" />
        <footer>
          <b />
          <b />
        </footer>
      </div>
    </>
  )
}
