import {useMemo,useState} from 'react'
import {TEMPLATE_CATALOG,WEBSITE_PACKAGES,AI_PACKAGES,generateWebsite,type WebsiteDetails} from './templateCatalog'
export default function TemplateStore(){
 const [template,setTemplate]=useState('01'),[tier,setTier]=useState('template'),[ai,setAi]=useState('none'),[notice,setNotice]=useState('')
 const [details,setDetails]=useState<WebsiteDetails>({name:'',headline:'Your next look starts here.',description:'',email:'',phone:'',location:'',services:'',color:'#174a39',photo:''})
 const [preview,setPreview]=useState('')
 const selected=TEMPLATE_CATALOG.find(t=>t.id===template)!,plan=WEBSITE_PACKAGES.find(t=>t.id===tier)!,addon=AI_PACKAGES.find(t=>t.id===ai)!
 const quote=useMemo(()=>({oneTime:plan.price,monthly:addon.monthly}),[plan,addon])
 const update=(key:keyof WebsiteDetails,value:string)=>{setDetails(d=>({...d,[key]:value}));setPreview('')}
 async function photo(file?:File){
  if(!file)return
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){setNotice('Use a JPG, PNG or WebP photo under 2 MB.');return}
  const reader=new FileReader();reader.onload=()=>{update('photo',String(reader.result));setNotice('Photo added locally. It has not been uploaded.')};reader.onerror=()=>setNotice('Photo could not be read. Please try another.');reader.readAsDataURL(file)
 }
 function download(content:string,name:string,type:string){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
 return <section id="template-store" aria-labelledby="template-title"><p className="eyebrow">TRYAMM WEBSITE STUDIO · BETA</p><h2 id="template-title">Pick a number. Make it your business.</h2><p>Choose an industry, add your business details and a photo, then generate a website draft. Preview creation is free during beta. Paid installation and AI subscriptions are not activated.</p>
 <div className="template-grid">{TEMPLATE_CATALOG.map(t=><button type="button" className={'template-choice '+(template===t.id?'selected':'')} aria-pressed={template===t.id} key={t.id} onClick={()=>{setTemplate(t.id);update('headline',t.headline)}}><strong>#{t.id} · {t.name}</strong><small>{t.audience}</small></button>)}</div>
 <form className="template-form" onSubmit={e=>{e.preventDefault();setPreview(generateWebsite(details));setNotice('Draft ready below. No purchase, upload or deployment has occurred.')}}>
 <h3>1. Choose your package</h3><label>Website package<select value={tier} onChange={e=>setTier(e.target.value)}>{WEBSITE_PACKAGES.map(p=><option key={p.id} value={p.id}>{p.name} — ${p.price} once</option>)}</select></label><p>{plan.description}</p>
 <label>Optional AI package<select value={ai} onChange={e=>setAi(e.target.value)}>{AI_PACKAGES.map(p=><option key={p.id} value={p.id}>{p.name} — ${p.monthly}/month</option>)}</select></label><p>{addon.description} AI limits and metered delivery must be verified before subscriptions open. No automatic overage billing.</p>
 <h3>2. Add your business</h3>
 {([['name','Business name'],['headline','Headline'],['email','Public contact email'],['phone','Public phone'],['location','City or service area']] as const).map(([key,label])=><label key={key}>{label}<input required={key==='name'||key==='headline'} type={key==='email'?'email':key==='phone'?'tel':'text'} maxLength={200} value={details[key]} onChange={e=>update(key,e.target.value)}/></label>)}
 <label>What does your business offer?<textarea maxLength={1500} required value={details.description} onChange={e=>update('description',e.target.value)}/></label>
 <label>Services or products — one per line<textarea maxLength={2000} value={details.services} onChange={e=>update('services',e.target.value)}/></label>
 <label>Brand color<input type="color" value={details.color} onChange={e=>update('color',e.target.value)}/></label>
 <label>Your business photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>void photo(e.target.files?.[0])}/></label>
 <p>Use photos you own or have permission to use. Only enter details intended for your public website. This form stays in this page until you download it; refreshing clears it.</p>
 {template==='03'&&<p>OmniCare template is an information/contact page. Do not enter patient information. Clinical services, prescriptions and insurance integrations are not included.</p>}
 <div className="quote"><strong>Proposed price: ${quote.oneTime} once + ${quote.monthly}/month</strong><p>Taxes, domain, hosting and payment-provider fees are additional where applicable. One business per template license. Existing promised free website gifts stay free; optional services are separate.</p></div>
 <button type="submit">Generate my free preview</button><button type="button" disabled>Paid checkout & launch — not activated</button>
 </form><p role="status">{notice}</p>
 {preview&&<div><h3>{details.name} · template #{selected.id}</h3><iframe title="Your website draft" sandbox="" srcDoc={preview} style={{width:'100%',height:550,border:'1px solid #ddd',borderRadius:12}}/>
 <div className="template-actions"><button onClick={()=>download(preview,'TRYAMM-website-draft.html','text/html;charset=utf-8')}>Download website draft</button><button onClick={()=>download(JSON.stringify({templateId:template,templateName:selected.name,package:tier,aiPackage:ai,quote,details,status:'draft-not-paid-not-launched'},null,2),'TRYAMM-website-brief.json','application/json')}>Download setup brief</button></div><p>The downloaded page includes your photo and contact links. It is not a live store. Domain, hosting, checkout and AI connection still require setup.</p></div>}
 </section>
}
