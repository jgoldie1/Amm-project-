import {useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
type Ticket={id:string;reference:string;subject:string;category:string;status:string;createdAt:string;reply?:string;description?:string}
export default function SupportOperatorConsole(){
 const [tickets,setTickets]=useState<Ticket[]>([]),[selected,setSelected]=useState<Ticket|null>(null),[status,setStatus]=useState('in_review'),[reply,setReply]=useState(''),[message,setMessage]=useState('Operator access requires an explicitly authorized account.'),[busy,setBusy]=useState(false)
 async function request(save=false){
  if(busy)return;setBusy(true);const c=new AbortController(),timer=setTimeout(()=>c.abort(),15000)
  try{const token=await getAccessToken();if(!token)throw new Error('Sign in with an authorized operator account first.')
   const r=await fetch('/api/support/tickets'+(save?'':'?queue=1'),{method:save?'PATCH':'GET',headers:{authorization:`Bearer ${token}`,...(save?{'content-type':'application/json'}:{})},body:save?JSON.stringify({ticketId:selected?.id,status,reply}):undefined,signal:c.signal,cache:'no-store'}),data=await r.json()
   if(!r.ok||!data.ok)throw new Error(data.error||'Operator service is unavailable.')
   if(save){setTickets(old=>old.map(t=>t.id===data.ticket.id?data.ticket:t));setSelected({...selected,...data.ticket});setMessage('Status and customer-visible reply saved. No email was sent.')}
   else{setTickets(data.tickets);setMessage(data.tickets.length+' tickets loaded.')}
  }catch(error){setMessage(error instanceof Error&&error.name!=='AbortError'?error.message:'Request timed out. Refresh the queue before retrying.')}
  finally{clearTimeout(timer);setBusy(false)}
 }
 return <section><details><summary>Support operator console</summary><p>Restricted to server-authorized support staff. Ordinary customers cannot read this queue or change ticket status.</p><button disabled={busy} onClick={()=>void request()}>Load operator queue</button><p role="status">{message}</p>{tickets.map(t=><button key={t.id} disabled={busy} onClick={()=>{setSelected(t);setStatus(t.status);setReply(t.reply||'')}}>{t.reference} · {t.subject} · {t.status}</button>)}{selected&&<form onSubmit={e=>{e.preventDefault();void request(true)}}><h3>{selected.subject}</h3><p>{selected.description}</p><label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="open">Open</option><option value="in_review">In review</option><option value="waiting_customer">Waiting on customer</option><option value="resolved">Resolved</option></select></label><label>Reply visible to the customer<textarea maxLength={5000} value={reply} onChange={e=>setReply(e.target.value)}/></label><button disabled={busy}>Save status and reply</button></form>}</details></section>
}
