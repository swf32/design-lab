const previewStyles = String.raw`
.preview-component-card {
  position: relative;
  width: 150px;
  height: 90px;
  overflow: hidden;
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}
.preview-component-card i {
  position: absolute;
  inset: 13px 22px 28px;
  border-radius: var(--radius-small);
  background: var(--color-surface-hover);
}
.preview-component-card span {
  position: absolute;
  inset: auto 0 0;
  min-width: 0;
  height: 48px;
  padding: 23px 14px 9px;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(
    to top,
    var(--color-surface-raised) 0%,
    color-mix(in srgb, var(--color-surface-raised) 88%, transparent) 56%,
    transparent 100%
  );
  color: var(--color-text-primary);
  font-size: 8px;
  line-height: 1;
  font-weight: var(--typography-heading-weight);
  text-overflow: ellipsis;
  white-space: nowrap;
}
`
export function ComponentCardPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-component-card" aria-label="Component Card illustration">
        <i />
        <span>Button</span>
      </div>
    </>
  )
}
