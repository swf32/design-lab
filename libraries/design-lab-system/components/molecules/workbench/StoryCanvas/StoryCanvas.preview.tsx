const previewStyles = String.raw`
.preview-story-canvas {
  width: 160px;
  height: 92px;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-canvas);
}
.preview-story-canvas header {
  height: 28px;
  padding: 7px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-secondary);
  display: grid;
  gap: 4px;
}
.preview-story-canvas header b {
  width: 38px;
  height: 4px;
  background: var(--color-text-secondary);
}
.preview-story-canvas header span {
  width: 72px;
  height: 3px;
  background: var(--color-text-disabled);
}
.preview-story-canvas main {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.preview-story-canvas main i {
  width: 30px;
  height: 14px;
  border-radius: 3px;
  background: var(--color-accent-primary);
}
.preview-story-canvas main i:nth-child(2) {
  background: transparent;
  border: 1px solid var(--color-border-default);
}
.preview-story-canvas main i:nth-child(3) {
  background: var(--color-status-danger);
}
`
export function StoryCanvasPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-story-canvas" aria-label="Story Canvas illustration">
        <header>
          <b />
          <span />
        </header>
        <main>
          <i />
          <i />
          <i />
        </main>
      </div>
    </>
  )
}
