export type ResolvedInterfacePack = {
  root: string
  manifest: Record<string, unknown>
  entrypoints: Record<string, string>
}

export function resolveActiveInterface(): Promise<{
  system: ResolvedInterfacePack
  skin: ResolvedInterfacePack | null
  skinStyle: string
}>
