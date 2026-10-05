import { useEffect, useMemo, useRef, useState } from 'react'
import { getAccessToken } from '../services/supabaseClient'

type Msg={role:'user'|'assistant';content:string;provider?:string}
type SourceMode='auto'|'holo'|'oracle'|'old-web'|'historical'
type RetrievalItem={title?:string;headline?:string;summary?:string;sourceName?:string;sourceUrl?:string|null;verification?:string;kind?:string;city?:string;representation?:string}
type Props={showLauncher?:boolean}
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
    [/3d print|print network|print swarm|printer swarm|meshy factory|manufacturing/, '__showMeshyFactory','Opening the TRYAMM Meshy Rig + Print Factory.'],
    [/world forge|build west side|build circle park|build jefferson|cad|construct building|building wrap|photoreal.*building|make.*neighborhood/, '__showWorldForge','Opening the Chicago World Forge.'],
    [/game flow|game status|repair game|fix streetverse|why.*game|streetverse.*broken|game.*broken/, '__showGameOps','Opening StreetVerse Game Ops and diagnosing the actual blocker.'],
    [/holo services/, '__showHoloServices','Opening Holo Services.'],
    [/holo core/, '__showHoloCore','Opening Holo Core.'],
    [/holoverse/, '__showHoloverse','Opening Holoverse.'],
    [/holo menu|command nexus|all holo|holo functions|menu/, '__showCommandNexusV2','Opening the organized Holo Command Nexus.'],
    [/concierge|what can i do|help me choose/, '__showHoloConcierge','Opening Holo Concierge.'],
    [/bible|scripture|ethiopian canon|hebrew|strong.?s concordance|paleo.?hebrew|\besther\b|\bester\b|\bjubilee(?:s)?\b/, '__showEthiopianBible','Opening the Ethiopian Bible Metaverse study world.'],
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

