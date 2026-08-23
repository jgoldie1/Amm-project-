import { useEffect, useMemo, useState } from 'react'
import {
  addDoNotContact,
  askStubbsAboutRepoFile,
  checkDoNotContact,
  createMiddleverseHandoff,
  getApprovedScripts,
  getMiddleverseStatus,
  getRepoWorkstation,
  getWorkforceStatus,
  logInteraction,
  startWorkforceSession,
} from '../services/workforce'

type Script={id:string;name:string;campaign_key:string;objective:string;opening:string;discovery:any[];value_points:any[];closing:string;required_disclosures:any[];prohibited_claims:any[];version:number}
type Rebuttal={id:string;script_id:string;trigger_key:string;customer_phrase?:string;approved_response:string;follow_up_question?:string;escalation_required:boolean;risk_level:string}

export default function WorkforceWorkstation({onClose}:{onClose:()=>void}){
  const [tab,setTab]=useState<'agent'|'middleverse'|'repo'>('agent')
  const [scripts,setScripts]=useState<Script[]>([])
  const [rebuttals,setRebuttals]=useState<Rebuttal[]>([])
  const [scriptId,setScriptId]=useState('')
  const [contact,setContact]=useState('')
  const [status,setStatus]=useState('Loading workforce…')
  const [message,setMessage]=useState('')
  const [middleverse,setMiddleverse]=useState<any>(null)
  const [repo,setRepo]=useState<any>(null)
  const [repoPath,setRepoPath]=useState('amm-omniverse/src/App.tsx')
  const [review,setReview]=useState('')
  const [busy,setBusy]=useState(false)
  const active=useMemo(()=>scripts.find(s=>s.id===scriptId)||scripts[0],[scripts,scriptId])
  const activeRebuttals=useMemo(()=>active?rebuttals.filter(r=>r.script_id===active.id):[],[active,rebuttals])

  useEffect(()=>{(async()=>{
    try{
      const [w,s,m]=await Promise.all([getWorkforceStatus(),getApprovedScripts(),getMiddleverseStatus()])
      setStatus(`${w.service||'Workforce'} · READY`)
      setScripts(s.scripts||[]); setRebuttals(s.rebuttals||[]); setMiddleverse(m)
      if(s.scripts?.[0]?.id)setScriptId(s.scripts[0].id)
    }catch(e:any){setStatus(e.message||'Workforce unavailable')}
  })()},[])

  async function checkDnc(){
    if(!contact.trim())return setMessage('Enter a phone/email/contact reference first.')
    setBusy(true); try{const r:any=await checkDoNotContact(contact);setMessage(r.suppressed?'⛔ DO NOT CONTACT — suppressed':'✅ Contact not found on TRYAMM suppression list')}catch(e:any){setMessage(`⚠️ ${e.message}`)}finally{setBusy(false)}
  }
  async function suppress(){
    if(!contact.trim())return setMessage('Enter the contact first.')
    setBusy(true); try{await addDoNotContact(contact,'customer-request');setMessage('⛔ Contact added to do-not-contact suppression list.')}catch(e:any){setMessage(`⚠️ ${e.message}`)}finally{setBusy(false)}
  }
  async function startShift(){
    setBusy(true);try{const r:any=await startWorkforceSession(active?.campaign_key||'');setMessage(`✅ Shift started · ${r.session?.status||'available'}`)}catch(e:any){setMessage(`⚠️ ${e.message}`)}finally{setBusy(false)}
  }
  async function logSample(){
    if(!contact.trim())return setMessage('Enter a contact first.')
    setBusy(true);try{const r:any=await logInteraction({channel:'voice',contact,consentBasis:'agent-confirmed-per-campaign-policy',scriptId:active?.id,campaignKey:active?.campaign_key,summary:'Interaction opened from TRYAMM AI Workstation',disclosuresGiven:[]});setMessage(`✅ Interaction logged · ${r.interaction?.id||''}`)}catch(e:any){setMessage(`⚠️ ${e.message}`)}finally{setBusy(false)}
  }
  async function handoff(routeKey:string){
    setBusy(true);try{const r:any=await createMiddleverseHandoff({routeKey,taskSummary:`Workstation handoff from ${routeKey}`,sourceContext:{surface:'workforce-workstation',scriptId:active?.id||null},riskBand:routeKey.includes('commerce')||routeKey.includes('safety')?'yellow':'green'});setMessage(`✅ Middleverse handoff created · ${r.handoff?.status}`)}catch(e:any){setMessage(`⚠️ ${e.message}`)}finally{setBusy(false)}
  }
  async function inspectRepo(){setBusy(true);try{const r:any=await getRepoWorkstation();setRepo(r);setMessage(`✅ Repository scanned · ${r.files?.length||0} tracked files`)}catch(e:any){setMessage(`⚠️ ${e.message}`)}finally{setBusy(false)}}
  async function aiReview(){setBusy(true);try{const r:any=await askStubbsAboutRepoFile(repoPath,'Review for security, correctness, missing wiring, outdated claims and missing tests.');setReview(JSON.stringify(r.review,null,2));setMessage('✅ Stubbs AI repository review completed.')}catch(e:any){setMessage(`⚠️ ${e.message}`)}finally{setBusy(false)}}

  return <div style={{position:'fixed',inset:0,zIndex:10050,background:'#04050E',color:'#fff',fontFamily:'monospace',overflow:'auto'}}>
    <div style={{position:'sticky',top:0,zIndex:2,background:'#07101ccc',backdropFilter:'blur(14px)',borderBottom:'1px solid #4FE3FF44',padding:'12px 16px',display:'flex',gap:10,alignItems:'center'}}>
      <div><div style={{color:'#4FE3FF',fontSize:10,letterSpacing:3,fontWeight:900}}>TRYAMM WORKFORCE</div><div style={{fontSize:18,fontWeight:950}}>AI Contact Center · Middleverse Workstation</div><div style={{fontSize:9,color:'#8190a5'}}>{status}</div></div>
      <button onClick={onClose} style={{marginLeft:'auto',border:'1px solid #34465b',background:'#0c1623',color:'#fff',borderRadius:999,width:38,height:38,cursor:'pointer'}}>×</button>
    </div>
    <div style={{maxWidth:1180,margin:'0 auto',padding:16}}>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>{[['agent','☎ AGENT DESK'],['middleverse','◈ MIDDLEVERSE'],['repo','⌘ REPO WORKSTATION']].map(([id,label])=><button key={id} onClick={()=>setTab(id as any)} style={{padding:'9px 12px',border:`1px solid ${tab===id?'#4FE3FF':'#273244'}`,background:tab===id?'#0b2632':'#0b111b',color:tab===id?'#4FE3FF':'#aab5c2',borderRadius:10,cursor:'pointer',fontWeight:900}}>{label}</button>)}</div>
      {message&&<div style={{padding:10,border:'1px solid #2d3a4f',borderRadius:10,background:'#0a1019',marginBottom:12,fontSize:11}}>{message}</div>}

      {tab==='agent'&&<div style={{display:'grid',gridTemplateColumns:'minmax(0,1.25fr) minmax(280px,.75fr)',gap:14}}>
        <section style={panel}><h3 style={title}>Approved Script + Rebuttal Console</h3>
          <select value={active?.id||''} onChange={e=>setScriptId(e.target.value)} style={input}>{scripts.map(s=><option key={s.id} value={s.id}>{s.name} · v{s.version}</option>)}</select>
          {active?<><Label>OBJECTIVE</Label><P>{active.objective}</P><Label>OPENING</Label><P>{active.opening}</P><Label>DISCOVERY</Label>{(active.discovery||[]).map((x:any,i)=><P key={i}>• {String(x)}</P>)}<Label>VALUE POINTS</Label>{(active.value_points||[]).map((x:any,i)=><P key={i}>• {String(x)}</P>)}<Label>CLOSE</Label><P>{active.closing}</P><Label>REQUIRED DISCLOSURES</Label>{(active.required_disclosures||[]).map((x:any,i)=><P key={i}>⚠ {String(x)}</P>)}<Label>PROHIBITED CLAIMS</Label>{(active.prohibited_claims||[]).map((x:any,i)=><P key={i}>⛔ {String(x)}</P>)}</>:<P>No approved script is loaded yet. Drafts stay hidden until approved.</P>}
        </section>
        <section style={panel}><h3 style={title}>Agent Controls</h3><input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Phone / email / contact reference" style={input}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}><B onClick={checkDnc}>CHECK DNC</B><B onClick={suppress}>ADD DNC</B><B onClick={startShift}>START SHIFT</B><B onClick={logSample}>LOG CONTACT</B></div><Label>APPROVED REBUTTALS</Label>{activeRebuttals.map(r=><div key={r.id} style={{padding:9,border:'1px solid #253449',borderRadius:9,marginBottom:8}}><div style={{color:'#E8B944',fontSize:10,fontWeight:900}}>{r.customer_phrase||r.trigger_key} · {r.risk_level}</div><P>{r.approved_response}</P>{r.follow_up_question&&<P>Next: {r.follow_up_question}</P>}{r.escalation_required&&<div style={{color:'#ff8094',fontSize:10,fontWeight:900}}>ESCALATE — DO NOT IMPROVISE</div>}</div>)}</section>
      </div>}

      {tab==='middleverse'&&<section style={panel}><h3 style={title}>Middleverse Orchestration</h3><P>Context-preserving handoffs between Holoverse, Stubbs AI, Workforce, Commerce, LIVE, Safety and Living Worlds.</P><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:9}}>{(middleverse?.routes||[]).map((r:any)=><button key={r.route_key} onClick={()=>handoff(r.route_key)} style={{textAlign:'left',padding:12,border:'1px solid #284056',background:'#091521',borderRadius:12,color:'#fff',cursor:'pointer'}}><div style={{fontWeight:950,color:'#4FE3FF'}}>{r.name}</div><div style={{fontSize:9,color:'#8190a5',margin:'5px 0'}}>{r.source_system} → {r.target_system}</div><div style={{fontSize:10,lineHeight:1.5}}>{r.intent}</div><div style={{fontSize:9,color:r.high_impact?'#E8B944':'#78ffb4',marginTop:7}}>{r.high_impact?'RISK REVIEW REQUIRED':'LOW-RISK ROUTE'}</div></button>)}</div></section>}

      {tab==='repo'&&<section style={panel}><h3 style={title}>Repository Workstation + Stubbs AI Code Review</h3><P>Reads the configured GitHub branch server-side. Tokens stay off the browser. Candidate executables/scripts are flagged for review; a flag does not automatically mean malware.</P><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><B onClick={inspectRepo}>SCAN REPOSITORY</B><input value={repoPath} onChange={e=>setRepoPath(e.target.value)} style={{...input,flex:1,minWidth:280}}/><B onClick={aiReview}>AI REVIEW FILE</B></div>{repo&&<div style={{marginTop:12}}><P>Repo: {repo.repository} · Branch: {repo.branch} · Head: {repo.head}</P><P>Tracked files: {repo.files?.length||0} · Review candidates: {repo.securityReview?.opaqueOrExecutableCandidates?.length||0}</P></div>}{review&&<pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',background:'#050a10',padding:12,borderRadius:10,border:'1px solid #1e2a39',fontSize:10,lineHeight:1.5,maxHeight:420,overflow:'auto'}}>{review}</pre>}</section>}
      <div style={{marginTop:12,fontSize:9,color:'#65758a'}}>Compliance guardrail: honor do-not-contact immediately; no deceptive guarantees, invented pricing, false eligibility, or improvised legal/medical/financial claims. Escalate uncertain high-risk cases.</div>
      {busy&&<div style={{position:'fixed',right:18,bottom:18,padding:'10px 14px',borderRadius:999,background:'#0c2030',border:'1px solid #4FE3FF66',color:'#4FE3FF'}}>Working…</div>}
    </div>
  </div>
}

const panel:React.CSSProperties={background:'#08111c',border:'1px solid #1b2b3f',borderRadius:16,padding:14}
const title:React.CSSProperties={margin:'0 0 12px',fontSize:14,color:'#fff'}
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',background:'#050b12',border:'1px solid #2d3f55',color:'#fff',borderRadius:9,padding:'9px 10px',fontFamily:'monospace'}
function Label({children}:{children:React.ReactNode}){return <div style={{marginTop:12,marginBottom:5,fontSize:9,color:'#4FE3FF',letterSpacing:2,fontWeight:900}}>{children}</div>}
function P({children}:{children:React.ReactNode}){return <div style={{fontSize:10,color:'#bcc8d5',lineHeight:1.6,marginBottom:5}}>{children}</div>}
function B({children,onClick}:{children:React.ReactNode;onClick:()=>void}){return <button onClick={onClick} style={{border:'1px solid #4FE3FF55',background:'#0b2230',color:'#4FE3FF',borderRadius:9,padding:'9px 10px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>{children}</button>}
