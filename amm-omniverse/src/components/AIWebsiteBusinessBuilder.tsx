import { useEffect,useState } from 'react'
import {CHILD_THEME_PRESETS,type ThemePreset,type BusinessSite,type TrashEntry,type VersionEntry} from '../runtime/AIWebsiteRecoveryVault'
import { FAMILY_BUSINESS_REGISTRY } from '../data/familyBusinessRegistry'
import {DOMAIN_AUTOMATION_FLOW} from '../services/domainProvisioning'

type Site=BusinessSite
type CloudBackup={id:string;reason:string;created_at:string}
export default function AIWebsiteBusinessBuilder(){
 const [open,setOpen]=useState(false),[sites,setSites]=useState<Site[]>([]),[name,setName]=useState(''),[industry,setIndustry]=useState('general'),[city,setCity]=useState('Chicago'),[familyId,setFamilyId]=useState(''),[domain,setDomain]=useState(''),[domainStatus,setDomainStatus]=useState('Choose a domain, provide registrant information and complete payment. TRYAMM can automate DNS, SSL and verification after a registrar provider is connected.')
 const [trash,setTrash]=useState<TrashEntry[]>([]),[versions,setVersions]=useState<VersionEntry[]>([]),[backups,setBackups]=useState<CloudBackup[]>([])
 const [cloudStatus,setCloudStatus]=useState('connecting'),[vaultMessage,setVaultMessage]=useState('Loading backups…')
 const [legacyAvailable,setLegacyAvailable]=useState(false)
 useEffect(()=>{
  const onState=(e:Event)=>{
   const d=(e as CustomEvent<any>).detail||{}
   setSites((d.sites||[]) as Site[]);setTrash((d.trash||[]) as TrashEntry[])
   setVersions((d.versions||[]) as VersionEntry[]);setBackups((d.cloudBackups||[]) as CloudBackup[])
   setCloudStatus(String(d.cloudStatus||'browser-only'));setVaultMessage(String(d.message||''))
   setLegacyAvailable(d.legacyAvailable===true)
  }
  const onBackup=(e:Event)=>{
   const d=(e as CustomEvent<{json:string;filename:string}>).detail
   if(!d?.json)return
   const url=URL.createObjectURL(new Blob([d.json],{type:'application/json'}))
   const a=document.createElement('a');a.href=url;a.download=d.filename||'TRYAMM_website_backup.json'
   document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)
  }
  window.addEventListener('tryamm:ai-site-builder-state',onState)
  window.addEventListener('tryamm:ai-site-backup-ready',onBackup)
  window.dispatchEvent(new CustomEvent('tryamm:ai-site-builder-request'))
  return()=>{window.removeEventListener('tryamm:ai-site-builder-state',onState);window.removeEventListener('tryamm:ai-site-backup-ready',onBackup)}
 },[])
 const create=()=>{window.dispatchEvent(new CustomEvent('tryamm:ai-site-create',{detail:{name:name||'My Business',industry,city}}));setName('')}
 const loadFamily=(id:string)=>{setFamilyId(id);const p=FAMILY_BUSINESS_REGISTRY.find(x=>x.id===id);if(!p)return;setName(`${p.owner} — ${p.ventures[0]}`);setIndustry(p.ventures.join(' / '));setCity(p.region);window.dispatchEvent(new CustomEvent('tryamm:family-business-selected',{detail:p}))}
 if(!open)return <button onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:356,zIndex:8995,border:'1px solid #4FE3FF88',borderRadius:999,padding:'10px 14px',background:'#07131e',color:'#4FE3FF',fontWeight:900,fontSize:10,cursor:'pointer'}}>🌐 BUILD & OWN WEBSITE</button>
 return <div style={{position:'fixed',inset:0,zIndex:15180,background:'#02050bf4',color:'#fff',overflow:'auto'}}><div style={{maxWidth:980,margin:'0 auto',padding:20}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontSize:10,letterSpacing:2,color:'#4FE3FF',fontWeight:900}}>TRYAMM AI BUSINESS LAUNCHER</div><h1 style={{margin:'6px 0'}}>Build, Launch & Own Your Website</h1><p style={{color:'#9fb2c8',fontSize:12}}>Create the business site, publish it, choose ownership, then launch the same business into Marketplace, Quantum Sourcing and StreetVerse.</p></div><button onClick={()=>setOpen(false)} style={btn}>✕</button></div>
  <section style={card}><h3>Friends & family site factory</h3><p style={{fontSize:11,color:'#9fb2c8'}}>Load a recovered business profile, then use the existing AI builder. Registry status does not mean the site/domain is live yet.</p><select value={familyId} onChange={e=>loadFamily(e.target.value)} style={{...input,width:'100%'}}><option value="">Choose a registered business</option>{FAMILY_BUSINESS_REGISTRY.map(p=><option key={p.id} value={p.id}>{p.owner} — {p.ventures[0]}</option>)}</select></section>
  <section style={{...card,marginTop:12}}><h3>Create business</h3><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}><input value={name} onChange={e=>setName(e.target.value)} placeholder="Business name" style={input}/><input value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="Industry" style={input}/><input value={city} onChange={e=>setCity(e.target.value)} placeholder="City" style={input}/><button onClick={create} style={primary}>AI BUILD SITE</button></div></section>
  <section style={{...card,marginTop:12,borderColor:'#2b9d9a'}}>
    <h3>WEBSITE RECOVERY VAULT + CHILD THEMES</h3>
    <p role="status" style={{fontSize:11,color:cloudStatus==='cloud-saved'?'#78ffb4':'#ffd98a'}}>
     {cloudStatus.toUpperCase().replace(/-/g,' ')} • {vaultMessage}
    </p>
    <p style={{fontSize:11,color:'#aebed0'}}>Cloud backups require a signed-in TRYAMM app account. Drafts can also be exported and imported as portable JSON files. This vault protects builder settings, not hosted site files, customer databases, DNS records or payments.</p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
     <button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-vault-export'))}>DOWNLOAD WEBSITE BACKUP</button>
     <label style={{...btn,cursor:'pointer'}}>IMPORT BACKUP (MERGE)
       <input aria-label="Import TRYAMM website backup" type="file" accept=".json,application/json" style={{display:'none'}} onChange={async e=>{
        const file=e.target.files?.[0];if(!file)return
        if(file.size>524288){setVaultMessage('Backup is too large. Maximum 512 KB.');e.target.value='';return}
        try{window.dispatchEvent(new CustomEvent('tryamm:ai-site-vault-import',{detail:{json:await file.text()}}))}
        catch{setVaultMessage('Unable to read backup. Original drafts were preserved.')}
        e.target.value=''
       }}/>
     </label>
     <button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-cloud-refresh'))}>REFRESH CLOUD HISTORY</button>
     {legacyAvailable&&<button style={btn} onClick={()=>{
      if(window.confirm('Import older browser-only drafts into the current website builder? Existing drafts will be preserved.'))
       window.dispatchEvent(new CustomEvent('tryamm:ai-site-legacy-import'))
     }}>IMPORT OLD BROWSER DRAFTS</button>}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10,marginTop:12}}>
      <div style={{border:'1px solid #294058',padding:10,borderRadius:10}}>
       <strong>Recycle bin ({trash.length})</strong>
       {trash.length===0?<p style={{fontSize:11}}>No deleted website drafts.</p>:trash.slice(0,12).map(item=><div key={item.site.id+'-'+item.deletedAt} style={{fontSize:11,marginTop:8}}>
        {item.site.name} • {new Date(item.deletedAt).toLocaleDateString()}
        <button style={{...btn,marginLeft:6}} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-restore',{detail:{id:item.site.id}}))}>RESTORE SITE</button>
       </div>)}
      </div>
      <div style={{border:'1px solid #294058',padding:10,borderRadius:10}}>
       <strong>Previous versions ({versions.length})</strong>
       {versions.slice(0,8).map((item,index)=><div key={item.site.id+'-'+item.savedAt+'-'+index} style={{fontSize:11,marginTop:8}}>
        {item.site.name} • {item.reason}
        <button style={{...btn,marginLeft:6}} onClick={()=>{
         if(window.confirm('Restore this older website configuration? Current settings will be saved in history.'))
          window.dispatchEvent(new CustomEvent('tryamm:ai-site-version-restore',{detail:{index}}))
        }}>RESTORE VERSION</button>
       </div>)}
      </div>
      <div style={{border:'1px solid #294058',padding:10,borderRadius:10}}>
       <strong>Private cloud backups ({backups.length})</strong>
       {backups.length===0?<p style={{fontSize:11}}>No cloud backup confirmed yet. Sign in and create or edit a draft.</p>:backups.slice(0,10).map(item=><div key={item.id} style={{fontSize:11,marginTop:8}}>
        {new Date(item.created_at).toLocaleString()} • {item.reason}
        <button style={{...btn,marginLeft:6}} onClick={()=>{
         if(window.confirm('Recover this entire website-builder snapshot? Export current drafts first if you need another separate copy.'))
          window.dispatchEvent(new CustomEvent('tryamm:ai-site-cloud-restore',{detail:{id:item.id}}))
        }}>RESTORE CLOUD COPY</button>
       </div>)}
      </div>
    </div>
  </section>
  <section style={{display:'grid',gap:10,marginTop:12}}>{sites.map(s=><article key={s.id} style={card}><div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><div><strong>{s.name}</strong><div style={{fontSize:10,color:'#8ea4ba',marginTop:4}}>{s.industry} • {s.city} • {s.status}</div></div><span style={{fontSize:9,color:'#e8b944'}}>{s.ownership.toUpperCase()}</span></div><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}><button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-publish',{detail:{id:s.id,domain:s.domain}}))}>PUBLISH</button><button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-ownership',{detail:{id:s.id,ownership:'subscription'}}))}>SUBSCRIPTION</button><button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-ownership',{detail:{id:s.id,ownership:'buyout'}}))}>BUY & OWN</button><button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-export',{detail:{id:s.id}}))}>EXPORT PROJECT</button><label style={{fontSize:10,color:'#aebed0'}}>CHILD THEME
   <select aria-label={'Child theme for '+s.name} value={s.childTheme?.preset||'electric'} style={{...input,padding:'6px 8px'}} onChange={e=>
     window.dispatchEvent(new CustomEvent('tryamm:ai-site-theme',{detail:{id:s.id,preset:e.target.value as ThemePreset}}))}>
    {Object.keys(CHILD_THEME_PRESETS).map(theme=><option key={theme} value={theme}>{theme.toUpperCase()}</option>)}
   </select></label>
   <button style={{...btn,borderColor:'#aa6b6b'}} onClick={()=>{
     if(window.confirm('Move '+s.name+' into the recovery bin? It can be restored.'))
      window.dispatchEvent(new CustomEvent('tryamm:ai-site-delete',{detail:{id:s.id,confirmed:true}}))
   }}>MOVE TO RECOVERY BIN</button><button style={primary} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:business-launch-from-site',{detail:{id:s.id}}))}>LAUNCH BUSINESS</button></div></article>)}</section>
  <section style={{...card,marginTop:12}}>
   <h3>DOMAIN + GO LIVE</h3>
   <p style={{fontSize:11,color:'#aebed0',lineHeight:1.6}}>Customer pays for the domain through the approved checkout. After verified payment and required registrant information, TRYAMM sends the order to the connected registrar, configures DNS/hosting, waits for SSL, verifies resolution and then marks the business live.</p>
   <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8}}>
    <input value={domain} onChange={e=>setDomain(e.target.value)} placeholder="yourbusiness.com" style={input}/>
    <button onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:domain-provision-request',{detail:{domain,source:'ai-website-builder'}}));setDomainStatus(domain?`Domain request prepared for ${domain}. Purchase/connection stays gated until registrar credentials and server-verified payment are available.`:'Enter a domain first.')}} style={primary}>PAY + CONNECT DOMAIN</button>
   </div>
   <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>{DOMAIN_AUTOMATION_FLOW.map((x,i)=><span key={x} style={{fontSize:9,padding:'5px 7px',borderRadius:999,border:'1px solid #2b4558',background:'#091721'}}>{i+1}. {x}</span>)}</div>
   <div role="status" style={{fontSize:10,color:'#ffd98a',marginTop:10}}>{domainStatus}</div>
  </section>
  <section style={{...card,marginTop:12}}><strong>Revenue model</strong><p style={{fontSize:11,color:'#aebed0',lineHeight:1.6}}>Hosted plans • one-time site buyouts • domain/hosting management • premium templates • commerce services • AI business copilot • marketing/SEO • Creator/Broadcast packages • maintenance and support.</p></section>
 </div></div>
}
const card:React.CSSProperties={background:'#08111c',border:'1px solid #294058',borderRadius:16,padding:14}
const input:React.CSSProperties={background:'#0b1724',border:'1px solid #294058',borderRadius:10,padding:'11px 12px',color:'#fff'}
const btn:React.CSSProperties={background:'#101a25',border:'1px solid #3b536b',borderRadius:10,padding:'9px 11px',color:'#fff',fontWeight:850,fontSize:10,cursor:'pointer'}
const primary:React.CSSProperties={...btn,background:'linear-gradient(135deg,#4FE3FF,#78ffb4)',color:'#04111a',border:0}
