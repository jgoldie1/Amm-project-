import {useEffect,useMemo,useState} from 'react'
import {
 beginHoloArenaBattle,beginHoloArenaReturn,buildStreetVerseReturnUrl,
 finishHoloArenaBattle,loadHoloArenaSession,type HoloArenaSession,
} from '../game/holographic/HoloArenaManager'

const buttonStyle={minHeight:48,border:'1px solid #35ffe1',borderRadius:12,background:'rgba(0,18,28,.88)',color:'#eaffff',fontWeight:800,padding:'10px 14px'} as const

export default function HoloArenaWorld({onClose}:{onClose:()=>void}){
 const initial=useMemo(()=>loadHoloArenaSession(),[])
 const [session,setSession]=useState<HoloArenaSession|null>(initial)
 const [playerHP,setPlayerHP]=useState(100)
 const [opponentHP,setOpponentHP]=useState(100)
 const [stamina,setStamina]=useState(100)
 const [guard,setGuard]=useState(false)
 const [message,setMessage]=useState('HOLO ARENA LINK ESTABLISHED')

 useEffect(()=>{
  if(!session)return
  if(session.phase==='teleporting-in'){
   const next=beginHoloArenaBattle(session);setSession(next);setMessage('TELEPORT COMPLETE — BATTLE READY')
  }
 },[session])

 const finish=(result:'victory'|'defeat'|'retreat')=>{
  if(!session)return
  const next=finishHoloArenaBattle(session,result);setSession(next)
  setMessage(result==='victory'?'HOLO VICTORY — RETURN PORTAL OPEN':result==='retreat'?'RETREAT ACCEPTED — RETURN PORTAL OPEN':'MATCH COMPLETE — RETURN PORTAL OPEN')
 }

 const attack=(power:number,cost:number,label:string)=>{
  if(!session||session.phase!=='battle'||stamina<cost)return
  const next=Math.max(0,opponentHP-power)
  setOpponentHP(next);setStamina(v=>Math.max(0,v-cost));setGuard(false);setMessage(label)
  if(next===0){finish('victory');return}
  window.setTimeout(()=>{
   const hit=guard?4:9
   setPlayerHP(v=>{const hp=Math.max(0,v-hit);if(hp===0)finish('defeat');return hp})
   setStamina(v=>Math.min(100,v+12))
  },260)
 }

 const returnToStreetVerse=()=>{
  if(!session)return onClose()
  const next=beginHoloArenaReturn(session)
  window.location.assign(buildStreetVerseReturnUrl(next.checkpoint))
 }

 if(!session)return <div style={{position:'fixed',inset:0,zIndex:9999,background:'#02060a',color:'white',display:'grid',placeItems:'center',padding:24}}><div><h2>HOLO ARENA</h2><p>No active teleport session.</p><button style={buttonStyle} onClick={onClose}>RETURN</button></div></div>

 return <div style={{position:'fixed',inset:0,zIndex:9999,overflow:'hidden',background:'radial-gradient(circle at 50% 40%,#10334a 0%,#07131f 38%,#02050a 76%)',color:'white',fontFamily:'system-ui'}}>
  <div aria-hidden style={{position:'absolute',left:'8%',right:'8%',top:'24%',bottom:'18%',border:'2px solid #35ffe1',borderRadius:'50%',boxShadow:'0 0 28px #35ffe1, inset 0 0 48px rgba(53,255,225,.22)'}}/>
  <div aria-hidden style={{position:'absolute',left:'20%',right:'20%',top:'33%',bottom:'27%',border:'1px solid #b66cff',borderRadius:'50%',boxShadow:'0 0 32px #b66cff'}}/>
  <header style={{position:'relative',padding:'max(16px,env(safe-area-inset-top)) 16px 8px',textAlign:'center'}}>
   <div style={{fontSize:12,letterSpacing:3,color:'#35ffe1'}}>STREETVERSE GLOBAL</div><h1 style={{margin:'4px 0'}}>HOLO ARENA</h1>
   <div style={{fontSize:13}}>{session.mode.toUpperCase()} • {message}</div>
  </header>
  <main style={{position:'relative',height:'55%',display:'grid',gridTemplateColumns:'1fr 1fr',alignItems:'center',textAlign:'center',padding:16}}>
   <section><div style={{fontSize:44}}>◈</div><strong>PLAYER</strong><div>HP {playerHP}</div><div>STAMINA {stamina}</div></section>
   <section><div style={{fontSize:44}}>⬡</div><strong>HOLO OPPONENT</strong><div>HP {opponentHP}</div></section>
  </main>
  <div style={{position:'absolute',left:12,right:12,bottom:'max(14px,env(safe-area-inset-bottom))',display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
   {session.phase==='battle'?<>
    <button style={buttonStyle} onClick={()=>attack(12,10,'QUICK STRIKE')}>QUICK STRIKE</button>
    <button style={buttonStyle} onClick={()=>attack(22,24,'HOLO BURST')}>HOLO BURST</button>
    <button style={buttonStyle} onClick={()=>{setGuard(true);setStamina(v=>Math.min(100,v+8));setMessage('GUARD ACTIVE')}}>BLOCK / CHARGE</button>
    <button style={buttonStyle} onClick={()=>finish('retreat')}>RETREAT</button>
   </>:<button style={{...buttonStyle,gridColumn:'1 / -1'}} onClick={returnToStreetVerse}>TELEPORT BACK TO STREETVERSE</button>}
  </div>
 </div>
}
