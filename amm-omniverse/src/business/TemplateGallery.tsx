import {useState} from 'react'
import {useTemplateCatalog} from './TemplateCatalogProvider'
import TemplateDemo from './TemplateDemo'
function initialDemo(){return new URLSearchParams(window.location.search).get('demo')}
export default function TemplateGallery(){
 const {templates,notice}=useTemplateCatalog()
 const [selected,setSelected]=useState<string|null>(initialDemo),[search,setSearch]=useState('')
 const demo=templates.find(t=>t.id===selected)
 const visible=templates.filter(t=>[t.name,t.audience,t.bestFor].join(' ').toLowerCase().includes(search.trim().toLowerCase()))
 function open(id:string|null){setSelected(id);const url=new URL(window.location.href);if(id)url.searchParams.set('demo',id);else url.searchParams.delete('demo');window.history.replaceState({},'',url);if(!id)document.getElementById('business-catalog')?.focus()}
 function customize(id:string){window.dispatchEvent(new CustomEvent('tryamm:template-select',{detail:{templateId:id}}));document.getElementById('template-store')?.scrollIntoView({block:'start'})}
 return <section className="catalog-section" id="business-catalog" tabIndex={-1} aria-labelledby="catalog-title"><div className="catalog-heading"><p className="eyebrow">BUSINESS WEBSITES · EXPLORE BEFORE YOU CHOOSE</p><h2 id="catalog-title">Choose a business. Try its demo.</h2><p>Open a sample site, try its form or shopping cart, then customize it for your business. No account or payment is needed to try a demo.</p><label>Find a business template<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try salon, cleaning, fashion or tutoring"/></label><p aria-live="polite">{visible.length} of {templates.length} templates</p><a className="studio-jump secondary-action" href="#template-manager">Add or manage your templates ↓</a>{notice&&<p className="note">{notice}</p>}</div>
 <div className="catalog-grid">{visible.map(t=><article className="catalog-card" key={t.id} style={{'--demo-tone':t.demo.tone} as React.CSSProperties}><div className="mini-site" aria-hidden="true"><div className="mini-nav">{t.demo.brand}</div><div className="mini-layout"><strong>{t.headline}</strong><div className="mini-art"><span>{t.id.startsWith('custom-')?'NEW':t.id}</span></div></div><div className="mini-pills"><span>About</span><span>Services</span><span>Contact</span></div></div><div className="catalog-card-body"><p className="template-number">{t.id.startsWith('custom-')?'OWNER TEMPLATE':'TEMPLATE #'+t.id}</p><h3>{t.name}</h3><p>{t.description}</p><p><strong>Best for:</strong> {t.bestFor}</p><p><strong>How it helps:</strong> {t.benefit}</p><details><summary>What you can try</summary><p>{t.includes}</p></details><p><strong>${(t.priceCents/100).toFixed(2)} once</strong> · DIY starter</p><div className="catalog-actions"><button type="button" onClick={()=>open(t.id)}>Try {t.name} demo</button><button type="button" className="secondary-action" onClick={()=>customize(t.id)}>Customize & view packages</button></div></div></article>)}</div>
 {!visible.length&&<p>No matching templates. Try another business type.</p>}
 <p className="note">The demos show sample content and interactions. Orders, appointments and inquiries stay in the demo. Live checkout and paid template delivery are not activated. Domain and hosting are separate.</p>
 {demo&&<TemplateDemo key={demo.id} listing={demo} onClose={()=>open(null)} onCustomize={customize}/>}
 </section>
}
