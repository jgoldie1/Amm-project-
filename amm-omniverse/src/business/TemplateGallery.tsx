import {useState} from 'react'
import {useTemplateCatalog} from './TemplateCatalogProvider'
import TemplateDemo from './TemplateDemo'
import {TEMPLATE_SECTORS} from './templateSectors'
function initialDemo(){return new URLSearchParams(window.location.search).get('demo')}
export default function TemplateGallery(){
 const {templates,notice}=useTemplateCatalog()
 const [selected,setSelected]=useState<string|null>(initialDemo),[search,setSearch]=useState(''),[sector,setSector]=useState('All')
 const demo=templates.find(t=>t.id===selected)
 const sectors=[...new Set(templates.map(t=>TEMPLATE_SECTORS[t.id]||'Custom'))].sort()
 const visible=templates.filter(t=>(sector==='All'||(TEMPLATE_SECTORS[t.id]||'Custom')===sector)&&[t.name,t.audience,t.bestFor,TEMPLATE_SECTORS[t.id]||'Custom'].join(' ').toLowerCase().includes(search.trim().toLowerCase()))
 function open(id:string|null){setSelected(id);const url=new URL(window.location.href);if(id)url.searchParams.set('demo',id);else url.searchParams.delete('demo');window.history.replaceState({},'',url);if(!id)document.getElementById('business-catalog')?.focus()}
 function customize(id:string){window.dispatchEvent(new CustomEvent('tryamm:template-select',{detail:{templateId:id}}));document.getElementById('template-store')?.scrollIntoView({block:'start'})}
 return <section className="catalog-section" id="business-catalog" tabIndex={-1} aria-labelledby="catalog-title"><div className="catalog-heading"><p className="eyebrow">BUSINESS WEBSITES · EXPLORE BEFORE YOU CHOOSE</p><h2 id="catalog-title">Choose a business. Open its full website.</h2><p>Tap Open full website to explore a complete, navigable business site. Each sample has Home, About, Services or Shop, Contact, and a working local-only form or cart. No account or payment is needed.</p><label>Browse by business category<select value={sector} onChange={e=>setSector(e.target.value)}><option value="All">All categories</option>{sectors.map(s=><option key={s} value={s}>{s}</option>)}</select></label><label>Find a business template<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try salon, cleaning, fashion or tutoring"/></label><p aria-live="polite">{visible.length} of {templates.length} templates</p><a className="studio-jump secondary-action" href="#template-manager">Add or manage your templates ↓</a>{notice&&<p className="note">{notice}</p>}</div>
 <div className="catalog-grid">{visible.map(t=><article className="catalog-card" key={t.id} style={{'--demo-tone':t.demo.tone} as React.CSSProperties}><div className="catalog-card-body"><p className="template-number">{TEMPLATE_SECTORS[t.id]||"Owner template"} · {t.id.startsWith('custom-')?'OWNER TEMPLATE':'TEMPLATE #'+t.id}</p><h3>{t.name}</h3><p>{t.description}</p><p><strong>Best for:</strong> {t.bestFor}</p><p><strong>How it helps:</strong> {t.benefit}</p><details><summary>What you can try</summary><p>{t.includes}</p></details><p><strong>${(t.priceCents/100).toFixed(2)} once</strong> · DIY starter</p><div className="catalog-actions"><a className="studio-jump" href={'/site-demo.html?template='+encodeURIComponent(t.id)}>Open full website · {t.name} ↗</a><button type="button" onClick={()=>open(t.id)}>Try {t.name} demo</button><button type="button" className="secondary-action" onClick={()=>customize(t.id)}>Customize & view packages</button></div></div></article>)}</div>
 {!visible.length&&<p>No matching templates. Try another business type.</p>}
 <p className="note">The full websites are navigable sample designs, not published customer businesses. Sample forms and shopping carts never submit real orders. Live checkout and paid template delivery are not activated. Domain and hosting are separate.</p>
 {demo&&<TemplateDemo key={demo.id} listing={demo} onClose={()=>open(null)} onCustomize={customize}/>}
 </section>
}
