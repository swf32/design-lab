const colors = [
  {name:'accent',value:'#26D9C7',className:'is-accent'},
  {name:'surface',value:'#20201F',className:'is-surface'},
  {name:'danger',value:'#FF7B72',className:'is-danger'},
]

export function ColorCardPreview() {
  return <div className="preview-color-cards" role="img" aria-label="Color cards with token names and resolved values">
    {colors.map((color)=><span className={color.className} key={color.name}><i/><code>{color.name}</code><small>{color.value}</small></span>)}
  </div>
}
