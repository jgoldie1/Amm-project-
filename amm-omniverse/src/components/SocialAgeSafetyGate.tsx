import {useEffect,useMemo,useState} from 'react'

export type SocialIntent='live'|'pk'
export type AudienceBand='under-12'|'age-12'|'teen'|'adult'
export type SocialSafetyDecision={band:AudienceBand;youthViewerOnly:boolean}

const PROFILE_KEY='tryamm.audience.profile.v1'
const SAFETY_ACK_KEY='tryamm.audience.social-safety.v1'

function calculateAge(value:string,now=new Date()){
  const birth=new Date(value+'T12:00:00')
  if(Number.isNaN(birth.getTime()))return -1
  let age=now.getFullYear()-birth.getFullYear()
  const month=now.getMonth()-birth.getMonth()
  if(month<0||(month===0&&now.getDate()<birth.getDate()))age-=1
  return age
}

export function bandForAge(age:number):AudienceBand{
  if(age<12)return 'under-12'
  if(age===12)return 'age-12'
  if(age<18)return 'teen'
  return 'adult'
}

function readStoredBand():AudienceBand|null{
  try{
    const parsed=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')
    const band=String(parsed?.band||'')
    return ['under-12','age-12','teen','adult'].includes(band)?band as AudienceBand:null
  }catch{return null}
}

function saveBand(band:AudienceBand){
  try{localStorage.setItem(PROFILE_KEY,JSON.stringify({band,evaluatedAt:new Date().toISOString(),retained:'age-band-only'}))}catch{}
}

function readAck(band:AudienceBand,intent:SocialIntent){
  try{
    const parsed=JSON.parse(localStorage.getItem(SAFETY_ACK_KEY)||'{}')
    return Boolean(parsed?.[band]?.[intent])
  }catch{return false}
}

function saveAck(band:AudienceBand,intent:SocialIntent){
  try{
    const parsed=JSON.parse(localStorage.getItem(SAFETY_ACK_KEY)||'{}')
    parsed[band]={...(parsed[band]||{}),[intent]:new Date().toISOString()}
    localStorage.setItem(SAFETY_ACK_KEY,JSON.stringify(parsed))
  }catch{}
}

