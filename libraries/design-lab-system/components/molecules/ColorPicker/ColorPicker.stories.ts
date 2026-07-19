export const stories=[
  {id:'selection',kind:'behavior',name:'Color selection',interactive:true,examples:[{label:'Preset and custom color',props:{value:'#3b82f6'}},{label:'No override',props:{value:null}}]},
  {id:'tree-icon',kind:'integration',name:'Semantic tree icon color',description:'The picker is triggered from a semantic entity icon and returns a nullable color override.',interactive:true,subject:'ColorPicker',related:['SemanticTreeItem'],examples:[{label:'Component icon',props:{value:'#8b5cf6'}}]},
]
