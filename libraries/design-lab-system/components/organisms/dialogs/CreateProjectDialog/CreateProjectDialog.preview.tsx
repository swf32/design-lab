const previewStyles = String.raw`
.preview-create-project {
  width: min(220px, 100%);
  padding: var(--space-12);
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-surface);
  background: var(--color-surface-primary);
  display: grid;
  gap: var(--space-10);
}
.preview-create-project__heading {
  width: 84px;
  height: 8px;
  border-radius: var(--corner-control);
  background: var(--color-text-primary);
}
.preview-create-project__choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
}
.preview-create-project__choices i {
  height: 38px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  background: var(--color-surface-secondary);
}
.preview-create-project__choices i:first-child {
  border-color: var(--color-accent-primary);
}
.preview-create-project__field {
  height: 24px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  background: var(--color-surface-secondary);
}
`

export function CreateProjectDialogPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-create-project" aria-label="Create project dialog illustration">
        <i className="preview-create-project__heading" aria-hidden="true" />
        <div className="preview-create-project__choices" aria-hidden="true">
          <i />
          <i />
        </div>
        <i className="preview-create-project__field" aria-hidden="true" />
      </div>
    </>
  )
}
