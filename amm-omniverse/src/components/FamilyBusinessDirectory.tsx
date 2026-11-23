import { useMemo, useState } from 'react'
import { FAMILY_BUSINESS_REGISTRY } from '../data/familyBusinessRegistry'
import { TRYAMM_FIRST_30_WEBSITES } from '../data/TRYAMMFirst30WebsiteLaunch'
import { TRYAMM_WEBSITE_MASTER_REGISTRY } from '../data/tryammWebsiteMasterRegistry'

type SiteRow = { id: string; name: string; status: string; description: string; href?: string; source?: string }
const previewRoutes: Record<string, string> = {
 'la-taeasia-beautyverse': '/lateasia-beauty-house.html',
 'lateasia-beauty-house': '/lateasia-beauty-house.html',
 'bj-stubbs-newumerica': '/bj-stubbs-store.html',
 'stubbs-mobility360': '/stubbs-mobility/index.html',
 'jacobie-visions': '/jacobie-visions.html',
}
const aliases: Record<string,string> = {
 'lateasia-beauty-house':'la-taeasia-beautyverse',
 'sculptify-ltd':'sculptifyltd',
 'stubbs-mobility':'stubbs-mobility360',
 'raymond-jarreau':'omnicare360',
 'alton-security':'al-ai-security',
 'jacobie-vision-site':'jacobie-visions',
}
function canonical(id:string){return aliases[id] ?? id}
const siteMap = new Map<string,SiteRow>()
for(const p of FAMILY_BUSINESS_REGISTRY){
 siteMap.set(canonical(p.id),{id:canonical(p.id),name:p.owner,status:p.status==='live'?'live':p.status,description:p.ventures.join(' • '),href:previewRoutes[canonical(p.id)] ?? '/business/'+encodeURIComponent(p.id)})
}
for(const p of TRYAMM_FIRST_30_WEBSITES){
 const id=canonical(p.id),old=siteMap.get(id)
 siteMap.set(id,{id,name:old?.name ?? p.name,status:old?.status ?? p.stage,description:old?.description ?? 'Business website / preview',href:old?.href ?? previewRoutes[p.id],source:old?.source})
}
for(const p of TRYAMM_WEBSITE_MASTER_REGISTRY){
 const id=canonical(p.id),old=siteMap.get(id)
 siteMap.set(id,{id,name:old?.name ?? p.name,status:old?.status ?? p.status,description:old?.description ?? 'Recovered website project',href:old?.href ?? p.publicPath ?? previewRoutes[p.id],source:p.sourcePath})
}
export const UNIFIED_TRYAMM_WEBSITES = [...siteMap.values()].sort((a,b)=>a.name.localeCompare(b.name))

export default function FamilyBusinessDirectory(){
 const [search,setSearch]=useState('')
 const visible=useMemo(()=>UNIFIED_TRYAMM_WEBSITES.filter(p=>(p.name+' '+p.description+' '+p.id).toLowerCase().includes(search.toLowerCase().trim())),[search])
 return <main style={{position:'fixed',inset:0,zIndex:22000,overflow:'auto',background:'linear-gradient(145deg,#04070b,#0a1720 55%,#151008)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
  <section style={{maxWidth:1120,margin:'0 auto',padding:'20px 16px 56px'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><a href="/" style={btn}>← TRYAMM</a><strong style={{fontSize:12,color:'#e8b944'}}>ALL AMERICAN MARKETPLACE BUSINESS NETWORK</strong></header>
   <h1 style={{fontSize:'clamp(30px,6vw,56px)',margin:'30px 0 12px'}}>All TRYAMM Websites</h1>
   <p style={{color:'#c8d5dc'}}>One searchable directory of registered businesses, previews and recovered source projects. A listing does not establish that a business is live.</p>
   <label htmlFor="website-search" style={{display:'block',margin:'20px 0 8px',fontWeight:800}}>Find a website</label>
   <input id="website-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search BeautyVerse, Sculptify, Kevon, security…" style={{width:'100%',minHeight:56,fontSize:18,padding:14,borderRadius:12,border:'2px solid #e8b944',background:'#0b1720',color:'#fff'}}/>
   <p role="status" aria-live="polite" style={{color:'#c8d5dc'}}>{visible.length} of {UNIFIED_TRYAMM_WEBSITES.length} projects</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:14}}>{visible.map(p=><article key={p.id} style={card}>
    <h2 style={{fontSize:22,margin:'0 0 8px'}}>{p.name}</h2><p style={{fontSize:14,color:'#c8d5dc'}}>{p.description}</p>
    <p style={{fontSize:13,color:'#e8b944'}}>Status: {p.status}</p>
    {p.source && <p style={{fontSize:11,color:'#aab9c5',overflowWrap:'anywhere'}}>Source: {p.source}</p>}
    {p.href ? <a href={p.href} style={btn}>OPEN WEBSITE / PROFILE</a> : <p style={{color:'#e8b944'}}>Website publication verification pending</p>}
   </article>)}</div>
  </section>
 </main>
}
const card:React.CSSProperties={padding:18,borderRadius:16,border:'1px solid #39505e',background:'#081017cc'}
const btn:React.CSSProperties={display:'inline-block',minHeight:48,padding:'13px 16px',borderRadius:10,border:'1px solid #e8b944',background:'#0b1720',color:'#fff',fontWeight:850,textDecoration:'none'}
