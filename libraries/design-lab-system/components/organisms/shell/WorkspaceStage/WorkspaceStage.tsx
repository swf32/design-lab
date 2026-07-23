import './WorkspaceStage.scss'
import type { ComponentProps } from 'react'

export type WorkspaceStageProps = ComponentProps<'div'>

export function WorkspaceStage({ className, ...props }: WorkspaceStageProps) {
  return <div className={`dl-workspace-stage${className ? ` ${className}` : ''}`} {...props} />
}
