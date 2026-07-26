const previewStyles = String.raw`
.preview-canvas-control {
  width: 90px;
  max-width: 34px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 3px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  background: var(--color-surface-secondary);
  display: flex;
  gap: 0;
  transition:
    max-width var(--transition-preview) var(--easing-preview),
    gap var(--transition-preview) var(--easing-preview);
}
.preview-canvas-control i {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  box-sizing: border-box;
  padding: 2px;
  border: 0;
  border-radius: 4px;
  display: block;
  transition:
    width var(--transition-preview) var(--easing-preview),
    flex-basis var(--transition-preview) var(--easing-preview),
    padding var(--transition-preview) var(--easing-preview),
    opacity var(--transition-preview),
    transform var(--transition-preview) var(--easing-preview),
    background var(--transition-preview) var(--easing-preview),
    box-shadow var(--transition-preview) var(--easing-preview);
}
.preview-canvas-control i::before {
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  border: 1px solid var(--color-border-default);
  border-radius: 50%;
}
.preview-canvas-control .is-dark::before {
  background-color: var(--color-canvas-grid-dark-a);
  background-image:
    linear-gradient(45deg, var(--color-canvas-grid-dark-b) 25%, transparent 25%),
    linear-gradient(-45deg, var(--color-canvas-grid-dark-b) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--color-canvas-grid-dark-b) 75%),
    linear-gradient(-45deg, transparent 75%, var(--color-canvas-grid-dark-b) 75%);
  background-size: 6px 6px;
  background-position:
    0 0,
    0 3px,
    3px -3px,
    -3px 0;
}
.preview-canvas-control .is-light::before {
  background-color: var(--color-canvas-grid-light-a);
  background-image:
    linear-gradient(45deg, var(--color-canvas-grid-light-b) 25%, transparent 25%),
    linear-gradient(-45deg, var(--color-canvas-grid-light-b) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--color-canvas-grid-light-b) 75%),
    linear-gradient(-45deg, transparent 75%, var(--color-canvas-grid-light-b) 75%);
  background-size: 6px 6px;
  background-position:
    0 0,
    0 3px,
    3px -3px,
    -3px 0;
}
.preview-canvas-control .is-solid::before {
  background: var(--color-accent-secondary);
}
.preview-canvas-control .is-dark {
  background: var(--color-surface-hover);
}
.preview-canvas-control .is-light,
.preview-canvas-control .is-solid {
  width: 0;
  flex-basis: 0;
  padding-inline: 0;
  opacity: 0;
  transform: scale(0.72);
}
@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible) .preview-canvas-control {
    max-width: 90px;
    gap: 2px;
  }
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-canvas-control
    :is(.is-light, .is-solid) {
    width: 26px;
    flex-basis: 26px;
    padding-inline: 2px;
    opacity: 1;
    transform: none;
  }
}
`

export function CanvasBackgroundControlPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-canvas-control"
        data-preview-motion="reveal"
        role="img"
        aria-label="Collapsed canvas background selector revealing all modes"
      >
        <i className="is-dark" />
        <i className="is-light" />
        <i className="is-solid" />
      </div>
    </>
  )
}
