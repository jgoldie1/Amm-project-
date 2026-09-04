import {useEffect,useMemo,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import {CreatorEngineKind,enginesFor} from '../data/creatorEngineCatalog'
import HoloSocialEngine from './HoloSocialEngine'
import PoyoMovieFactoryPanel from './PoyoMovieFactoryPanel'
import HoloForgeGameFactoryPanel from './HoloForgeGameFactoryPanel'

type Props={onClose:()=>void}
type Task={task_id?:string;status?:string;progress?:number;files?:{file_url?:string;url?:string;file_type?:string;type?:string}[];error_message?:string}
const API=(import.meta as any).env?.VITE_API_URL??''
const MODES:{id:CreatorEngineKind;label:string;icon:string}[]=[
  {id:'image',label:'IMAGE',icon:'◈'},{id:'video',label:'VIDEO',icon:'▶'},{id:'music',label:'MUSIC',icon:'♫'},{id:'speech',label:'VOICE',icon:'◉'},{id:'chat',label:'CHAT',icon:'✦'},{id:'3d',label:'3D',icon:'⬡'},{id:'tool',label:'TOOLS',icon:'⚙'},
]
const PROMPTS:Partial<Record<CreatorEngineKind,string>>={
  image:'Photorealistic creator campaign image, premium cinematic lighting, natural detail, vertical social composition.',
  video:'Cinematic vertical social Reel in a photorealistic Chicago night scene, smooth camera movement, realistic people and lighting.',
  music:'Create an original high-energy soundtrack for a 30-second TRYAMM creator Reel with a memorable hook and clean instrumental sections.',
  speech:'Natural professional narration with warm delivery, clear pacing and accessible pronunciation.',
  chat:'Create a production-ready creator concept, shot list, captions, hooks and publishing plan.',
  '3d':'Create a realistic optimized 3D asset for StreetVerse with production-ready textures and game-friendly geometry.',
  tool:'Enhance the supplied media while preserving natural detail and creator intent.',
}
async function api(path:string,options:RequestInit={}){const token=await getAccessToken();if(!token)throw new Error('Sign in to TRYAMM before live generation.');const response=await fetch(`${API}${path}`,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...(options.headers||{})}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||data?.error||`Request failed (${response.status})`);return data}

