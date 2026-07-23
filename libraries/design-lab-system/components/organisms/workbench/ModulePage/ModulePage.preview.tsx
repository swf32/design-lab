const previewStyles = String.raw`
.preview-module-page {
  width: min(210px, 100%);
  height: 120px;
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-medium);
  display: grid;
  grid-template-rows: 24px 1fr;
  gap: 10px;
}
.preview-module-page header {
  border-bottom: 1px solid var(--color-border-subtle);
}
.preview-module-page div {
  border-radius: var(--radius-card);
  background: var(--color-surface-secondary);
}
`

export function ModulePagePreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-module-page" aria-label="Module Page illustration">
        <header />
        <div />
      </div>
    </>
  )
}
