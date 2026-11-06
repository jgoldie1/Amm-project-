import {useState} from 'react'
type Ops={mode:string;partners:Array<{id:string;name:string;region:string;verified:boolean}>;sellers:Array<{id:string;name:string;verified:boolean}>;orders:Array<{id:string;status:string;paymentVerified:boolean;carrierVerified:boolean;delivered:boolean;realShipmentReleased:boolean}>}
export default function StreetVerseWarehouseOperationsHUD(){
 const [open,setOpen]=useState(false),[token,setToken]=useState(''),[endpoint,setEndpoint]=useState('http://127.0.0.1:4318'),[data,setData]=useState<Ops|null>(null),[error,setError]=useState('')
 const refresh=async()=>{
  setError('')
  try{
   const url=new URL(endpoint)
   if(!['localhost','127.0.0.1'].includes(url.hostname)||url.protocol!=='http:')throw Error('Pilot dashboard connects to local server only')
   const res=await fetch(url.origin+'/ops',{headers:{authorization:'Bearer '+token},cache:'no-store'})
   if(!res.ok)throw Error('Staff authorization or server unavailable ('+res.status+')')
   setData(await res.json())
  }catch(e){setData(null);setError(e instanceof Error?e.message:'Unable to connect')}
 }
 const btn={minHeight:46,borderRadius:8,padding:'8px 12px',background:'#174e63',color:'white',border:'1px solid #7ceaff'}
 return <aside data-tryamm-ops-dashboard="restricted-pilot" style={{position:'fixed',right:8,bottom:90,zIndex:43992,maxWidth:'min(370px,calc(100vw - 16px))',maxHeight:'60dvh',overflow:'auto',background:'rgba(4,19,32,.96)',color:'white',padding:10,borderRadius:12,font:'12px system-ui'}}>
 <button style={btn} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🔐 WAREHOUSE OPERATIONS</button>
 {open&&<div style={{display:'grid',gap:8,marginTop:8}}>
  <strong>Restricted local pilot • no real shipment release</strong>
  <label>Local API endpoint<input aria-label="Operations API URL" value={endpoint} onChange={e=>setEndpoint(e.target.value)} style={{width:'100%',minHeight:44}}/></label>
  <label>Staff pilot token<input aria-label="Operations staff token" type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} style={{width:'100%',minHeight:44}}/></label>
  <button style={btn} onClick={refresh}>REFRESH VERIFIED SERVER RECORDS</button>
  {error&&<div role="alert">{error}</div>}
  {data&&<><div>Partners: {data.partners.length} • Sellers: {data.sellers.length} • Orders: {data.orders.length}</div>
   {data.partners.map(p=><div key={p.id}>{p.name} ({p.region}): {p.verified?'Verified':'Awaiting contract verification'}</div>)}
   {data.sellers.map(s=><div key={s.id}>{s.name}: {s.verified?'Verified':'Awaiting identity verification'}</div>)}
   {data.orders.map(o=><div key={o.id}>{o.id}: {o.status} • Payment {o.paymentVerified?'verified':'pending'} • Carrier {o.carrierVerified?'verified':'pending'} • Delivery {o.delivered?'reported':'pending'}</div>)}
  </>}
  <small>Do not paste production credentials into this prototype. No real partner verification, payment provider connection, carrier connection or database is installed.</small>
 </div>}
 </aside>
}
