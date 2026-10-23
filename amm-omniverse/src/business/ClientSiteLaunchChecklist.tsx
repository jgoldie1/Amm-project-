import {useState} from 'react'
const gates=[
 ['owner','Client ownership and branding approved'],
 ['assets','Photo, logo, talent and music rights approved'],
 ['domain','Real domain, DNS and HTTPS verified'],
 ['contact','Inquiry, appointment and spam handling tested'],
 ['checkout','Merchant, payments, refunds or disabled checkout verified'],
 ['phone','Mobile navigation, accessibility and performance tested'],
 ['handoff','Customer access, backup, monitoring and cost limits verified'],
] as const
export default function ClientSiteLaunchChecklist({templateId,businessName,sector}:{templateId:string;businessName:string;sector:string}){
 const [checked,setChecked]=useState<Record<string,boolean>>({})
 const [desiredDomain,setDesiredDomain]=useState('')
 const [message,setMessage]=useState('Template preview only; no business website has been deployed.')
 const completed=gates.filter(([key])=>checked[key]).length
 const download=()=>{
  const handoff={schema:'tryamm.client-site.launch.v1',templateId,businessName,sector,requestedDomain:desiredDomain.trim(),
   status:'draft-needs-independent-verification',productionPublished:false,verifiedLiveUrl:null,
   createdAt:new Date().toISOString(),tasks:gates.map(([id,label])=>({id,label,ownerReviewed:Boolean(checked[id])})),
   disclaimer:'Checks are self-reported and do not prove deployment, form delivery, payment or domain ownership.'}
  const url=URL.createObjectURL(new Blob([JSON.stringify(handoff,null,2)],{type:'application/json'}))
  const a=document.createElement('a');a.href=url;a.download='TRYAMM-client-'+templateId+'-handoff.json';document.body.append(a);a.click();a.remove()
  window.setTimeout(()=>URL.revokeObjectURL(url),1200)
  setMessage('Downloaded client handoff. No website, checkout or domain was published.')
 }
 return <details aria-label="Individual client website launch checklist" style={{marginTop:12,padding:12,borderRadius:12,background:'#0b2031',border:'1px solid #52859a',color:'#e8f7ff'}}>
  <summary style={{minHeight:44,cursor:'pointer',fontWeight:900}}>CLIENT WEBSITE LAUNCH GATE • {completed}/7 • NOT LIVE</summary>
  <p style={{fontSize:12,lineHeight:1.5}}>111 template categories are reusable previews, not 111 independently published customer websites. Finish each real business and have a developer verify its deployment separately.</p>
  <label style={{display:'block',marginBottom:8}}>Intended customer domain<input type="text" maxLength={180} value={desiredDomain} onChange={e=>setDesiredDomain(e.target.value)} placeholder="customer-business.com" style={{minHeight:44,width:'100%',boxSizing:'border-box'}} /></label>
  <div style={{display:'grid',gap:7}}>{gates.map(([id,label])=><label key={id} style={{display:'flex',alignItems:'center',gap:9,padding:8,border:'1px solid #345669',borderRadius:9}}>
   <input type="checkbox" checked={Boolean(checked[id])} onChange={e=>setChecked(p=>({...p,[id]:e.target.checked}))} style={{width:20,height:20}}/>
   <span style={{fontSize:12}}>{label}</span>
  </label>)}</div>
  <button type="button" onClick={download} style={{minHeight:48,marginTop:10,padding:'9px 14px',borderRadius:10,border:'1px solid #62e6da',background:'#10443b',color:'#fff',fontWeight:900}}>DOWNLOAD CLIENT LAUNCH HANDOFF</button>
  <p role="status" style={{fontSize:12}}>{message}</p>
 </details>
}
