import {useEffect,useState} from 'react'
type Offer={id:string;name:string;price:string;description:string}
export const TAMPA_COMMERCIAL_OFFERS:Offer[]=[
 {id:'website-450',name:'Starter Business Website',price:'$450 USD',description:'Real service inquiry; scope, terms and delivery must be agreed before payment.'},
 {id:'storefront',name:'StreetVerse Storefront',price:'Quote required',description:'Fictional in-game commercial space; no real property rights.'},
 {id:'holo-ad',name:'Holo Advertisement',price:'Quote required',description:'Advertising inquiry with content review and placement approval.'},
 {id:'event',name:'Sponsored Tampa Event',price:'Quote required',description:'Proposed in-world event; requires owner approval.'},
 {id:'brand-partnership',name:'Commercial Brand Partnership',price:'Quote required',description:'Business collaboration and optional disclosed commission agreement.'}
]
const KEY='streetverse:tampa-marketplace-inquiries:v1'
type Inquiry={id:string;offerId:string;business:string;contact:string;notes:string;status:'local-draft';createdAt:string}
function load():Inquiry[]{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x.id==='string').slice(-20):[]}catch{return []}}
export function StreetVerseTampaCommercialMarketplace(){
 const [open,setOpen]=useState(false)
 const [offerId,setOfferId]=useState('website-450')
 const [business,setBusiness]=useState('')
 const [contact,setContact]=useState('')
 const [notes,setNotes]=useState('')
 const [inquiries,setInquiries]=useState<Inquiry[]>(load)
 const [notice,setNotice]=useState('Inquiries are saved locally until a secure customer inbox is connected.')
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(inquiries))}catch{}},[inquiries])
 const submit=()=>{
  if(business.trim().length<2||contact.trim().length<3){setNotice('Enter a business name and contact information.');return}
  const item:Inquiry={id:'TMP-'+Date.now().toString(36),offerId,business:business.trim().slice(0,80),contact:contact.trim().slice(0,120),notes:notes.trim().slice(0,400),status:'local-draft',createdAt:new Date().toISOString()}
  setInquiries(s=>[...s.slice(-19),item])
  setNotice('Draft saved on this device. Not sent to LaTeasia, not paid, and not approved.')
  setNotes('')
 }
 const field={minHeight:48,width:'100%',padding:8,borderRadius:8,fontSize:14} as const
 return <section aria-label="Tampa commercial brand marketplace" style={{position:'absolute',right:12,bottom:105,zIndex:41,width:'min(300px,65vw)',background:'rgba(21,27,43,.96)',color:'white',padding:10,border:'1px solid #c3e6ff',borderRadius:12}}>
  <button type="button" style={field} onClick={()=>setOpen(v=>!v)}>{open?'CLOSE':'OPEN'} COMMERCIAL MARKETPLACE</button>
  {open&&<div style={{display:'grid',gap:7,fontSize:13}}>
   <strong>LaTeasia • Business and Brand Marketplace</strong>
   <label htmlFor="tampa-offer">Service</label>
   <select id="tampa-offer" style={field} value={offerId} onChange={e=>setOfferId(e.target.value)}>{TAMPA_COMMERCIAL_OFFERS.map(o=><option key={o.id} value={o.id}>{o.name} — {o.price}</option>)}</select>
   <p style={{margin:0}}>{TAMPA_COMMERCIAL_OFFERS.find(o=>o.id===offerId)?.description}</p>
   <label htmlFor="tampa-market-business">Business / brand</label><input id="tampa-market-business" style={field} maxLength={80} value={business} onChange={e=>setBusiness(e.target.value)}/>
   <label htmlFor="tampa-market-contact">Contact for follow-up</label><input id="tampa-market-contact" style={field} maxLength={120} value={contact} onChange={e=>setContact(e.target.value)} placeholder="Business email or preferred contact"/>
   <label htmlFor="tampa-market-notes">Requirements</label><textarea id="tampa-market-notes" style={{...field,minHeight:80}} maxLength={400} value={notes} onChange={e=>setNotes(e.target.value)}/>
   <button type="button" style={field} onClick={submit}>SAVE INQUIRY DRAFT</button>
   <div role="status" aria-live="polite">{notice}</div>
   <small>Local drafts: {inquiries.length}. This is not secure messaging. Do not enter payment credentials or sensitive personal information. Real purchases require verified checkout, receipts, fulfillment, and explicit commission terms. No automatic Cash App payments.</small>
  </div>}
 </section>
}
