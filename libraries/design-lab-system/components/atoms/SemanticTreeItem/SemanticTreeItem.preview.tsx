import { ComponentIcon, MoreIcon } from '../../../assets/icons'

export function SemanticTreeItemPreview() {
  return <div className="preview-tree-item" aria-label="Semantic Tree Item illustration"><span>⌄</span><i><ComponentIcon size={14}/></i><b>Button</b><em><MoreIcon size={12}/></em></div>
}
