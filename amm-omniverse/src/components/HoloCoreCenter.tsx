import { useEffect, useState } from 'react'
import { analyticsSummary, createCreatorProject, createWorkTask, enroll, getIdentity, getWellnessProfile, getWorkProfile, listCourses, listCreatorProjects, listEnrollments, listPaymentIntents, listWorkTasks, logWellnessSession, recordMetric, updateLearning, wellnessNotice } from '../services/holoCore'
import { isSupabaseConfigured } from '../services/supabaseClient'

interface Props{onClose:()=>void}
type Tab='work'|'wellness'|'education'|'creator'|'analytics'|'identity'|'pay'

export default function HoloCoreCenter({onClose}:Props){
 const [tab,setTab]=useState<Tab>('work'),[data,setData]=useState<any>({}),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
 const box:React.CSSProperties={background:'#091426',border:'1px solid #29466d',borderRadius:14,padding:12}
 const btn:React.CSSProperties={background:'#10233d',border:'1px solid #78d5ff55',color:'#dff6ff',borderRadius:9,padding:'8px 11px',cursor:'pointer',fontFamily:'monospace'}
 async function load(t=tab){if(!isSupabaseConfigured()){setMsg('Supabase is not configured for this build.');return}setBusy(true);try{
   if(t==='work')setData({profile:await getWorkProfile(),tasks:await listWorkTasks()})
   if(t==='wellness')setData({profile:await getWellnessProfile()})
   if(t==='education')setData({courses:await listCourses(),enrollments:await listEnrollments()})
   if(t==='creator')setData({projects:await listCreatorProjects()})
   if(t==='analytics')setData(await analyticsSummary())
   if(t==='identity')setData({identity:await getIdentity()})
   if(t==='pay')setData({intents:await listPaymentIntents()})
 }catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 useEffect(()=>{load(tab)},[tab])
 const tabs:[Tab,string][]=[['work','Holo Work'],['wellness','Holo Health/Fitness'],['education','Holo Education'],['creator','Holo Creator'],['analytics','Holo Analytics'],['identity','Holo Identity'],['pay','Holo Pay']]
 return <div style={{position:'fixed',inset:0,zIndex:10080,background:'rgba(2,8,20,.99)',color:'#eef6ff',fontFamily:'monospace',overflowY:'auto'}}><div style={{maxWidth:1120,margin:'0 auto',padding:16}}>
   <div style={{display:'flex',alignItems:'center',gap:12}}><button style={btn} onClick={onClose}>← Back</button><div><h2 style={{margin:0,color:'#78d5ff'}}>Holo Core</h2><small style={{color:'#7d8fa5'}}>Work • Wellness • Education • Creator • Analytics • Identity • Pay</small></div></div>
   <div style={{display:'flex',flexWrap:'wrap',gap:7,margin:'14px 0'}}>{tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{...btn,borderColor:tab===k?'#ffd166':'#78d5ff55',color:tab===k?'#ffd166':'#dff6ff'}}>{l}</button>)}</div>
   {msg&&<div style={{...box,marginBottom:10,borderColor:'#ffd16666'}}>{msg}</div>}{busy&&<p>Loading…</p>}
   {!busy&&tab==='work'&&<section style={box}><h3>Unified Career Dashboard</h3><p>Skills, call-center, logistics and business work all converge here.</p><pre style={{whiteSpace:'pre-wrap',color:'#9fb4cc'}}>{JSON.stringify(data.profile??{},null,2)}</pre><button style={btn} onClick={async()=>{await createWorkTask('logistics','Complete next logistics dispatch scenario','holo-work',{route:'Chicago→Atlanta'});await recordMetric('work_task_created');setMsg('Work task created.');load('work')}}>Create Logistics Task</button><div style={{marginTop:10}}>{(data.tasks??[]).map((t:any)=><div key={t.id} style={{...box,marginTop:6}}><b>{t.title}</b> <small>{t.status}</small></div>)}</div></section>}
   {!busy&&tab==='wellness'&&<section style={box}><h3>Holo Health/Fitness</h3><p style={{color:'#ffd166'}}>{wellnessNotice}</p><button style={btn} onClick={async()=>{await logWellnessSession('mobility-walk',20,'light','General wellness activity');await recordMetric('wellness_session',20,'wellness');setMsg('Wellness session logged.');load('wellness')}}>Log 20-minute Wellness Session</button><pre style={{whiteSpace:'pre-wrap',color:'#9fb4cc'}}>{JSON.stringify(data.profile??{},null,2)}</pre></section>}
   {!busy&&tab==='education'&&<section style={box}><h3>Academy + Generations Learning</h3><div style={{display:'grid',gap:8}}>{(data.courses??[]).map((c:any)=><div key={c.id} style={box}><b>{c.title}</b><p>{c.description}</p><button style={btn} onClick={async()=>{await enroll(c.id);await recordMetric('course_enrollment');setMsg(`Enrolled in ${c.title}.`);load('education')}}>Enroll</button><button style={{...btn,marginLeft:7}} onClick={async()=>{await updateLearning(c.id,100);await recordMetric('course_completed');setMsg(`${c.title} marked complete.`);load('education')}}>Complete Demo Lesson</button></div>)}</div></section>}
   {!busy&&tab==='creator'&&<section style={box}><h3>Holo Creator Studio</h3><p>Video, music, game, book, world, app and AI-agent projects share one creation center.</p><div style={{display:'flex',flexWrap:'wrap',gap:7}}>{['video','music','game','book','world','app','agent'].map(k=><button key={k} style={btn} onClick={async()=>{await createCreatorProject(k,`New ${k} project`);await recordMetric('creator_project_created',1,'creator',{type:k});setMsg(`${k} project created.`);load('creator')}}>+ {k}</button>)}</div>{(data.projects??[]).map((p:any)=><div key={p.id} style={{...box,marginTop:7}}><b>{p.title}</b> <small>{p.project_type} • {p.status}</small></div>)}</section>}
   {!busy&&tab==='analytics'&&<section style={box}><h3>Holo Analytics</h3><p>Operational metrics for creators, worlds, business, workforce and advertising.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8}}>{Object.entries(data.totals??{}).map(([k,v])=><div key={k} style={box}><b>{k}</b><div style={{fontSize:24,color:'#ffd166'}}>{String(v)}</div></div>)}</div></section>}
   {!busy&&tab==='identity'&&<section style={box}><h3>Holo Identity</h3><p>Passport-linked age lane, accessibility, credentials and permissions.</p><pre style={{whiteSpace:'pre-wrap',color:'#9fb4cc'}}>{JSON.stringify(data.identity??{},null,2)}</pre></section>}
   {!busy&&tab==='pay'&&<section style={box}><h3>Holo Pay</h3><p>Payment intents are human-confirmed and executed only through approved payment providers such as Stripe. AI cannot autonomously transfer funds.</p><p style={{color:'#9fb4cc'}}>Create purchases through existing Stripe checkout flows; this panel shows the account's Holo payment-intent history.</p>{(data.intents??[]).map((i:any)=><div key={i.id} style={{...box,marginTop:7}}><b>{i.purpose}</b><br/><small>{i.currency?.toUpperCase()} {(i.amount_cents/100).toFixed(2)} • {i.status}</small></div>)}</section>}
 </div></div>
}
