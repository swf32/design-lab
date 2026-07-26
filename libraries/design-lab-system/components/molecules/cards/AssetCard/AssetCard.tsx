import './AssetCard.scss'
import { useEffect, useState } from 'react'
import { AssetsIcon, CodeIcon, VideoIcon } from '../../../../assets/icons'
import { Chip, type ChipColor } from '../../../atoms/data-display/Chip/Chip'

export type AssetKind = 'icon' | 'image' | 'video' | 'other'

const codeExtensions = new Set(['js', 'jsx', 'ts', 'tsx'])
const rasterExtensions = new Set(['avif', 'gif', 'jpeg', 'jpg', 'png', 'webp'])
const videoExtensions = new Set(['m4v', 'mov', 'mp4', 'webm'])

function extensionColor(kind: AssetKind, extension?: string): ChipColor {
  const normalized = extension?.replace(/^\./, '').toLowerCase()
  if (normalized === 'svg') return 'cyan'
  if (normalized && codeExtensions.has(normalized)) return 'violet'
  if (normalized && rasterExtensions.has(normalized)) return 'teal'
  if (normalized && videoExtensions.has(normalized)) return 'orange'
  if (kind === 'icon') return 'violet'
  if (kind === 'image') return 'teal'
  if (kind === 'video') return 'orange'
  return 'default'
}

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
  const extensionLabel = extension || kind
  const tone = extensionColor(kind, extension)
  const [previewFailed, setPreviewFailed] = useState(false)
  useEffect(() => setPreviewFailed(false), [previewUrl])
  return (
    <button
      type="button"
      className={`dl-asset-card dl-asset-card--${kind} dl-asset-card--tone-${tone}${selected ? ' dl-asset-card--selected' : ''}`}
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
      <Chip className="dl-asset-card__extension" color={tone} size="small" variant="soft">
        {extensionLabel}
      </Chip>
    </button>
  )
}
