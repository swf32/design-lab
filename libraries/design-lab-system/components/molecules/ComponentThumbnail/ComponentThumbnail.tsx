export function ComponentThumbnail({ kind }: { kind:string }) {
  const generic = !['button','icon-button','input','sidebar-tab','color-card','component-card','module-header','canvas-background-control'].includes(kind)
  return <div className={`dl-thumbnail dl-thumbnail--${kind}`} aria-label={`${kind} illustration`}>
    {kind==='button' && <><span/><span/><i/></>}
    {kind==='icon-button' && <><b>＋</b><b>↗</b><i/></>}
    {kind==='input' && <><label/><span/><div><i/><i/></div></>}
    {kind==='sidebar-tab' && <><b>◇</b><span/><span/></>}
    {kind==='color-card' && <><i/><i/><i/></>}
    {kind==='component-card' && <><em/><span/><small/></>}
    {kind==='module-header' && <><small/><strong/><i/></>}
    {kind==='canvas-background-control' && <><b/><b/><b/></>}
    {generic && <div className="dl-thumbnail__generic"><i/><span/><span/><small/></div>}
  </div>
}
