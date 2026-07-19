export const stories=[
  {id:'entity-kinds',kind:'variant',name:'Entity kinds',examples:[{label:'Folder',props:{kind:'folder'}},{label:'Component',props:{kind:'component'}},{label:'Token',props:{kind:'token'}},{label:'File',props:{kind:'file'}}]},
  {id:'tree-context',kind:'context',name:'Inside semantic tree',description:'Verify stronger indentation, disclosure, selection, and sibling alignment inside a tree.',interactive:true,examples:[{label:'Nested selection',props:{active:true,level:2}}]},
  {id:'optional-affordances',kind:'behavior',name:'Optional color and actions',description:'Color editing and future actions remain separately configurable secondary affordances.',interactive:true,examples:[{label:'Both enabled',props:{coloringEnabled:true,actionsEnabled:true,color:'#8b5cf6'}},{label:'Quiet row',props:{coloringEnabled:false,actionsEnabled:false}}]},
]
