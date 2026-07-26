const previewStyles = String.raw`
.preview-wireframe-card {
  position: relative;
  box-sizing: border-box;
  width: min(150px, 100%);
  height: 90px;
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-card);
  background: var(--color-canvas);
}
.preview-wireframe-card__screen {
  position: absolute;
  inset: 8px 10px 30px;
  border-radius: var(--corner-control);
  background:
    linear-gradient(
        90deg,
        var(--color-surface-primary) 0 28%,
        transparent 28% 36%,
        var(--color-accent-primary) 36% 64%,
        transparent 64% 72%,
        var(--color-surface-primary) 72% 100%
      )
      6px 58% / calc(100% - 12px) 18px no-repeat,
    linear-gradient(
        var(--color-text-disabled) 0 4px,
        transparent 4px 10px,
        var(--color-border-default) 10px 13px,
        transparent 13px
      )
      6px 8px / 52% 22px no-repeat,
    var(--color-surface-secondary);
  box-shadow: inset 0 0 0 1px var(--color-border-subtle);
}
.preview-wireframe-card__footer {
  position: absolute;
  inset: auto 0 0;
  min-height: 30px;
  padding: 12px 10px 8px;
  box-sizing: border-box;
  background: linear-gradient(
    to top,
    var(--color-surface-raised) 0%,
    color-mix(in srgb, var(--color-surface-raised) 88%, transparent) 56%,
    transparent 100%
  );
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.preview-wireframe-card__footer strong {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: 9px;
  font-weight: var(--typography-heading-weight);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-wireframe-card__footer small {
  flex: 0 0 auto;
  min-height: 14px;
  padding: 0 5px;
  border: 1px solid color-mix(in srgb, var(--color-status-warning) 12%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-status-warning) 14%, var(--color-surface-raised));
  color: var(--color-status-warning);
  display: inline-grid;
  place-items: center;
  font-size: 6px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
`

export function WireframeCardPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-wireframe-card" aria-hidden="true">
        <div className="preview-wireframe-card__screen" />
        <span className="preview-wireframe-card__footer">
          <strong>Pricing</strong>
          <small>Draft</small>
        </span>
      </div>
    </>
  )
}
