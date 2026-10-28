import {useMemo,useState} from 'react'

/** Home-page gateway. These are app families, NOT 111 verified live apps.
 * Never turn a catalog placeholder into a paid checkout without a product record.
 */
const apps=[
 {id:'streetverse',name:'StreetVerse',group:'PLAY',description:'Enter the Chicago RP RPG world',url:'/streetverse',status:'entry'},
 {id:'black-business-directory',name:'Black Business Directory',group:'SHOP',description:'Discover and support Black-owned businesses. Marketplace entry; dedicated verified listings pending.',url:'/marketplace',status:'entry'},
 {id:'streetverse-radio',name:'StreetVerse Radio',group:'CREATE',description:'In-world radio genres and sound controls. Enter the game to explore; live stations unverified.',url:'/streetverse',status:'entry'},
 {id:'marketplace',name:'All American Marketplace',group:'SHOP',description:'Businesses, services and digital commerce',url:'/marketplace',status:'entry'},
 {id:'live',name:'Omni LIVE',group:'CREATE',description:'Broadcast, battle and creator experiences',event:'tryamm:home-open-live',status:'preview'},
 {id:'music',name:'MusicVerse',group:'CREATE',description:'Music and creator worlds',url:'/music',status:'entry'},
 {id:'faith',name:'FaithVerse',group:'EXPLORE',description:'Faith and learning experiences',url:'/faith',status:'entry'},
 {id:'sports',name:'SportsVerse',group:'PLAY',description:'Sports realm',url:'/sports',status:'entry'},
 {id:'ai-cafe',name:'TRYAMM AI Café',group:'LEARN',description:'Existing AI Café beta experience for creator learning, community work and hospitality concepts.',status:'preview'},
 {id:'12d-fabrication',name:'12D Printer / Nano Factory',group:'SERVICES',description:'Future fabrication and prototyping venture; no verified 12D machine or manufacturing service is operational.',status:'catalog'},
 {id:'education',name:'Education & Training',group:'LEARN',description:'School, career and training destinations',status:'catalog'},
 {id:'health',name:'Health & Wellness',group:'SERVICES',description:'Wellness and accessibility business categories',status:'catalog'},
 {id:'beauty',name:'Beauty & Personal Care',group:'SERVICES',description:'Salon, academy, massage and beauty templates',status:'catalog'},
 {id:'logistics',name:'Logistics & Delivery',group:'SERVICES',description:'Freight, rideshare, trucking, plumbing, electrical and delivery templates',status:'catalog'},
 {id:'security',name:'Security & Safety',group:'SERVICES',description:'Security services and training categories',status:'catalog'},
 {id:'realestate',name:'Real Estate & Housing',group:'SERVICES',description:'Housing, property and accommodation templates',status:'catalog'},
] as const
const groups=['ALL','PLAY','CREATE','SHOP','LEARN','SERVICES','EXPLORE'] as const
export default function OmniverseAppGateway(){
 const [query,setQuery]=useState('')
 const [group,setGroup]=useState<string>('ALL')
 const [note,setNote]=useState('')
 const shown=useMemo(()=>apps.filter(app=>(group==='ALL'||app.group===group)&&[app.name,app.description,app.group].join(' ').toLowerCase().includes(query.toLowerCase().trim())),[query,group])
 const enter=(app:typeof apps[number])=>{
  if('url'in app&&app.url){window.location.assign(app.url);return}
  if(app.id==='ai-cafe'){
   const open=(window as Window&{__showAICafe?:()=>void}).__showAICafe
   if(open){open();return}
  }
  if(app.id==='live'){
   const handler=(window as Window&{__showTryAMMLive?:()=>void}).__showTryAMMLive
   if(handler){handler();return}
  }
  setNote(app.name+' is in the catalog. This page does not claim it is live or available to buy.')
 }
 const button:React.CSSProperties={minHeight:44,padding:'10px 13px',border:'1px solid #4e819a',borderRadius:12,background:'#102235',color:'#fff',fontWeight:750,cursor:'pointer'}
 return <section id="omniverse-apps" aria-labelledby="omniverse-apps-heading" data-no-realm-swipe="true" style={{marginTop:32,padding:18,border:'1px solid #2e7188',borderRadius:22,background:'linear-gradient(160deg,#0c1c2b,#080d18)',color:'#fff'}}>
  <div style={{fontSize:11,color:'#83def2',fontWeight:900,letterSpacing:2}}>OMNIVERSE APP PASSPORT</div>
  <h2 id="omniverse-apps-heading" style={{fontSize:'clamp(22px,4vw,32px)',margin:'7px 0'}}>Explore the TRYAMM app ecosystem</h2>
  <p style={{fontSize:13,color:'#bbccda',lineHeight:1.6}}>Discover connected worlds and business-template families from one place. The 111-template goal is a catalog target, not a claim that 111 independent apps are deployed.</p>
  <label style={{display:'block',fontSize:12,marginBottom:8}}>Search apps and categories
   <input aria-label="Search TRYAMM apps" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try music, gaming, plumbing, beauty…" style={{display:'block',width:'100%',boxSizing:'border-box',marginTop:5,minHeight:48,padding:12,borderRadius:12,border:'1px solid #548aa5',background:'#07111e',color:'#fff',fontSize:16}}/>
  </label>
  <div aria-label="App categories" style={{display:'flex',flexWrap:'wrap',gap:6}}>{groups.map(item=><button key={item} aria-pressed={group===item} onClick={()=>setGroup(item)} style={{...button,background:group===item?'#17647b':'#102235'}}>{item}</button>)}</div>
  <div aria-live="polite" style={{fontSize:12,color:'#a9c4d4',margin:'13px 0'}}>Showing {shown.length} app families and entry points</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,205px),1fr))',gap:10}}>{shown.map(app=><article key={app.id} style={{padding:14,border:'1px solid #304c63',borderRadius:14,background:'#0e1a2b'}}>
    <div style={{fontSize:10,color:'#8cdce9',fontWeight:800}}>{app.group} · {app.status==='entry'?'ENTRY LINK':app.status==='preview'?'PREVIEW':'CATALOG'}</div>
    <h3 style={{fontSize:17,margin:'8px 0'}}>{app.name}</h3>
    <p style={{fontSize:12,color:'#b7c7d5',minHeight:37}}>{app.description}</p>
    <button style={{...button,width:'100%'}} onClick={()=>enter(app)}>{app.status==='catalog'?'View availability':'Open experience'}</button>
  </article>)}</div>
  {note&&<div role="status" style={{marginTop:10,color:'#f6d18b',fontSize:12}}>{note}</div>}
  <p style={{fontSize:11,color:'#90a8b7',marginTop:13}}>Only documented entry routes open. A catalog item does not imply finished functionality, ownership rights, commercial licensing or an active checkout.</p>
 </section>
}
