import {useEffect,useState} from 'react'
import type {ChangeEvent} from 'react'
type Entry={id:number;name:string;url:string;ownerApproval:boolean;mobileTest:boolean;leadTest:boolean;paymentTest:boolean;paymentNotApplicable:boolean;paymentExceptionReason:string;seniorApproval:boolean;notes:string}
const KEY='tryamm.client-websites.launch-tracker.v1'
const known:Record<number,string>={16:'Alphonso Gregory — CNA staffing',17:'Michael Castner — carting and meal prep',18:'Silvia Caster — insurance',19:'Nekira Frances — logistics',20:'Raymond Jarreau — financial/legacy planning'}
const initial=():Entry[]=>Array.from({length:20},(_,i)=>({id:i+1,name:known[i+1]||'',url:'',ownerApproval:false,mobileTest:false,leadTest:false,paymentTest:false,paymentNotApplicable:false,paymentExceptionReason:'',seniorApproval:false,notes:''}))
function normalizeEntries(value:unknown):Entry[]|null{
 if(!Array.isArray(value)||value.length!==20)return null
 const ids=new Set<number>(),clean:Entry[]=[]
 for(const x of value){
  if(!x||typeof x!=='object')return null
  const record=x as Partial<Entry>
  if(!Number.isInteger(record.id)||!record.id||record.id<1||record.id>20||ids.has(record.id))return null
  ids.add(record.id)
  for(const field of ['ownerApproval','mobileTest','leadTest','paymentTest','seniorApproval'] as const){
   if(typeof record[field]!=='boolean')return null
  }
  if(typeof record.name!=='string'||typeof record.url!=='string'||typeof record.notes!=='string')return null
  if(record.name.length>110||record.url.length>300||record.notes.length>1200)return null
  const reason=typeof record.paymentExceptionReason==='string'?record.paymentExceptionReason:''
  if(reason.length>350||record.paymentNotApplicable!==undefined&&typeof record.paymentNotApplicable!=='boolean')return null
  // Preserve legacy v1 checks but never silently accept a former notes-based
  // "no payments" exception. It now requires a separate explicit checkbox.
  clean.push({id:record.id,name:record.name,url:record.url,
   ownerApproval:record.ownerApproval===true,mobileTest:record.mobileTest===true,leadTest:record.leadTest===true,
   paymentTest:record.paymentTest===true,paymentNotApplicable:record.paymentNotApplicable===true,
   paymentExceptionReason:reason,seniorApproval:record.seniorApproval===true,notes:record.notes})
 }
 return clean.sort((a,b)=>a.id-b.id)
}
function load():Entry[]{
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');return normalizeEntries(saved)||initial()}
 catch{return initial()}
}
const noPaymentApproved=(entry:Entry)=>entry.paymentNotApplicable&&entry.paymentExceptionReason.trim().length>=15
const siteReady=(entry:Entry)=>Boolean(entry.name.trim())&&safeUrl(entry.url)&&entry.ownerApproval&&entry.mobileTest&&entry.leadTest&&entry.seniorApproval&&(entry.paymentTest||noPaymentApproved(entry))
function safeUrl(v:string){try{const u=new URL(v);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch{return false}}
const row:React.CSSProperties={border:'1px solid #35465a',borderRadius:15,padding:12,background:'#0e1725'}
const field:React.CSSProperties={padding:'11px 12px',border:'1px solid #3a536c',borderRadius:11,minHeight:44,boxSizing:'border-box',width:'100%',background:'#0a1020',color:'#fff'}
export default function WebsiteLaunchTracker(){
 const [sites,setSites]=useState<Entry[]>(load),[notice,setNotice]=useState('Save and export a backup of your checklist. Local changes are only on this device.')
 const [selected,setSelected]=useState(1)
 const item=sites.find(s=>s.id===selected)!
 const missingChecks=(entry:Entry)=>{
  const missing:string[]=[]
  if(!entry.name.trim())missing.push('Client name and ownership')
  if(!safeUrl(entry.url))missing.push('Real public HTTPS address')
  if(!entry.ownerApproval)missing.push('Client approval and image/content rights')
  if(!entry.mobileTest)missing.push('Mobile layout and buttons test')
  if(!entry.leadTest)missing.push('Real customer contact or booking received')
  if(!entry.paymentTest&&!noPaymentApproved(entry))missing.push('Verified checkout/refund, or explicitly approved no-payment exception with a written reason')
  if(!entry.seniorApproval)missing.push('Independent senior review')
  return missing
 }
 const selectedMissing=missingChecks(item)
 const verified=sites.filter(siteReady).length
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(sites))}catch{setNotice('This browser cannot save local drafts. Export a backup.') }},[sites])
 function edit<K extends keyof Entry>(k:K,v:Entry[K]){setSites(a=>a.map(s=>s.id===selected?{...s,[k]:v}:s))}
 function download(){
  const rows=[['Slot','Client / website','Production URL to verify','Owner approved','Mobile verified','Lead delivered','Payment tested','No-payment exception','Exception reason','Senior approved','Notes','Outstanding launch requirements'],
   ...sites.map(s=>[String(s.id),s.name,s.url,...([s.ownerApproval,s.mobileTest,s.leadTest,s.paymentTest,s.paymentNotApplicable].map(String)),s.paymentExceptionReason,String(s.seniorApproval),s.notes,missingChecks(s).join('; ')])]
  const csv=rows.map(values=>values.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n')
  const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='TRYAMM-20-client-website-release-tracker.csv';document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(u),1000)
  setNotice('CSV downloaded for your developer and Victor. No websites were published.')
 }
 function downloadBackup(){
  const backup={schema:'tryamm.client-website-launch-backup.v2',exportedAt:new Date().toISOString(),source:'owner-reported-local-qa',entries:sites}
  const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}))
  const link=document.createElement('a')
  link.href=url;link.download='TRYAMM-20-client-websites-restorable-backup.json'
  document.body.appendChild(link);link.click();link.remove()
  window.setTimeout(()=>URL.revokeObjectURL(url),1000)
  setNotice('Restorable JSON backup downloaded. Store it safely with your site owner and senior reviewer.')
 }
 async function importBackup(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0]
  event.target.value=''
  if(!file)return
  if(file.size>128*1024){setNotice('Backup rejected: maximum file size is 128 KB. Existing sites were not changed.');return}
  try{
   const backup=JSON.parse(await file.text())
   if(backup?.schema!=='tryamm.client-website-launch-backup.v2')throw new Error('This is not the 20-site TRYAMM JSON backup format')
   const restored=normalizeEntries(backup.entries)
   if(!restored)throw new Error('Invalid backup entries: exactly 20 unique client slots are required')
   if(!window.confirm('Replace the 20 local website checklists with this backup? Export your existing JSON first.'))return
   setSites(restored)
   setSelected(1)
   setNotice('20 owner-reported website checklists restored locally. No site was published or independently verified.')
  }catch(error){setNotice('Backup not imported: '+(error instanceof Error?error.message:'Invalid JSON'))}
 }
 const ready=siteReady(item)
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
    {item.url&&!safeUrl(item.url)&&<p role="alert" style={{color:'#ffb4a7'}}>A real public HTTPS address is required before readiness can be marked.</p>}
    {item.url&&safeUrl(item.url)&&<a href={item.url} target="_blank" rel="noopener noreferrer" style={{color:'#91e7ff',display:'inline-block',padding:'10px 0'}}>↗ OPEN CLIENT SITE FOR MANUAL TEST</a>}
    {([['ownerApproval','Client approved content, permissions and branding'],['mobileTest','Website buttons and mobile layout tested'],['leadTest','Real email/booking/customer inquiry received'],['paymentTest','Verified checkout and refund test (only if site accepts payments)'],['seniorApproval','Independent reviewer signed off']] as const).map(([id,label])=><label key={id} style={{display:'flex',alignItems:'center',gap:10,minHeight:44}}><input type="checkbox" checked={item[id]} onChange={e=>edit(id,e.target.checked)}/>{label}</label>)}
    <label style={{display:'flex',alignItems:'center',gap:10,minHeight:44}}><input type="checkbox" checked={item.paymentNotApplicable} onChange={e=>edit('paymentNotApplicable',e.target.checked)}/> This website does not accept payments and I explicitly approve skipping payment QA</label>
    {item.paymentNotApplicable&&<label>Reason for skipping payment testing<input style={field} value={item.paymentExceptionReason} maxLength={350} onChange={e=>edit('paymentExceptionReason',e.target.value)} placeholder="No checkout, subscription, donation or payment is offered on this client website." /></label>}
    <label>Proof, issues or exceptions<textarea rows={3} style={{...field,minHeight:90}} value={item.notes} maxLength={1200} onChange={e=>edit('notes',e.target.value)} placeholder="Document reviewer evidence, failed tests and next actions. A note alone cannot waive payment testing." /></label>
    <strong style={{color:ready?'#a8ffd6':'#ffcc92'}}>{ready?'OWNER-MARKED READY FOR FINAL RELEASE VERIFICATION':'NOT YET RELEASE-VERIFIED'}</strong>
    {selectedMissing.length>0&&<div aria-label="Outstanding website launch requirements" style={{background:'#182438',padding:12,borderRadius:12}}><strong>Still needed for this site</strong><ul>{selectedMissing.map(x=><li key={x}>{x}</li>)}</ul></div>}
   </div>
  </section>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>
   <button type="button" onClick={download} style={{minHeight:48,padding:'12px 20px',background:'#115879',border:'1px solid #72ddfa',borderRadius:12,color:'#fff',fontWeight:900}}>DOWNLOAD 20-SITE QA CSV</button>
   <button type="button" onClick={downloadBackup} style={{minHeight:48,padding:'12px 20px',background:'#214137',border:'1px solid #83eac9',borderRadius:12,color:'#fff',fontWeight:900}}>BACK UP ALL 20 SITES (JSON)</button>
   <label style={{display:'flex',alignItems:'center',minHeight:48,padding:'10px 14px',background:'#1d304b',border:'1px solid #688fba',borderRadius:12,color:'#fff',fontWeight:800}}>
    RESTORE A JSON BACKUP <input aria-label="Import saved 20-site launch backup" type="file" accept=".json,application/json" onChange={e=>void importBackup(e)} style={{maxWidth:180,marginLeft:8}} />
   </label>
  </div>
  <p role="status" style={{color:'#9cb5ce'}}>{notice}</p>
  <p style={{fontSize:11,color:'#8296ac'}}>This checklist uses local browser storage; export and back up regularly. It does not publish websites, test URLs, send forms, charge cards, or certify launch status.</p>
 </div>
 </main>
}
