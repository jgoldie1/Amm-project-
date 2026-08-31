import { useState } from 'react'

type Action={label:string;tone:string;run:()=>void;hint?:string}

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

function openLife(){
  event('tryamm:streetverse-life-hub-open',{source:'command-dock'})
}

function openCreator(){
  event('tryamm:media-studio-open',{source:'command-dock'})
}

function openLive(){
  if(!call('__showBroadcastStudio'))event('tryamm:broadcast-studio-open',{source:'command-dock'})
}

function openWallet(){
  if(!call('__showOmniCash'))event('tryamm:omnicash-open',{source:'command-dock'})
}

export default function FirstClassFeatureDock(){
  const [more,setMore]=useState(false)

  const primary:Action[]=[
    {label:'🎮 STREETVERSE',tone:'#4FE3FF',run:openStreetVerse,hint:'Enter the living world'},
    {label:'🎬 CREATE',tone:'#E8B944',run:openCreator,hint:'Record, edit and publish'},
    {label:'🛡 JACOBIE',tone:'#53ddff',run:()=>event('tryamm:jacobie-vision-open',{source:'command-dock'}),hint:'Security + opportunity'},
    {label:'✦ HOLOGPT',tone:'#b89cff',run:()=>event('tryamm:hologpt-open',{source:'command-dock'}),hint:'AI command layer'},
  ]

  const workflow:Action[]=[
    {label:'1 • ENTER WORLD',tone:'#4FE3FF',run:openStreetVerse,hint:'Open StreetVerse'},
    {label:'2 • LIFE + MISSIONS',tone:'#79f2c0',run:openLife,hint:'Avatar, city, jobs and missions'},
    {label:'3 • CREATE',tone:'#E8B944',run:openCreator,hint:'Turn gameplay into media'},
    {label:'4 • GO LIVE',tone:'#ff7ac8',run:openLive,hint:'Broadcast, PK and TV surfaces'},
    {label:'5 • WALLET',tone:'#ffd76a',run:openWallet,hint:'Review wallet and verified earnings'},
  ]

  const secondary:Action[]=[
    {label:'🛍 Marketplace',tone:'#4FE3FF',run:()=>{if(!call('__showHoloMarketplace'))event('tryamm:holo-marketplace-open',{source:'command-dock'})}},
    {label:'💳 OmniCash',tone:'#E8B944',run:openWallet},
    {label:'♫ Music',tone:'#E8B944',run:()=>{if(!call('__showHoloMusic'))event('tryamm:holo-music-open',{source:'command-dock'})}},
    {label:'● LIVE / TV',tone:'#ff7ac8',run:openLive},
    {label:'◈ Work / Business',tone:'#4FE3FF',run:()=>{if(!call('__showMiddleverseWorkstation'))event('tryamm:middleverse-work-open',{source:'command-dock'})}},
    {label:'🌍 StreetVerse Life',tone:'#79f2c0',run:openLife},
    {label:'♿ Accessibility',tone:'#79f2c0',run:()=>{if(!call('__showAccessibilityPassport'))event('tryamm:accessibility-passport-open',{source:'command-dock'})}},
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

    {more&&<section role="dialog" aria-label="TRYAMM apps and guided workflow" style={{position:'fixed',left:'50%',bottom:82,transform:'translateX(-50%)',zIndex:9590,width:'min(94vw,820px)',maxHeight:'72vh',overflow:'auto',padding:12,border:'1px solid #314358',borderRadius:18,background:'#030812f5',boxShadow:'0 18px 60px #000c',backdropFilter:'blur(18px)',color:'#fff'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:10}}><div><div style={{fontSize:9,color:'#4FE3FF',fontWeight:950,letterSpacing:2}}>TRYAMM COMMAND CENTER</div><strong>One workflow • every major system</strong></div><button onClick={()=>setMore(false)} aria-label="Close apps and workflow" style={{width:38,height:38,borderRadius:'50%',border:'1px solid #40536a',background:'#0b1520',color:'#fff',fontSize:20}}>×</button></div>

      <div style={{padding:'10px 0 12px'}}>
        <div style={{fontSize:9,color:'#8da2b8',fontWeight:950,letterSpacing:1.5,marginBottom:7}}>GUIDED CORE FLOW</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:7}}>{workflow.map(item=><button key={item.label} type="button" onClick={()=>{setMore(false);item.run()}} style={{minHeight:64,textAlign:'left',border:`1px solid ${item.tone}66`,borderRadius:13,background:'#09131f',color:item.tone,fontSize:10,fontWeight:950,padding:'10px 11px'}}><div>{item.label}</div><div style={{marginTop:5,color:'#9fb2c4',fontSize:9,fontWeight:700,lineHeight:1.3}}>{item.hint}</div></button>)}</div>
        <div style={{marginTop:8,fontSize:9,lineHeight:1.45,color:'#8da2b8'}}>ENTER → LIFE/MISSION → CREATE → LIVE → VERIFIED WALLET. Payment and reward settlement stay server-authorized; the UI never grants itself money.</div>
      </div>

      <div style={{borderTop:'1px solid #1d3042',paddingTop:11}}>
        <div style={{fontSize:9,color:'#8da2b8',fontWeight:950,letterSpacing:1.5,marginBottom:7}}>MORE APPS</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>{secondary.map(item=><button key={item.label} type="button" onClick={()=>{setMore(false);item.run()}} style={{minHeight:52,textAlign:'left',border:`1px solid ${item.tone}55`,borderRadius:13,background:'#09131f',color:item.tone,fontSize:11,fontWeight:900,padding:'10px 12px'}}>{item.label}</button>)}</div>
      </div>
    </section>}

    <nav aria-label="TRYAMM quick launch" style={{position:'fixed',left:'50%',bottom:10,transform:'translateX(-50%)',zIndex:9600,width:'min(96vw,820px)',display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:6,padding:6,border:'1px solid #314358',borderRadius:18,background:'#030812f2',backdropFilter:'blur(16px)',boxShadow:'0 14px 40px #000b'}}>
      {primary.map(item=><button key={item.label} type="button" title={item.hint} onClick={item.run} style={{minHeight:52,border:`1px solid ${item.tone}66`,borderRadius:12,background:'#09131f',color:item.tone,fontSize:'clamp(8px,2.1vw,10px)',fontWeight:950,letterSpacing:.3,cursor:'pointer',padding:'7px 4px'}}>{item.label}</button>)}
      <button type="button" aria-expanded={more} onClick={()=>setMore(v=>!v)} style={{minHeight:52,border:'1px solid #64748b77',borderRadius:12,background:more?'#17283a':'#09131f',color:'#dce8f5',fontSize:'clamp(8px,2.1vw,10px)',fontWeight:950,padding:'7px 4px'}}>☰ FLOW</button>
    </nav>
  </>
}