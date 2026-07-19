export const stories = [
  {id:'states',kind:'state',name:'Selection states',description:'Compare unchecked, checked, indeterminate, and disabled semantics.',examples:[{label:'Unchecked',props:{}},{label:'Checked',props:{checked:true}},{label:'Indeterminate',props:{indeterminate:true}},{label:'Disabled',props:{disabled:true}}]},
  {id:'sizes',kind:'variant',name:'Sizes',description:'The control supports compact workbench rows and standard form composition.',examples:[{label:'Small',props:{size:'small'}},{label:'Medium',props:{size:'medium'}}]},
  {id:'label-composition',kind:'accessibility',name:'Label composition',description:'Visible labels and descriptions share the native checkbox activation area.',examples:[{label:'With label',props:{label:'Include documentation'}},{label:'With description',props:{label:'Generate stories',description:'Creates the component story contract.'}}]},
]
