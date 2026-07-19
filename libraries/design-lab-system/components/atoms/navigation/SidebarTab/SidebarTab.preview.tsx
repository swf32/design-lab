import { ComponentsIcon } from '../../../../assets/icons/ComponentsIcon'

const previewStyles = String.raw`
.preview-sidebar-tabs {
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.preview-sidebar-tabs span {
  width: 33px;
  height: 50px;
  border-radius: var(--radius-medium);
  background: var(--color-surface-hover);
}
.preview-sidebar-tabs span:first-child {
  border: 1px solid var(--color-border-strong);
  background: transparent;
  display: grid;
  place-items: center;
}

.preview-sidebar-tab {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-primary);
  font-family: var(--typography-interface-family);
}
.preview-sidebar-tab__item {
  width: 48px;
  height: 52px;
  box-sizing: border-box;
  padding: 4px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: var(--radius-medium);
  background: var(--color-surface-primary);
  opacity: 0.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}
.preview-sidebar-tab__item.is-active {
  border-color: var(--color-border-strong);
  opacity: 1;
  box-shadow: inset 0 0 0 1px var(--color-border-subtle);
}
.preview-sidebar-tab__item--expanded {
  width: 72px;
}
.preview-sidebar-tab__item svg {
  flex: 0 0 20px;
}
.preview-sidebar-tab__item small {
  max-width: 100%;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 8px;
  line-height: 12px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`

export function SidebarTabPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div
        className="preview-sidebar-tab"
        role="img"
        aria-label="Collapsed and expanded Sidebar Tab"
      >
        <span className="preview-sidebar-tab__item is-active">
          <ComponentsIcon size={20} />
        </span>
        <span className="preview-sidebar-tab__item preview-sidebar-tab__item--expanded is-active">
          <ComponentsIcon size={20} />
          <small>Components</small>
        </span>
      </div>
    </>
  )
}
