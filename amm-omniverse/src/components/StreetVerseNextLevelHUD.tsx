import { useEffect, useMemo, useState } from 'react'
import AniyahPayCenter from './AniyahPayCenter'
import VolcanoGamingHub from './VolcanoGamingHub'
import BennieChatbot from './BennieChatbot'

type Props={district?:string;assetStatus?:string;visited?:number;totalMissions?:number}
type HudTab='play'|'create'|'system'
type LauncherAction={label:string;icon:string;names?:string[];run?:()=>void;hint:string;accent?:boolean}

export default function StreetVerseNextLevelHUD({district='CHICAGO • DISTRICT 01',assetStatus='WORLD ACTIVE',visited=0,totalMissions=4}:Props){
 const [open,setOpen]=useState(true)
 const [showAniyahPay,setShowAniyahPay]=useState(false)
 const [showVolcano,setShowVolcano]=useState(false)
 const [showBennie,setShowBennie]=useState(false)
 const [tab,setTab]=useState<HudTab>('play')
 const [status,setStatus]=useState('StreetVerse controls ready.')
 const progress=useMemo(()=>totalMissions>0?Math.min(100,Math.round((visited/totalMissions)*100)):0,[visited,totalMissions])

 useEffect(()=>{const fn=()=>setOpen(v=>!v);window.addEventListener('tryamm:streetverse-hud',fn);return()=>window.removeEventListener('tryamm:streetverse-hud',fn)},[])
 useEffect(()=>{const fn=()=>setShowBennie(true);window.addEventListener('tryamm:bennie-hologram',fn);return()=>window.removeEventListener('tryamm:bennie-hologram',fn)},[])
 useEffect(()=>{;(window as any).__showAniyahPay=()=>setShowAniyahPay(true);return()=>{delete (window as any).__showAniyahPay}},[])
 useEffect(()=>{;(window as any).__showVolcanoGaming=()=>setShowVolcano(true);return()=>{delete (window as any).__showVolcanoGaming}},[])
 useEffect(()=>{;(window as any).__showBennieHologram=()=>setShowBennie(true);return()=>{delete (window as any).__showBennieHologram}},[])

 const launch=(names:string[],label:string)=>{for(const name of names){const fn=(window as any)[name];if(typeof fn==='function'){fn();setStatus(`${label} opened.`);return}}setStatus(`${label} is installed in the HUD but its runtime launcher is not connected on this build.`)}
 const actions:Record<HudTab,LauncherAction[]>={
   play:[
     {label:'Bennie Hologram',icon:'🦁',run:()=>setShowBennie(true),hint:'Summon Bennie as your holographic AI guide.',accent:true},
     {label:'HoloGPT',icon:'◈',names:['__showHoloGPT'],hint:'Ask, navigate and get mission help.'},
     {label:'Holo Fon',icon:'📱',names:['__showHoloFon'],hint:'Calls, messages, services and world controls.'},
     {label:'Volcano Gaming',icon:'🌋',run:()=>setShowVolcano(true),hint:'Phone + gamepad + TV / AR / VR control bridge.'},
     {label:'Aniyah Pay',icon:'💸',run:()=>setShowAniyahPay(true),hint:'Send, request, split and cross-border.'},
     {label:'Holoverse',icon:'◎',names:['__showHoloverse'],hint:'Move between connected worlds.'},
   ],
   create:[
     {label:'Start Reel',icon:'●',names:['__showReelComposer','__showReelCreator','__showReels'],hint:'Open recording and Reel creation.',accent:true},
     {label:'Broadcast',icon:'◉',names:['__showBroadcastStudio','__showLiveStudio'],hint:'Open LIVE / PK / broadcast tools.'},
     {label:'Omni Box',icon:'▣',names:['__showOmniBox'],hint:'Open saved clips, media and creator assets.'},
     {label:'Marketplace',icon:'◆',names:['__showMarketplace'],hint:'Creator commerce and business listings.'},
   ],
   system:[
     {label:'Command Nexus',icon:'⌘',names:['__showCommandNexus'],hint:'Platform status and operational controls.',accent:true},
     {label:'Omni Wallet',icon:'◇',names:['__showOmniWallet','__showWallet'],hint:'Wallet, balances and ledger activity.'},
     {label:'Quantum Time',icon:'⌛',names:['__showQuantumTime'],hint:'Timeline and time controls.'},
     {label:'Quantum Zoom',icon:'⌕',names:['__showQuantumZoom'],hint:'Scale and world-view controls.'},
   ],
 }

 if(showAniyahPay)return <AniyahPayCenter onClose={()=>setShowAniyahPay(false)}/>
 if(showVolcano)return <VolcanoGamingHub onClose={()=>setShowVolcano(false)}/>
 if(!open)return <button aria-label="Open StreetVerse control deck" onClick={()=>setOpen(true)} style={{position:'absolute',right:12,top:'max(12px,env(safe-area-inset-top))',zIndex:30,minHeight:44,border:'1px solid #4fe3ff77',borderRadius:999,background:'#06131df2',color:'#b9f7ff',padding:'9px 14px',fontFamily:'monospace',fontWeight:900,boxShadow:'0 10px 30px #0009'}}>◈ STREETVERSE</button>

 return <>
 {showBennie&&<div role="dialog" aria-modal="true" aria-label="Bennie holographic assistant" style={{position:'fixed',inset:0,zIndex:22000,pointerEvents:'none',display:'grid',placeItems:'center',padding:12}}>
   <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 50% 55%,#00e5ff18,transparent 38%)',pointerEvents:'none'}}/>
   <div style={{pointerEvents:'auto',width:'min(360px,calc(100vw - 24px))',maxHeight:'min(620px,calc(100dvh - 24px))',position:'relative',filter:'drop-shadow(0 0 24px #4fe3ff88)'}}>
    <div aria-hidden style={{position:'absolute',inset:-8,border:'1px solid #6ef2ff99',borderRadius:22,boxShadow:'inset 0 0 30px #4fe3ff22,0 0 40px #4fe3ff33',pointerEvents:'none'}}/>
    <div aria-hidden style={{position:'absolute',left:'10%',right:'10%',bottom:-14,height:20,borderRadius:'50%',background:'#5ce9ff44',filter:'blur(7px)',pointerEvents:'none'}}/>
    <BennieChatbot onClose={()=>setShowBennie(false)}/>
   </div>
 </div>}
 <aside aria-label="StreetVerse control deck" style={{position:'absolute',right:10,top:'max(10px,env(safe-area-inset-top))',zIndex:30,width:'min(378px,calc(100vw - 20px))',maxHeight:'calc(100dvh - 20px)',overflowY:'auto',background:'linear-gradient(165deg,#04131cf5,#0b0718f2 62%,#051019f5)',border:'1px solid #4fe3ff66',borderRadius:20,padding:14,backdropFilter:'blur(16px)',boxShadow:'0 20px 70px #000c',fontFamily:'monospace',color:'#e8fbff'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}><div><div style={{fontSize:9,letterSpacing:2.4,color:'#69ebff',fontWeight:900}}>STREETVERSE • CONTROL DECK</div><div style={{fontSize:14,fontWeight:950,marginTop:4}}>{district}</div><div style={{display:'flex',alignItems:'center',gap:6,marginTop:6,fontSize:9,color:'#8fb6c3'}}><span aria-hidden style={{width:7,height:7,borderRadius:99,background:'#78ffb4',boxShadow:'0 0 10px #78ffb4'}}/> {assetStatus}</div></div><button aria-label="Minimize StreetVerse control deck" onClick={()=>setOpen(false)} style={{minWidth:44,minHeight:44,border:'1px solid #294553',borderRadius:12,background:'#07141ddd',color:'#a9c3cc',fontSize:19,cursor:'pointer'}}>×</button></header>
  <div style={{marginTop:12,padding:10,background:'#06141fcc',border:'1px solid #183849',borderRadius:14}}><div style={{display:'flex',justifyContent:'space-between',gap:8,fontSize:9}}><span style={{color:'#8ba9b5'}}>MISSION PROGRESS</span><b style={{color:'#aef5ff'}}>{visited}/{totalMissions} • {progress}%</b></div><div aria-label={`Mission progress ${progress}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} style={{height:7,marginTop:7,borderRadius:999,background:'#0e2732',overflow:'hidden'}}><div style={{height:'100%',width:`${progress}%`,background:'linear-gradient(90deg,#4fe3ff,#78ffb4)',boxShadow:'0 0 14px #4fe3ff99',transition:'width .25s ease'}}/></div></div>
  <nav aria-label="StreetVerse controls" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginTop:10}}><Tab label="PLAY" active={tab==='play'} onClick={()=>setTab('play')}/><Tab label="CREATE" active={tab==='create'} onClick={()=>setTab('create')}/><Tab label="SYSTEM" active={tab==='system'} onClick={()=>setTab('system')}/></nav>
  <section style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:9}}>{actions[tab].map(action=><Action key={action.label} {...action} onClick={()=>action.run?action.run():launch(action.names??[],action.label)}/>)}</section>
  <div role="status" aria-live="polite" style={{marginTop:10,minHeight:34,padding:'9px 10px',border:'1px solid #284655',borderRadius:11,background:'#050d14cc',fontSize:9,lineHeight:1.55,color:'#a7c2cc'}}>{status}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginTop:9}}><Metric label="WORLD" value="LIVE"/><Metric label="INPUT" value="VOLCANO"/><Metric label="MEMORY" value="ON"/><Metric label="A11Y" value="READY"/></div>
  <div style={{marginTop:9,fontSize:8.5,lineHeight:1.55,color:'#7195a4'}}>One control deck for play, creation and platform systems. Bennie is summonable instead of permanently covering the world. Real-money submission remains server-side and compliance-gated.</div>
 </aside></>
}
function Tab({label,active,onClick}:{label:string;active:boolean;onClick:()=>void}){return <button aria-pressed={active} onClick={onClick} style={{minHeight:42,border:active?'1px solid #5ce9ff88':'1px solid #203a47',borderRadius:11,background:active?'linear-gradient(180deg,#103044,#0b1b26)':'#07131b',color:active?'#d9fbff':'#7896a2',fontFamily:'monospace',fontSize:9,fontWeight:950,letterSpacing:1,cursor:'pointer'}}>{label}</button>}
function Metric({label,value}:{label:string;value:string}){return <div style={{background:'#071722bb',border:'1px solid #19384a',borderRadius:9,padding:'7px 5px',textAlign:'center'}}><div style={{fontSize:6.5,color:'#66899a'}}>{label}</div><div style={{fontSize:8.5,fontWeight:900,color:'#aef5ff',marginTop:3}}>{value}</div></div>}
function Action({label,icon,hint,accent,onClick}:{label:string;icon:string;hint:string;accent?:boolean;onClick:()=>void}){return <button onClick={onClick} style={{minHeight:76,textAlign:'left',background:accent?'linear-gradient(145deg,#0c3140,#102237)':'linear-gradient(145deg,#0b1c27,#08131c)',border:accent?'1px solid #5ce9ff88':'1px solid #294350',borderRadius:13,padding:'10px 9px',color:'#dffaff',fontFamily:'monospace',cursor:'pointer',boxShadow:accent?'inset 0 0 20px #4fe3ff10':'none'}}><span style={{display:'block',fontSize:17,lineHeight:1}}>{icon}</span><b style={{display:'block',fontSize:10,marginTop:7}}>{label}</b><span style={{display:'block',fontSize:7.5,lineHeight:1.35,color:'#7fa1af',marginTop:4}}>{hint}</span></button>}