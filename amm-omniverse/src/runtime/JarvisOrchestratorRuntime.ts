type JarvisCommand={action:string;payload?:Record<string,unknown>}

const routes:Record<string,()=>void>={
  'open-live':()=> (window as any).__showTryAMMLive?.(),
  'open-poyo':()=> (window as any).__showPoyoAI?.(),
  'open-hologpt':()=> window.dispatchEvent(new CustomEvent('tryamm:hologpt-open')),
  'open-games':()=> window.dispatchEvent(new CustomEvent('tryamm:gameverse-open')),
  'open-streetverse':()=> window.dispatchEvent(new CustomEvent('tryamm:streetverse-open')),
  'open-access':()=> (window as any).__showOmniAccess?.(),
  'open-sign':()=> (window as any).__showSignLanguage?.(),
  'open-wear':()=> (window as any).__showOmniWear?.(),
  'open-media':()=> window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'jarvis'}})),
  'open-share':()=> window.dispatchEvent(new CustomEvent('tryamm:social-share-open',{detail:{source:'jarvis'}})),
  'open-connect':()=> (window as any).__showTryAMMConnect?.(),
  'open-omniverse':()=> (window as any).__showOmniverse?.(),
  'open-holocore':()=> (window as any).__showHoloCore?.(),
  'open-security':()=> (window as any).__showSecurityCenter?.(),
}

export function installJarvisOrchestratorRuntime(){
  const execute=(command:JarvisCommand)=>{
    const key=String(command?.action||'').toLowerCase()
    const route=routes[key]
    if(route){route();window.dispatchEvent(new CustomEvent('tryamm:jarvis-status',{detail:{ok:true,action:key}}));return true}
    window.dispatchEvent(new CustomEvent('tryamm:jarvis-status',{detail:{ok:false,action:key,error:'unknown_command'}}));return false
  }
  ;(window as any).__jarvis={execute,capabilities:Object.keys(routes),version:'tryamm.jarvis.v1'}
  const listener=(event:Event)=>execute((event as CustomEvent<JarvisCommand>).detail||{action:''})
  window.addEventListener('tryamm:jarvis-command',listener)
  return()=>window.removeEventListener('tryamm:jarvis-command',listener)
}
