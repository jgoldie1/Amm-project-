import { useEffect, useState } from 'react'

type Action={label:string;tone:string;run:()=>void;hint?:string}
type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed';platform:string}>}

function call(name:string,...args:any[]){
  const fn=(window as any)[name]
  if(typeof fn==='function'){
    fn(...args)
    return true
  }
  return false
}

function event(name:string,detail?:any){
  window.dispatchEvent(new CustomEvent(name,{detail}))
}

function openStreetVerse(){
  if(!call('__launchStreetVerse'))event('tryamm:streetverse-open',{source:'command-dock'})
}
function openBusiness(){event('tryamm:metaverse-business-open',{source:'command-dock'})}
function openSourcing(){
  openBusiness()
  queueMicrotask(()=>event('tryamm:metaverse-business-find-suppliers',{source:'command-dock'}))
}
function openNigeria(){
  event('tryamm:global-city-select',{city:'Lagos',country:'Nigeria',source:'command-dock'})
  openStreetVerse()
}
function openLife(){event('tryamm:streetverse-life-hub-open',{source:'command-dock'})}
function openCreator(){event('tryamm:media-studio-open',{source:'command-dock'})}
function openLive(){if(!call('__showBroadcastStudio'))event('tryamm:broadcast-studio-open',{source:'command-dock'})}
function openWallet(){if(!call('__showOmniCash'))event('tryamm:omnicash-open',{source:'command-dock'})}

