import {useEffect,useRef,useState} from 'react'
import {STREETVERSE_CHICAGO_MARTIAL_STYLES,type StreetVerseMartialStyleId} from '../config/streetverseChicagoMartialArtsStyles'

type Hand='left'|'right'
type Cue='OPENING'|'ATTACK'|'FEINT'
type Action='STRIKE'|'GUARD'|'EVADE'

const scoreFor=(cue:Cue,action:Action)=>{
  if(cue==='OPENING'&&action==='STRIKE')return 2
  if(cue==='ATTACK'&&action==='GUARD')return 2
  if(cue==='FEINT'&&action==='EVADE')return 2
  if(cue==='ATTACK'&&action==='EVADE')return 1
  if(cue==='OPENING'&&action==='EVADE')return 0
  return -1
}

export default function StreetVerseChronoDojoArena(){
  const [open,setOpen]=useState(false)
  const [hand,setHand]=useState<Hand>(()=>localStorage.getItem('tryamm.dojo.hand')==='left'?'left':'right')
  const [cue,setCue]=useState<Cue>('OPENING')
  const [score,setScore]=useState(0)
  const [discipline,setDiscipline]=useState(100)
  const [round,setRound]=useState(1)
  const [message,setMessage]=useState('Read the cue. Win with timing, defense and discipline.')
  const timer=useRef<number|undefined>()

  useEffect(()=>{
    const launch=(event:Event)=>{
      const d=(event as CustomEvent<any>).detail||{}
      if(d.campaignId==='chicago-dojo-wars'&&d.choice==='A'){
        setScore(0);setDiscipline(100);setRound(1);setCue('OPENING')
        setMessage('Historical-simulation sparring prototype. Nonlethal points only.')
        setOpen(true)
      }
    }
    window.addEventListener('tryamm:history-route-selected',launch)
    return()=>window.removeEventListener('tryamm:history-route-selected',launch)
  },[])

  useEffect(()=>{
    if(!open)return
    window.clearInterval(timer.current)
    timer.current=window.setInterval(()=>{
      const cues:Cue[]=['OPENING','ATTACK','FEINT']
      setCue(cues[Math.floor(Math.random()*cues.length)])
      setRound(r=>r+1)
    },1400)
    return()=>window.clearInterval(timer.current)
  },[open])

  const act=(action:Action)=>{
    const styleId=((localStorage.getItem('tryamm.streetverse.martial-style.v1') as StreetVerseMartialStyleId)||'neutral-dojo')
    const style=STREETVERSE_CHICAGO_MARTIAL_STYLES[styleId]||STREETVERSE_CHICAGO_MARTIAL_STYLES['neutral-dojo']
    const mapped=action==='STRIKE'?'BURST':action==='GUARD'?'GUARD':'STEP'
    const bias=Number(style.actionBias[mapped]||1)
    const base=scoreFor(cue,action)
    const delta=base>0&&bias>=1.25?base+1:base
    const nextScore=Math.max(0,score+delta)
    const nextDiscipline=Math.max(0,Math.min(100,discipline+(delta>0?2:-5)))
    setScore(nextScore);setDiscipline(nextDiscipline)
    setMessage(delta===2?'Perfect read • +2':delta===1?'Safe response • +1':delta===0?'Neutral reset':'Mistimed • discipline -5')
    window.dispatchEvent(new CustomEvent('tryamm:dojo-sparring-action',{detail:{cue,action,delta,score:nextScore,discipline:nextDiscipline,round,styleId,style:style.label,bias}}))
    if(nextScore>=12){
      window.clearInterval(timer.current)
      window.dispatchEvent(new CustomEvent('tryamm:dojo-training-completed',{detail:{score:nextScore,discipline:nextDiscipline,rounds:round,mode:'nonlethal-historical-simulation'}}))
      window.dispatchEvent(new CustomEvent('tryamm:easter-egg-found',{detail:{id:'dojo-discipline',name:'Dragon Discipline',era:'1970'}}))
      setMessage('DOJO CHALLENGE COMPLETE • Dragon Discipline discovered.')
    }
  }

  if(!open)return null
  const side=hand==='right'?{right:14}:{left:14}
  return <div role="dialog" aria-label="Chicago Dojo Wars training simulation" style={{position:'fixed',inset:0,zIndex:17400,background:'#020306f5',color:'#fff'}}>
    <div style={{maxWidth:760,margin:'0 auto',padding:'18px 16px 120px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12}}>
        <div><div style={{fontSize:10,letterSpacing:2.5,color:'#e8b944',fontWeight:950}}>TIME MACHINE • 1970 CHICAGO</div><h1 style={{margin:'6px 0'}}>Dojo Wars • Sparring Reconstruction</h1><div style={{fontSize:12,opacity:.68}}>Nonlethal gameplay simulation. Historical facts, recollections and legend remain separately labeled.</div></div>
        <button onClick={()=>setOpen(false)} aria-label="Close Dojo Wars training" style={{width:48,height:48,borderRadius:14}}>×</button>
      </header>
      <section style={{marginTop:22,padding:18,border:'1px solid #35515d',borderRadius:20,background:'#08121a'}}>
        <div style={{fontSize:11,opacity:.66}}>ROUND {round}</div>
        <div aria-live="polite" style={{fontSize:'clamp(34px,8vw,68px)',fontWeight:1000,margin:'18px 0',textAlign:'center'}}>{cue}</div>
        <div style={{textAlign:'center',fontSize:11,opacity:.68,marginTop:-10,marginBottom:12}}>ACTIVE STYLE • {STREETVERSE_CHICAGO_MARTIAL_STYLES[((localStorage.getItem('tryamm.streetverse.martial-style.v1') as StreetVerseMartialStyleId)||'neutral-dojo')]?.label||'Chicago Dojo • Balanced'}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <div style={{padding:12,border:'1px solid #263d49',borderRadius:14}}>POINTS<br/><b style={{fontSize:28}}>{score}</b> / 12</div>
          <div style={{padding:12,border:'1px solid #263d49',borderRadius:14}}>DISCIPLINE<br/><b style={{fontSize:28}}>{discipline}%</b></div>
        </div>
        <div style={{marginTop:12,minHeight:44,padding:12,borderRadius:12,background:'#04090e'}}>{message}</div>
      </section>
    </div>
    <div style={{position:'fixed',...side,bottom:18,zIndex:17410,display:'grid',gap:8,width:'min(280px,76vw)'}}>
      {(['STRIKE','GUARD','EVADE'] as Action[]).map(action=><button key={action} onClick={()=>act(action)} style={{minHeight:64,borderRadius:16,border:'1px solid #4fe3ff77',background:'#0a1c26',color:'#fff',fontSize:18,fontWeight:1000,touchAction:'manipulation'}}>{action}</button>)}
      <button onClick={()=>{const next=hand==='right'?'left':'right';setHand(next);localStorage.setItem('tryamm.dojo.hand',next)}} style={{minHeight:52,borderRadius:14,border:'1px solid #e8b94477',background:'#211907',color:'#ffe49b',fontWeight:950}}>MOVE CONTROLS TO {hand==='right'?'LEFT':'RIGHT'}</button>
    </div>
  </div>
}
