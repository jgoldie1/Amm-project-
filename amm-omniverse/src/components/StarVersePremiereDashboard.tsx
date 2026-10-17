import React,{useMemo,useState} from 'react';
const jobs=['Master Performance','Stage Scene','Camera Plan','Lighting Cues','Captions','Translations','Reel Cuts','Poster','LIVE Rundown','MR Experience'];
export default function StarVersePremiereDashboard(){
 const [goal,setGoal]=useState("Turn my performance into tonight's StarVerse premiere.");
 const [planned,setPlanned]=useState(false),[approved,setApproved]=useState<string[]>([]);
 const remaining=useMemo(()=>jobs.filter(j=>!approved.includes(j)),[approved]);
 return <section aria-label="StarVerse Create Once Premiere" style={{padding:16,borderRadius:22,background:'#090b18',color:'white'}}>
  <h2 style={{margin:'0 0 4px'}}>CREATE ONCE → BECOME A WORLD</h2><div style={{opacity:.7}}>Benny coordinates your AI Creative Company. Nothing publishes without approval.</div>
  <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,marginTop:14}}><input value={goal} onChange={e=>setGoal(e.target.value)} style={{padding:12,fontSize:16,borderRadius:10}}/><button onClick={()=>setPlanned(true)}>BUILD PREMIERE PLAN</button></div>
  {planned&&<><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8,marginTop:14}}>{jobs.map(j=><button key={j} onClick={()=>setApproved(a=>a.includes(j)?a:[...a,j])} style={{minHeight:58,borderRadius:12,border:'1px solid #7587ff',background:approved.includes(j)?'#304f39':'#171d38',color:'white'}}>{approved.includes(j)?'✓ ':''}{j}</button>)}</div>
  <div style={{marginTop:12,padding:10,borderRadius:10,background:'#13182d'}}>AI COMPANY STATUS: {remaining.length?remaining.length+' production items awaiting creator review/approval.':'All production items approved. Final publish remains a separate creator action.'}</div>
  <button disabled={remaining.length>0} style={{marginTop:10}}>FINAL PUBLISH APPROVAL</button></>}
 </section>
}
