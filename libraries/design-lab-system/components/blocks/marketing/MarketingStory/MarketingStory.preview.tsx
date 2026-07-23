const previewStyles = String.raw`
.preview-marketing-story {
  width: 150px;
  height: 108px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 8px;
  align-items: center;
}

.preview-marketing-story__media {
  min-width: 0;
  height: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-small);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-accent-secondary) 14%, transparent),
    color-mix(in srgb, var(--color-accent-primary) 12%, transparent)
  );
}

.preview-marketing-story__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-marketing-story__eyebrow {
  width: 32px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-text-disabled);
  opacity: 0.65;
}

.preview-marketing-story__title {
  display: grid;
  gap: 3px;
}

.preview-marketing-story__title i {
  display: block;
  height: 5px;
  border-radius: 999px;
  background: var(--color-text-primary);
}

.preview-marketing-story__title i:nth-child(1) {
  width: 100%;
}

.preview-marketing-story__title i:nth-child(2) {
  width: 78%;
}

.preview-marketing-story__desc {
  display: grid;
  gap: 2px;
}

.preview-marketing-story__desc i {
  display: block;
  height: 3px;
  border-radius: 999px;
  background: var(--color-text-muted);
  opacity: 0.55;
}

.preview-marketing-story__desc i:nth-child(1) {
  width: 96%;
}

.preview-marketing-story__desc i:nth-child(2) {
  width: 70%;
}

.preview-marketing-story__btn {
  width: 34px;
  height: 10px;
  margin-top: 1px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: transparent;
}
`

export function MarketingStoryPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-marketing-story"
        role="img"
        aria-label="Marketing story section with media and copy"
      >
        <div className="preview-marketing-story__media" aria-hidden="true" />
        <div className="preview-marketing-story__copy">
          <span className="preview-marketing-story__eyebrow" aria-hidden="true" />
          <span className="preview-marketing-story__title" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="preview-marketing-story__desc" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="preview-marketing-story__btn" aria-hidden="true" />
        </div>
      </div>
    </>
  )
}