export default function FirstClassFeatureDock(){
  const [more,setMore]=useState(false)
  const [installPrompt,setInstallPrompt]=useState<InstallPromptEvent|null>(null)
  const [installOpen,setInstallOpen]=useState(false)
  const [installed,setInstalled]=useState(false)
  const [installMessage,setInstallMessage]=useState('')

  useEffect(()=>{
    const standalone=window.matchMedia?.('(display-mode: standalone)').matches||(navigator as any).standalone===true
    setInstalled(Boolean(standalone))
    const capture=(e:Event)=>{
      e.preventDefault()
      setInstallPrompt(e as InstallPromptEvent)
    }
    const completed=()=>{
      setInstalled(true)
      setInstallPrompt(null)
      setInstallMessage('AMM Omniverse is installed on this phone.')
    }
    window.addEventListener('beforeinstallprompt',capture)
    window.addEventListener('appinstalled',completed)
    return()=>{
      window.removeEventListener('beforeinstallprompt',capture)
      window.removeEventListener('appinstalled',completed)
    }
  },[])

  async function installOnPhone(){
    if(installed){
      setInstallMessage('AMM Omniverse is already installed on this device.')
      setInstallOpen(true)
      return
    }
    if(installPrompt){
      await installPrompt.prompt()
      const choice=await installPrompt.userChoice
      if(choice.outcome==='accepted'){
        setInstalled(true)
        setInstallMessage('Install accepted. AMM Omniverse is being added to your phone.')
      }else{
        setInstallMessage('Install was dismissed. Tap INSTALL APP whenever you are ready.')
      }
      setInstallPrompt(null)
      setInstallOpen(true)
      event('tryamm:app-store:install-request',{appId:'amm-omniverse',target:'pwa',source:'command-dock',outcome:choice.outcome})
      return
    }
    const ua=navigator.userAgent||''
    const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)
    if(ios){
      setInstallMessage('iPhone requires Apple’s Safari install step: tap the Share button, choose Add to Home Screen, then tap Add. Apple does not allow a website to bypass that confirmation.')
    }else{
      setInstallMessage('Your browser did not expose the one-tap install prompt yet. Open this site in Chrome or another install-capable browser, then tap INSTALL APP again or use Add to Home Screen from the browser menu.')
    }
    setInstallOpen(true)
    event('tryamm:app-store:install-request',{appId:'amm-omniverse',target:'pwa',source:'command-dock',requiresBrowserInstallUI:true})
  }

  const primary:Action[]=[
    {label:'🎮 STREETVERSE',tone:'#4FE3FF',run:openStreetVerse,hint:'Enter the living world'},
    {label:'🏪 BUSINESS',tone:'#ffd86a',run:openBusiness,hint:'Start a business pathway'},
    {label:'📦 SOURCE',tone:'#79f2c0',run:openSourcing,hint:'Quantum Sourcing + low MOQ'},
    {label:installed?'✅ INSTALLED':'📲 INSTALL APP',tone:'#8cff9b',run:installOnPhone,hint:'Add AMM Omniverse to this phone'},
  ]

  const workflow:Action[]=[
    {label:'1 • IDEA',tone:'#b89cff',run:openBusiness,hint:'Choose product, service or creator business'},
    {label:'2 • PROTECT',tone:'#53ddff',run:openBusiness,hint:'NDA / NNN / trademark / copyright readiness'},
    {label:'3 • SOURCE',tone:'#79f2c0',run:openSourcing,hint:'Verified suppliers, samples and low MOQ'},
    {label:'4 • BUILD + SELL',tone:'#E8B944',run:()=>{openBusiness();event('tryamm:metaverse-business-open-marketplace')},hint:'Brand, storefront and direct-to-consumer'},
    {label:'5 • DELIVER',tone:'#ff9d6c',run:openBusiness,hint:'Freight, customs and global delivery tracking'},
    {label:'6 • GROW',tone:'#ff7ac8',run:openNigeria,hint:'Expand city-by-city, starting Lagos + Abuja'},
  ]

  const secondary:Action[]=[
    {label:'🇳🇬 Nigeria • Lagos + Abuja',tone:'#8cff9b',run:openNigeria},
    {label:'🌍 Life + Missions',tone:'#79f2c0',run:openLife},
    {label:'🎬 Create',tone:'#E8B944',run:openCreator},
    {label:'● LIVE / TV',tone:'#ff7ac8',run:openLive},
    {label:'💳 OmniCash',tone:'#E8B944',run:openWallet},
    {label:'🛍 Marketplace',tone:'#4FE3FF',run:()=>{if(!call('__showHoloMarketplace'))event('tryamm:holo-marketplace-open',{source:'command-dock'})}},
    {label:'◈ Work / MiddleVerse',tone:'#4FE3FF',run:()=>{if(!call('__showMiddleverseWorkstation'))event('tryamm:middleverse-work-open',{source:'command-dock'})}},
    {label:'✦ HoloGPT',tone:'#b89cff',run:()=>event('tryamm:hologpt-open',{source:'command-dock'})},
    {label:'🛡 Jacobie',tone:'#53ddff',run:()=>event('tryamm:jacobie-vision-open',{source:'command-dock'})},
    {label:'♫ Music',tone:'#E8B944',run:()=>{if(!call('__showHoloMusic'))event('tryamm:holo-music-open',{source:'command-dock'})}},
    {label:'♿ Accessibility',tone:'#79f2c0',run:()=>{if(!call('__showAccessibilityPassport'))event('tryamm:accessibility-passport-open',{source:'command-dock'})}},
  ]

  return <>
    <style>{`
      [aria-label="Open StreetVerse playable beta"],
      [aria-label="Open Holo Marketplace"],
      [aria-label="Open Holo Music"],
      [aria-label="Open OmniCash"],
      [aria-label="Open Middleverse AI Workforce and Developer Workstation"],
      [aria-label="Open Holo Concierge"],
      [aria-label="Open TRYAMM latest changes"],
      [aria-label="Open TRYAMM production readiness"]{display:none!important}
      body{padding-bottom:84px}
    `}</style>

    {installOpen&&<section role="dialog" aria-modal="true" aria-label="Install AMM Omniverse" style={{position:'fixed',inset:0,zIndex:14000,display:'grid',placeItems:'center',padding:18,background:'#02060de8',backdropFilter:'blur(12px)'}}>
      <div style={{width:'min(92vw,520px)',border:'1px solid #5ef0b388',borderRadius:20,background:'#07121a',padding:20,color:'#fff',boxShadow:'0 24px 80px #000d'}}>
        <div style={{fontSize:10,color:'#79f2c0',fontWeight:950,letterSpacing:2}}>ALL AMERICAN APP STORE</div>
        <h2 style={{margin:'7px 0 8px'}}>📲 Install AMM Omniverse</h2>
        <p style={{fontSize:13,lineHeight:1.6,color:'#b8c8d5'}}>{installMessage}</p>
        <div style={{marginTop:12,padding:11,borderRadius:12,border:'1px solid #233d4c',background:'#091722',fontSize:11,color:'#94aabe'}}>Android/compatible browsers can use the browser’s native one-tap install prompt. iPhone Safari requires Apple’s Share → Add to Home Screen confirmation.</div>
        <button onClick={()=>setInstallOpen(false)} style={{marginTop:15,width:'100%',minHeight:46,border:'1px solid #79f2c088',borderRadius:12,background:'#10271f',color:'#9ff7d0',fontWeight:950}}>DONE</button>
      </div>
    </section>}

    {more&&<section role="dialog" aria-label="TRYAMM apps and guided workflow" style={{position:'fixed',left:'50%',bottom:88,transform:'translateX(-50%)',zIndex:9590,width:'min(94vw,860px)',maxHeight:'74vh',overflow:'auto',padding:13,border:'1px solid #31566a',borderRadius:18,background:'#030812f7',boxShadow:'0 18px 60px #000d',backdropFilter:'blur(18px)',color:'#fff'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:10}}><div><div style={{fontSize:9,color:'#79f2c0',fontWeight:950,letterSpacing:2}}>NEW • GLOBAL BUSINESS WORKFLOW</div><strong>Idea → Protect → Source → Sell → Deliver → Grow</strong><div style={{fontSize:10,color:'#8da2b8',marginTop:3}}>Parallel-development target: +40% faster cycle time, measured against baseline.</div></div><button onClick={()=>setMore(false)} aria-label="Close apps and workflow" style={{width:38,height:38,borderRadius:'50%',border:'1px solid #40536a',background:'#0b1520',color:'#fff',fontSize:20}}>×</button></div>
      <button type="button" onClick={installOnPhone} style={{width:'100%',minHeight:54,marginBottom:10,border:'1px solid #79f2c099',borderRadius:14,background:'#0c241c',color:'#9ff7d0',fontSize:12,fontWeight:950}}>{installed?'✅ AMM OMNIVERSE INSTALLED':'📲 ONE-TAP INSTALL AMM OMNIVERSE'}</button>
      <div style={{padding:'10px 0 12px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(125px,1fr))',gap:7}}>{workflow.map(item=><button key={item.label} type="button" onClick={()=>{setMore(false);item.run()}} style={{minHeight:70,textAlign:'left',border:`1px solid ${item.tone}66`,borderRadius:13,background:'#09131f',color:item.tone,fontSize:10,fontWeight:950,padding:'10px 11px'}}><div>{item.label}</div><div style={{marginTop:5,color:'#a7bacb',fontSize:9,fontWeight:700,lineHeight:1.3}}>{item.hint}</div></button>)}</div>
        <div style={{marginTop:9,fontSize:9,lineHeight:1.45,color:'#8da2b8'}}>BUSINESS PATHWAY → IP/DEAL PROTECTION → QUANTUM SOURCING → LOW MOQ/SAMPLES → DTC STOREFRONT → GLOBAL TRACKING → CITY EXPANSION.</div>
      </div>
      <div style={{borderTop:'1px solid #1d3042',paddingTop:11}}><div style={{fontSize:9,color:'#8da2b8',fontWeight:950,letterSpacing:1.5,marginBottom:7}}>MORE APPS</div><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>{secondary.map(item=><button key={item.label} type="button" onClick={()=>{setMore(false);item.run()}} style={{minHeight:52,textAlign:'left',border:`1px solid ${item.tone}55`,borderRadius:13,background:'#09131f',color:item.tone,fontSize:11,fontWeight:900,padding:'10px 12px'}}>{item.label}</button>)}</div></div>
    </section>}

    <nav aria-label="TRYAMM quick launch" style={{position:'fixed',left:'50%',bottom:10,transform:'translateX(-50%)',zIndex:9600,width:'min(97vw,860px)',display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:6,padding:6,border:'1px solid #31566a',borderRadius:18,background:'#030812f5',backdropFilter:'blur(16px)',boxShadow:'0 14px 40px #000b'}}>
      {primary.map(item=><button key={item.label} type="button" title={item.hint} onClick={item.run} style={{minHeight:56,border:`1px solid ${item.tone}77`,borderRadius:12,background:'#09131f',color:item.tone,fontSize:'clamp(7px,2vw,10px)',fontWeight:950,letterSpacing:.2,cursor:'pointer',padding:'7px 3px'}}>{item.label}</button>)}
      <button type="button" aria-expanded={more} onClick={()=>setMore(v=>!v)} style={{minHeight:56,border:'1px solid #b89cff77',borderRadius:12,background:more?'#17283a':'#111526',color:'#d9c9ff',fontSize:'clamp(7px,2vw,10px)',fontWeight:950,padding:'7px 3px'}}>⚡ 40% FLOW</button>
    </nav>
  </>
}