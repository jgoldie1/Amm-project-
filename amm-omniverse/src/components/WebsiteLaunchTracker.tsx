import {useEffect,useState} from 'react'
type Entry={id:number;name:string;url:string;ownerApproval:boolean;mobileTest:boolean;leadTest:boolean;paymentTest:boolean;seniorApproval:boolean;notes:string}
const KEY='tryamm.client-websites.launch-tracker.v1'
const known:Record<number,string>={16:'Alphonso Gregory — CNA staffing',17:'Michael Castner — carting and meal prep',18:'Silvia Caster — insurance',19:'Nekira Frances — logistics',20:'Raymond Jarreau — financial/legacy planning'}
const initial=():Entry[]=>Array.from({length:20},(_,i)=>({id:i+1,name:known[i+1]||'',url:'',ownerApproval:false,mobileTest:false,leadTest:false,paymentTest:false,seniorApproval:false,notes:''}))
function load():Entry[]{try{const obj=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(obj)&&obj.length===20&&obj.every(x=>Number.isInteger(x.id)&&x.id>=1&&x.id<=20))return obj}catch{}return initial()}
function safeUrl(v:string){try{const u=new URL(v);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch{return false}}
const row:React.CSSProperties={border:'1px solid #35465a',borderRadius:15,padding:12,background:'#0e1725'}
const field:React.CSSProperties={padding:'11px 12px',border:'1px solid #3a536c',borderRadius:11,minHeight:44,boxSizing:'border-box',width:'100%',background:'#0a1020',color:'#fff'}
export default function WebsiteLaunchTracker(){
 const [sites,setSites]=useState<Entry[]>(load),[notice,setNotice]=useState('Save and export a backup of your checklist. Local changes are only on this device.')
 const [selected,setSelected]=useState(1)
 const item=sites.find(s=>s.id===selected)!
 const verified=sites.filter(s=>Boolean(s.name.trim())&&safeUrl(s.url)&&s.ownerApproval&&s.mobileTest&&s.leadTest&&s.seniorApproval&&(s.paymentTest||s.notes.toLowerCase().includes('no payments'))).length
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(sites))}catch{setNotice('This browser cannot save local drafts. Export a backup.') }},[sites])
 function edit<K extends keyof Entry>(k:K,v:Entry[K]){setSites(a=>a.map(s=>s.id===selected?{...s,[k]:v}:s))}
 function download(){
  const rows=[['Slot','Client / website','Verified URL','Owner approved','Mobile verified','Lead delivered','Payment tested','Senior approved','Notes'],
   ...sites.map(s=>[String(s.id),s.name,s.url,...([s.ownerApproval,s.mobileTest,s.leadTest,s.paymentTest,s.seniorApproval].map(String)),s.notes])]
  const csv=rows.map(values=>values.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n')
  const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='TRYAMM-20-client-website-release-tracker.csv';document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(u),1000)
  setNotice('CSV downloaded for your developer and Victor. No websites were published.')
 }
 const ready=Boolean(item.name.trim())&&safeUrl(item.url)&&item.ownerApproval&&item.mobileTest&&item.leadTest&&item.seniorApproval&&(item.paymentTest||item.notes.toLowerCase().includes('no payments'))
 return <main aria-label="20 client website release tracker" style={{minHeight:'100dvh',background:'#070e19',color:'#fff',fontFamily:'system-ui',padding:'max(14px,env(safe-area-inset-top)) 12px 35px'}}>
 <div style={{maxWidth:980,margin:'auto'}}>
  <a href="/creator-launch" style={{display:'inline-block',color:'#90d8ff',padding:'12px 0'}}>← CREATOR / BUSINESS LAUNCH</a>
  <h1 style={{fontSize:'clamp(26px,6vw,42px)',margin:'7px 0'}}>20 Client Websites • Launch Tracker</h1>
  <p style={{color:'#bed0e0',lineHeight:1.6}}>These are 20 independent client deliveries, separate from the 111 template categories for sale. Client sites require their own approved URL, content, functional contact route, and individual production QA. No client site is assumed deployed.</p>
  <p style={{color:'#ffdb91'}}>Owner-reported QA completions: {verified}/20. Not independently verified by TRYAMM servers.</p>
  <nav aria-label="Client site slots" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(46px,1fr))',gap:6,marginBottom:16}}>{sites.map(s=><button type="button" key={s.id} onClick={()=>setSelected(s.id)} aria-pressed={s.id===selected} aria-label={'Client website slot '+s.id} style={{minHeight:44,borderRadius:10,border:'1px solid '+(s.id===selected?'#79dfff':'#3c5872'),background:s.id===selected?'#1b536e':'#152237',color:'#fff',fontWeight:900}}>{s.id}</button>)}</nav>
  <section style={row}><h2 style={{fontSize:19}}>Client {selected}: {item.name||'Owner and website mapping needed'}</h2>
   <div style={{display:'grid',gap:12}}>
    <label>Business name<input style={field} value={item.name} maxLength={110} onChange={e=>edit('name',e.target.value)} placeholder="Business / client name"/></label>
    <label>Verified production address (HTTPS)<input style={field} value={item.url} maxLength={300} onChange={e=>edit('url',e.target.value)} placeholder="https://..." inputMode="url"/></label>
    {item.url&&!safeUrl(item.url)&&<p role="alert" style={{color:'#ffb4a7'}}>A verified public HTTPS address is required before readiness can be marked.</p>}
    {([['ownerApproval','Client approved content, permissions and branding'],['mobileTest','Website buttons and mobile layout tested'],['leadTest','Real email/booking/customer inquiry received'],['paymentTest','Verified checkout and refund test (only if site accepts payments)'],['seniorApproval','Independent reviewer signed off']] as const).map(([id,label])=><label key={id} style={{display:'flex',alignItems:'center',gap:10,minHeight:44}}><input type="checkbox" checked={item[id]} onChange={e=>edit(id,e.target.checked)}/>{label}</label>)}
    <label>Proof, issues or exceptions<textarea rows={3} style={{...field,minHeight:90}} value={item.notes} maxLength={1200} onChange={e=>edit('notes',e.target.value)} placeholder='For nonpayment sites, note "no payments" after verifying that no checkout is offered.' /></label>
    <strong style={{color:ready?'#a8ffd6':'#ffcc92'}}>{ready?'OWNER-MARKED READY FOR FINAL RELEASE VERIFICATION':'NOT YET RELEASE-VERIFIED'}</strong>
   </div>
  </section>
  <button type="button" onClick={download} style={{minHeight:48,marginTop:16,padding:'12px 20px',background:'#115879',border:'1px solid #72ddfa',borderRadius:12,color:'#fff',fontWeight:900}}>DOWNLOAD 20-SITE QA CSV</button>
  <p role="status" style={{color:'#9cb5ce'}}>{notice}</p>
  <p style={{fontSize:11,color:'#8296ac'}}>This checklist uses local browser storage; export and back up regularly. It does not publish websites, test URLs, send forms, charge cards, or certify launch status.</p>
 </div>
 </main>
}
