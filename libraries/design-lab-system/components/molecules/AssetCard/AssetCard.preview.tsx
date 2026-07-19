import { AssetsIcon, CodeIcon, VideoIcon } from '../../../assets/icons'

export function AssetCardPreview() {
  return <div className="preview-asset-cards" aria-hidden="true">
    <span><CodeIcon size={18}/><i>tsx</i></span>
    <span><AssetsIcon size={18}/><i>jpg</i></span>
    <span><VideoIcon size={18}/><i>mp4</i></span>
  </div>
}
