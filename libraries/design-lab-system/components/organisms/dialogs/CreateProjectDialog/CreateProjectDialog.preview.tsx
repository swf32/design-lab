const previewStyles = String.raw`
.preview-dialog {
  width: 135px;
  height: 90px;
  padding: 9px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-raised);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preview-dialog small {
  width: 28px;
  height: 3px;
  background: var(--color-accent-primary);
}
.preview-dialog strong {
  width: 78px;
  height: 8px;
  background: var(--color-text-secondary);
}
.preview-dialog i {
  height: 5px;
  background: var(--color-text-disabled);
}
.preview-dialog span {
  height: 18px;
  border: 1px solid var(--color-border-default);
  border-radius: 3px;
}
.preview-dialog footer {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
.preview-dialog footer b {
  width: 29px;
  height: 10px;
  border-radius: 3px;
  background: var(--color-surface-hover);
}
.preview-dialog footer b:last-child {
  background: var(--color-accent-primary);
}
`
export function CreateProjectDialogPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-dialog" role="img" aria-label="Create Project Dialog illustration">
        <small />
        <strong />
        <i />
        <span />
        <footer>
          <b />
          <b />
        </footer>
      </div>
    </>
  )
}
