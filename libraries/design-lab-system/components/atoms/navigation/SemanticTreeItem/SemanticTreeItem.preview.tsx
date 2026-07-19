import { ComponentIcon, MoreIcon } from '../../../../assets/icons'

const previewStyles = String.raw`
.preview-tree-item {
  width: min(240px, 100%);
  height: 30px;
  padding: 0 7px;
  box-sizing: border-box;
  border-radius: var(--radius-small);
  background: var(--color-surface-hover);
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-text-muted);
  font-size: 10px;
}
.preview-tree-item span {
  width: 12px;
  color: var(--color-text-disabled);
}
.preview-tree-item i {
  width: 18px;
  height: 22px;
  border-radius: 4px;
  color: var(--color-accent-secondary);
  display: grid;
  place-items: center;
  font-style: normal;
}
.preview-tree-item b {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-tree-item em {
  width: 18px;
  height: 22px;
  color: var(--color-text-muted);
  display: grid;
  place-items: center;
  font-style: normal;
}
`

export function SemanticTreeItemPreview() {
  return (
    <>
      <style>{previewStyles}</style>
      <div className="preview-tree-item" aria-label="Semantic Tree Item illustration">
        <span>⌄</span>
        <i>
          <ComponentIcon size={14} />
        </i>
        <b>Button</b>
        <em>
          <MoreIcon size={12} />
        </em>
      </div>
    </>
  )
}
