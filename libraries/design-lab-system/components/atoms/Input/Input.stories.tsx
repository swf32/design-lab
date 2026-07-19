export const stories = [
  {id:'control-kinds',kind:'variant',name:'Control kinds',description:'Compare text, search, and multiline entry at medium density.',examples:[{label:'Text',props:{variant:'text',label:'Component name'}},{label:'Search',props:{variant:'search',label:'Search components'}},{label:'Textarea',props:{variant:'textarea',label:'Description'}}]},
  {id:'density-matrix',kind:'variant',name:'Density by control kind',description:'Verify every supported control kind at every supported size.',examples:[
    {label:'Text · small',props:{variant:'text',size:'small'}},{label:'Text · medium',props:{variant:'text',size:'medium'}},{label:'Text · large',props:{variant:'text',size:'large'}},
    {label:'Search · small',props:{variant:'search',size:'small'}},{label:'Search · medium',props:{variant:'search',size:'medium'}},{label:'Search · large',props:{variant:'search',size:'large'}},
    {label:'Textarea · small',props:{variant:'textarea',size:'small'}},{label:'Textarea · medium',props:{variant:'textarea',size:'medium'}},{label:'Textarea · large',props:{variant:'textarea',size:'large'}},
  ]},
  {id:'validation-states',kind:'state',name:'Validation and availability',description:'Compare default, error, read-only, and disabled semantics.',examples:[{label:'Default',props:{}},{label:'Error',props:{errorMessage:'Use letters, numbers, and hyphens only.'}},{label:'Read only',props:{readOnly:true}},{label:'Disabled',props:{disabled:true}}]},
  {id:'supporting-content',kind:'accessibility',name:'Labels and supporting content',description:'Visible labels, descriptions, errors, and counts stay associated with the native control.',examples:[{label:'Helper',props:{helperText:'Used for the generated component folder.'}},{label:'Required',props:{required:true}},{label:'Character count',props:{variant:'textarea',showCount:true,maxLength:160}}]},
  {id:'composition',kind:'context',name:'Form composition',description:'Review adornments and field rhythm in a realistic component-creation form.',examples:[{label:'Component details',props:{startAdornment:'@',endAdornment:'.tsx'}}]},
]
