export const stories = [
  { id:'variants', kind:'variant', name:'Visual variants', examples:[
    { label:'Segmented text', props:{variant:'segmented',options:['tokens','palette','fonts'],value:'tokens'} },
    { label:'Compact toggle', props:{variant:'toggle',options:['light','dark'],value:'light'} },
  ]},
  { id:'sizes', kind:'variant', name:'Sizes by visual variant', examples:[
    { label:'Segmented small', props:{variant:'segmented',size:'small'} },
    { label:'Segmented medium', props:{variant:'segmented',size:'medium'} },
    { label:'Toggle small', props:{variant:'toggle',size:'small'} },
    { label:'Toggle medium', props:{variant:'toggle',size:'medium'} },
  ]},
  { id:'states', kind:'state', name:'Selection and disabled state', examples:[
    { label:'Selected', props:{value:'tokens'} },
    { label:'Disabled option', props:{disabled:'fonts'} },
  ]},
]
