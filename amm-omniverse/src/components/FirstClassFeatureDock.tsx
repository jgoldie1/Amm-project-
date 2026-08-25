import { useState } from 'react'

type Action={label:string;tone:string;run:()=>void}

function call(name:string,...args:any[]){
  const fn=(window as any)[name]
  if(typeof fn==='function')fn(...args)
}

function event(name:string,detail?:any){
  window.dispatchEvent(new CustomEvent(name,{detail}))
}

export default function FirstClassFeatureDock(){
  const [more,setMore]=useState(false)

  const primary:Action[]=[
    {label:'🎮 STREETVERSE',tone:'#4FE3FF',run:()=>{if(typeof (window as any).__launchStreetVerse==='function')call('__launchStreetVerse');else event('tryamm:streetverse-open')}},
    {label:'🎬 CREATE',tone:'#E8B944',run:()=>event('tryamm:media-studio-open',{source:'command-dock'})},
    {label:'🛡 JACOBIE',tone:'#53ddff',run:()=>event('tryamm:jacobie-vision-open',{source:'command-dock'})},
    {label:'✦ HOLOGPT',tone:'#b89cff',run:()=>event('tryamm:hologpt-open',{source:'command-dock'})},
  ]

  const secondary:Action[]=[
    {label:'🛍 Marketplace',tone:'#4FE3FF',run:()=>call('__showHoloMarketplace')},
    {label:'💳 OmniCash',tone:'#E8B944',run:()=>call('__showOmniCash')},
    {label:'♫ Music',tone:'#E8B944',run:()=>call('__showHoloMusic')},
    {label:'● LIVE / TV',tone:'#ff7ac8',run:()=>call('__showBroadcastStudio')},
    {label:'◈ Work / Business',tone:'#4FE3FF',run:()=>call('__showMiddleverseWorkstation')},
    {label:'🌍 StreetVerse Life',tone:'#79f2c0',run:()=>event('tryamm:streetverse-life-hub-open')},
    {label:'♿ Accessibility',tone:'#79f2c0',run:()=>call('__showAccessibilityPassport')},
    {label:'● Live Status',tone:'#79f2c0',run:()=>document.querySelector<HTMLButtonElement>('[aria-label="Open TRYAMM production readiness"]')?.click()},
  ]

  return <>
    <style>{`
      /* The command dock is the single public launcher. Keep legacy launchers mounted for their dialogs/APIs, but remove their overlapping floating buttons. */
      [aria-label="Open StreetVerse playable beta"],
      [aria-label="Open Holo Marketplace"],
      [aria-label="Open Holo Music"],
      [aria-label="Open OmniCash"],
      [aria-label="Open Middleverse AI Workforce and Developer Workstation"],
      [aria-label="Open Holo Concierge"],
      [aria-label="Open TRYAMM latest changes"],
      [aria-label="Open TRYAMM production readiness"]{display:none!important}
      body{padding-bottom:78px}
    `}</style>

    {more&&<section role="dialog" aria-label="TRYAMM more apps" style={{position:'fixed',left:'50%',bottom:82,transform:'translateX(-50%)',zIndex:9590,width:'min(94vw,760px)',padding:12,border:'1px solid #314358',borderRadius:18,background:'#030812f5',boxShadow:'0 18px 60px #000c',backdropFilter:'blur(18px)',color:'#fff'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:10}}><div><div style={{fontSize:9,color:'#4FE3FF',fontWeight:950,letterSpacing:2}}>TRYAMM COMMAND CENTER</div><strong>More apps</strong></div><button onClick={()=>setMore(false)} aria-label="Close more apps" style={{width:38,height:38,borderRadius:'50%',border:'1px solid #40536a',background:'#0b1520',color:'#fff',fontSize:20}}>×</button></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>{secondary.map(item=><button key={item.label} type="button" onClick={()=>{setMore(false);item.run()}} style={{minHeight:52,textAlign:'left',border:`1px solid ${item.tone}55`,borderRadius:13,background:'#09131f',color:item.tone,fontSize:11,fontWeight:900,padding:'10px 12px'}}>{item.label}</button>)}</div>
    </section>}

    <nav aria-label="TRYAMM quick launch" style={{position:'fixed',left:'50%',bottom:10,transform:'translateX(-50%)',zIndex:9600,width:'min(96vw,820px)',display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:6,padding:6,border:'1px solid #314358',borderRadius:18,background:'#030812f2',backdropFilter:'blur(16px)',boxShadow:'0 14px 40px #000b'}}>
      {primary.map(item=><button key={item.label} type="button" onClick={item.run} style={{minHeight:52,border:`1px solid ${item.tone}66`,borderRadius:12,background:'#09131f',color:item.tone,fontSize:'clamp(8px,2.1vw,10px)',fontWeight:950,letterSpacing:.3,cursor:'pointer',padding:'7px 4px'}}>{item.label}</button>)}
      <button type="button" aria-expanded={more} onClick={()=>setMore(v=>!v)} style={{minHeight:52,border:'1px solid #64748b77',borderRadius:12,background:more?'#17283a':'#09131f',color:'#dce8f5',fontSize:'clamp(8px,2.1vw,10px)',fontWeight:950,padding:'7px 4px'}}>☰ MORE</button>
    </nav>
  </>
}
