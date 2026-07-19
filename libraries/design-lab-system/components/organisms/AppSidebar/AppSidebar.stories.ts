export const stories=[
  {id:'disclosure',kind:'behavior',name:'Hover disclosure',description:'Hover the production sidebar to reveal labels without changing the combined navigation width.',interactive:true,examples:[{label:'Collapsed',props:{expanded:false}},{label:'Expanded',props:{expanded:true}}]},
  {id:'selection',kind:'state',name:'Module selection',examples:[{label:'Components active',props:{active:'components'}}]},
  {id:'settings',kind:'state',name:'Settings selection',description:'The persistent footer action opens application settings without becoming a project module.',examples:[{label:'Settings active',props:{settingsActive:true}}]},
  {id:'navigation-width',kind:'integration',name:'Shared navigation width',description:'Application Sidebar and the adjacent directory region divide one stable navigation width.',interactive:true,subject:'AppSidebar',related:['DirectoryPanel'],examples:[{label:'Collapsed rail',props:{expanded:false}},{label:'Expanded rail',props:{expanded:true}}]},
]
