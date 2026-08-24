import { useEffect, useMemo, useRef, useState } from 'react'
import { getAccessToken } from '../services/supabaseClient'

type Msg={role:'user'|'assistant';content:string;provider?:string}
type Health={ok:boolean;provider?:string;model?:string;error?:string;degraded?:boolean}
const KEY='tryamm_hologpt_history_v1'

function loadHistory():Msg[]{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.slice(-20):[]}catch{return []}}
function invoke(name:string){const fn=(window as any)[name];if(typeof fn==='function'){fn();return true}return false}
function localIntent(question:string){
  const q=question.toLowerCase()
  const intents:[RegExp,string,string][]=[
    [/streetverse|play.*game/, '__showPlayableBeta','Opening StreetVerse.'],
    [/reel|movie|clip|video|green screen/, '__showMediaStudio','Opening TRYAMM Media Studio.'],
    [/ride|car service/, '__showHoloRide','Opening Holo Ride.'],
    [/delivery|courier/, '__showHoloDelivery','Opening Holo Delivery.'],
    [/drone/, '__showHoloDrone','Opening Holo Drone.'],
    [/holo music|music streaming/, '__showHoloMusic','Opening Holo Music.'],
    [/xr|mixed reality|virtual reality|augmented reality|\bar\b|\bvr\b|\bmr\b/, '__showXR','Opening AR · VR · Mixed Reality.'],
    [/holo lab/, '__showHoloLab','Opening Holo Lab.'],
    [/holo services/, '__showHoloServices','Opening Holo Services.'],
    [/holo core/, '__showHoloCore','Opening Holo Core.'],
    [/holoverse/, '__showHoloverse','Opening Holoverse.'],
    [/holo menu|command nexus|all holo|holo functions|menu/, '__showCommandNexusV2','Opening the organized Holo Command Nexus.'],
    [/concierge|what can i do|help me choose/, '__showHoloConcierge','Opening Holo Concierge.'],
    [/healthy|grocery|food basket|yahavah/, '__showYahavahGrocery','Opening YAHAVAH Grocery.'],
    [/wig|bundle|extension|beauty supply|makeup|nail/, '__showAllAmericanBeauty','Opening All American Beauty Supply.'],
  ]
  for(const [pattern,opener,message] of intents){if(pattern.test(q)&&invoke(opener))return message}
  return ''
}
function fallbackAnswer(question:string,error?:string){
  const q=question.toLowerCase()
  const hint=/holo|holoverse|game|streetverse|play/.test(q)
    ?'The Holo launch controls are still available. Say “open Holoverse”, “open StreetVerse”, “open Holo Services”, or “open Command Nexus”.'
    :'Navigation and local TRYAMM commands remain available while the generative AI provider is being restored.'
  return `HoloGPT is in local recovery mode instead of crashing. ${hint}${error?`\n\nConnection diagnostic: ${error}`:''}`
}
async function readJson(r:Response){const text=await r.text();try{return text?JSON.parse(text):{}}catch{return {error:text||`API ${r.status}`}}}

