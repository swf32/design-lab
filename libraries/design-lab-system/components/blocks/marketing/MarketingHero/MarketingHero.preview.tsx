const previewStyles = String.raw`
.preview-marketing-hero {
  width: 150px;
  height: 108px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.9fr);
  gap: 8px;
  align-items: center;
}

.preview-marketing-hero__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-marketing-hero__chip {
  width: 28px;
  height: 8px;
  border-radius: var(--radius-medium);
  background: color-mix(in srgb, var(--color-accent-secondary) 18%, transparent);
}

.preview-marketing-hero__title {
  display: grid;
  gap: 3px;
}

.preview-marketing-hero__title i {
  display: block;
  height: 5px;
  border-radius: 999px;
  background: var(--color-text-primary);
}

.preview-marketing-hero__title i:nth-child(1) {
  width: 100%;
}

.preview-marketing-hero__title i:nth-child(2) {
  width: 72%;
}

.preview-marketing-hero__desc {
  display: grid;
  gap: 2px;
}

.preview-marketing-hero__desc i {
  display: block;
  height: 3px;
  border-radius: 999px;
  background: var(--color-text-muted);
  opacity: 0.55;
}

.preview-marketing-hero__desc i:nth-child(1) {
  width: 92%;
}

.preview-marketing-hero__desc i:nth-child(2) {
  width: 68%;
}

.preview-marketing-hero__actions {
  display: flex;
  gap: 3px;
  margin-top: 1px;
}

.preview-marketing-hero__btn {
  height: 10px;
  border-radius: var(--radius-small);
}

.preview-marketing-hero__btn--primary {
  width: 26px;
  background: var(--color-accent-primary);
}

.preview-marketing-hero__btn--secondary {
  width: 20px;
  border: 1px solid var(--color-border-default);
  background: transparent;
}

.preview-marketing-hero__media {
  min-width: 0;
  height: 100%;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-accent-primary) 16%, transparent),
    color-mix(in srgb, var(--color-accent-secondary) 16%, transparent)
  );
  box-shadow: 0 8px 18px color-mix(in srgb, var(--color-accent-primary) 10%, transparent);
}
`

export function MarketingHeroPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-marketing-hero"
        role="img"
        aria-label="Marketing hero two-column section"
      >
        <div className="preview-marketing-hero__copy">
          <span className="preview-marketing-hero__chip" aria-hidden="true" />
          <span className="preview-marketing-hero__title" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="preview-marketing-hero__desc" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="preview-marketing-hero__actions" aria-hidden="true">
            <span className="preview-marketing-hero__btn preview-marketing-hero__btn--primary" />
            <span className="preview-marketing-hero__btn preview-marketing-hero__btn--secondary" />
          </span>
        </div>
        <div className="preview-marketing-hero__media" aria-hidden="true" />
      </div>
    </>
  )
}
