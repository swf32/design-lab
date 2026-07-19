export const stories = [
  {id:'canvas-padding',kind:'variant',name:'Canvas padding',description:'Full-width specimens fill the safe content box without touching the Canvas edge.',examples:[{label:'None',props:{padding:'none'}},{label:'Compact',props:{padding:'compact'}},{label:'Comfortable',props:{padding:'comfortable'}}]},
  {id:'background-modes',kind:'state',name:'Background modes',description:'The shared Canvas control switches dark grid, light grid, and solid backgrounds.',interactive:true,examples:[{label:'Dark grid',props:{mode:'dark-grid'}},{label:'Light grid',props:{mode:'light-grid'}},{label:'Solid',props:{mode:'solid'}}]},
  {id:'controls-composition',kind:'integration',name:'Controls composition',description:'Canvas and inspector remain one reusable workbench region while accepting module-owned controls.',examples:[{label:'Boolean controls',props:{controls:'Checkbox fields'}}]},
]
