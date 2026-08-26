import { useEffect, useMemo, useState } from 'react'
import { addDoNotContact, askStubbsAboutRepoFile, checkDoNotContact, escalateInteraction, getApprovedScripts, getRepoFile, getRepoWorkstation, getWorkforceStatus, logInteraction, startWorkforceSession } from '../services/workforce'

type Mode='middleverse'|'contact-center'|'developer'

type Script={id:string;name:string;campaign_key:string;objective:string;opening:string;discovery:any[];value_points:any[];closing:string;required_disclosures:any[];prohibited_claims:any[];version:number}
type Rebuttal={id:string;script_id:string;trigger_key:string;customer_phrase?:string;approved_response:string;follow_up_question?:string;escalation_required:boolean;risk_level:string}

const bridgeCards=[
  ['🌐','HOLOVERSE','AI, holographic services, search, mobility and identity'],
  ['🏙️','LIVING WORLDS','Persistent worlds, city systems, games and experiences'],
  ['💼','WORKFORCE','WFH jobs, contact center, training, QA and escalation'],
  ['🛍️','COMMERCE OS','Marketplace, LIVE shopping, auctions, offers and B2B'],
  ['●','TRYAMM LIVE','Creators, protected pause, moderation and audience'],
  ['🤖','STUBBS AI','Context-aware copilot across the entire ecosystem'],
]

