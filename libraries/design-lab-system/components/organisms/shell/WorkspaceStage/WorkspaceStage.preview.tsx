const previewStyles = String.raw`
.preview-workspace-stage {
  width: min(220px, 100%);
  height: 110px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-medium);
  background-color: var(--color-surface-raised);
  background-image: radial-gradient(
    color-mix(in srgb, var(--color-text-primary) 8%, transparent) 0.7px,
    transparent 0.7px
  );
  background-size: 12px 12px;
  display: grid;
  place-items: center;
}
.preview-workspace-stage i {
  width: 72%;
  height: 54%;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  background: var(--color-surface-secondary);
}
`

export function WorkspaceStagePreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-workspace-stage" aria-label="Workspace Stage illustration">
        <i aria-hidden="true" />
      </div>
    </>
  )
}
