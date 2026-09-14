import {useEffect,useMemo,useState} from 'react'
import {
  AFTER_DARK_ALPHA_MISSION,
  AFTER_DARK_EVIDENCE,
  AFTER_DARK_FICTIONAL_CAST,
  chooseAfterDarkApproach,
  collectAfterDarkEvidence,
  completeAfterDarkAlphaMission,
  loadAfterDarkMissionState,
  protectAfterDarkWitness,
  resetAfterDarkAlphaMission,
  verifyAfterDarkAgeAndConsent,
  type AfterDarkApproach,
  type AfterDarkMissionState,
} from '../runtime/StreetVerseAfterDarkAlphaRuntime'

const buttonStyle={border:'1px solid #6d596f',borderRadius:12,background:'#15101b',color:'#fff',padding:'10px 12px',fontWeight:800,cursor:'pointer'} as const

export default function StreetVerseAfterDarkAlpha(){
  const [open,setOpen]=useState(false)
  const [state,setState]=useState<AfterDarkMissionState>(()=>loadAfterDarkMissionState())
  const [result,setResult]=useState<string>('')
  const evidence=useMemo(()=>AFTER_DARK_EVIDENCE.filter(item=>state.evidenceIds.includes(item.id)),[state.evidenceIds])

  useEffect(()=>{
    const sync=(event:Event)=>{
      const detail=(event as CustomEvent<AfterDarkMissionState>).detail
      if(detail?.missionId==='after-dark-white-night-file')setState(detail)
    }
    const openMission=()=>setOpen(true)
    window.addEventListener('tryamm:after-dark-state',sync)
    window.addEventListener('tryamm:open-after-dark-alpha',openMission)
    return()=>{
      window.removeEventListener('tryamm:after-dark-state',sync)
      window.removeEventListener('tryamm:open-after-dark-alpha',openMission)
    }
  },[])

  const choose=(approach:AfterDarkApproach)=>{
    setState(chooseAfterDarkApproach(approach))
    setResult('')
  }
  const collect=(id:string)=>setState(collectAfterDarkEvidence(id))
  const protect=()=>setState(protectAfterDarkWitness())
  const complete=()=>{
    const validation=completeAfterDarkAlphaMission()
    setState(loadAfterDarkMissionState())
    setResult(validation.accepted
      ? `Mission complete: +${validation.xp} XP, +${validation.softCurrency} credits, Evidence Before Accusation unlocked.`
      : 'Mission objectives incomplete. Collect at least 3 fictional evidence items, protect Maya Cross, and avoid unsupported accusations.')
  }

  return <>
    <button type="button" aria-label="Open After Dark Alpha mission" onClick={()=>setOpen(true)} style={{position:'fixed',left:12,bottom:118,zIndex:9010,border:'1px solid #d58cff88',borderRadius:999,background:'linear-gradient(135deg,#24102d,#11101d)',color:'#f6d9ff',padding:'10px 14px',fontFamily:'monospace',fontSize:10,fontWeight:950,cursor:'pointer',boxShadow:'0 8px 28px #0009'}}>🌙 AFTER DARK α</button>

    {open&&<div role="dialog" aria-modal="true" aria-label="After Dark Alpha Mission" style={{position:'fixed',inset:0,zIndex:12000,background:'#030207ee',display:'grid',placeItems:'center',padding:14}}>
      <div style={{width:'min(96vw,760px)',maxHeight:'90dvh',overflowY:'auto',background:'linear-gradient(160deg,#100b16,#07070c)',border:'1px solid #8c62a2',borderRadius:22,padding:18,color:'#fff',boxShadow:'0 28px 90px #000'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start'}}>
          <div><div style={{fontSize:10,letterSpacing:3,color:'#d58cff',fontWeight:950}}>STREETVERSE • OMNIVERSE • ALPHA</div><h2 style={{margin:'6px 0'}}>{AFTER_DARK_ALPHA_MISSION.title}</h2><div style={{fontSize:12,color:'#b9abc0'}}>21+ fictional investigation mission • evidence-first • branching paths • persistent rewards</div></div>
          <button aria-label="Close After Dark mission" onClick={()=>setOpen(false)} style={{...buttonStyle,width:38,height:38,padding:0,borderRadius:'50%'}}>×</button>
        </div>

        {!state.ageVerified&&<section style={{marginTop:18,padding:16,border:'1px solid #402d49',borderRadius:16,background:'#0c0910'}}>
          <h3 style={{marginTop:0}}>21+ gate & consent</h3>
          <p style={{fontSize:13,lineHeight:1.6,color:'#c8bbc9'}}>This alpha mission contains mature nightlife themes but no explicit sexual gameplay. The investigation is fictional. Public-event attendance never implies wrongdoing.</p>
          <button style={buttonStyle} onClick={()=>setState(verifyAfterDarkAgeAndConsent(true,true))}>I am 21+ and enter the fictional mission</button>
        </section>}

        {state.ageVerified&&!state.approach&&<section style={{marginTop:18}}>
          <h3>Choose your approach</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}>
            {(['spy','detective','social','rescue'] as AfterDarkApproach[]).map(approach=><button key={approach} style={buttonStyle} onClick={()=>choose(approach)}>{approach.toUpperCase()}</button>)}
          </div>
        </section>}

        {state.approach&&<>
          <section style={{marginTop:18,padding:14,border:'1px solid #35293c',borderRadius:16}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><strong>Mission stage: {state.stage}</strong><span style={{color:'#d58cff'}}>Approach: {state.approach}</span></div>
            <p style={{fontSize:13,lineHeight:1.6,color:'#c7bacb'}}>Benny sends you into a fictional elite-event investigation. Observe the public layer, follow Cipher's fictional tip, protect Maya Cross, and build an evidence chain against fictional target Darius Vale. No named real attendee is a suspect.</p>
          </section>

          <section style={{marginTop:18}}>
            <h3>Evidence board {state.evidenceIds.length}/{AFTER_DARK_EVIDENCE.length}</h3>
            <div style={{display:'grid',gap:8}}>{AFTER_DARK_EVIDENCE.map(item=><button key={item.id} disabled={state.evidenceIds.includes(item.id)} onClick={()=>collect(item.id)} style={{...buttonStyle,textAlign:'left',opacity:state.evidenceIds.includes(item.id)?.55:1}}><div>{state.evidenceIds.includes(item.id)?'✓ ':'＋ '}{item.label}</div><small style={{color:'#a697aa'}}>FICTIONAL • {item.class.replaceAll('_',' ')}</small></button>)}</div>
          </section>

          <section style={{marginTop:18,padding:14,border:'1px solid #35293c',borderRadius:16}}>
            <h3 style={{marginTop:0}}>Protected witness</h3>
            <p style={{fontSize:13,color:'#c7bacb'}}>Maya Cross is a fictional event coordinator. Escort her to the safe extraction point.</p>
            <button style={buttonStyle} disabled={state.protectedWitness} onClick={protect}>{state.protectedWitness?'✓ MAYA PROTECTED':'PROTECT MAYA & EXTRACT'}</button>
          </section>

          <section style={{marginTop:18,padding:14,border:'1px solid #35293c',borderRadius:16}}>
            <h3 style={{marginTop:0}}>Mission cast</h3>
            <div style={{display:'flex',flexWrap:'wrap',gap:7}}>{AFTER_DARK_FICTIONAL_CAST.map(person=><span key={person.id} style={{padding:'6px 8px',background:'#17101d',borderRadius:999,fontSize:11}}>{person.name}</span>)}</div>
          </section>

          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:18}}>
            <button style={{...buttonStyle,background:'#291033',borderColor:'#c376e8'}} onClick={complete}>VALIDATE & COMPLETE MISSION</button>
            <button style={buttonStyle} onClick={()=>{setState(resetAfterDarkAlphaMission());setResult('')}}>RESET ALPHA RUN</button>
          </div>
          {result&&<div role="status" style={{marginTop:12,padding:12,borderRadius:12,background:'#100f18',color:result.startsWith('Mission complete')?'#8dffb7':'#ffd184',fontSize:12,lineHeight:1.5}}>{result}</div>}
          {evidence.length>0&&<div style={{marginTop:12,fontSize:10,color:'#8f8494'}}>Chain of custody maintained for {evidence.length} fictional evidence item{evidence.length===1?'':'s'}.</div>}
        </>}

        <div style={{marginTop:18,paddingTop:12,borderTop:'1px solid #2b2230',fontSize:10,lineHeight:1.5,color:'#837589'}}>ALPHA safeguard: real-person public-event cameos are disabled by default until independently sourced and content-reviewed. The playable wrongdoing, evidence and suspects remain fictional.</div>
      </div>
    </div>}
  </>
}
