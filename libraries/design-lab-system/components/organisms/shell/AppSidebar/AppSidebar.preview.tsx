import { ComponentsIcon, PagesIcon, PaletteIcon, SettingsIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.preview-app-sidebar {
  width: 78px;
  height: 118px;
  padding: 6px 5px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-medium);
  background: var(--color-surface-primary);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 5px;
}
.preview-app-sidebar header {
  width: 20px;
  height: 20px;
  margin: 0 auto 1px;
  border: 1px solid var(--color-border-default);
  border-radius: 50%;
  color: var(--color-text-primary);
  display: grid;
  place-items: center;
  font-size: 8px;
  font-weight: 700;
  font-style: italic;
}
.preview-app-sidebar nav {
  min-height: 0;
  display: grid;
  gap: 3px;
}
.preview-app-sidebar nav span {
  min-width: 0;
  height: 22px;
  padding: 2px 4px;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--color-text-muted);
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  align-items: center;
  gap: 3px;
}
.preview-app-sidebar nav span.is-active {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
  box-shadow: inset 0 0 0 1px var(--color-border-subtle);
}
.preview-app-sidebar nav i {
  width: auto;
  height: auto;
  background: transparent;
  font-size: 8px;
  font-style: normal;
}
.preview-app-sidebar nav small {
  overflow: hidden;
  font-size: 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-app-sidebar footer {
  height: 14px;
  margin-top: auto;
  border-top: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted);
  display: grid;
  place-items: end center;
}
`

export function AppSidebarPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-app-sidebar" aria-label="Application Sidebar illustration">
        <header>d</header>
        <nav>
          <span className="is-active">
            <ComponentsIcon size={10} />
            <small>Components</small>
          </span>
          <span>
            <PagesIcon size={10} />
            <small>Pages</small>
          </span>
          <span>
            <PaletteIcon size={10} />
            <small>Palette</small>
          </span>
        </nav>
        <footer>
          <SettingsIcon size={10} />
        </footer>
      </div>
    </>
  )
}
