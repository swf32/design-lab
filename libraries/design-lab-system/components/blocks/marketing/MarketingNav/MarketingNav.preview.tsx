import { StarIcon } from '@design-lab/system/icons'

const previewStyles = String.raw`
.preview-marketing-nav {
  width: 150px;
  height: 34px;
  box-sizing: border-box;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
}

.preview-marketing-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-primary);
}

.preview-marketing-nav__brand svg {
  width: 10px;
  height: 10px;
  color: var(--color-accent-primary);
}

.preview-marketing-nav__brand i {
  width: 28px;
  height: 5px;
  border-radius: 999px;
  background: var(--color-text-primary);
  opacity: 0.82;
}

.preview-marketing-nav__meta {
  justify-self: center;
  width: 36px;
  height: 3px;
  border-radius: 999px;
  background: var(--color-text-muted);
  opacity: 0.55;
}

.preview-marketing-nav__actions {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.preview-marketing-nav__pill {
  width: 18px;
  height: 12px;
  border-radius: var(--radius-small);
  background: color-mix(in srgb, var(--color-status-success) 16%, transparent);
}

.preview-marketing-nav__btn {
  width: 22px;
  height: 12px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: transparent;
}
`

export function MarketingNavPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-marketing-nav" role="img" aria-label="Marketing navigation bar">
        <span className="preview-marketing-nav__brand">
          <StarIcon aria-hidden="true" />
          <i aria-hidden="true" />
        </span>
        <span className="preview-marketing-nav__meta" aria-hidden="true" />
        <span className="preview-marketing-nav__actions" aria-hidden="true">
          <span className="preview-marketing-nav__pill" />
          <span className="preview-marketing-nav__btn" />
        </span>
      </div>
    </>
  )
}
