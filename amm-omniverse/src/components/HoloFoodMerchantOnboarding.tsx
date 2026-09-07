import { useEffect,useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const url=import.meta.env.VITE_SUPABASE_URL as string|undefined
const key=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY) as string|undefined
const supabase=url&&key?createClient(url,key):null

const types=[['restaurant','Restaurant'],['food_truck','Food truck'],['vendor','Food vendor'],['caterer','Caterer'],['ghost_kitchen','Ghost kitchen'],['bakery','Bakery'],['market','Market'],['other','Other']] as const

export default function HoloFoodMerchantOnboarding(){
  const [userId,setUserId]=useState<string|null>(null)
  const [status,setStatus]=useState('Checking account…')
  const [businessType,setBusinessType]=useState('restaurant')
  const [businessName,setBusinessName]=useState('')
  const [legalName,setLegalName]=useState('')
  const [contactName,setContactName]=useState('')
  const [phone,setPhone]=useState('')
  const [email,setEmail]=useState('')
  const [street,setStreet]=useState('')
  const [city,setCity]=useState('')
  const [region,setRegion]=useState('')
  const [postal,setPostal]=useState('')
  const [pickup,setPickup]=useState(true)
  const [delivery,setDelivery]=useState(true)
  const [profile,setProfile]=useState<any>(null)

  async function refresh(){
    if(!supabase){setStatus('Cloud is not configured on this build.');return}
    const {data:{user}}=await supabase.auth.getUser();setUserId(user?.id||null)
    if(!user){setStatus('Sign in to start or continue merchant onboarding.');return}
    const found=await supabase.from('holo_food_merchant_profiles').select('*').eq('owner_user_id',user.id).order('created_at',{ascending:false}).limit(1).maybeSingle()
    if(found.data){setProfile(found.data);setStatus(`Application ${String(found.data.onboarding_status||'draft').split('_').join(' ')}.`)}else setStatus('Ready to start your Holo Food merchant application.')
  }
  useEffect(()=>{void refresh()},[])

  async function submit(){
    if(!supabase||!userId){setStatus('Sign in before submitting.');return}
    if(!businessName.trim()){setStatus('Business name is required.');return}
    if(!pickup&&!delivery){setStatus('Choose pickup, delivery, or both.');return}
    setStatus('Submitting merchant application…')
    const payload={owner_user_id:userId,business_type:businessType,business_name:businessName.trim(),legal_name:legalName.trim()||null,contact_name:contactName.trim()||null,phone:phone.trim()||null,email:email.trim()||null,address:{street:street.trim(),city:city.trim(),region:region.trim(),postal_code:postal.trim()},service_modes:[...(pickup?['pickup']:[]),...(delivery?['delivery']:[])],onboarding_status:'submitted',verification_status:'pending',provider_status:'simulation_only'}
    const result=await supabase.from('holo_food_merchant_profiles').insert(payload).select('*').single()
    if(result.error){setStatus(`Could not submit: ${result.error.message}`);return}
    setProfile(result.data);setStatus('Application submitted. Verification, menu setup, payout setup and approval are next.')
  }

  const steps=[['1','CREATE ACCOUNT','Use your TRYAMM sign-in so the business stays tied to the verified owner.'],['2','BUSINESS PROFILE','Choose restaurant, food truck, vendor, caterer, ghost kitchen or other food business.'],['3','VERIFY BUSINESS','Upload applicable licenses, permits, insurance and identity/business documents for review.'],['4','BUILD MENU','Add items, prices, dietary/allergen information, photos and availability.'],['5','SET FULFILLMENT','Choose pickup, Holo Food delivery, scheduled orders and service area.'],['6','CONNECT PAYOUTS','Complete the approved payment-provider onboarding before real settlement can start.'],['7','REVIEW + GO LIVE','Holo Food reviews the account; approval changes the merchant from simulation/readiness to real marketplace availability.']] as const

  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at top,#18392b,#07110d 48%,#050505)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'26px 16px 110px'}}>
    <div style={{maxWidth:1080,margin:'0 auto'}}>
      <a href='/holo-food' style={back}>← HOLO FOOD</a>
      <div style={{fontSize:12,fontWeight:950,letterSpacing:2,color:'#7fe8c7',marginTop:18}}>MERCHANT ONBOARDING</div>
      <h1 style={{fontSize:'clamp(38px,7vw,72px)',margin:'6px 0'}}>SELL ON HOLO FOOD</h1>
      <p style={{fontSize:18,lineHeight:1.55,color:'#c8ded5',maxWidth:860}}>Restaurants, food trucks, vendors, caterers, ghost kitchens, bakeries and markets can apply directly from TRYAMM. Approval does not replace any license, permit, food-safety, tax, insurance or other requirement that applies to the business.</p>
      <div role='status' aria-live='polite' style={statusBox}>{status}</div>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10,margin:'16px 0 22px'}}>{steps.map(([n,title,body])=><article key={n} style={card}><strong style={{color:'#7fe8c7'}}>{n}. {title}</strong><p style={muted}>{body}</p></article>)}</section>

      {profile?<section style={card}><h2>YOUR MERCHANT APPLICATION</h2><Metric label='Business' value={profile.business_name}/><Metric label='Type' value={String(profile.business_type).split('_').join(' ')}/><Metric label='Onboarding' value={String(profile.onboarding_status).split('_').join(' ')}/><Metric label='Verification' value={String(profile.verification_status).split('_').join(' ')}/><Metric label='Menu' value={String(profile.menu_status).split('_').join(' ')}/><Metric label='Payouts' value={String(profile.payout_status).split('_').join(' ')}/><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><a href='/holo-food' style={button}>OPEN HOLO FOOD</a><a href='/omni-cash' style={button}>OMNI CASH</a></div></section>:
      <section style={{...card,maxWidth:820}}><h2>START APPLICATION</h2>
        <label style={label}>Business type<select value={businessType} onChange={e=>setBusinessType(e.target.value)} style={input}>{types.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label style={label}>Business name<input value={businessName} onChange={e=>setBusinessName(e.target.value)} style={input}/></label>
        <label style={label}>Legal business name (if different)<input value={legalName} onChange={e=>setLegalName(e.target.value)} style={input}/></label>
        <div style={grid}><label style={label}>Contact person<input value={contactName} onChange={e=>setContactName(e.target.value)} style={input}/></label><label style={label}>Phone<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode='tel' style={input}/></label><label style={label}>Email<input value={email} onChange={e=>setEmail(e.target.value)} inputMode='email' style={input}/></label></div>
        <div style={grid}><label style={label}>Street / location<input value={street} onChange={e=>setStreet(e.target.value)} style={input}/></label><label style={label}>City<input value={city} onChange={e=>setCity(e.target.value)} style={input}/></label><label style={label}>State / region<input value={region} onChange={e=>setRegion(e.target.value)} style={input}/></label><label style={label}>ZIP / postal<input value={postal} onChange={e=>setPostal(e.target.value)} style={input}/></label></div>
        <fieldset style={{border:'1px solid #365246',borderRadius:14,padding:14,margin:'14px 0'}}><legend style={{fontWeight:900}}>How will customers receive orders?</legend><label style={check}><input type='checkbox' checked={pickup} onChange={e=>setPickup(e.target.checked)}/> Pickup</label><label style={check}><input type='checkbox' checked={delivery} onChange={e=>setDelivery(e.target.checked)}/> Holo Food delivery</label></fieldset>
        <div style={{padding:13,border:'1px solid #8a7333',borderRadius:12,background:'#1c180b',color:'#ffe5a0',marginBottom:14}}>Submitting starts review; it does not automatically activate real orders or payouts. Those remain gated until business verification, required licenses/permits, menu readiness and payment-provider onboarding are complete.</div>
        <button onClick={submit} style={primary}>SUBMIT MERCHANT APPLICATION</button>
      </section>}
    </div>
  </main>
}

