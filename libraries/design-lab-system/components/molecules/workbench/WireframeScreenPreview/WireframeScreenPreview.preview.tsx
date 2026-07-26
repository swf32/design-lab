const previewStyles = String.raw`
.wireframe-screen-preview-specimen {
  width: min(228px, 100%);
  aspect-ratio: 16 / 9;
  background: var(--color-canvas);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 0 1px var(--color-border-subtle);
}

.wireframe-screen-preview-specimen__viewport {
  position: absolute;
  inset: 10% 8%;
  overflow: hidden;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px var(--color-border-subtle);
}

.wireframe-screen-preview-specimen__screen {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(
        var(--color-text-disabled) 0 4px,
        transparent 4px 10px,
        var(--color-border-default) 10px 14px,
        transparent 14px
      )
      10% 16% / 46% 18px no-repeat,
    linear-gradient(var(--color-surface-secondary), var(--color-surface-secondary)) 10% 36% / 80%
      24% no-repeat,
    linear-gradient(var(--color-surface-secondary), var(--color-surface-secondary)) 10% 66% / 36%
      18% no-repeat,
    linear-gradient(var(--color-surface-secondary), var(--color-surface-secondary)) 54% 66% / 36%
      18% no-repeat,
    var(--color-surface-primary);
}
`

export function WireframeScreenPreviewPreview() {
  return (
    <div className="wireframe-screen-preview-specimen" aria-hidden="true">
      <style>{previewStyles}</style>
      <div className="wireframe-screen-preview-specimen__viewport">
        <div className="wireframe-screen-preview-specimen__screen" />
      </div>
    </div>
  )
}
