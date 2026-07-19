import './SemanticTreeItem.scss'
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  ArrowDownIcon,
  AssetsIcon,
  CodeIcon,
  ComponentIcon,
  DirectoryIcon,
  MoreIcon,
  TokensIcon,
  type IconProps,
} from '../../../../assets/icons'
import { useDesignLabI18n } from '../../../../i18n'
import { ColorPicker } from '../../../molecules/inputs/ColorPicker/ColorPicker'

export type SemanticTreeNode = {
  name: string
  path: string
  kind: 'folder' | 'file' | 'component' | 'token' | 'asset'
  level: number
  id?: string
  virtual?: boolean
}

export type SemanticTreeItemProps = {
  node: SemanticTreeNode
  active?: boolean
  expanded?: boolean
  color?: string | null
  coloringEnabled?: boolean
  actionsEnabled?: boolean
  actions?: ReactNode
  onSelect: () => void
  onColorChange?: (color: string | null) => void
  onActionClick?: () => void
}

function iconFor(kind: SemanticTreeNode['kind']): ComponentType<IconProps> {
  if (kind === 'folder') return DirectoryIcon
  if (kind === 'component') return ComponentIcon
  if (kind === 'token') return TokensIcon
  if (kind === 'asset') return AssetsIcon
  return CodeIcon
}

export function SemanticTreeItem({
  node,
  active = false,
  expanded = false,
  color = null,
  coloringEnabled = false,
  actionsEnabled = false,
  actions,
  onSelect,
  onColorChange,
  onActionClick,
}: SemanticTreeItemProps) {
  const { t } = useDesignLabI18n()
  const [actionsOpen, setActionsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const EntityIcon = iconFor(node.kind)
  const canExpand = node.kind === 'folder' && !node.virtual
  const canColor = coloringEnabled && !node.virtual
  const canAct = actionsEnabled && !node.virtual

  useEffect(() => {
    if (!actionsOpen) return
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setActionsOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActionsOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [actionsOpen])

  return (
    <div
      ref={rootRef}
      className={`file-tree__item${node.virtual ? ' file-tree__item--virtual' : ''}${active ? ' file-tree__item--active' : ''}${actionsOpen ? ' file-tree__item--actions-open' : ''}`}
      style={{ '--tree-level': node.level } as CSSProperties}
      role="treeitem"
      aria-label={node.name}
      aria-selected={active}
      aria-expanded={canExpand ? expanded : undefined}
    >
      {canExpand ? (
        <button
          className="file-tree__chevron-button"
          type="button"
          aria-label={t(expanded ? 'tree.collapse' : 'tree.expand')}
          onClick={onSelect}
        >
          <ArrowDownIcon
            className={
              expanded ? 'file-tree__chevron' : 'file-tree__chevron file-tree__chevron--collapsed'
            }
            size={12}
          />
        </button>
      ) : (
        <span className="file-tree__chevron-spacer" />
      )}
      {canColor ? (
        <ColorPicker
          className="file-tree__color-picker"
          label={`${t('tree.color')}: ${node.name}`}
          value={color}
          onChange={onColorChange}
          trigger={<EntityIcon size={16} />}
        />
      ) : (
        <span className="file-tree__entity-icon" style={{ color: color ?? undefined }}>
          <EntityIcon size={16} />
        </span>
      )}
      <button className="file-tree__label" type="button" onClick={onSelect}>
        <span>{node.name}</span>
      </button>
      {canAct && (
        <div className="file-tree__actions">
          <button
            className="file-tree__actions-trigger"
            type="button"
            aria-label={`${t('tree.actions')}: ${node.name}`}
            aria-expanded={actionsOpen}
            aria-haspopup="menu"
            onClick={() => {
              setActionsOpen((current) => !current)
              onActionClick?.()
            }}
          >
            <MoreIcon size={16} />
          </button>
          {actionsOpen && (
            <div className="file-tree__actions-menu" role="menu">
              {actions ?? (
                <span role="menuitem" aria-disabled="true">
                  {t('tree.actionsSoon')}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
