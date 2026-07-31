const previewStyles = String.raw`
.preview-application-frame {
  width: min(220px, 100%);
  height: 112px;
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  background: var(--shell-application-background);
  display: grid;
  grid-template-columns: 38% minmax(0, 1fr);
}
.preview-application-frame__navigation {
  border-right: 1px solid var(--color-border-subtle);
  background: var(--shell-navigation-surface);
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
}
.preview-application-frame__rail {
  border-right: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
}
.preview-application-frame__workspace {
  background: var(--shell-workspace-background);
  display: grid;
  grid-template-rows: 22px minmax(0, 1fr);
}
.preview-application-frame__workspace::before {
  content: '';
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
}
`

export function ApplicationFramePreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-application-frame" aria-label="Application frame illustration">
        <div className="preview-application-frame__navigation">
          <i className="preview-application-frame__rail" aria-hidden="true" />
        </div>
        <div className="preview-application-frame__workspace" aria-hidden="true" />
      </div>
    </>
  )
}
