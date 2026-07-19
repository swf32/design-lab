import { ComponentsIcon, PagesIcon, PaletteIcon, SettingsIcon } from '../../../assets/icons'

export function AppSidebarPreview() {
  return <div className="preview-app-sidebar" aria-label="Application Sidebar illustration">
    <header>d</header>
    <nav>
      <span className="is-active"><ComponentsIcon size={10}/><small>Components</small></span>
      <span><PagesIcon size={10}/><small>Pages</small></span>
      <span><PaletteIcon size={10}/><small>Palette</small></span>
    </nav>
    <footer><SettingsIcon size={10}/></footer>
  </div>
}
