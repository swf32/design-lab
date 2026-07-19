import type { ReactNode } from 'react'

export type ComponentCardProps = { name:string; entry:string; meta:string; preview:ReactNode; previewAnimated?:boolean; selected?:boolean; onClick?:()=>void }

export function ComponentCard({ name, entry, meta, preview, previewAnimated=false, selected=false, onClick }: ComponentCardProps) {
  return <button type="button" className={`dl-component-card${previewAnimated?' dl-component-card--preview-animated':''}${selected?' dl-component-card--selected':''}`} aria-current={selected?'page':undefined} onClick={onClick}><span className="dl-component-card__preview">{preview}</span><span className="dl-component-card__footer"><span><strong>{name}</strong><code title={entry}>{entry}</code></span><small>{meta}</small></span></button>
}
