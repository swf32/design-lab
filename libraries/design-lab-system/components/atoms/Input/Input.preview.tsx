import { SearchIcon } from '../../../assets/icons/SearchIcon'

export function InputPreview() {
  return <div className="preview-input" data-preview-motion="state-transition" role="img" aria-label="Text, search, and textarea input family illustration">
    <div className="preview-input__column">
      <div className="preview-input__specimen preview-input__specimen--focused">
        <span>Component name</span>
        <div className="preview-input__control"><b>Input</b><i/></div>
      </div>
      <div className="preview-input__specimen preview-input__specimen--search">
        <span>Search</span>
        <div className="preview-input__control"><SearchIcon size={10}/><b>Find…</b></div>
      </div>
    </div>
    <div className="preview-input__specimen preview-input__specimen--textarea">
      <span>Description</span>
      <div className="preview-input__control"><b>Reusable text field</b><small>19 / 160</small></div>
    </div>
  </div>
}
