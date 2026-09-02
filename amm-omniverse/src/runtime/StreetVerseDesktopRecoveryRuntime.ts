let installed=false

function style(el:HTMLElement,css:Partial<CSSStyleDeclaration>){Object.assign(el.style,css)}

function navigate(path:string){
  const nav=(window as any).__tryammNavigate
  if(typeof nav==='function'){nav(path);return}
  const normalized=path.startsWith('/')?path:`/${path}`
  if(window.location.hash===`#${normalized}`){window.dispatchEvent(new HashChangeEvent('hashchange'));return}
  window.location.hash=normalized
}

export function installStreetVerseDesktopRecoveryRuntime(){
  if(installed||typeof window==='undefined'||typeof document==='undefined')return
  installed=true

  const mount=()=>{
    if(document.getElementById('tryamm-desktop-recovery-nav'))return
    const nav=document.createElement('div')
    nav.id='tryamm-desktop-recovery-nav'
    nav.setAttribute('role','navigation')
    nav.setAttribute('aria-label','TRYAMM recovery navigation')
    style(nav,{position:'fixed',left:'50%',bottom:'14px',transform:'translateX(-50%)',zIndex:'2147482500',display:'flex',gap:'8px',alignItems:'center',padding:'8px',border:'1px solid rgba(79,227,255,.55)',borderRadius:'16px',background:'rgba(3,10,18,.92)',boxShadow:'0 12px 40px rgba(0,0,0,.55)',backdropFilter:'blur(10px)',maxWidth:'calc(100vw - 20px)',overflowX:'auto'})

    const make=(label:string,onClick:()=>void,primary=false)=>{
      const b=document.createElement('button')
      b.type='button';b.textContent=label
      style(b,{border:primary?'0':'1px solid rgba(79,227,255,.38)',borderRadius:'12px',padding:'11px 14px',background:primary?'linear-gradient(135deg,#4fe3ff,#66a6ff)':'#0a1420',color:primary?'#031018':'#fff',fontWeight:'900',fontSize:'12px',whiteSpace:'nowrap',cursor:'pointer',minHeight:'42px'})
      b.addEventListener('click',onClick)
      return b
    }

    nav.append(
      make('🎮 STREETVERSE',()=>navigate('/streetverse'),true),
      make('🏠 HOME',()=>navigate('/')),
      make('🛍 MARKET',()=>navigate('/marketplace')),
      make('✦ NEXUS',()=>navigate('/command-nexus'))
    )
    document.body.appendChild(nav)
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount()

  window.addEventListener('tryamm:streetverse-open',()=>navigate('/streetverse'))
  window.addEventListener('tryamm:streetverse-recover',()=>navigate('/streetverse'))
  queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:desktop-recovery-ready',{detail:{streetversePath:'#/streetverse',homePath:'#/'}})))
}