export default function SocialAgeSafetyGate({open,intent,onAllow,onClose}:{open:boolean;intent:SocialIntent;onAllow:(decision:SocialSafetyDecision)=>void;onClose:()=>void}){
  const [band,setBand]=useState<AudienceBand|null>(()=>typeof localStorage==='undefined'?null:readStoredBand())
  const [birthDate,setBirthDate]=useState('')
  const [error,setError]=useState('')
  const [confirmed,setConfirmed]=useState(false)

  useEffect(()=>{
    if(!open)return
    const stored=readStoredBand()
    setBand(stored)
    setConfirmed(stored?readAck(stored,intent):false)
    setError('')
  },[open,intent])

  const copy=useMemo(()=>intent==='pk'?{
    title:'Holographic PK safety check',
    body:'PK uses live social video, audio and interactive effects.'
  }:{
    title:'TRYAMM LIVE safety check',
    body:'LIVE can use camera, microphone and realtime social features.'
  },[intent])

  if(!open)return null

  const submitBirthDate=()=>{
    const age=calculateAge(birthDate)
    if(age<0||age>120){setError('Enter a valid date of birth.');return}
    const next=bandForAge(age)
    saveBand(next)
    setBand(next)
    setConfirmed(readAck(next,intent))
    setError('')
  }

  const continueSafe=()=>{
    if(!band||band==='under-12')return
    saveAck(band,intent)
    const youthViewerOnly=band==='age-12'
    onAllow({band,youthViewerOnly})
  }

  const resetAge=()=>{
    try{localStorage.removeItem(PROFILE_KEY);localStorage.removeItem(SAFETY_ACK_KEY)}catch{}
    setBand(null);setBirthDate('');setConfirmed(false);setError('')
  }

  return <div role="dialog" aria-modal="true" aria-label={copy.title} style={{position:'fixed',inset:0,zIndex:24050,display:'grid',placeItems:'center',padding:18,background:'#02040bea',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
    <section style={{width:'min(92vw,520px)',border:'1px solid #4fe3ff88',borderRadius:22,background:'#07111df7',padding:20,boxShadow:'0 24px 80px #000d'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start'}}>
        <div><div style={{fontSize:10,letterSpacing:2.2,color:'#4fe3ff',fontWeight:950}}>TRYAMM • 12+ RELEASE SAFETY</div><h2 style={{margin:'7px 0 5px'}}>{copy.title}</h2><p style={{margin:0,opacity:.78,lineHeight:1.45,fontSize:13}}>{copy.body}</p></div>
        <button aria-label="Close social safety check" onClick={onClose} style={smallButton}>×</button>
      </div>

      {!band&&<div style={{marginTop:18}}>
        <label style={{display:'grid',gap:7,fontSize:13,fontWeight:800}}>Date of birth
          <input aria-label="Date of birth" type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} style={field}/>
        </label>
        <p style={note}>TRYAMM stores only a coarse age band for this gate, not the birth date you enter here.</p>
        <button disabled={!birthDate} onClick={submitBirthDate} style={primary}>Continue</button>
        {error&&<div role="alert" style={alert}>{error}</div>}
      </div>}

      {band==='under-12'&&<div style={{marginTop:18}}>
        <div style={alert}>This release is designed for ages 12 and up. LIVE/PK social features are not available for this age band.</div>
        <button onClick={resetAge} style={smallButton}>Correct date of birth</button>
      </div>}

      {band==='age-12'&&<div style={{marginTop:18}}>
        <div style={youthBox}>
          <b>YOUTH VIEWER MODE</b>
          <p style={{margin:'7px 0 0',lineHeight:1.45}}>You can watch age-appropriate LIVE/PK rooms. Camera, microphone, freeform personal-information exchange, paid gifts/tips and hosting stay off in this release until adult-managed social controls are verified.</p>
        </div>
        <div style={safetyBox}><b>Stay safe online.</b> Do not share your full name, address, school, phone number, passwords or exact location. Leave, block or report anyone who makes you uncomfortable.</div>
        <button onClick={continueSafe} style={primary}>I understand • continue as viewer</button>
        <button onClick={resetAge} style={linkButton}>Correct date of birth</button>
      </div>}

      {(band==='teen'||band==='adult')&&<div style={{marginTop:18}}>
        <div style={safetyBox}><b>{band==='teen'?'Teen safety reminder':'LIVE/PK reminder'}</b><br/>Protect personal information, use block/report controls when needed, and remember that online interactions can create real-world risk.</div>
        <button onClick={continueSafe} style={primary}>{confirmed?'Continue':'I understand • continue'}</button>
        <button onClick={resetAge} style={linkButton}>Correct date of birth</button>
      </div>}
    </section>
  </div>
}

const field:React.CSSProperties={width:'100%',boxSizing:'border-box',padding:12,borderRadius:12,border:'1px solid #4fe3ff55',background:'#030914',color:'#fff',fontSize:16}
const primary:React.CSSProperties={width:'100%',marginTop:12,padding:'13px 14px',borderRadius:13,border:'1px solid #4fe3ff99',background:'linear-gradient(135deg,#0d4154,#24182d)',color:'#fff',fontWeight:950,cursor:'pointer'}
const smallButton:React.CSSProperties={padding:'9px 12px',borderRadius:12,border:'1px solid #456',background:'#101722',color:'#fff',fontWeight:850,cursor:'pointer'}
const linkButton:React.CSSProperties={width:'100%',marginTop:8,padding:9,border:0,background:'transparent',color:'#9fc8d8',cursor:'pointer',textDecoration:'underline'}
const note:React.CSSProperties={fontSize:11,opacity:.65,lineHeight:1.45}
const alert:React.CSSProperties={marginTop:10,padding:12,borderRadius:12,border:'1px solid #ff707066',background:'#351013aa',fontSize:12,lineHeight:1.45}
const safetyBox:React.CSSProperties={padding:12,borderRadius:13,border:'1px solid #4fe3ff55',background:'#071c28',fontSize:12,lineHeight:1.5}
const youthBox:React.CSSProperties={padding:12,borderRadius:13,border:'1px solid #ffd65a66',background:'#2a2108',fontSize:12,color:'#fff3c4'}
