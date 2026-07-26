const previewStyles = String.raw`
.preview-component-card {
  position: relative;
  box-sizing: border-box;
  width: min(150px, 100%);
  height: 90px;
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--corner-card);
  background: var(--color-surface-raised);
}
.preview-component-card__specimen {
  position: absolute;
  inset: 22px 42px 40px;
  border-radius: var(--corner-control);
  background: var(--color-accent-primary);
  color: var(--color-canvas);
  display: grid;
  place-items: center;
  font-size: 8px;
  font-weight: 600;
  font-style: normal;
  line-height: 1;
}
.preview-component-card__footer {
  position: absolute;
  inset: auto 0 0;
  min-height: 34px;
  padding: 14px 10px 8px;
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
.preview-component-card__footer strong {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: 9px;
  font-weight: var(--typography-heading-weight);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-component-card__status {
  flex: 0 0 auto;
  min-height: 14px;
  padding: 0 5px;
  border: 1px solid color-mix(in srgb, var(--color-accent-primary) 12%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent-primary) 14%, var(--color-surface-raised));
  color: var(--color-accent-primary);
  display: inline-grid;
  place-items: center;
  font-size: 6px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition:
    border-color var(--transition-preview) var(--easing-preview),
    background var(--transition-preview) var(--easing-preview),
    color var(--transition-preview) var(--easing-preview);
}
.preview-component-card__status::before {
  content: 'In Progress';
}
@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible) .preview-component-card__status {
    border-color: color-mix(in srgb, var(--color-status-success) 12%, transparent);
    background: color-mix(in srgb, var(--color-status-success) 14%, var(--color-surface-raised));
    color: var(--color-status-success);
  }
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-component-card__status::before {
    content: 'Ready';
  }
}
`

export function ComponentCardPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-component-card"
        data-preview-motion="state-transition"
        aria-hidden="true"
      >
        <i className="preview-component-card__specimen">Save</i>
        <span className="preview-component-card__footer">
          <strong>Button</strong>
          <small className="preview-component-card__status" />
        </span>
      </div>
    </>
  )
}
