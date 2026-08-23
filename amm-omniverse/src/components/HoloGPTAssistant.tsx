import { useEffect, useMemo, useRef, useState } from 'react'
import { getAccessToken } from '../services/supabaseClient'

type Msg={role:'user'|'assistant';content:string;provider?:string}
type Health={ok:boolean;provider?:string;model?:string;error?:string}
const KEY='tryamm_hologpt_history_v1'

function loadHistory():Msg[]{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.slice(-20):[]}catch{return []}}

export default function HoloGPTAssistant(){
  const [open,setOpen]=useState(false)
  const [messages,setMessages]=useState<Msg[]>(loadHistory)
  const [input,setInput]=useState('')
  const [busy,setBusy]=useState(false)
  const [health,setHealth]=useState<Health|null>(null)
  const end=useRef<HTMLDivElement>(null)
  const history=useMemo(()=>messages.slice(-10).map(m=>({role:m.role,content:m.content})),[messages])

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(messages.slice(-20)));end.current?.scrollIntoView({behavior:'smooth'})},[messages])
  useEffect(()=>{
    const openAssistant=()=>setOpen(true)
    window.addEventListener('tryamm:open-hologpt',openAssistant)
    ;(window as any).__showHoloGPT=openAssistant
    return()=>{window.removeEventListener('tryamm:open-hologpt',openAssistant);if((window as any).__showHoloGPT===openAssistant)delete (window as any).__showHoloGPT}
  },[])
  useEffect(()=>{fetch('/api/ai/health',{cache:'no-store'}).then(async r=>({r,d:await r.json()})).then(({r,d})=>setHealth({...d,ok:r.ok&&d.ok})).catch(()=>setHealth({ok:false,error:'API offline'}))},[])

  async function send(){
    const question=input.trim();if(!question||busy)return
    setInput('');setMessages(m=>[...m,{role:'user',content:question}]);setBusy(true)
    try{
      const token=await getAccessToken()
      const r=await fetch('/api/ai/answer',{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify({question,history})})
      const data=await r.json();if(!r.ok)throw new Error(data.error||`API ${r.status}`)
      setMessages(m=>[...m,{role:'assistant',content:data.answer||'No answer returned.',provider:data.provider}])
      setHealth(h=>({...h,ok:data.degraded!==true,provider:data.provider||h?.provider,model:data.model||h?.model,error:data.degraded?'No generative provider is reachable':undefined}))
    }catch(e:any){
      setHealth(h=>({...h,ok:false,error:e?.message||'Runtime error'}))
      setMessages(m=>[...m,{role:'assistant',content:`HoloGPT runtime error: ${e?.message||'unknown error'}`,provider:'error'}])
    } finally {setBusy(false)}
  }

  const disabled=busy||!input.trim()
  return <>
    <button aria-label="Open HoloGPT" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:18,zIndex:10030,border:'1px solid #4fe3ffaa',borderRadius:999,padding:'12px 16px',background:'linear-gradient(135deg,#061c29,#171128)',color:'#4fe3ff',fontFamily:'monospace',fontWeight:950,fontSize:11,cursor:'pointer',boxShadow:'0 0 28px #4fe3ff33'}}>◈ HOLOGPT</button>
    {open&&<div role="dialog" aria-label="HoloGPT" style={{position:'fixed',inset:0,zIndex:12000,background:'rgba(1,3,10,.82)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'flex-end',padding:12}} onClick={()=>setOpen(false)}>
      <div onClick={e=>e.stopPropagation()} style={{width:'min(96vw,460px)',height:'min(82vh,690px)',background:'linear-gradient(160deg,#06101a,#080615)',border:'1px solid #4fe3ff77',borderRadius:22,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 28px 90px #000d'}}>
        <header style={{padding:'14px 16px',borderBottom:'1px solid #4fe3ff22',display:'flex',alignItems:'center',gap:10}}><div style={{fontSize:27}}>◈</div><div style={{flex:1}}><div style={{color:'#fff',fontWeight:950}}>HoloGPT</div><div style={{fontSize:9,color:health?.ok?'#78ffb4':'#e8b944',fontFamily:'monospace'}}>{health?.ok?`INTELLIGENCE ONLINE · ${health.provider||'provider'}`:`DIAGNOSTIC MODE · ${health?.error||health?.provider||'provider not configured'}`}</div></div><button aria-label="Close HoloGPT" onClick={()=>setOpen(false)} style={{background:'transparent',border:'1px solid #334',color:'#fff',borderRadius:'50%',width:34,height:34,cursor:'pointer'}}>×</button></header>
        <div style={{flex:1,overflowY:'auto',padding:14}}>
          {messages.length===0&&<div style={{padding:16,border:'1px solid #4fe3ff22',borderRadius:14,color:'#b8cfda',lineHeight:1.6,fontSize:12}}>I’m the intelligent TRYAMM/Holoverse assistant. Ask about a broken feature, a route, a world, deployment, business tools, games, accessibility, or what should be built next. I will distinguish verified-live systems from beta or planned work.</div>}
          {messages.map((m,i)=><div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',margin:'10px 0'}}><div style={{maxWidth:'88%',whiteSpace:'pre-wrap',lineHeight:1.55,fontSize:12,padding:'10px 12px',borderRadius:14,background:m.role==='user'?'#e8b94418':'#4fe3ff12',border:`1px solid ${m.role==='user'?'#e8b94444':'#4fe3ff33'}`,color:m.role==='user'?'#ffe7a0':'#e8faff'}}>{m.content}{m.provider&&<div style={{marginTop:7,fontSize:8,color:'#6f8d9e',fontFamily:'monospace'}}>{m.provider}</div>}</div></div>)}
          {busy&&<div style={{color:'#4fe3ff',fontFamily:'monospace',fontSize:11}}>HOLOGPT IS THINKING…</div>}<div ref={end}/>
        </div>
        <div style={{padding:12,borderTop:'1px solid #4fe3ff22',display:'flex',gap:8}}><textarea aria-label="Message HoloGPT" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask HoloGPT…" rows={2} style={{flex:1,resize:'none',borderRadius:12,border:'1px solid #334b5b',background:'#050912',color:'#fff',padding:10,fontFamily:'inherit'}}/><button onClick={send} disabled={disabled} style={{border:0,borderRadius:12,padding:'0 15px',background:'#4fe3ff',color:'#041018',fontWeight:950,cursor:disabled?'not-allowed':'pointer',opacity:disabled?.55:1}}>SEND</button></div>
        <div style={{padding:'0 12px 10px',fontSize:9,color:'#617483'}}>Conversation state is retained on this device; signed-in requests also carry the Supabase session to the server.</div>
      </div>
    </div>}
  </>
}
