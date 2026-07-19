import { AssetsIcon, CodeIcon, VideoIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.preview-asset-cards {
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.preview-asset-cards span {
  position: relative;
  width: 48px;
  height: 62px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-small);
  background: var(--color-surface-secondary);
  color: var(--color-text-muted);
  display: grid;
  place-items: center;
}
.preview-asset-cards span::before {
  content: '';
  position: absolute;
  inset: 0 0 17px;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
}
.preview-asset-cards svg {
  position: relative;
  z-index: 1;
}
.preview-asset-cards i {
  position: absolute;
  right: 4px;
  bottom: 4px;
  color: var(--color-text-disabled);
  font-size: 6px;
  font-style: normal;
  text-transform: uppercase;
}
`

export function AssetCardPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-asset-cards" aria-hidden="true">
        <span>
          <CodeIcon size={18} />
          <i>tsx</i>
        </span>
        <span>
          <AssetsIcon size={18} />
          <i>jpg</i>
        </span>
        <span>
          <VideoIcon size={18} />
          <i>mp4</i>
        </span>
      </div>
    </>
  )
}
