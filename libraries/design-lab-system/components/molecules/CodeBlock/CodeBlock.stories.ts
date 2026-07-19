export const stories=[
  {id:'languages',kind:'context',name:'Language labels',description:'Source remains readable across common library file formats.',examples:[{label:'TSX',props:{language:'tsx'}},{label:'SCSS',props:{language:'scss'}}]},
  {id:'copy',kind:'behavior',name:'Copy source',description:'The action copies the complete source and acknowledges success.',interactive:true,examples:[{label:'Ready',props:{showCopy:true}}]},
  {id:'overflow',kind:'context',name:'Long source',description:'Long lines scroll inside the block without widening documentation.',examples:[{label:'Horizontal overflow'}]},
]
