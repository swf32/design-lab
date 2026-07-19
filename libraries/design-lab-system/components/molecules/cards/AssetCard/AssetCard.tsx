import './AssetCard.scss'
import { useEffect, useState } from 'react'
import { AssetsIcon, CodeIcon, VideoIcon } from '../../../../assets/icons'

export type AssetKind = 'icon' | 'image' | 'video' | 'other'

export type AssetCardProps = {
  name: string
  path: string
  kind: AssetKind
  extension?: string
  previewUrl?: string | null
  selected?: boolean
  onClick?: () => void
}

export function AssetCard({
  name,
  path,
  kind,
  extension,
  previewUrl,
  selected = false,
  onClick,
}: AssetCardProps) {
  const TypeIcon = kind === 'video' ? VideoIcon : kind === 'icon' ? CodeIcon : AssetsIcon
  const [previewFailed, setPreviewFailed] = useState(false)
  useEffect(() => setPreviewFailed(false), [previewUrl])
  return (
    <button
      type="button"
      className={`dl-asset-card dl-asset-card--${kind}${selected ? ' dl-asset-card--selected' : ''}`}
      aria-current={selected ? 'page' : undefined}
      onClick={onClick}
    >
      <div className="dl-asset-card__preview">
        {previewUrl && !previewFailed ? (
          <img src={previewUrl} alt="" loading="lazy" onError={() => setPreviewFailed(true)} />
        ) : (
          <TypeIcon size={32} />
        )}
        <span>{kind}</span>
      </div>
      <div className="dl-asset-card__identity">
        <strong title={name}>{name}</strong>
        <code title={path}>{path}</code>
      </div>
      <small>{extension || kind}</small>
    </button>
  )
}
