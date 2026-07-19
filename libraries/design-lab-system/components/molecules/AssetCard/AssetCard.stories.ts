export const stories = [
  {id:'asset-kinds',kind:'variant',name:'Asset kinds',description:'Icon, image, and video entities share one catalog anatomy while retaining distinct previews.',examples:[{label:'Icon',props:{kind:'icon',extension:'tsx'}},{label:'Image',props:{kind:'image',extension:'webp'}},{label:'Video',props:{kind:'video',extension:'mp4'}}]},
  {id:'selection',kind:'state',name:'Route selection',description:'A deep-linked asset remains visibly selected and exposes page-current semantics.',examples:[{label:'Selected icon',props:{kind:'icon',extension:'tsx',selected:true}}]},
  {id:'rendered-preview',kind:'context',name:'Rendered previews',description:'Raster files and validated TSX/SVG icons use real local previews while identity and path remain readable.',examples:[{label:'Raster image',props:{kind:'image',previewUrl:'/api/example-image'}},{label:'TSX icon',props:{kind:'icon',extension:'tsx',previewUrl:'/api/example-icon'}}]},
  {id:'long-path',kind:'context',name:'Long filesystem path',description:'Long names and nested paths truncate without changing the grid.',examples:[{label:'Nested asset',props:{path:'images/campaigns/summer/hero-product-composition.webp'}}]},
]
