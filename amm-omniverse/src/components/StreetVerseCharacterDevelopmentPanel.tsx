import {useEffect,useMemo,useState} from 'react'
import {BJ_STUBBS_DNA} from '../data/streetVerseBJStubbsCharacter'
import {createCharacterDevelopmentState,STREETVERSE_CHARACTER_LEVEL_XP,type StreetVerseCharacterDevelopmentState} from '../runtime/StreetVerseCharacterDevelopmentRuntime'

export default function StreetVerseCharacterDevelopmentPanel({onClose}:{onClose:()=>void}){
 const [state,setState]=useState<StreetVerseCharacterDevelopmentState>(()=>createCharacterDevelopmentState(BJ_STUBBS_DNA.id))
 useEffect(()=>{
  const onUpdate=(e:Event)=>{const d=(e as CustomEvent<StreetVerseCharacterDevelopmentState>).detail;if(d?.characterId===BJ_STUBBS_DNA.id)setState(d)}
  window.addEventListener('tryamm:character-development-updated',onUpdate)
  window.dispatchEvent(new CustomEvent('tryamm:character-development-status-request',{detail:{characterId:BJ_STUBBS_DNA.id}}))
  return()=>window.removeEventListener('tryamm:character-development-updated',onUpdate)
 },[])
 const nextXp=STREETVERSE_CHARACTER_LEVEL_XP(state.level+1)
 const prevXp=STREETVERSE_CHARACTER_LEVEL_XP(state.level)
 const pct=Math.max(0,Math.min(100,Math.round(((state.xp-prevXp)/Math.max(1,nextXp-prevXp))*100)))
 const skills=useMemo(()=>BJ_STUBBS_DNA.progression.skillTracks.map(skill=>({skill,xp:Number(state.skillXp[skill]||0)})),[state])
 return <section aria-label="BJ Stubbs character development" style={{position:'fixed',inset:0,zIndex:49200,overflow:'auto',padding:'max(14px,env(safe-area-inset-top)) 14px max(28px,env(safe-area-inset-bottom))',background:'linear-gradient(180deg,#080d12,#10151d 55%,#04070a)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}>
   <div><small style={{fontWeight:950,color:'#d7b45f',letterSpacing:2}}>STREETVERSE • CHARACTER DNA V1</small><h1 style={{margin:'4px 0'}}>{BJ_STUBBS_DNA.displayName}</h1><div style={{fontSize:11,color:'#9fb2c1'}}>{BJ_STUBBS_DNA.role} • identity continuity locked</div></div>
   <button onClick={onClose} aria-label="Close character development" style={{width:48,height:48,borderRadius:24,border:'1px solid #465564',background:'#101923',color:'#fff',fontSize:24}}>×</button>
  </header>
  <section style={{marginTop:14,padding:14,borderRadius:16,border:'1px solid #3e4c57',background:'#0a1219'}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}><strong>LEVEL {state.level}</strong><small>{state.xp} XP • SERVER AUTHORITY</small></div>
   <div style={{height:12,marginTop:8,borderRadius:99,background:'#1b2730',overflow:'hidden'}}><div style={{height:'100%',width:pct+'%',background:'linear-gradient(90deg,#d6a84a,#f3d37d)'}}/></div>
   <small style={{display:'block',marginTop:5,color:'#91a5b4'}}>{pct}% to Level {state.level+1}</small>
  </section>
  <section style={{marginTop:12,padding:14,borderRadius:16,border:'1px solid #344957',background:'#08131b'}}>
   <h2 style={{marginTop:0}}>Skill Development</h2>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
    {skills.map(({skill,xp})=><div key={skill} style={{padding:10,borderRadius:12,border:'1px solid #2f4553',background:'#0b1922'}}><strong>{skill}</strong><small style={{display:'block',marginTop:3,color:'#8fefff'}}>{xp} skill XP</small></div>)}
   </div>
  </section>
  <section style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:12}}>
   <article style={{padding:12,borderRadius:14,border:'1px solid #354652',background:'#09141c'}}><strong>ERAS</strong>{state.unlockedEras.map(x=><small key={x} style={{display:'block',marginTop:5}}>✓ {x}</small>)}</article>
   <article style={{padding:12,borderRadius:14,border:'1px solid #354652',background:'#09141c'}}><strong>OUTFITS</strong>{state.unlockedOutfits.map(x=><small key={x} style={{display:'block',marginTop:5}}>✓ {x}</small>)}</article>
  </section>
  <section style={{marginTop:12,padding:12,borderRadius:14,border:'1px solid #51472f',background:'#171308'}}>
   <strong>CHARACTER FACTORY READY</strong>
   <p style={{fontSize:12,lineHeight:1.5,color:'#d0c8b5'}}>BJ is the master template. New characters inherit the same rig, animation slots, progression system, era handling and photo-match upgrade path, while their face/body/hair/wardrobe DNA stays person-specific.</p>
  </section>
 </section>
}