export default function HoloGPTAssistant(){
  const [open,setOpen]=useState(false)
  const [messages,setMessages]=useState<Msg[]>(loadHistory)
  const [input,setInput]=useState('')
  const [busy,setBusy]=useState(false)
  const [health,setHealth]=useState<Health|null>(null)
  const end=useRef<HTMLDivElement>(null)
  const history=useMemo(()=>messages.slice(-10).map(m=>({role:m.role,content:m.content})),[messages])

  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(messages.slice(-20)))}catch{};end.current?.scrollIntoView({behavior:'smooth'})},[messages])
  useEffect(()=>{
    const openAssistant=()=>setOpen(true)
    window.addEventListener('tryamm:open-hologpt',openAssistant)
    ;(window as any).__showHoloGPT=openAssistant
    return()=>{window.removeEventListener('tryamm:open-hologpt',openAssistant);if((window as any).__showHoloGPT===openAssistant)delete (window as any).__showHoloGPT}
  },[])
  useEffect(()=>{let cancelled=false;fetch('/api/ai/health',{cache:'no-store'}).then(async r=>({r,d:await readJson(r)})).then(({r,d})=>{if(!cancelled)setHealth({...d,ok:r.ok&&d.ok&&!d.degraded,degraded:Boolean(d.degraded)})}).catch(e=>{if(!cancelled)setHealth({ok:false,degraded:true,error:e instanceof Error?e.message:'AI connection unavailable'})});return()=>{cancelled=true}},[])

  async function send(){
    const question=input.trim();if(!question||busy)return
    setInput('');setMessages(m=>[...m,{role:'user',content:question}])
    const action=localIntent(question)
    if(action){setMessages(m=>[...m,{role:'assistant',content:`${action}\n\nNavigation is active. Consequential actions such as payments, physical rides, deliveries and drones still remain behind their safety and verification gates.`,provider:'holo-router'}]);return}
    setBusy(true)
    try{
      const token=await getAccessToken()
      const r=await fetch('/api/ai/answer',{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify({question,history})})
      const data=await readJson(r)
      if(!r.ok)throw new Error(data.error||`AI API ${r.status}`)
      const answer=String(data.answer||'').trim()||fallbackAnswer(question,'No answer returned by the AI service.')
      setMessages(m=>[...m,{role:'assistant',content:answer,provider:data.provider||'diagnostic'}])
      setHealth({ok:data.degraded!==true,degraded:Boolean(data.degraded),provider:data.provider,model:data.model,error:data.degraded?'Generative provider not configured; local recovery mode is active.':undefined})
    }catch(e:any){
      const reason=e?.message||'AI connection unavailable'
      setHealth({ok:false,degraded:true,error:reason,provider:'local-recovery'})
      setMessages(m=>[...m,{role:'assistant',content:fallbackAnswer(question,reason),provider:'local-recovery'}])
    } finally {setBusy(false)}
  }

  const disabled=busy||!input.trim()
  const status=health?.ok?'INTELLIGENCE ONLINE':health?.degraded?'RECOVERY MODE':'CHECKING AI'
  const statusColor=health?.ok?'#78ffb4':'#e8b944'
  return <>
    <button aria-label="Open HoloGPT" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:18,zIndex:10030,border:'1px solid #4fe3ffaa',borderRadius:999,padding:'12px 16px',background:'linear-gradient(135deg,#061c29,#171128)',color:'#4fe3ff',fontFamily:'monospace',fontWeight:950,fontSize:11,cursor:'pointer',boxShadow:'0 0 28px #4fe3ff33'}}>◈ HOLOGPT</button>
    {open&&<div role="dialog" aria-label="HoloGPT" style={{position:'fixed',inset:0,zIndex:12000,background:'rgba(1,3,10,.82)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'flex-end',padding:12}} onClick={()=>setOpen(false)}>
      <div onClick={e=>e.stopPropagation()} style={{width:'min(96vw,460px)',height:'min(82vh,690px)',background:'linear-gradient(160deg,#06101a,#080615)',border:'1px solid #4fe3ff77',borderRadius:22,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 28px 90px #000d'}}>
        <header style={{padding:'14px 16px',borderBottom:'1px solid #4fe3ff22',display:'flex',alignItems:'center',gap:10}}><div style={{fontSize:27}}>◈</div><div style={{flex:1}}><div style={{color:'#fff',fontWeight:950}}>HoloGPT</div><div style={{fontSize:9,color:statusColor,fontFamily:'monospace'}}>{status}{health?.provider?` · ${health.provider}`:''}</div></div><button aria-label="Close HoloGPT" onClick={()=>setOpen(false)} style={{background:'transparent',border:'1px solid #334',color:'#fff',borderRadius:'50%',width:34,height:34,cursor:'pointer'}}>×</button></header>
        {health?.degraded&&<div style={{margin:'10px 12px 0',padding:'9px 10px',border:'1px solid #e8b94455',borderRadius:11,background:'#e8b9440d',fontSize:10,color:'#ffe281',lineHeight:1.45}}>Generative AI is not connected on this deployment yet. Holo navigation remains usable and HoloGPT now fails softly instead of showing a raw runtime-error message.</div>}
        <div style={{flex:1,overflowY:'auto',padding:14}}>
          {messages.length===0&&<div style={{padding:16,border:'1px solid #4fe3ff22',borderRadius:14,color:'#b8cfda',lineHeight:1.6,fontSize:12}}>Ask HoloGPT a question or use it as a Holo launcher. Try “open Holoverse”, “open StreetVerse”, “open Holo Services”, “open Holo Music”, or “open Command Nexus”.</div>}
          {messages.map((m,i)=><div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',margin:'10px 0'}}><div style={{maxWidth:'88%',whiteSpace:'pre-wrap',lineHeight:1.55,fontSize:12,padding:'10px 12px',borderRadius:14,background:m.role==='user'?'#e8b94418':'#4fe3ff12',border:`1px solid ${m.role==='user'?'#e8b94444':'#4fe3ff33'}`,color:m.role==='user'?'#ffe7a0':'#e8faff'}}>{m.content}{m.provider&&<div style={{marginTop:7,fontSize:8,color:'#6f8d9e',fontFamily:'monospace'}}>{m.provider}</div>}</div></div>)}
          {busy&&<div style={{color:'#4fe3ff',fontFamily:'monospace',fontSize:11}}>HOLOGPT IS THINKING…</div>}<div ref={end}/>
        </div>
        <div style={{padding:12,borderTop:'1px solid #4fe3ff22',display:'flex',gap:8}}><textarea aria-label="Message HoloGPT" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask HoloGPT or say open Holoverse…" rows={2} style={{flex:1,resize:'none',borderRadius:12,border:'1px solid #334b5b',background:'#050912',color:'#fff',padding:10,fontFamily:'inherit'}}/><button onClick={send} disabled={disabled} style={{border:0,borderRadius:12,padding:'0 15px',background:'#4fe3ff',color:'#041018',fontWeight:950,cursor:disabled?'not-allowed':'pointer',opacity:disabled?.55:1}}>SEND</button></div>
      </div>
    </div>}
  </>
}
