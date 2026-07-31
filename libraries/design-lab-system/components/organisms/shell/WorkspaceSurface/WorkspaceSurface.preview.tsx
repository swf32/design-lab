const previewStyles = String.raw`
.preview-workspace-surface {
  width: min(220px, 100%);
  height: 112px;
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  background: var(--shell-workspace-background);
  display: grid;
  grid-template-rows: 24px minmax(0, 1fr);
}
.preview-workspace-surface__header {
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
}
.preview-workspace-surface__stage {
  background-image: radial-gradient(
    color-mix(in srgb, var(--color-text-primary) 7%, transparent) 0.7px,
    transparent 0.7px
  );
  background-size: 12px 12px;
}
`

export function WorkspaceSurfacePreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-workspace-surface" aria-label="Workspace surface illustration">
        <i className="preview-workspace-surface__header" aria-hidden="true" />
        <i className="preview-workspace-surface__stage" aria-hidden="true" />
      </div>
    </>
  )
}
