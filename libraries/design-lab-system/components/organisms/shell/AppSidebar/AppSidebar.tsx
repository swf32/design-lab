import './AppSidebar.scss'
import type { ComponentType } from 'react'
import {
  AssetsIcon,
  ComponentsIcon,
  FontsIcon,
  HomeIcon,
  PagesIcon,
  PaletteIcon,
  SettingsIcon,
  TokensIcon,
  WireframesIcon,
  type IconProps,
} from '../../../../assets/icons'
import { SidebarTab } from '../../../atoms/navigation/SidebarTab/SidebarTab'
import { useDesignLabI18n, type MessageKey } from '../../../../i18n'

export type ModuleId =
  'home' | 'components' | 'wireframes' | 'pages' | 'assets' | 'palette' | 'tokens' | 'fonts'

type Module = { id: ModuleId; label: MessageKey; icon: ComponentType<IconProps> }
const modules: Module[] = [
  { id: 'home', label: 'module.home', icon: HomeIcon },
  { id: 'components', label: 'module.components', icon: ComponentsIcon },
  { id: 'wireframes', label: 'module.wireframes', icon: WireframesIcon },
  { id: 'pages', label: 'module.pages', icon: PagesIcon },
  { id: 'assets', label: 'module.assets', icon: AssetsIcon },
  { id: 'palette', label: 'module.palette', icon: PaletteIcon },
  { id: 'tokens', label: 'module.tokens', icon: TokensIcon },
  { id: 'fonts', label: 'module.fonts', icon: FontsIcon },
]

export type AppSidebarProps = {
  active: ModuleId
  expanded?: boolean
  settingsActive?: boolean
  onChange: (id: ModuleId) => void
  onSettings?: () => void
  onExpandedChange?: (expanded: boolean) => void
}

export function AppSidebar({
  active,
  expanded = false,
  settingsActive = false,
  onChange,
  onSettings,
  onExpandedChange,
}: AppSidebarProps) {
  const { t } = useDesignLabI18n()
  return (
    <aside
      className={`app-sidebar${expanded ? ' app-sidebar--expanded' : ''}`}
      aria-label={t('nav.modules')}
      onPointerEnter={() => onExpandedChange?.(true)}
      onPointerLeave={() => onExpandedChange?.(false)}
    >
      <div className="app-sidebar__logo" aria-label="Design Lab">
        d
      </div>
      <nav className="app-sidebar__tabs">
        {modules.map((module) => (
          <SidebarTab
            key={module.id}
            {...module}
            label={t(module.label)}
            active={active === module.id}
            expanded={expanded}
            onClick={() => onChange(module.id)}
          />
        ))}
      </nav>
      <footer className="app-sidebar__footer">
        <SidebarTab
          icon={SettingsIcon}
          label={t('nav.settings')}
          active={settingsActive}
          expanded={expanded}
          onClick={onSettings}
        />
      </footer>
    </aside>
  )
}
