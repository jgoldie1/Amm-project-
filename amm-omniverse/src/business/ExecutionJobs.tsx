import {useRef,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import type {WebsiteDetails} from './templateCatalog'
type Job={id:string,status:string,attempts:number,error?:string,output?:{html:string,sha256:string}}
export default function ExecutionJobs({details}:{details:WebsiteDetails}){
 const [jobs,setJobs]=useState<Job[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 const pending=useRef<{body:string,key:string}|null>(null)
 async function api(method:string,body?:unknown){
  const token=await getAccessToken();if(!token)throw new Error('Sign in with your studio owner account first.')
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000)
  try{
  const response=await fetch('/api/agents/jobs',{method,headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:controller.signal})
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Execution service unavailable.')
  return data
  }finally{clearTimeout(timer)}
 }
 async function refresh(){const data=await api('GET');setJobs(data.jobs)}
 async function action(fn:()=>Promise<void>){
  setBusy(true);setMessage('')
  try{await fn()}catch(error){setMessage(error instanceof Error?error.message:'Could not complete the request.')}finally{setBusy(false)}
 }
 async function create(){
  // Only public text is uploaded. Photos and other form fields stay local.
  const {name,headline,description,services,email,phone,location,color,language}=details
  const input={name,headline,description,services,email,phone,location,color,language},body=JSON.stringify(input)
  if(!pending.current||pending.current.body!==body)pending.current={body,key:crypto.randomUUID()}
  const data=await api('POST',{kind:'website-draft',requestKey:pending.current.key,input})
  setJobs(old=>[data.job,...old.filter(j=>j.id!==data.job.id)])
  const result=await api('PATCH',{id:data.job.id})
  await refresh()
  setMessage(result.completed?'Website draft completed and saved.':'Job saved. Check status or resume when available.')
 }
 function download(job:Job){
  if(!job.output?.html)return
  const url=URL.createObjectURL(new Blob([job.output.html],{type:'text/html;charset=utf-8'})),a=document.createElement('a')
  a.href=url;a.download=`TRYAMM-draft-${job.id}.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)
 }
 return <section aria-labelledby="execution-title"><h3 id="execution-title">AI Café · saved website drafts</h3>
 <p>Owner pilot: save and execute a simple website draft from the public business text above. This uploads that text to your account. Photos, checkout, publishing and paid AI are not included. Your local preview has a separate design.</p>
 <p>Limit: 10 drafts per account and 100 across the pilot in 24 hours; at most three attempts per job.</p>
 <button type="button" disabled={busy||!details.name.trim()||!details.headline.trim()||!details.description.trim()} onClick={()=>void action(create)}>Save & execute draft</button>
 <button type="button" disabled={busy} onClick={()=>void action(refresh)}>Load saved jobs</button>
 <p role="status">{busy?'Working…':message}</p>
 <ul>{jobs.map(job=><li key={job.id}><strong>{job.status}</strong> · {job.id.slice(0,8)} · attempts {job.attempts}/3
 {job.status==='succeeded'&&job.output&&<button type="button" onClick={()=>download(job)}>Download saved draft</button>}
 {['queued','running'].includes(job.status)&&<button type="button" disabled={busy} onClick={()=>void action(async()=>{await api('PATCH',{id:job.id});await refresh();setMessage('Status refreshed. A running job can be reclaimed after its 60-second lease expires.')})}>Resume / check job</button>}
 {job.error&&<span> · {job.error}</span>}</li>)}</ul></section>
}
