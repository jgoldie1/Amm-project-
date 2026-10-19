import {useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
const STEPS=[
 ['account','Use your TRYAMM account','Sign in below with your existing account; no second game account is needed.'],
 ['business','Prepare your business details','Public business name, contact details, service area and offerings.'],
 ['template','Choose a template and package','Use the numbered website studio and review what is included.'],
 ['content','Supply your logo, photos and text','Use material you own or have permission to use.'],
 ['review','Review language and accessibility','Review translated claims, keyboard access, phone layout and contact links.'],
 ['domain','Choose domain and hosting','Domain ownership and hosting setup still require verification.'],
 ['payment','Confirm your sales and delivery terms','Define products, fulfillment, refund terms and support contact. Checkout activation is separate.'],
 ['test','Run a launch rehearsal','Check a real contact request, preview, download and supported purchase/delivery flow before publication.'],
] as const
function download(value:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
export default function BusinessOnboarding(){
 const [checked,setChecked]=useState<string[]>([]),[note,setNote]=useState('')
 const [category,setCategory]=useState('website-setup'),[subject,setSubject]=useState(''),[description,setDescription]=useState('')
 const [requestId,setRequestId]=useState(()=>crypto.randomUUID()),[busy,setBusy]=useState(false),[message,setMessage]=useState('No ticket has been submitted.')
 const [tickets,setTickets]=useState<Array<{reference:string;subject:string;status:string}>>([])
 const [submitted,setSubmitted]=useState(false)
 const record=()=>({requestId,category,subject,description,state:submitted?'submitted':'local-draft-or-unconfirmed',createdAt:new Date().toISOString()})
 async function api(method:'GET'|'POST'){
  if(busy)return;setBusy(true)
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000)
  try{
   const token=await getAccessToken();if(!token){setMessage('Sign in to submit or view tickets. Your draft has not been sent.');return}
   const response=await fetch('/api/support/tickets',{method,headers:{authorization:`Bearer ${token}`,...(method==='POST'?{'content-type':'application/json'}:{})},body:method==='POST'?JSON.stringify(record()):undefined,signal:controller.signal,cache:'no-store'})
   const data=await response.json()
   if(!response.ok||!data.ok)throw new Error(data.error||'The ticket service could not confirm this request.')
   if(method==='GET'){setTickets(data.tickets);setMessage(data.tickets.length?'Your submitted tickets are shown below.':'No submitted tickets were found.')}
   else{if(!data.ticket?.reference)throw new Error('No server ticket reference was returned. Keep your draft and check ticket history.');setSubmitted(true);setTickets(old=>[data.ticket,...old.filter(t=>t.reference!==data.ticket.reference)]);setMessage('Submitted: '+data.ticket.reference+'. No response time is promised during beta.')}
  }catch(error){setMessage(error instanceof Error&&error.name!=='AbortError'?error.message:'Request timed out. Submission is unconfirmed. Keep the same request ID and check history before retrying.')}
  finally{clearTimeout(timer);setBusy(false)}
 }
 return <section id="onboarding" aria-labelledby="onboarding-title"><p className="eyebrow">START HERE</p><h2 id="onboarding-title">Your website onboarding</h2><p>Work at your own pace. These checkboxes track your preparation only; they do not verify payment or publish a website.</p><p aria-live="polite">{checked.length} of {STEPS.length} preparation steps marked complete</p><ol className="onboarding-steps">{STEPS.map(([id,title,detail])=><li key={id}><label><input type="checkbox" checked={checked.includes(id)} onChange={e=>setChecked(old=>e.target.checked?[...old,id]:old.filter(x=>x!==id))}/><span><strong>{title}</strong><small>{detail}</small></span></label></li>)}</ol><div className="template-actions"><a href="#template-store">Open website studio ↓</a><button onClick={()=>{download({version:1,completedSteps:checked,verification:'self-reported-not-launched'},'TRYAMM-onboarding-checklist.json');setNote('Checklist prepared for download. It has not been submitted.')}}>Download my checklist</button></div><p role="status">{note}</p><p>Progress stays in this page until downloaded. Refreshing clears the checklist. Do not enter passwords, bank information or patient details.</p>
 <h3>Support tickets</h3><p>Describe what you need—no screenshot required. Submission requires sign-in and an activated support service. No live chat, emergency service or guaranteed response time is provided.</p>
 <form onSubmit={e=>{e.preventDefault();void api('POST')}}><fieldset disabled={busy||submitted}><legend>New support request</legend><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option value="website-setup">Website setup</option><option value="technical">Technical problem</option><option value="accessibility">Accessibility assistance</option><option value="billing">Billing question</option><option value="other">Other</option></select></label><label>Subject<input required minLength={3} maxLength={160} value={subject} onChange={e=>setSubject(e.target.value)}/></label><label>What do you need help with?<textarea required minLength={10} maxLength={5000} value={description} onChange={e=>setDescription(e.target.value)}/></label><button type="submit">{busy?'Submitting…':'Submit support ticket'}</button></fieldset></form>
 <p role="status">{message}</p><small>Draft/request ID: {requestId}</small><div className="template-actions"><button disabled={busy} onClick={()=>download(record(),'TRYAMM-support-ticket.json')}>Download this ticket</button><button disabled={busy} onClick={()=>void api('GET')}>View my submitted tickets</button><button disabled={busy} onClick={()=>{setRequestId(crypto.randomUUID());setSubject('');setDescription('');setSubmitted(false);setMessage('New draft. It has not been submitted.')}}>Start a new ticket</button></div>
 {tickets.map(t=><article className="order" key={t.reference}><strong>{t.reference}</strong><p>{t.subject} · {t.status}</p></article>)}
 <details><summary>What still needs activation before paid launch?</summary><ul><li>Verified checkout, signed payment confirmation and refunds.</li><li>Paid template delivery, hosting provisioning and domain verification.</li><li>Support storage, operator review queue and a published response policy.</li><li>AI usage metering, spending limits and successful-delivery accounting.</li><li>Customer terms, privacy, retention and refund policies.</li><li>Device, accessibility and end-to-end customer testing.</li></ul></details></section>
}
