const previewStyles = String.raw`
.preview-story-canvas {
  width: min(228px, 100%);
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-surface);
  background: var(--color-surface-secondary);
}
.preview-story-canvas header {
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.preview-story-canvas__title {
  display: grid;
  gap: 2px;
}
.preview-story-canvas__title b {
  width: 52px;
  height: 5px;
  border-radius: 2px;
  background: var(--color-text-primary);
}
.preview-story-canvas__title i {
  width: 78px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-text-muted);
}
.preview-story-canvas__modes {
  padding: 2px;
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  display: flex;
  gap: 2px;
}
.preview-story-canvas__modes i {
  width: 8px;
  height: 8px;
  border: 1px solid var(--color-border-default);
  border-radius: 50%;
  background: var(--color-canvas-grid-dark-a);
}
.preview-story-canvas__modes i:nth-child(2) {
  background: var(--color-canvas-grid-light-a);
}
.preview-story-canvas__modes i:nth-child(3) {
  background: var(--color-accent-secondary);
}
.preview-story-canvas main {
  position: relative;
  min-height: 72px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-canvas);
  background-image:
    linear-gradient(45deg, var(--color-surface-primary) 25%, transparent 25%),
    linear-gradient(-45deg, var(--color-surface-primary) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--color-surface-primary) 75%),
    linear-gradient(-45deg, transparent 75%, var(--color-surface-primary) 75%);
  background-size: 12px 12px;
  background-position:
    0 0,
    0 6px,
    6px -6px,
    -6px 0;
}
.preview-story-canvas main .preview-story-canvas__modes {
  position: absolute;
  top: 6px;
  right: 6px;
  background: var(--color-surface-secondary);
}
.preview-story-canvas main i {
  width: 36px;
  height: 14px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  background: var(--color-surface-secondary);
}
.preview-story-canvas footer {
  padding: 7px 9px;
  border-top: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
  display: grid;
  gap: 3px;
}
.preview-story-canvas footer i {
  width: 72%;
  height: 2px;
  border-radius: 2px;
  background: var(--color-code);
  opacity: 0.72;
}
.preview-story-canvas footer i:nth-child(2) {
  width: 54%;
}
.preview-story-canvas footer i:nth-child(3) {
  width: 63%;
}
`

export function StoryCanvasPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <article className="preview-story-canvas" aria-label="Story Canvas illustration">
        <header>
          <span className="preview-story-canvas__title">
            <b />
            <i />
          </span>
        </header>
        <main>
          <span className="preview-story-canvas__modes" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <i aria-hidden="true" />
        </main>
        <footer aria-hidden="true">
          <i />
          <i />
          <i />
        </footer>
      </article>
    </>
  )
}
