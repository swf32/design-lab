const previewStyles = String.raw`
.preview-workspace-header {
  width: min(230px, 100%);
  min-height: 52px;
  box-sizing: border-box;
  padding: 0 10px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.preview-workspace-header__title {
  color: var(--color-text-muted);
  display: flex;
  gap: 5px;
  font-size: 7px;
}
.preview-workspace-header__title b {
  color: var(--color-text-disabled);
  font-weight: 400;
}
.preview-workspace-header__title strong {
  color: var(--color-text-secondary);
}
.preview-workspace-header__actions {
  display: flex;
  gap: 4px;
}
.preview-workspace-header__actions i {
  width: 19px;
  height: 19px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-small);
}
`

export function WorkspaceHeaderPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-workspace-header" aria-label="Workspace Header illustration">
        <span className="preview-workspace-header__title">
          Design Lab <b>/</b> <strong>Components</strong>
        </span>
        <span className="preview-workspace-header__actions" aria-hidden="true">
          <i />
          <i />
        </span>
      </div>
    </>
  )
}
