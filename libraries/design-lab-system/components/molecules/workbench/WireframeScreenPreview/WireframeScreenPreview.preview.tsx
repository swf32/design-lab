const previewStyles = String.raw`
.wireframe-screen-preview-specimen {
  width: min(210px, 100%);
  aspect-ratio: 16 / 9;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-primary);
  overflow: hidden;
  display: grid;
  grid-template-rows: 18px 1fr;
}
.wireframe-screen-preview-specimen::before {
  border-bottom: 1px solid var(--color-border-subtle);
  background:
    linear-gradient(90deg, var(--color-text-disabled) 28px, transparent 28px) var(--spacing-2) 50% /
      auto 3px no-repeat,
    var(--color-surface-secondary);
  content: '';
}
.wireframe-screen-preview-specimen::after {
  margin: 12px;
  border-radius: 4px;
  background:
    linear-gradient(
        90deg,
        var(--color-surface-raised) 0 30%,
        transparent 30% 34%,
        var(--color-accent-primary) 34% 66%,
        transparent 66% 70%,
        var(--color-surface-raised) 70% 100%
      )
      0 68% / 100% 34px no-repeat,
    linear-gradient(
      var(--color-text-disabled) 18%,
      transparent 18% 34%,
      var(--color-border-default) 34% 40%,
      transparent 40%
    );
  content: '';
}
`

export function WireframeScreenPreviewPreview() {
  return (
    <div className="wireframe-screen-preview-specimen" aria-hidden="true">
      <style>{previewStyles}</style>
    </div>
  )
}
