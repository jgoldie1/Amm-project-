import React,{useState} from 'react'
type Task={id:string;title:string;status:string}
export function GoogleXOneHandCommandCenter({tasks,onSelect}:{tasks:Task[];onSelect:(id:string)=>void}){
 const [selected,setSelected]=useState('')
 return <section aria-label="GoogleX one-hand command center" style={{maxWidth:560,padding:16}}>
 <h2>GoogleX Guardian</h2><p>Review only. Nothing deploys or charges automatically.</p>
 {tasks.map(t=><button key={t.id} type="button" onClick={()=>{setSelected(t.id);onSelect(t.id)}} aria-pressed={selected===t.id} style={{display:'block',width:'100%',minHeight:56,marginBottom:12,fontSize:18,textAlign:'left',padding:12}}>{t.title} — {t.status}</button>)}
 </section>
}
