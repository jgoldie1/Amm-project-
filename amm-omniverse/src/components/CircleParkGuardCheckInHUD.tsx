import {useEffect,useMemo,useState} from 'react'

type VisitRecord={
  visitorName:string
  visitingName:string
  unitLabel:string
  lastVisitAt:number
}

const MEMORY_KEY='tryamm.circle-park.guard-visitor-memory.v1'
const MEMORY_MAX_AGE=1000*60*60*24*7

const readMemory=():VisitRecord|null=>{
  try{
    const parsed=JSON.parse(localStorage.getItem(MEMORY_KEY)||'null') as VisitRecord|null
    if(!parsed?.visitorName||!Number.isFinite(parsed.lastVisitAt))return null
    if(Date.now()-parsed.lastVisitAt>MEMORY_MAX_AGE){localStorage.removeItem(MEMORY_KEY);return null}
    return parsed
  }catch{return null}
}

const speak=(text:string)=>{
  try{
    if(!('speechSynthesis'in window))return
    speechSynthesis.cancel()
    const utterance=new SpeechSynthesisUtterance(text)
    utterance.rate=.92
    utterance.pitch=.92
    utterance.volume=.85
    speechSynthesis.speak(utterance)
  }catch{}
}

export default function CircleParkGuardCheckInHUD(){
  const [open,setOpen]=useState(false)
  const [memory,setMemory]=useState<VisitRecord|null>(()=>readMemory())
  const [visitorName,setVisitorName]=useState('')
  const [visitingName,setVisitingName]=useState('')
  const [unitLabel,setUnitLabel]=useState('')
  const returning=useMemo(()=>Boolean(memory?.visitorName),[memory])

  useEffect(()=>{
    const onOpen=()=>{
      const saved=readMemory()
      setMemory(saved)
      if(saved){
        setVisitorName(saved.visitorName)
        setVisitingName(saved.visitingName)
        setUnitLabel(saved.unitLabel)
        const line=`Welcome back ${saved.visitorName}. Are you going to see ${saved.visitingName||'the same resident'} again?`
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{speaker:'Circle Park Security',text:line}}))
        speak(line)
      }else{
        const line="Good day. What's your name, who are you here to see, and which building or unit?"
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{speaker:'Circle Park Security',text:line}}))
        speak(line)
      }
      setOpen(true)
    }
    addEventListener('tryamm:circle-park-guard-checkin-open',onOpen)
    return()=>removeEventListener('tryamm:circle-park-guard-checkin-open',onOpen)
  },[])

  const finish=(useLast=false)=>{
    const record:VisitRecord=useLast&&memory?{...memory,lastVisitAt:Date.now()}:{
      visitorName:visitorName.trim().slice(0,60)||'Visitor',
      visitingName:visitingName.trim().slice(0,60)||'Resident',
      unitLabel:unitLabel.trim().slice(0,32)||'Building / unit not listed',
      lastVisitAt:Date.now(),
    }
    try{localStorage.setItem(MEMORY_KEY,JSON.stringify(record))}catch{}
    setMemory(record)
    setOpen(false)
    const line=`Okay ${record.visitorName}. You're signed in to visit ${record.visitingName}. Have a good visit.`
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{speaker:'Circle Park Security',text:line}}))
    window.dispatchEvent(new CustomEvent('tryamm:circle-park-guard-checkin-complete',{detail:{
      visitorName:record.visitorName,
      visitingName:record.visitingName,
      unitLabel:record.unitLabel,
      remembered:true,
      source:'circle-park-guard-checkin',
    }}))
    speak(line)
  }

  if(!open)return null
  return <div role="dialog" aria-modal="true" aria-label="Circle Park security check in" style={{position:'fixed',inset:0,zIndex:47050,display:'grid',placeItems:'center',padding:14,background:'rgba(2,7,12,.78)',backdropFilter:'blur(5px)'}}>
    <section style={{width:'min(94vw,520px)',maxHeight:'86dvh',overflowY:'auto',borderRadius:20,border:'1px solid #6de9ff77',background:'#07141df7',color:'#fff',padding:16,fontFamily:'system-ui',boxShadow:'0 24px 80px #000d'}}>
      <div style={{fontSize:10,letterSpacing:2,color:'#80e8ff',fontWeight:950}}>CIRCLE PARK • SECURITY DESK</div>
      <h2 style={{margin:'6px 0 4px'}}>Visitor Check-In</h2>
      <p style={{margin:'0 0 12px',fontSize:12,color:'#bdd0db',lineHeight:1.5}}>The guard can remember your in-game visit for up to 7 days so returning visitors do not have to re-enter everything. No real gate codes or real security schedules are stored.</p>
      {returning&&<button onClick={()=>finish(true)} style={primaryButton}>WELCOME BACK • USE LAST VISIT</button>}
      <label style={labelStyle}>YOUR NAME<input value={visitorName} onChange={e=>setVisitorName(e.target.value)} inputMode="text" autoComplete="name" style={inputStyle}/></label>
      <label style={labelStyle}>WHO ARE YOU GOING TO SEE?<input value={visitingName} onChange={e=>setVisitingName(e.target.value)} inputMode="text" style={inputStyle}/></label>
      <label style={labelStyle}>BUILDING / UNIT<input value={unitLabel} onChange={e=>setUnitLabel(e.target.value)} inputMode="text" placeholder="Game building or unit" style={inputStyle}/></label>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:12}}>
        <button onClick={()=>setOpen(false)} style={secondaryButton}>CANCEL</button>
        <button onClick={()=>finish(false)} style={primaryButton}>SIGN IN</button>
      </div>
      <small style={{display:'block',marginTop:10,color:'#81949f'}}>Large one-hand controls • keyboard dictation works when available on the device.</small>
    </section>
  </div>
}

const inputStyle:React.CSSProperties={width:'100%',minHeight:48,boxSizing:'border-box',marginTop:5,borderRadius:12,border:'1px solid #31596c',background:'#0b202b',color:'#fff',padding:'10px 12px',fontSize:16}
const labelStyle:React.CSSProperties={display:'block',marginTop:10,fontSize:10,fontWeight:950,letterSpacing:.6,color:'#bfefff'}
const primaryButton:React.CSSProperties={minHeight:52,borderRadius:12,border:'1px solid #72f0c0',background:'#0d3029',color:'#e8fff5',fontWeight:950,padding:'10px 12px',touchAction:'manipulation'}
const secondaryButton:React.CSSProperties={...primaryButton,border:'1px solid #526777',background:'#13202a'}
