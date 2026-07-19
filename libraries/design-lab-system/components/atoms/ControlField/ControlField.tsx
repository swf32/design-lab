import type { ReactNode } from 'react'
export function ControlField({ label, children }: { label:string; children:ReactNode }) { return <label className="dl-control-field"><span>{label}</span>{children}</label> }
