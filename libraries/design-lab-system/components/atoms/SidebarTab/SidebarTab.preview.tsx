import { ComponentsIcon } from '../../../assets/icons/ComponentsIcon'

export function SidebarTabPreview() {
  return <div className="preview-sidebar-tab" role="img" aria-label="Collapsed and expanded Sidebar Tab">
    <span className="preview-sidebar-tab__item is-active">
      <ComponentsIcon size={20}/>
    </span>
    <span className="preview-sidebar-tab__item preview-sidebar-tab__item--expanded is-active">
      <ComponentsIcon size={20}/>
      <small>Components</small>
    </span>
  </div>
}
