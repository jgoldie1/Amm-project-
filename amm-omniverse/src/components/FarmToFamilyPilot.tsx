import { useMemo, useState } from 'react'
import ChicagoHoloJourneyStatus from './ChicagoHoloJourneyStatus'

type Farm = { id:string; name:string; city:string; state:string; products:string[]; description:string; website?:string; approved:boolean; consent?:string }
const EXAMPLES:Farm[] = [
 {id:'demo-produce',name:'Example Produce Farm (DEMO)',city:'Chicago',state:'IL',products:['Produce','CSA'],description:'Illustrative farm profile only. No farm, supplier, food safety or media permissions have been verified.',approved:false},
 {id:'demo-pantry',name:'Example Pantry Cooperative (DEMO)',city:'Oak Park',state:'IL',products:['Pantry','Food boxes'],description:'Illustrative example of a cooperative referral listing. Not a real business or participating partner.',approved:false},
 {id:'demo-pasture',name:'Example Pasture Farm (DEMO)',city:'Joliet',state:'IL',products:['Meat','Eggs'],description:'Illustrative farm passport. Do not place orders; inspected food supply and cold chain remain unverified.',approved:false}
]
const styles = {
 field:{width:'100%',padding:12,fontSize:16,minHeight:48,borderRadius:10,background:'#0b2331',color:'#fff',border:'1px solid #7290a0',boxSizing:'border-box' as const},
 button:{minHeight:52,padding:'12px 16px',fontSize:16,borderRadius:12,fontWeight:750 as const,background:'#184156',color:'white',border:'1px solid #8cc7df',cursor:'pointer'},
 card:{padding:16,background:'#102332',border:'1px solid #577084',borderRadius:16},
 label:{display:'block',marginBottom:6,fontSize:14,fontWeight:700 as const}
}
const EN={title:'Farm-to-Family',intro:'Discover farm profiles. The examples below are NOT approved farms or products for sale.',search:'Find farms by city, name or product',product:'All products',passport:'Farm Passport',directory:'Find farms',pilot:'Chicago pilot',status:'Approval pending',external:'Open approved farm website',noResults:'No matching profiles',qr:'Create demo QR (external service)',notLive:'No farm listings are approved. Shopping, referrals and fulfillment are disabled pending written permissions.'}
const ES={title:'De la granja a la familia',intro:'Explore perfiles de granjas. Los ejemplos NO son granjas aprobadas ni productos en venta.',search:'Buscar por ciudad, nombre o producto',product:'Todos los productos',passport:'Pasaporte de granja',directory:'Buscar granjas',pilot:'Piloto de Chicago',status:'Aprobación pendiente',external:'Abrir sitio de granja autorizada',noResults:'No hay perfiles coincidentes',qr:'Crear QR de demostración (servicio externo)',notLive:'No hay granjas aprobadas. Las compras, referencias y entregas están desactivadas hasta obtener permisos escritos.'}
function passportURL(id:string){const url=new URL('/yahavah-grocery',window.location.origin);url.searchParams.set('farm',id);return url.toString()}
export default function FarmToFamilyPilot(){
 const [lang,setLang]=useState<'en'|'es'>('en')
 const [mode,setMode]=useState<'directory'|'passport'|'pilot'>(()=>new URLSearchParams(window.location.search).has('farm')?'passport':'directory')
 const [search,setSearch]=useState('')
 const [product,setProduct]=useState('')
 const [selected,setSelected]=useState(()=>{const requested=new URLSearchParams(window.location.search).get('farm');return EXAMPLES.some(f=>f.id===requested)?requested!:EXAMPLES[0].id})
 const [farmName,setFarmName]=useState('')
 const [farmCity,setFarmCity]=useState('')
 const [farmProducts,setFarmProducts]=useState('')
 const [farmURL,setFarmURL]=useState('')
 const [notes,setNotes]=useState('')
 const t=lang==='en'?EN:ES
 const farms=EXAMPLES
 const filtered=useMemo(()=>farms.filter(f=>(!product||f.products.includes(product))&&[f.name,f.city,f.state,...f.products].join(' ').toLowerCase().includes(search.toLowerCase())),[search,product,farms])
 const active=farms.find(f=>f.id===selected)||farms[0]
 const types=Array.from(new Set(farms.flatMap(f=>f.products)))
 const qrURL=passportURL(active.id)
 const draftReady=Boolean(farmName.trim()&&farmCity.trim()&&farmProducts.trim())
 return <section aria-label="Yahavah Farm-to-Family pilot" style={{...styles.card,marginTop:14,color:'#fff'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
   <h2 style={{margin:0,fontSize:25}}>{t.title}</h2>
   <label style={{fontSize:15}}>Language / Idioma <select aria-label="Language / Idioma" value={lang} onChange={e=>setLang(e.target.value as 'en'|'es')} style={{...styles.field,width:155,marginLeft:8}}><option value="en">English</option><option value="es">Español</option></select></label>
  </div>
  <p role="status" style={{color:'#ffdca0',lineHeight:1.6}}>{t.intro} {t.notLive}</p>
  <ChicagoHoloJourneyStatus/>
  <nav aria-label="Farm pilot navigation" style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
   <button type="button" style={styles.button} aria-pressed={mode==='directory'} onClick={()=>setMode('directory')}>{t.directory}</button>
   <button type="button" style={styles.button} aria-pressed={mode==='passport'} onClick={()=>setMode('passport')}>{t.passport}</button>
   <button type="button" style={styles.button} aria-pressed={mode==='pilot'} onClick={()=>setMode('pilot')}>{t.pilot}</button>
  </nav>
  {mode==='directory'&&<>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>
    <label><span style={styles.label}>{t.search}</span><input style={styles.field} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Chicago, produce, pantry…" /></label>
    <label><span style={styles.label}>{t.product}</span><select style={styles.field} value={product} onChange={e=>setProduct(e.target.value)}><option value="">{t.product}</option>{types.map(type=><option key={type}>{type}</option>)}</select></label>
   </div>
   <p aria-live="polite">{filtered.length} demonstration profiles · 0 approved partners</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
    {filtered.map(f=><article key={f.id} style={styles.card}><b style={{fontSize:18}}>{f.name}</b><p>{f.city}, {f.state} · {f.products.join(', ')}</p><p style={{color:'#ffe6b2'}}>{t.status} — DEMO</p><p>{f.description}</p><button type="button" style={styles.button} onClick={()=>{setSelected(f.id);setMode('passport')}}>{t.passport}</button></article>)}
   </div>
   {filtered.length===0&&<p role="status">{t.noResults}</p>}
  </>}
  {mode==='passport'&&<article style={styles.card}>
   <label><span style={styles.label}>Demo profile</span><select style={styles.field} value={selected} onChange={e=>setSelected(e.target.value)}>{farms.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
   <h3 style={{fontSize:24,marginBottom:8}}>{active.name}</h3>
   <p>{active.city}, {active.state} | {active.products.join(' · ')}</p>
   <p>{active.description}</p>
   <p role="status" style={{color:'#ffdca0'}}><strong>DEMO — UNVERIFIED.</strong> No farm or Eatwild affiliation, permission, certification, inventory, food inspection, pickup or delivery is represented.</p>
   <label><span style={styles.label}>Example passport link</span><input readOnly aria-label="Demo passport link" style={styles.field} value={qrURL} onFocus={e=>e.currentTarget.select()} /></label>
   <p style={{fontSize:13}}>The QR option opens a third-party QR creation service only when you choose it. Do not use demonstration passports in customer advertising.</p>
   <a href={'https://quickchart.io/qr?size=260&text='+encodeURIComponent(qrURL)} target="_blank" rel="noopener noreferrer" style={{...styles.button,display:'inline-flex',alignItems:'center',textDecoration:'none'}}>{t.qr}</a>
  </article>}
  {mode==='pilot'&&<div style={{display:'grid',gap:12}}>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10}}>
    {[['Approved farms','0'],['Outreach targets','Not yet enrolled'],['Verified orders','0'],['Pilot region','Chicago, IL']].map(([name,value])=><div key={name} style={styles.card}><b>{name}</b><p style={{fontSize:20,marginBottom:0}}>{value}</p></div>)}
   </div>
   <h3 style={{marginBottom:0}}>Prepare a private farm invitation</h3>
   <p>Enter a prospective farm's details to prepare an outreach summary. This is a local, unsaved draft, not an application or public listing. No farm is enrolled automatically.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
    {([['Farm / organization',farmName,setFarmName],['City / area',farmCity,setFarmCity],['Product types',farmProducts,setFarmProducts],['Public website (optional)',farmURL,setFarmURL]] as const).map(([label,value,setValue])=><label key={label}><span style={styles.label}>{label}</span><input style={styles.field} value={value} onChange={e=>setValue(e.target.value)} /></label>)}
   </div>
   <label><span style={styles.label}>Private notes (do not enter personal information)</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{...styles.field,minHeight:85}} /></label>
   <button type="button" disabled={!draftReady} style={{...styles.button,opacity:draftReady?1:0.5}} onClick={()=>{const summary=['YAHAVAH Chicago farm pilot — PRIVATE INQUIRY DRAFT','Farm: '+farmName,'Area: '+farmCity,'Products: '+farmProducts,'Website: '+farmURL,'Notes: '+notes,'Status: UNVERIFIED / NOT ENROLLED','Ask for opt-in consent, source/inspection records, media permissions, prices and direct purchase links.'].join('\n');navigator.clipboard?.writeText(summary).catch(()=>{});}}>Copy private invitation details</button>
   <p style={{fontSize:13}}>Before public listing: written farm opt-in, permission for descriptions/photos/logos, farmer-controlled purchase URL, product/food safety documents, current contact details and removal instructions. For resale: separate commercial supply, payment and fulfillment approval.</p>
  </div>}
 </section>
}
