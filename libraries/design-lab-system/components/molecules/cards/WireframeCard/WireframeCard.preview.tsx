const previewStyles = String.raw`
.wireframe-card-preview {
  width: min(220px, 100%);
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-medium);
  background:
    linear-gradient(
      to top,
      var(--color-surface-secondary) 0%,
      color-mix(in srgb, var(--color-surface-secondary) 82%, transparent) 24%,
      transparent 52%
    ),
    linear-gradient(
        90deg,
        var(--color-surface-primary) 0 30%,
        transparent 30% 34%,
        var(--color-accent-primary) 34% 66%,
        transparent 66% 70%,
        var(--color-surface-primary) 70% 100%
      )
      12px 54% / calc(100% - 24px) 38px no-repeat,
    linear-gradient(
        var(--color-text-disabled) 0 5px,
        transparent 5px 12px,
        var(--color-border-default) 12px 16px,
        transparent 16px
      )
      12px 18px / 58% 34px no-repeat,
    var(--color-canvas);
  box-shadow: inset 0 0 0 1px var(--color-border-subtle);
  overflow: hidden;
  position: relative;
}
.wireframe-card-preview::after {
  color: var(--color-text-primary);
  content: 'Pricing';
  font-size: 10px;
  font-weight: var(--typography-heading-weight);
  position: absolute;
  inset: auto auto 10px 12px;
}
`

export function WireframeCardPreview() {
  return (
    <div className="wireframe-card-preview" aria-hidden="true">
      <style>{previewStyles}</style>
    </div>
  )
}
