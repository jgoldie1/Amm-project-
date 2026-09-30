import {useEffect,useMemo,useState} from 'react'
import {BJ_STUBBS_DNA} from '../data/streetVerseBJStubbsCharacter'
import {createCharacterDevelopmentState,STREETVERSE_CHARACTER_LEVEL_XP,type StreetVerseCharacterDevelopmentState} from '../runtime/StreetVerseCharacterDevelopmentRuntime'
import {STREETVERSE_FACIAL_EXPRESSIONS,requestStreetVerseExpression,type StreetVerseExpressionId} from '../data/streetVerseFacialExpressions'

export default function StreetVerseCharacterDevelopmentPanel({onClose}:{onClose:()=>void}){
 const [state,setState]=useState<StreetVerseCharacterDevelopmentState>(()=>createCharacterDevelopmentState(BJ_STUBBS_DNA.id))
 const [activeExpression,setActiveExpression]=useState<StreetVerseExpressionId>('neutral')
 useEffect(()=>{
  const onUpdate=(e:Event)=>{const d=(e as CustomEvent<StreetVerseCharacterDevelopmentState>).detail;if(d?.characterId===BJ_STUBBS_DNA.id)setState(d)}
  const onExpressionState=(e:Event)=>{const d=(e as CustomEvent<{characterId?:string;expression?:StreetVerseExpressionId}>).detail||{};if(d.characterId===BJ_STUBBS_DNA.id&&d.expression)setActiveExpression(d.expression)}
  window.addEventListener('tryamm:character-development-updated',onUpdate)
  window.addEventListener('tryamm:character-expression-state',onExpressionState)
  window.dispatchEvent(new CustomEvent('tryamm:character-development-status-request',{detail:{characterId:BJ_STUBBS_DNA.id}}))
  return()=>{window.removeEventListener('tryamm:character-development-updated',onUpdate);window.removeEventListener('tryamm:character-expression-state',onExpressionState)}
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
  <section style={{marginTop:12,padding:14,borderRadius:16,border:'1px solid #493f65',background:'#100d18'}}>
   <h2 style={{marginTop:0}}>Facial Expression Test</h2>
   <p style={{fontSize:11,color:'#aeb7c5'}}>Tap an expression to preview BJ V5. The same presets work with the procedural head now and the photo-matched head later.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
    {STREETVERSE_FACIAL_EXPRESSIONS.filter(x=>['neutral','warm-smile','serious','focused','concerned','skeptical','surprised','angry','laughing','proud'].includes(x.id)).map(expression=><button key={expression.id} onClick={()=>{setActiveExpression(expression.id);requestStreetVerseExpression({characterId:BJ_STUBBS_DNA.id,expression:expression.id,source:'character-development-panel'})}} style={{minHeight:46,borderRadius:12,border:activeExpression===expression.id?'2px solid #d9a7ff':'1px solid #4b4162',background:activeExpression===expression.id?'#281d38':'#171121',color:'#fff',fontWeight:900,textAlign:'left',padding:'8px 10px'}}>{expression.label}</button>)}
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
