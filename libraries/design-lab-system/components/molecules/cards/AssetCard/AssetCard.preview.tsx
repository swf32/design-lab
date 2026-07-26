import { AssetsIcon, CodeIcon, VideoIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.preview-asset-cards {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.preview-asset-cards span {
  position: relative;
  box-sizing: border-box;
  width: 48px;
  height: 62px;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  border-radius: var(--corner-control);
  background: var(--color-surface-secondary);
  display: grid;
  grid-template-rows: minmax(0, 1fr) 17px;
  transition:
    border-color var(--transition-preview) var(--easing-preview),
    background var(--transition-preview) var(--easing-preview);
}
.preview-asset-cards b {
  min-height: 0;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
  display: grid;
  place-items: center;
  font-weight: inherit;
  transition: background var(--transition-preview) var(--easing-preview);
}
.preview-asset-cards svg {
  display: block;
  transition: transform var(--transition-preview) var(--easing-preview);
}
.preview-asset-cards i {
  --preview-chip-color: var(--color-text-secondary);
  align-self: center;
  justify-self: end;
  margin-right: 3px;
  padding: 1px 3px;
  border: 1px solid color-mix(in srgb, var(--preview-chip-color) 12%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--preview-chip-color) 14%, var(--color-surface-primary));
  color: var(--preview-chip-color);
  font-size: 5px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.preview-asset-cards .is-code {
  color: var(--color-category-violet);
}
.preview-asset-cards .is-code i {
  --preview-chip-color: var(--color-category-violet);
}
.preview-asset-cards .is-image {
  color: var(--color-category-teal);
}
.preview-asset-cards .is-image i {
  --preview-chip-color: var(--color-category-teal);
}
.preview-asset-cards .is-video {
  color: var(--color-category-orange);
}
.preview-asset-cards .is-video i {
  --preview-chip-color: var(--color-category-orange);
}
@media (prefers-reduced-motion: no-preference) {
  .dl-component-card--preview-animated:is(:hover, :focus-visible) .preview-asset-cards .is-image {
    border-color: var(--color-border-strong);
    background: var(--color-surface-hover);
  }
  .dl-component-card--preview-animated:is(:hover, :focus-visible) .preview-asset-cards .is-image b {
    background: var(--color-surface-hover);
  }
  .dl-component-card--preview-animated:is(:hover, :focus-visible)
    .preview-asset-cards
    .is-image
    svg {
    transform: scale(1.06);
  }
}
`

export function AssetCardPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-asset-cards"
        data-preview-motion="state-transition"
        aria-hidden="true"
      >
        <span className="is-code">
          <b>
            <CodeIcon size={18} />
          </b>
          <i>tsx</i>
        </span>
        <span className="is-image">
          <b>
            <AssetsIcon size={18} />
          </b>
          <i>jpg</i>
        </span>
        <span className="is-video">
          <b>
            <VideoIcon size={18} />
          </b>
          <i>mp4</i>
        </span>
      </div>
    </>
  )
}
