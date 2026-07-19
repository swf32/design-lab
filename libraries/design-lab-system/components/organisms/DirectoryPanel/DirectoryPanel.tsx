import { useEffect, useMemo, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { Input } from '../../atoms/Input/Input'
import { SemanticTreeItem, type SemanticTreeNode } from '../../atoms/SemanticTreeItem/SemanticTreeItem'
import { SourceSelect, type SourceOption } from '../../molecules/SourceSelect/SourceSelect'
import { useDesignLabI18n } from '../../../i18n'

export type DirectorySource = SourceOption
export type DirectoryTreeItem = SemanticTreeNode

export type DirectoryPanelProps = {
  isResizing: boolean
  navigationWidth: number
  minNavigationWidth: number
  maxNavigationWidth: number
  onResizeStart: (event: PointerEvent<HTMLDivElement>) => void
  onResizeKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  projects: DirectorySource[]
  activeProject: DirectorySource | null
  activeModuleLabel: string
  tree: DirectoryTreeItem[]
  treeLoading: boolean
  onProjectChange: (projectId: string) => void
  onCreateProject: () => void
  selectedEntityId?: string | null
  selectedFolderPath?: string | null
  onTreeItemSelect?: (item: DirectoryTreeItem) => void
  searchEnabled?: boolean
  searchPlaceholder?: string
  coloringEnabled?: boolean
  actionsEnabled?: boolean
  defaultCollapsed?: boolean
  persistItemColors?: boolean
  colorStorageKey?: string
  itemColors?: Record<string,string>
  onItemColorChange?: (item: DirectoryTreeItem, color: string | null) => void
  renderItemActions?: (item: DirectoryTreeItem) => ReactNode
}

function readStoredColors(key:string){
  if(typeof window==='undefined')return{} as Record<string,string>
  try{
    const parsed=JSON.parse(window.localStorage.getItem(key)??'{}')
    return parsed&&typeof parsed==='object'?parsed as Record<string,string>:{}
  }catch{return{}}
}

export function DirectoryPanel({
  isResizing,
  navigationWidth,
  minNavigationWidth,
  maxNavigationWidth,
  onResizeStart,
  onResizeKeyDown,
  projects,
  activeProject,
  activeModuleLabel,
  tree,
  treeLoading,
  onProjectChange,
  onCreateProject,
  selectedEntityId,
  selectedFolderPath,
  onTreeItemSelect,
  searchEnabled = true,
  searchPlaceholder,
  coloringEnabled = true,
  actionsEnabled = true,
  defaultCollapsed = true,
  persistItemColors = true,
  colorStorageKey = 'design-lab:directory-item-colors',
  itemColors,
  onItemColorChange,
  renderItemActions,
}: DirectoryPanelProps) {
  const {t}=useDesignLabI18n()
  const treeKey=tree.map((item)=>`${item.kind}:${item.path}`).join('|')
  const [expanded,setExpanded]=useState<Set<string>>(()=>defaultCollapsed?new Set():new Set(tree.filter((item)=>item.kind==='folder'&&!item.virtual).map((item)=>item.path)))
  const [query,setQuery]=useState('')
  const [storedColors,setStoredColors]=useState<Record<string,string>>(()=>persistItemColors?readStoredColors(colorStorageKey):{})
  useEffect(()=>setExpanded(defaultCollapsed?new Set():new Set(tree.filter((item)=>item.kind==='folder'&&!item.virtual).map((item)=>item.path))),[defaultCollapsed,treeKey,activeProject?.id])
  useEffect(()=>setStoredColors(persistItemColors?readStoredColors(colorStorageKey):{}),[colorStorageKey,persistItemColors])
  useEffect(()=>{if(persistItemColors&&typeof window!=='undefined')window.localStorage.setItem(colorStorageKey,JSON.stringify(storedColors))},[colorStorageKey,persistItemColors,storedColors])

  const normalizedQuery=query.trim().toLowerCase()
  const searchedTree=useMemo(()=>{
    if(!normalizedQuery)return tree
    const matches=tree.filter((item)=>`${item.name} ${item.path}`.toLowerCase().includes(normalizedQuery))
    return tree.filter((item)=>matches.includes(item)||(item.kind==='folder'&&matches.some((match)=>match.path.startsWith(`${item.path}/`))))
  },[normalizedQuery,tree])
  let hiddenBelowLevel: number | null = null
  const visibleTree = searchedTree.filter((item) => {
    if(normalizedQuery)return true
    if (hiddenBelowLevel !== null && item.level > hiddenBelowLevel) return false
    if (hiddenBelowLevel !== null && item.level <= hiddenBelowLevel) hiddenBelowLevel = null
    if (item.kind === 'folder' && !item.virtual && !expanded.has(item.path)) hiddenBelowLevel = item.level
    return true
  })
  const colorKey=(item:DirectoryTreeItem)=>`${activeProject?.id??'no-source'}:${item.kind}:${item.path}`
  const changeColor=(item:DirectoryTreeItem,color:string|null)=>{
    setStoredColors((current)=>{
      const next={...current}
      if(color)next[colorKey(item)]=color
      else delete next[colorKey(item)]
      return next
    })
    onItemColorChange?.(item,color)
  }
  return (
    <aside className={`directory-panel${isResizing ? ' directory-panel--resizing' : ''}`} aria-label={t('directory.label')}>
      <header className="directory-panel__header">
        <SourceSelect sources={projects} activeSource={activeProject} onChange={onProjectChange} onCreateProject={onCreateProject}/>
      </header>

      <div className="directory-panel__toolbar">
        <span>{activeModuleLabel.toUpperCase()}</span>
        <button type="button" aria-label={t('directory.add')}>+</button>
      </div>

      {searchEnabled&&<div className="directory-panel__search">
        <Input label={t('directory.search')} visuallyHideLabel variant="search" size="small" fullWidth placeholder={searchPlaceholder??t('directory.searchPlaceholder')} value={query} onChange={(event)=>setQuery(event.target.value)}/>
      </div>}

      <div className="file-tree" role="tree">
        {treeLoading && <p className="file-tree__status">{t('directory.loading')}</p>}
        {!treeLoading && activeProject && tree.length === 0 && <p className="file-tree__status">{t('directory.empty')}</p>}
        {!treeLoading && !activeProject && <p className="file-tree__status">{t('directory.noProject')}</p>}
        {!treeLoading&&activeProject&&tree.length>0&&normalizedQuery&&visibleTree.length===0&&<p className="file-tree__status">{t('directory.noResults')}</p>}
        {!treeLoading && visibleTree.map((item) => (
          <SemanticTreeItem
            key={`${item.kind}-${item.path}`}
            node={item}
            active={item.kind === 'folder' ? item.path === selectedFolderPath : item.id === selectedEntityId}
            expanded={expanded.has(item.path)}
            color={itemColors?.[item.path]??storedColors[colorKey(item)]??null}
            coloringEnabled={coloringEnabled}
            actionsEnabled={actionsEnabled}
            actions={renderItemActions?.(item)}
            onColorChange={(color)=>changeColor(item,color)}
            onSelect={() => {
              if (item.kind === 'folder' && !item.virtual) setExpanded((current) => {
                const next = new Set(current)
                if (next.has(item.path)) next.delete(item.path)
                else next.add(item.path)
                return next
              })
              onTreeItemSelect?.(item)
            }}
          />
        ))}
      </div>

      <footer className="directory-panel__footer">
        <span className="runtime-indicator" />
        <span>{t('directory.localFilesystem')}</span>
      </footer>
      <div
        className="directory-panel__resizer"
        role="separator"
        aria-label={t('directory.resize')}
        aria-orientation="vertical"
        aria-valuemin={minNavigationWidth}
        aria-valuemax={maxNavigationWidth}
        aria-valuenow={navigationWidth}
        tabIndex={0}
        onPointerDown={onResizeStart}
        onKeyDown={onResizeKeyDown}
      />
    </aside>
  )
}