export default function MiddleverseWorkstation({onClose}:{onClose:()=>void}){
  const [mode,setMode]=useState<Mode>('middleverse')
  const [status,setStatus]=useState<any>(null)
  const [scripts,setScripts]=useState<Script[]>([])
  const [rebuttals,setRebuttals]=useState<Rebuttal[]>([])
  const [scriptId,setScriptId]=useState('')
  const [contact,setContact]=useState('')
  const [consentBasis,setConsentBasis]=useState('customer-requested-contact')
  const [dnc,setDnc]=useState<boolean|null>(null)
  const [sessionId,setSessionId]=useState('')
  const [interactionId,setInteractionId]=useState('')
  const [objection,setObjection]=useState('')
  const [summary,setSummary]=useState('')
  const [notice,setNotice]=useState('')
  const [repo,setRepo]=useState<any>(null)
  const [selectedPath,setSelectedPath]=useState('')
  const [fileContent,setFileContent]=useState('')
  const [aiQuestion,setAiQuestion]=useState('Review this file for security, integration gaps, outdated claims, missing tests, and production risks.')
  const [aiReview,setAiReview]=useState('')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{getWorkforceStatus().then(setStatus).catch(()=>setStatus(null))},[])
  useEffect(()=>{if(mode==='contact-center'&&!scripts.length)getApprovedScripts().then((x:any)=>{setScripts(x.scripts||[]);setRebuttals(x.rebuttals||[]);if(x.scripts?.[0])setScriptId(x.scripts[0].id)}).catch(e=>setNotice(e.message))},[mode,scripts.length])
  useEffect(()=>{if(mode==='developer'&&!repo)getRepoWorkstation().then(setRepo).catch(e=>setNotice(e.message))},[mode,repo])

  const activeScript=useMemo(()=>scripts.find(s=>s.id===scriptId)||null,[scripts,scriptId])
  const matchingRebuttals=useMemo(()=>rebuttals.filter(r=>r.script_id===scriptId),[rebuttals,scriptId])
  const suggested=useMemo(()=>{
    const q=objection.toLowerCase().trim(); if(!q)return matchingRebuttals
    return matchingRebuttals.filter(r=>`${r.trigger_key} ${r.customer_phrase||''} ${r.approved_response}`.toLowerCase().includes(q))
  },[objection,matchingRebuttals])

  async function run(fn:()=>Promise<void>){setBusy(true);setNotice('');try{await fn()}catch(e:any){setNotice(e.message||'Action failed')}finally{setBusy(false)}}

  const panel:React.CSSProperties={background:'#0a111c',border:'1px solid #1f3445',borderRadius:18,padding:16}
  const btn:React.CSSProperties={background:'#102333',border:'1px solid #4fe3ff55',color:'#fff',borderRadius:10,padding:'10px 12px',fontWeight:800,cursor:'pointer'}

  return <div style={{position:'fixed',inset:0,zIndex:10050,background:'linear-gradient(155deg,#03050b,#071523 55%,#090713)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',overflow:'auto'}}>
    <div style={{maxWidth:1280,margin:'0 auto',padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:18}}>
        <div><div style={{color:'#4fe3ff',fontSize:11,fontWeight:900,letterSpacing:3}}>TRYAMM MIDDLEVERSE</div><h1 style={{margin:'4px 0 0',fontSize:'clamp(26px,4vw,48px)'}}>AI Workforce & Developer Workstation</h1><div style={{color:'#91a4b7',marginTop:6}}>The bridge between Holoverse, Living Worlds, jobs, commerce, LIVE, GameVerse and the real codebase.</div></div>
        <button onClick={onClose} style={{...btn,width:42,height:42,borderRadius:'50%'}}>×</button>
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>{(['middleverse','contact-center','developer'] as Mode[]).map(m=><button key={m} onClick={()=>setMode(m)} style={{...btn,background:mode===m?'#16364c':'#0b1420',color:mode===m?'#4fe3ff':'#cbd5e1'}}>{m==='middleverse'?'MIDDLEVERSE BRIDGE':m==='contact-center'?'WFH AI CALL CENTER':'AI DEV WORKSTATION'}</button>)}</div>
      {notice&&<div style={{marginBottom:14,padding:12,borderRadius:10,background:'#2a1b14',border:'1px solid #e8b94466',color:'#ffd98a'}}>{notice}</div>}

      {mode==='middleverse'&&<>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>{bridgeCards.map(([i,n,d])=><div key={n} style={panel}><div style={{fontSize:28}}>{i}</div><div style={{fontWeight:950,marginTop:8}}>{n}</div><div style={{color:'#91a4b7',fontSize:13,lineHeight:1.5,marginTop:5}}>{d}</div></div>)}</div>
        <div style={{...panel,marginTop:14}}><div style={{fontWeight:950,color:'#e8b944'}}>What Middleverse does</div><p style={{color:'#b7c3d0',lineHeight:1.7}}>Middleverse is the context and workflow bridge. A worker can move from a customer conversation to a Marketplace order, a LIVE seller, a Living World business, a training module, or a developer incident without losing identity, permissions, audit history or Stubbs AI context. It is not a fake separate universe; it is the connective operating layer between TRYAMM systems.</p><div style={{fontSize:12,color:'#7f93a8'}}>Status: real bridge/workstation foundation added; individual domain handoffs still depend on each production service being configured.</div></div>
      </>}

      {mode==='contact-center'&&<div style={{display:'grid',gridTemplateColumns:'minmax(0,1.15fr) minmax(300px,.85fr)',gap:14}}>
        <div style={panel}>
          <div style={{fontWeight:950,fontSize:18}}>Agent Desktop</div><div style={{color:'#7f93a8',fontSize:12,marginBottom:14}}>Consent-first WFH contact center with approved scripts, rebuttals, DNC and escalation.</div>
          <div style={{display:'grid',gap:9}}>
            <select value={scriptId} onChange={e=>setScriptId(e.target.value)} style={{padding:10,borderRadius:10,background:'#07101a',color:'#fff',border:'1px solid #27384a'}}><option value="">Select approved campaign script</option>{scripts.map(s=><option key={s.id} value={s.id}>{s.name} · v{s.version}</option>)}</select>
            <input value={contact} onChange={e=>{setContact(e.target.value);setDnc(null)}} placeholder="Customer phone or email" style={{padding:10,borderRadius:10,background:'#07101a',color:'#fff',border:'1px solid #27384a'}}/>
            <input value={consentBasis} onChange={e=>setConsentBasis(e.target.value)} placeholder="Consent basis" style={{padding:10,borderRadius:10,background:'#07101a',color:'#fff',border:'1px solid #27384a'}}/>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button disabled={busy||!contact} onClick={()=>run(async()=>{const x:any=await checkDoNotContact(contact);setDnc(x.suppressed);setNotice(x.suppressed?'STOP: contact is on the do-not-contact list.':'DNC check clear. Consent still required.')})} style={btn}>CHECK DNC</button><button disabled={busy||!contact} onClick={()=>run(async()=>{await addDoNotContact(contact);setDnc(true);setNotice('Contact added to do-not-contact suppression list.')})} style={btn}>ADD DO-NOT-CONTACT</button><button disabled={busy} onClick={()=>run(async()=>{const x:any=await startWorkforceSession(activeScript?.campaign_key||'');setSessionId(x.session.id);setNotice('WFH shift started.')})} style={btn}>START SHIFT</button></div>
            <div style={{fontSize:12,color:dnc===true?'#ff8d8d':dnc===false?'#78ffb4':'#91a4b7'}}>DNC: {dnc===true?'SUPPRESSED — DO NOT CONTACT':dnc===false?'CLEAR':'NOT CHECKED'} · Session: {sessionId||'not started'}</div>
          </div>
          {activeScript&&<div style={{marginTop:16,paddingTop:14,borderTop:'1px solid #233142'}}><div style={{color:'#4fe3ff',fontWeight:900}}>{activeScript.objective}</div><h3>Opening</h3><div style={{lineHeight:1.6}}>{activeScript.opening}</div><h3>Discovery</h3>{(activeScript.discovery||[]).map((x:any,i)=><div key={i} style={{color:'#cbd5e1',margin:'5px 0'}}>• {String(x)}</div>)}<h3>Value points</h3>{(activeScript.value_points||[]).map((x:any,i)=><div key={i} style={{color:'#cbd5e1',margin:'5px 0'}}>• {String(x)}</div>)}<h3>Required disclosures</h3>{(activeScript.required_disclosures||[]).map((x:any,i)=><div key={i} style={{color:'#ffd98a',margin:'5px 0'}}>⚠ {String(x)}</div>)}<h3>Close</h3><div>{activeScript.closing}</div></div>}
        </div>
        <div style={{display:'grid',gap:14,alignContent:'start'}}>
          <div style={panel}><div style={{fontWeight:950}}>Objection / Rebuttal Coach</div><input value={objection} onChange={e=>setObjection(e.target.value)} placeholder="Type what the customer said" style={{width:'100%',boxSizing:'border-box',margin:'10px 0',padding:10,borderRadius:10,background:'#07101a',color:'#fff',border:'1px solid #27384a'}}/>{suggested.slice(0,8).map(r=><div key={r.id} style={{padding:10,marginBottom:8,borderRadius:10,background:'#0d1925',border:`1px solid ${r.risk_level==='high'||r.risk_level==='critical'?'#ff735c55':'#29465d'}`}}><div style={{fontSize:10,color:'#e8b944',fontWeight:900}}>{r.trigger_key.toUpperCase()} · {r.risk_level}</div><div style={{marginTop:5,lineHeight:1.45}}>{r.approved_response}</div>{r.follow_up_question&&<div style={{color:'#9dcde7',marginTop:5}}>Ask: {r.follow_up_question}</div>}{r.escalation_required&&<div style={{color:'#ff9a88',fontSize:11,marginTop:5}}>ESCALATION REQUIRED</div>}</div>)}</div>
          <div style={panel}><div style={{fontWeight:950}}>Wrap-up & Escalation</div><textarea value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Interaction summary" rows={5} style={{width:'100%',boxSizing:'border-box',margin:'10px 0',padding:10,borderRadius:10,background:'#07101a',color:'#fff',border:'1px solid #27384a'}}/><button disabled={busy||dnc===true||!contact||!consentBasis} onClick={()=>run(async()=>{const x:any=await logInteraction({sessionId:sessionId||null,campaignKey:activeScript?.campaign_key,channel:'voice',contact,consentBasis,scriptId:activeScript?.id,summary,objections:objection?[objection]:[],disclosuresGiven:activeScript?.required_disclosures||[]});setInteractionId(x.interaction.id);setNotice('Interaction logged.');})} style={{...btn,width:'100%'}}>SAVE INTERACTION</button><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>{[['supervisor','SUPERVISOR'],['compliance','COMPLIANCE'],['technical','TECH'],['accessibility','ACCESS']].map(([type,label])=><button key={type} disabled={!interactionId||busy} onClick={()=>run(async()=>{await escalateInteraction(interactionId,{type,priority:type==='compliance'?'urgent':'normal',reason:summary||objection||'Agent requested escalation'});setNotice(`${label} escalation opened.`)})} style={btn}>{label}</button>)}</div></div>
        </div>
      </div>}

      {mode==='developer'&&<div style={{display:'grid',gridTemplateColumns:'minmax(280px,.75fr) minmax(0,1.25fr)',gap:14}}>
        <div style={panel}><div style={{fontWeight:950}}>Connected Repository</div><div style={{fontSize:12,color:'#7f93a8',margin:'5px 0 10px'}}>{repo?.repository||status?.repo?.repository||'jgoldie1/Amm-project-'} · {repo?.branch||'main'} · {repo?.head?.slice?.(0,10)||'loading'}</div>{repo?.securityReview?.opaqueOrExecutableCandidates?.length>0&&<div style={{padding:10,borderRadius:10,background:'#281c14',color:'#ffd98a',fontSize:12,marginBottom:10}}>Security review candidates: {repo.securityReview.opaqueOrExecutableCandidates.length}. Candidates are not automatically malware.</div>}<div style={{maxHeight:'62vh',overflow:'auto'}}>{(repo?.files||[]).filter((f:any)=>/\.(tsx?|jsx?|mjs|cjs|json|md|yml|yaml|sh)$/.test(f.path)).slice(0,600).map((f:any)=><button key={f.path} onClick={()=>run(async()=>{setSelectedPath(f.path);const x:any=await getRepoFile(f.path);setFileContent(x.content);setAiReview('')})} style={{display:'block',width:'100%',textAlign:'left',padding:'7px 8px',marginBottom:3,border:'1px solid #172638',background:selectedPath===f.path?'#123148':'#08111b',color:'#bcd0df',borderRadius:7,cursor:'pointer',fontSize:11}}>{f.path}</button>)}</div></div>
        <div style={{display:'grid',gap:14,alignContent:'start'}}><div style={panel}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><div style={{fontWeight:950}}>File Viewer</div><div style={{fontSize:11,color:'#4fe3ff'}}>{selectedPath}</div></div><pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',maxHeight:'44vh',overflow:'auto',fontSize:11,lineHeight:1.5,color:'#c8d3dd',background:'#050a11',padding:12,borderRadius:10}}>{fileContent||'Select a source file from the repository.'}</pre></div><div style={panel}><div style={{fontWeight:950}}>Ask Stubbs AI about this code</div><textarea value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)} rows={3} style={{width:'100%',boxSizing:'border-box',margin:'10px 0',padding:10,borderRadius:10,background:'#07101a',color:'#fff',border:'1px solid #27384a'}}/><button disabled={!selectedPath||busy} onClick={()=>run(async()=>{const x:any=await askStubbsAboutRepoFile(selectedPath,aiQuestion);setAiReview(JSON.stringify(x.review,null,2))})} style={btn}>RUN TRI-BRAIN REVIEW</button>{aiReview&&<pre style={{whiteSpace:'pre-wrap',maxHeight:'35vh',overflow:'auto',fontSize:11,lineHeight:1.45,color:'#d9e6ef',marginTop:12}}>{aiReview}</pre>}</div></div>
      </div>}
    </div>
  </div>
}
