import './WorkspaceSurface.scss'
import type { ComponentProps, ReactNode } from 'react'
import { WorkspaceHeader, type WorkspaceHeaderProps } from '../WorkspaceHeader/WorkspaceHeader'
import { WorkspaceStage, type WorkspaceStageProps } from '../WorkspaceStage/WorkspaceStage'

export type WorkspaceSurfaceProps = Omit<ComponentProps<'section'>, 'children'> & {
  headerProps: WorkspaceHeaderProps
  stageProps?: Omit<WorkspaceStageProps, 'children'>
  children: ReactNode
}

export function WorkspaceSurface({
  headerProps,
  stageProps,
  children,
  className,
  ...props
}: WorkspaceSurfaceProps) {
  return (
    <section className={`dl-workspace-surface${className ? ` ${className}` : ''}`} {...props}>
      <WorkspaceHeader {...headerProps} />
      <WorkspaceStage {...stageProps}>{children}</WorkspaceStage>
    </section>
  )
}