function Metric({label,value}:{label:string,value:string}){return <div style={{display:'flex',justifyContent:'space-between',gap:12,padding:'10px 0',borderBottom:'1px solid #263a31'}}><span style={{color:'#b8cec4'}}>{label}</span><strong style={{textTransform:'uppercase'}}>{value}</strong></div>}
const card={padding:18,border:'1px solid #355046',borderRadius:18,background:'#0b1712e8'} as const
const muted={color:'#b8cec4',lineHeight:1.5} as const
const statusBox={margin:'15px 0',padding:'11px 13px',border:'1px solid #476c5b',borderRadius:12,background:'#0d1d16',color:'#dcf8eb'} as const
const label={display:'grid',gap:6,fontWeight:850,margin:'10px 0'} as const
const input={width:'100%',boxSizing:'border-box',padding:'12px 13px',borderRadius:12,border:'1px solid #476c5b',background:'#06100c',color:'#fff',font:'inherit'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10} as const
const check={display:'flex',gap:9,alignItems:'center',margin:'8px 0'} as const
const button={display:'inline-block',padding:'10px 13px',border:'1px solid #4c7160',borderRadius:999,background:'#10261c',color:'#fff',fontWeight:900,textDecoration:'none'} as const
const primary={...button,background:'#71e5ac',color:'#05130c',border:'1px solid #a0f3ca',cursor:'pointer'} as const
const back={color:'#bdebd5',fontWeight:900,textDecoration:'none'} as const