function clientCapabilities(){
  const nav=navigator as Navigator&{deviceMemory?:number;connection?:{effectiveType?:string}}
  const effective=String(nav.connection?.effectiveType||'4g')
  return {
    webgl:true,
    webxr:'xr'in navigator,
    bandwidth:(effective.includes('2g')?'low':effective.includes('3g')?'medium':'high') as 'low'|'medium'|'high',
    deviceMemoryGB:Number(nav.deviceMemory||2),
    audio:true,
    haptics:Boolean(navigator.vibrate),
  }
}
async function oracleSearch(question:string){
  const r=await fetch('/api/oracle/search',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({q:question}),cache:'no-store'})
  const d=await readJson(r)
  if(!r.ok)throw new Error(d.error||`Oracle API ${r.status}`)
  return d
}
async function holoSearch(question:string):Promise<RetrievalItem[]>{
  return await new Promise(resolve=>{
    let done=false
    const finish=(items:RetrievalItem[])=>{if(done)return;done=true;removeEventListener('tryamm:holo-internet-results',onResults);clearTimeout(timer);resolve(items)}
    const onResults=(event:Event)=>{
      const d=(event as CustomEvent<{query?:string;results?:RetrievalItem[]}>).detail||{}
      if(String(d.query||'')===question)finish(Array.isArray(d.results)?d.results:[])
    }
    addEventListener('tryamm:holo-internet-results',onResults)
    const timer=window.setTimeout(()=>finish([]),900)
    window.dispatchEvent(new CustomEvent('tryamm:holo-internet-query',{detail:{query:question,capabilities:clientCapabilities()}}))
  })
}
function extractLikelyUrl(text:string){
  const explicit=String(text||'').match(/https?:\/\/[^\s)]+/i)?.[0]
  if(explicit)return explicit.replace(/[.,!?]+$/,'')
  const domain=String(text||'').match(/\b(?:www\.)?[a-z0-9][a-z0-9.-]+\.(?:com|org|net|edu|gov|io|co|ai|biz|us)\b/i)?.[0]
  return domain||''
}
function yearsIn(text:string){return [...String(text||'').matchAll(/\b(?:18|19|20|21)\d{2}\b/g)].map(m=>m[0]).slice(0,2)}
async function historicalSearch(question:string,urlInput:string,fromInput:string,toInput:string){
  const url=urlInput.trim()||extractLikelyUrl(question)
  const years=yearsIn(question)
  const from=fromInput||years[0]||''
  const to=toInput||years[1]||''
  if(!url)return {results:[{title:'Historical URL required',summary:'HISTORY mode needs a website/domain to query archived captures. Add a URL such as example.com, then optionally choose one or two dates.',sourceName:'TRYAMM Time Machine',verification:'input-required'}],raw:null}
  const action=from&&to?'compare':from?'capture':'timeline'
  const body:any={action,url}
  if(action==='compare'){body.from=from;body.to=to}
  else if(action==='capture')body.date=from
  const r=await fetch('/api/time-machine/internet',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'})
  const d=await readJson(r)
  if(!r.ok)throw new Error(d.error||`Time Machine API ${r.status}`)
  const results:RetrievalItem[]=[]
  const addCapture=(label:string,x:any)=>{
    const cap=x?.capture||x
    if(!cap)return
    const ads=Array.isArray(cap.adSignals)&&cap.adSignals.length?` Promotions/ad signals: ${cap.adSignals.slice(0,5).join(' | ')}`:''
    results.push({
      title:`${label} • ${String(cap.capturedAt||cap.timestamp||'unknown date')}`,
      summary:[cap.title,cap.description,ads,cap.contentExcerpt].filter(Boolean).join(' — ').slice(0,1200),
      sourceName:cap.provider==='common-crawl'?'Common Crawl':'Internet Archive',
      sourceUrl:cap.archiveUrl||null,
      verification:'archived-source-capture',
    })
  }
  if(action==='compare'){if(d.before?.found)addCapture('THEN',d.before);if(d.after?.found)addCapture('NOW/COMPARE',d.after);if(d.difference)results.push({title:'Observed archived difference',summary:`Added terms: ${(d.difference.added||[]).slice(0,25).join(', ')}. Removed terms: ${(d.difference.removed||[]).slice(0,25).join(', ')}. ${d.difference.interpretation||''}`,sourceName:'TRYAMM Time Machine',verification:'derived-from-archive-captures'})}
  else if(action==='capture'){if(d.found)addCapture('HISTORICAL CAPTURE',d)}
  else for(const cap of (d.captures||[]).slice(-12))addCapture('ARCHIVE',cap)
  if(!results.length)results.push({title:'No verified historical snapshot found',summary:'The archive providers returned no matching capture. Missing archive evidence does not prove the page or advertisement did not exist.',sourceName:'TRYAMM Time Machine',verification:'no-capture'})
  return {results,raw:d}
}
function compactRetrieval(items:RetrievalItem[],limit=8){
  return items.slice(0,limit).map((item,i)=>({
    n:i+1,
    title:String(item.title||item.headline||'Untitled').slice(0,180),
    summary:String(item.summary||'').slice(0,500),
    source:String(item.sourceName||item.kind||'Holo Internet').slice(0,120),
    url:item.sourceUrl||null,
    verification:item.verification||null,
    city:item.city||null,
    representation:item.representation||null,
  }))
}

export default function HoloGPTAssistant({showLauncher=true}:Props){
  const [open,setOpen]=useState(false)
  const [messages,setMessages]=useState<Msg[]>(loadHistory)
  const [input,setInput]=useState('')
  const [busy,setBusy]=useState(false)
  const [health,setHealth]=useState<Health|null>(null)
  const [sourceMode,setSourceMode]=useState<SourceMode>('auto')
  const [retrievalStatus,setRetrievalStatus]=useState('')
  const [historyUrl,setHistoryUrl]=useState('')
  const [historyFrom,setHistoryFrom]=useState('')
  const [historyTo,setHistoryTo]=useState('')
  const [historyEvidence,setHistoryEvidence]=useState<RetrievalItem[]>([])
  const end=useRef<HTMLDivElement>(null)
  const history=useMemo(()=>messages.slice(-10).map(m=>({role:m.role,content:m.content})),[messages])

  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(messages.slice(-20)))}catch{};end.current?.scrollIntoView({behavior:'smooth'})},[messages])
  useEffect(()=>{
    const openAssistant=()=>setOpen(true)
    const openStudyContext=(event:Event)=>{const detail=(event as CustomEvent<{prompt?:string}>).detail||{};if(detail.prompt)setInput(String(detail.prompt));setOpen(true)}
    const openHistoricalInternet=(event:Event)=>{const detail=(event as CustomEvent<{url?:string;from?:string;to?:string}>).detail||{};setSourceMode('historical');if(detail.url)setHistoryUrl(String(detail.url));if(detail.from)setHistoryFrom(String(detail.from));if(detail.to)setHistoryTo(String(detail.to));setOpen(true)}
    window.addEventListener('tryamm:open-hologpt',openAssistant)
    window.addEventListener('tryamm:hologpt-study-context',openStudyContext)
    window.addEventListener('tryamm:hologpt-history-open',openHistoricalInternet)
    ;(window as any).__showHoloGPT=openAssistant
    ;(window as any).__showMeshyFactory=()=>{window.location.href='/meshy-factory'}
    return()=>{window.removeEventListener('tryamm:open-hologpt',openAssistant);window.removeEventListener('tryamm:hologpt-study-context',openStudyContext);window.removeEventListener('tryamm:hologpt-history-open',openHistoricalInternet);if((window as any).__showHoloGPT===openAssistant)delete (window as any).__showHoloGPT;delete (window as any).__showMeshyFactory}
  },[])
  useEffect(()=>{let cancelled=false;fetch('/api/ai/health',{cache:'no-store'}).then(async r=>({r,d:await readJson(r)})).then(({r,d})=>{if(!cancelled)setHealth({...d,ok:r.ok&&d.ok&&!d.degraded,degraded:Boolean(d.degraded)})}).catch(e=>{if(!cancelled)setHealth({ok:false,degraded:true,error:e instanceof Error?e.message:'AI connection unavailable'})});return()=>{cancelled=true}},[])

  async function send(){
    const question=input.trim();if(!question||busy)return
    setInput('');setMessages(m=>[...m,{role:'user',content:question}])
    const action=localIntent(question)
    if(action){setMessages(m=>[...m,{role:'assistant',content:`${action}\n\nNavigation is active. Consequential actions such as payments, physical rides, deliveries and drones still remain behind their safety and verification gates.`,provider:'holo-router'}]);return}
    setBusy(true)
    try{
      setRetrievalStatus('SEARCHING '+sourceMode.toUpperCase())
      let retrievalContext:any={mode:sourceMode,holo:[],oracle:[],historical:[],crawler:null}
      if(sourceMode==='holo'||sourceMode==='auto')retrievalContext.holo=compactRetrieval(await holoSearch(question))
      if(sourceMode==='oracle'||sourceMode==='old-web'||sourceMode==='auto'){
        const oracle=await oracleSearch(question)
        retrievalContext.oracle=compactRetrieval(Array.isArray(oracle.results)?oracle.results:[])
        retrievalContext.crawler=oracle.crawler||null
        retrievalContext.oracleConfigured=oracle.configured!==false
      }
      const autoHistory=sourceMode==='auto'&&Boolean(extractLikelyUrl(question))&&/(archive|history|historical|old (?:web|website|internet)|past|then|advertis|campaign|mandela|what .*looked like|\b(?:18|19|20)\d{2}\b)/i.test(question)
      if(sourceMode==='historical'||autoHistory){
        const historical=await historicalSearch(question,historyUrl,historyFrom,historyTo)
        retrievalContext.historical=compactRetrieval(historical.results,10)
        retrievalContext.historicalRaw=historical.raw
        setHistoryEvidence(historical.results.slice(0,12))
      }
      setRetrievalStatus('')
      const token=await getAccessToken()
      const r=await fetch('/api/ai/answer',{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify({question,history,sourceMode,retrievalContext})})
      const data=await readJson(r)
      if(!r.ok)throw new Error(data.error||`AI API ${r.status}`)
      const answer=String(data.answer||'').trim()||fallbackAnswer(question,'No answer returned by the AI service.')
      setMessages(m=>[...m,{role:'assistant',content:answer,provider:data.provider||'diagnostic'}])
      setHealth({ok:data.degraded!==true,degraded:Boolean(data.degraded),provider:data.provider,model:data.model,error:data.degraded?'Generative provider not configured; local recovery mode is active.':undefined})
    }catch(e:any){
      const reason=e?.message||'AI connection unavailable'
      setHealth({ok:false,degraded:true,error:reason,provider:'local-recovery'})
      setMessages(m=>[...m,{role:'assistant',content:fallbackAnswer(question,reason),provider:'local-recovery'}])
    } finally {setRetrievalStatus('');setBusy(false)}
  }

  const disabled=busy||!input.trim()
  const status=health?.ok?'INTELLIGENCE ONLINE':health?.degraded?'RECOVERY MODE':'CHECKING AI'
  const statusColor=health?.ok?'#78ffb4':'#e8b944'
  return <>
    {showLauncher&&<button aria-label="Open HoloGPT" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:18,zIndex:10030,border:'1px solid #4fe3ffaa',borderRadius:999,padding:'12px 16px',background:'linear-gradient(135deg,#061c29,#171128)',color:'#4fe3ff',fontFamily:'monospace',fontWeight:950,fontSize:11,cursor:'pointer',boxShadow:'0 0 28px #4fe3ff33'}}>◈ HOLOGPT</button>}
    {open&&<div role="dialog" aria-label="HoloGPT" style={{position:'fixed',inset:0,zIndex:12000,background:'rgba(1,3,10,.82)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'flex-end',padding:12}} onClick={()=>setOpen(false)}>
      <div onClick={e=>e.stopPropagation()} style={{width:'min(96vw,460px)',height:'min(82vh,690px)',background:'linear-gradient(160deg,#06101a,#080615)',border:'1px solid #4fe3ff77',borderRadius:22,display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 28px 90px #000d'}}>
        <header style={{padding:'14px 16px',borderBottom:'1px solid #4fe3ff22',display:'flex',alignItems:'center',gap:10}}><div style={{fontSize:27}}>◈</div><div style={{flex:1}}><div style={{color:'#fff',fontWeight:950}}>HoloGPT</div><div style={{fontSize:9,color:statusColor,fontFamily:'monospace'}}>{status}{health?.provider?` · ${health.provider}`:''}</div></div><button aria-label="Close HoloGPT" onClick={()=>setOpen(false)} style={{background:'transparent',border:'1px solid #334',color:'#fff',borderRadius:'50%',width:34,height:34,cursor:'pointer'}}>×</button></header>
        {health?.degraded&&<div style={{margin:'10px 12px 0',padding:'9px 10px',border:'1px solid #e8b94455',borderRadius:11,background:'#e8b9440d',fontSize:10,color:'#ffe281',lineHeight:1.45}}>Generative AI is not connected on this deployment yet. Holo navigation remains usable and HoloGPT now fails softly instead of showing a raw runtime-error message.</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:5,padding:'9px 12px 0'}}>
          {([['auto','AUTO'],['holo','HOLO'],['oracle','ORACLE'],['old-web','OLD WEB'],['historical','HISTORY']] as const).map(([id,label])=><button key={id} onClick={()=>setSourceMode(id)} style={{minHeight:34,borderRadius:9,border:sourceMode===id?'1px solid #4fe3ff':'1px solid #253647',background:sourceMode===id?'#0d3043':'#091019',color:'#dffaff',fontSize:8,fontWeight:950}}>{label}</button>)}
        </div>
        {sourceMode==='historical'&&<div style={{padding:'8px 12px 0'}}>
          <div style={{fontSize:8,color:'#9bd8e8',fontFamily:'monospace',marginBottom:5}}>INTERNET TIME MACHINE • archived observations, not complete Internet history</div>
          <input aria-label="Historical website or domain" value={historyUrl} onChange={e=>setHistoryUrl(e.target.value)} placeholder="Website/domain • example.com" style={{width:'100%',boxSizing:'border-box',minHeight:38,borderRadius:9,border:'1px solid #29495a',background:'#07111b',color:'#fff',padding:'7px 9px',fontSize:11}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:6}}>
            <label style={{fontSize:8,color:'#7899aa'}}>THEN<input aria-label="Historical from date" type="date" value={historyFrom} onChange={e=>setHistoryFrom(e.target.value)} style={{width:'100%',boxSizing:'border-box',minHeight:36,borderRadius:8,border:'1px solid #29495a',background:'#07111b',color:'#fff',padding:5,fontSize:10}}/></label>
            <label style={{fontSize:8,color:'#7899aa'}}>NOW / COMPARE<input aria-label="Historical compare date" type="date" value={historyTo} onChange={e=>setHistoryTo(e.target.value)} style={{width:'100%',boxSizing:'border-box',minHeight:36,borderRadius:8,border:'1px solid #29495a',background:'#07111b',color:'#fff',padding:5,fontSize:10}}/></label>
          </div>
          <div style={{fontSize:8,color:'#6f8794',marginTop:5}}>One date = inspect capture • two dates = THEN ↔ NOW • missing captures stay labeled missing.</div>
        </div>}
        {retrievalStatus&&<div style={{padding:'6px 12px 0',fontSize:8,color:'#6fe8ff',fontFamily:'monospace'}}>{retrievalStatus}</div>}        {sourceMode==='historical'&&historyEvidence.length>0&&<div style={{padding:'7px 12px 0',display:'grid',gap:5,maxHeight:150,overflowY:'auto'}}>
          {historyEvidence.slice(0,6).map((item,i)=><div key={i} style={{border:'1px solid #27495a',borderRadius:9,padding:7,background:'#071019'}}>
            <div style={{fontSize:8,fontWeight:950,color:'#a8efff'}}>{String(item.title||'ARCHIVED CAPTURE')}</div>
            <div style={{fontSize:8,color:'#7f9fac',marginTop:2}}>{String(item.sourceName||'archive')} • {String(item.verification||'source-capture')}</div>
            {item.sourceUrl&&<a href={String(item.sourceUrl)} target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:4,fontSize:8,color:'#76e8ff',fontWeight:950}}>OPEN ARCHIVE ↗</a>}
          </div>)}
        </div>}
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
