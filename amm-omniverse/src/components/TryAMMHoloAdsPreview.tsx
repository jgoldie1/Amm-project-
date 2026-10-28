import {useState} from 'react'
import {previewHoloAds,type HoloAdPlacement} from '../data/HoloAdsCatalog'
const tabs:{id:HoloAdPlacement;name:string}[]=[{id:'homepage',name:'Website'},{id:'directory',name:'Directory'},{id:'streetverse-billboard',name:'StreetVerse'},{id:'radio-companion',name:'Radio'},{id:'creator-live',name:'Omni LIVE'}]
export default function TryAMMHoloAdsPreview(){
 const [placement,setPlacement]=useState<HoloAdPlacement>('homepage')
 const ads=previewHoloAds(placement)
 return <section id="holo-ads" aria-label="Holo Ads showcase" style={{marginTop:24,padding:18,border:'1px solid #7a7ddc',borderRadius:20,background:'linear-gradient(140deg,#101a37,#081322)',color:'#fff'}}>
  <div style={{fontSize:11,letterSpacing:2,color:'#bcbaff',fontWeight:900}}>HOLO ADS · MULTI-WORLD PROMOTION</div>
  <h2 style={{fontSize:'clamp(23px,4vw,32px)',margin:'8px 0'}}>One business. Multiple places to be discovered.</h2>
  <p style={{fontSize:13,color:'#c6d2e6',lineHeight:1.6}}>Preview how approved promotions could appear on the website, Black Business Directory, StreetVerse billboards, radio companion cards and creator LIVE. These examples are not paid campaigns or running advertisements.</p>
  <div role="group" aria-label="Choose ad placement" style={{display:'flex',flexWrap:'wrap',gap:8,margin:'14px 0'}}>{tabs.map(t=><button key={t.id} aria-pressed={placement===t.id} onClick={()=>setPlacement(t.id)} style={{minHeight:44,borderRadius:11,padding:'8px 12px',border:'1px solid #93a7e8',background:placement===t.id?'#37418d':'#192943',color:'#fff',fontWeight:800}}>{t.name}</button>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))',gap:10}}>{ads.length?ads.map(ad=><article key={ad.id} style={{borderRadius:16,padding:16,border:'1px solid #6869a5',background:'radial-gradient(circle at right top,#7a66e044,transparent 65%),#111d34'}}>
   <div style={{fontSize:10,color:'#dfd3ff',fontWeight:900}}>HOLO AD CONCEPT · UNPUBLISHED</div><h3 style={{fontSize:19,margin:'9px 0'}}>{ad.headline}</h3><div style={{fontSize:13,fontWeight:800}}>{ad.business}</div><p style={{fontSize:12,color:'#c4d3e5'}}>{ad.description}</p><button onClick={()=>document.getElementById(ad.landingAnchor)?.scrollIntoView({behavior:'smooth'})} style={{minHeight:44,borderRadius:12,border:'1px solid #b6adff',background:'#27346a',color:'#fff',padding:'10px 13px',fontWeight:800}}>View business offer</button>
  </article>):<p>No demo creative is assigned to this placement.</p>}</div>
  <p style={{fontSize:11,color:'#aab9d6',marginTop:12}}>Future serving requires verified creative rights, advertiser approval, accessible ad labels, frequency caps, opt-out settings and independently validated billing/analytics. No audio autoplays here.</p>
 </section>
}