export default function PoyoAIStudio({onClose}:Props){
  const [kind,setKind]=useState<CreatorEngineKind>('image')
  const list=useMemo(()=>enginesFor(kind),[kind])
  const [model,setModel]=useState(list[0]?.model||'')
  const [prompt,setPrompt]=useState(PROMPTS.image||'')
  const [referenceUrl,setReferenceUrl]=useState('')
  const [consent,setConsent]=useState(false)
  const [providerReady,setProviderReady]=useState<boolean|null>(null)
  const [task,setTask]=useState<Task|null>(null)
  const [busy,setBusy]=useState(false)
  const [showHoloSocial,setShowHoloSocial]=useState(false)
  const [message,setMessage]=useState('ONE STUDIO → MANY ENGINES → ONE TRYAMM CREATOR PIPELINE')
  useEffect(()=>{fetch(`${API}/api/poyo/health`).then(r=>r.json()).then(d=>setProviderReady(Boolean(d?.configured))).catch(()=>setProviderReady(false))},[])
  function choose(next:CreatorEngineKind){setKind(next);const options=enginesFor(next);setModel(options[0]?.model||'');setPrompt(PROMPTS[next]||'');setTask(null)}
  async function generate(){if(!model)return;setBusy(true);setTask(null);try{const input:any={prompt:prompt.trim()};if(referenceUrl.trim()){if(kind==='video'||kind==='tool')input.video_url=referenceUrl.trim();else input.image_url=referenceUrl.trim()}const data=await api('/api/poyo/generate',{method:'POST',body:JSON.stringify({model,input,consent})});setTask(data?.task||{});setMessage(`Submitted ${data?.task?.task_id||'generation job'}.`)}catch(e){setMessage(e instanceof Error?e.message:'Generation failed.')}finally{setBusy(false)}}
  async function refresh(){if(!task?.task_id)return;setBusy(true);try{const data=await api(`/api/poyo/status?taskId=${encodeURIComponent(task.task_id)}`);setTask(data?.task||{});setMessage(`Task ${data?.task?.status||'updated'}${Number.isFinite(data?.task?.progress)?` • ${data.task.progress}%`:''}`)}catch(e){setMessage(e instanceof Error?e.message:'Status check failed.')}finally{setBusy(false)}}
  useEffect(()=>{if(!task?.task_id||['finished','failed'].includes(String(task.status)))return;const timer=window.setInterval(refresh,5000);return()=>window.clearInterval(timer)},[task?.task_id,task?.status])
  const files=Array.isArray(task?.files)?task!.files:[]
  const panel:React.CSSProperties={background:'#09111ce8',border:'1px solid #223a4c',borderRadius:18,padding:14}
  const btn=(active=false):React.CSSProperties=>({minHeight:44,background:active?'linear-gradient(135deg,#0f3546,#252036)':'#0a1119',border:active?'1px solid #4fe3ff':'1px solid #293846',color:active?'#c8f8ff':'#d8e1e8',borderRadius:11,padding:'9px 11px',cursor:'pointer',fontWeight:850})
  return <>
    <div role="dialog" aria-label="TRYAMM Poyo AI Studio" style={{position:'fixed',inset:0,zIndex:10070,overflowY:'auto',background:'radial-gradient(circle at 12% 8%,#0b3040,#03050b 42%,#010207)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{maxWidth:1180,margin:'0 auto',padding:'18px 14px 80px'}}>
        <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:14,flexWrap:'wrap'}}><div><div style={{color:'#4fe3ff',fontSize:10,fontWeight:950,letterSpacing:3}}>TRYAMM CREATOR INTELLIGENCE</div><h1 style={{margin:'4px 0',fontSize:'clamp(26px,5vw,44px)'}}>Poyo AI Studio MAX</h1><div style={{color:'#98aabc'}}>Multi-engine image • video • music • voice • chat • 3D • media tools • full movie continuity • Holo Forge game production.</div></div><div style={{display:'flex',gap:8}}><button onClick={()=>setShowHoloSocial(true)} style={{...btn(true),color:'#e8faff'}}>◎ HOLO SOCIAL</button><button onClick={onClose} aria-label="Close" style={{...btn(),fontSize:22,width:44,height:44,padding:0}}>×</button></div></header>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:12}}>{MODES.map(m=><button key={m.id} onClick={()=>choose(m.id)} style={btn(kind===m.id)}>{m.icon} {m.label}</button>)}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(310px,1fr))',gap:14}}>
          <section style={panel}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>ENGINE ROUTER</b><span style={{fontSize:10,color:providerReady?'#78ffb4':'#ffc96b'}}>{providerReady?'LIVE PROVIDER READY':'PROVIDER KEY REQUIRED'}</span></div><div style={{display:'grid',gap:7,marginTop:10,maxHeight:430,overflowY:'auto'}}>{list.map(engine=><button key={engine.model} onClick={()=>setModel(engine.model)} style={{...btn(model===engine.model),textAlign:'left'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><span>{engine.label}</span><span style={{fontSize:9,color:'#e8b944'}}>{engine.provider}</span></div><div style={{fontSize:9,color:'#80909d',marginTop:4}}>{engine.capabilities.join(' • ')} • {engine.tier}</div></button>)}</div></section>
          <section style={panel}><b>DIRECTOR</b><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={8} style={{width:'100%',boxSizing:'border-box',marginTop:10,background:'#04080e',border:'1px solid #263a49',borderRadius:12,color:'#fff',padding:12,lineHeight:1.5}}/><label style={{display:'block',fontSize:10,color:'#92a4b3',marginTop:10}}>AUTHORIZED REFERENCE URL (optional)</label><input value={referenceUrl} onChange={e=>setReferenceUrl(e.target.value)} style={{width:'100%',boxSizing:'border-box',minHeight:44,marginTop:5,background:'#04080e',border:'1px solid #263a49',borderRadius:10,color:'#fff',padding:10}}/><label style={{display:'flex',gap:8,alignItems:'flex-start',fontSize:11,color:'#b9c6cf',marginTop:12}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I own or have permission to use referenced people, voices, brands and media.</label><button disabled={busy||!consent||!model} onClick={generate} style={{...btn(true),width:'100%',marginTop:12,opacity:(busy||!consent)?0.6:1}}>{busy?'WORKING…':'GENERATE WITH '+(list.find(x=>x.model===model)?.label||model)}</button><div style={{fontSize:11,color:'#9db0bf',lineHeight:1.5,marginTop:10}}>{message}</div></section>
          <section style={panel}><b>RESULT + TRYAMM HANDOFF</b>{task?<><div style={{marginTop:10,fontSize:12,color:'#b7c5cf'}}>Task: <b>{task.task_id||'created'}</b><br/>Status: <b>{task.status||'submitted'}</b>{Number.isFinite(task.progress)?` • ${task.progress}%`:''}</div><button onClick={refresh} disabled={busy||!task.task_id} style={{...btn(),marginTop:10}}>REFRESH STATUS</button>{task.error_message&&<div style={{color:'#ff8f9d',marginTop:10}}>{task.error_message}</div>}<div style={{display:'grid',gap:8,marginTop:10}}>{files.map((file,i)=>{const url=file.file_url||file.url||'';return url?<div key={url+i} style={{border:'1px solid #233646',borderRadius:12,padding:9}}><a href={url} target="_blank" rel="noreferrer" style={{color:'#4fe3ff'}}>OPEN RESULT {i+1}</a><div style={{fontSize:9,color:'#7f909c',marginTop:4}}>{file.file_type||file.type||'generated media'}</div></div>:null})}</div></>:<div style={{marginTop:10,color:'#7f919f',lineHeight:1.6}}>Generated assets can feed TRYAMM Reels, Media Studio, Omni Box, StreetVerse, Pro Audio, StarVerse, campaigns and 3D worlds. Live generation remains OFF until an execution provider is actually configured.</div>}</section>
        </div>
        <PoyoMovieFactoryPanel />
        <HoloForgeGameFactoryPanel />
        <div style={{marginTop:14,...panel,fontSize:11,color:'#94a6b4',lineHeight:1.6}}>Architecture: <b style={{color:'#fff'}}>Poyo AI Studio → HoloGPT Director → Stubbs AI Factory → specialist model lanes → Holo Forge / movie continuity → simulation + QA → TRYAMM world/media handoff.</b> Software architecture can run now; owned inference and full rendering remain visibly blocked until real GPU/provider configuration exists.</div>
      </div>
    </div>
    {showHoloSocial&&<HoloSocialEngine onClose={()=>setShowHoloSocial(false)}/>} 
  </>
}
