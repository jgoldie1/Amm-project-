import {useMemo,useState} from 'react'
import {TEMPLATE_CATALOG} from './templateCatalog'
import {BASE_STEPS,FUNDING_PATHS,INDUSTRY_STEPS,US_STATES,checklistForTemplate,getTemplateName,makeFundingPacket,readinessSummary,sectorForTemplate,type FundingProfile} from './fundingReadiness'
import './BusinessFundingHub.css'

const firstTemplate=new URLSearchParams(window.location.search).get('fundingTemplate')||'01'
const safeInitialTemplate=TEMPLATE_CATALOG.some(t=>t.id===firstTemplate)?firstTemplate:'01'
const emptyProfile:FundingProfile={
 name:'',templateId:safeInitialTemplate,state:'Illinois',stage:'idea',amount:'',useOfFunds:'',
 customers:'',revenueModel:'',competition:'',ownerExperience:'',milestones:'',revenueEstimate:'',expensesEstimate:'',notes:'',
}
export default function BusinessFundingHub(){
 const [profile,setProfile]=useState<FundingProfile>(emptyProfile)
 const [checked,setChecked]=useState<Set<string>>(()=>new Set())
 const [message,setMessage]=useState('')
 const [search,setSearch]=useState('')
 const steps=useMemo(()=>checklistForTemplate(profile.templateId),[profile.templateId])
 const summary=readinessSummary(profile.templateId,checked)
 const sector=sectorForTemplate(profile.templateId)
 const template=TEMPLATE_CATALOG.find(t=>t.id===profile.templateId)
 const filtered=FUNDING_PATHS.filter(p=>(p.title+' '+p.description+' '+p.type).toLowerCase().includes(search.toLowerCase()))
 const set=(key:keyof FundingProfile,value:string)=>{setProfile(old=>({...old,[key]:value}));setMessage('')}
 const selectTemplate=(next:string)=>{setProfile(old=>({...old,templateId:next}));setChecked(new Set());setMessage('Business category changed. Review its requirements again.')}
 const mark=(id:string,next:boolean)=>{setChecked(previous=>{const copy=new Set(previous);if(next)copy.add(id);else copy.delete(id);return copy});setMessage('')}
 const exportPacket=()=>{
  const payload=makeFundingPacket(profile,checked)
  const blob=new Blob([payload],{type:'text/plain;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const link=document.createElement('a')
  const filename=profile.name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,42)||'small-business'
  link.href=url;link.download=filename+'-funding-readiness-draft.txt'
  document.body.appendChild(link);link.click();link.remove()
  window.setTimeout(()=>URL.revokeObjectURL(url),1500)
  setMessage('Draft funding packet prepared for download. It was not sent or submitted.')
 }
 return <section className="funding-hub" id="funding-hub" aria-labelledby="funding-hub-title">
  <div className="funding-hero">
   <div><p className="eyebrow">TRYAMM BUSINESS BUILDER · ALL 54 INDUSTRIES</p><h2 id="funding-hub-title">Build your business. Prepare for funding. Know what to check.</h2><p>Start with a business website, make a plan, assemble your funding materials, and track the licenses, tax and operational requirements that need verification.</p><p className="funding-limit"><strong>This is a planning tool.</strong> It does not register a company, apply for a loan, verify legal compliance, check eligibility or promise a grant.</p></div>
   <div className="funding-hero-art" aria-hidden="true"><span>54</span><strong>business starting points</strong><small>ONE ORGANIZED PATH</small></div>
  </div>
  <div className="funding-steps" aria-label="Business launch workflow">
   <span>1. Select your business</span><span>2. Check readiness</span><span>3. Create a plan</span><span>4. Explore funding</span><span>5. Launch responsibly</span>
  </div>
  <section className="funding-panel" aria-labelledby="funding-profile-title"><div className="funding-section-heading"><div><p className="eyebrow">01 / Business profile</p><h3 id="funding-profile-title">Start with your industry and location</h3></div><a href="#business-catalog" className="funding-text-link">Explore 54 websites ↗</a></div>
   <div className="funding-form-grid">
    <label>Business template<select aria-label="Funding business template" value={profile.templateId} onChange={event=>selectTemplate(event.target.value)}>{TEMPLATE_CATALOG.map(t=><option key={t.id} value={t.id}>{t.id} · {t.name}</option>)}</select></label>
    <label>Business name (optional)<input value={profile.name} onChange={e=>set('name',e.target.value)} maxLength={90} placeholder="Your future business name"/></label>
    <label>State / jurisdiction<select value={profile.state} onChange={e=>set('state',e.target.value)} aria-label="Business state">{US_STATES.map(state=><option key={state}>{state}</option>)}</select></label>
    <label>Business stage<select value={profile.stage} onChange={e=>set('stage',e.target.value)}><option value="idea">Idea / research</option><option value="forming">Forming / prelaunch</option><option value="operating">Already operating</option><option value="growth">Growing / hiring</option></select></label>
   </div>
   <div className="funding-sector-summary"><strong>{getTemplateName(profile.templateId)} · {sector}</strong><p>Requirements shown below are a U.S. national starting point, not a verified list for {profile.state}. The state, city and professional licensing authorities decide the requirements for your specific business.</p><a href={'/site-demo.html?template='+encodeURIComponent(profile.templateId)}>Open the complete sample website ↗</a></div>
  </section>
  <section className="funding-panel" aria-labelledby="funding-checklist-title"><div className="funding-section-heading"><div><p className="eyebrow">02 / Readiness and compliance</p><h3 id="funding-checklist-title">Track documents and obligations</h3></div><strong className="funding-progress" aria-live="polite">{summary.done} of {summary.total} owner-marked</strong></div>
   <div className="funding-meter" role="progressbar" aria-label="Owner checklist progress, not compliance certification" aria-valuemin={0} aria-valuemax={summary.total} aria-valuenow={summary.done}><span style={{width:(summary.done/Math.max(1,summary.total)*100)+'%'}}/></div>
   <p className="funding-hint">A check mark means only that you say you reviewed an item. It is not an approval, professional verification or government filing.</p>
   <div className="funding-task-list">{steps.map(step=><div className="funding-task" key={step.id}><label><input type="checkbox" checked={checked.has(step.id)} onChange={e=>mark(step.id,e.target.checked)}/><span><strong>{step.title}</strong><small>{step.why}</small>{step.industry&&<em>Industry-specific review</em>}</span></label>{step.resource&&<a href={step.resource} target="_blank" rel="noopener noreferrer">Official resource ↗</a>}</div>)}</div>
   <p className="funding-hint">Your selections and business-plan answers are kept only in this open browser session. Do not type an SSN, EIN, bank account number, medical record, private financial document or password here.</p>
  </section>
  <section className="funding-panel" aria-labelledby="funding-plan-title"><p className="eyebrow">03 / Business plan and lender packet</p><h3 id="funding-plan-title">Write a funding-ready draft</h3><p>Describe real customers, services and funding needs. The download includes a plan outline and your self-reported checklist, clearly labeled as a draft.</p>
   <div className="funding-form-grid">
    <label>Capital you want to request (USD)<input type="number" inputMode="decimal" value={profile.amount} onChange={e=>set('amount',e.target.value)} min="0" max="100000000" placeholder="Example: 15000"/></label>
    <label>Estimated monthly sales — forecast only (USD)<input type="number" inputMode="decimal" value={profile.revenueEstimate} onChange={e=>set('revenueEstimate',e.target.value)} min="0" max="100000000" placeholder="Your own projection"/></label>
    <label>Estimated monthly costs — forecast only (USD)<input type="number" inputMode="decimal" value={profile.expensesEstimate} onChange={e=>set('expensesEstimate',e.target.value)} min="0" max="100000000" placeholder="Your own projection"/></label>
    <label>Owner / team experience<textarea value={profile.ownerExperience} onChange={e=>set('ownerExperience',e.target.value)} maxLength={800} placeholder="Experience, qualifications and relevant background"/></label>
    <label>Customer, service and market<textarea value={profile.customers} onChange={e=>set('customers',e.target.value)} maxLength={1000} placeholder="Who needs your product or service, where and why?"/></label>
    <label>How the business earns revenue<textarea value={profile.revenueModel} onChange={e=>set('revenueModel',e.target.value)} maxLength={800} placeholder="Real offerings, pricing approach and customer acquisition"/></label>
    <label>Competition and differentiation<textarea value={profile.competition} onChange={e=>set('competition',e.target.value)} maxLength={800} placeholder="Who else serves these customers? What is distinct?"/></label>
    <label>Detailed use of funds<textarea value={profile.useOfFunds} onChange={e=>set('useOfFunds',e.target.value)} maxLength={1300} placeholder="Equipment, materials, rent, staffing, marketing and costs, item by item"/></label>
    <label>Launch milestones<textarea value={profile.milestones} onChange={e=>set('milestones',e.target.value)} maxLength={850} placeholder="What can you reasonably achieve in 30, 90 and 180 days?"/></label>
    <label>Other important notes<textarea value={profile.notes} onChange={e=>set('notes',e.target.value)} maxLength={1000} placeholder="Known risks, pending documents, questions for a lender or mentor"/></label>
   </div>
   <div className="funding-export"><button type="button" onClick={exportPacket}>Download my business funding packet ↓</button><span role="status">{message}</span></div>
   <p className="funding-hint">The file is a text draft stored on your device; it is not uploaded to TRYAMM or automatically submitted anywhere. Review all figures and documents before giving them to a lender or grantmaker.</p>
  </section>
  <section className="funding-panel" aria-labelledby="funding-options-title"><p className="eyebrow">04 / Funding pathways</p><h3 id="funding-options-title">Research legitimate ways to finance the business</h3><p>These are resources to investigate, not verified matches, awards or approvals. Application rules, credit decisions and funding availability must be checked with each provider.</p><label className="funding-search">Find a funding path<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try microloan, research, contracts, self-funding"/></label>
  <div className="funding-path-grid">{filtered.map(option=><article className="funding-path" key={option.id}><small>{option.type}</small><h4>{option.title}</h4><p>{option.description}</p><a href={option.url} target="_blank" rel="noopener noreferrer">Open official resource ↗</a></article>)}</div>{!filtered.length&&<p>No pathways match that search.</p>}
  <p className="funding-hint">Never pay TRYAMM to obtain an IRS EIN or SAM.gov registration; those official government services are free. SBA generally does not give grants to start or expand ordinary businesses. Research any private grant offer carefully.</p>
  </section>
  <section className="funding-bottom" aria-label="Launch next steps"><div><h3>From a draft to a real business</h3><p>Use your full website design, have licenses and obligations verified, collect real operational records, and approach suitable funding providers with an accurate packet.</p></div><a href={'/site-demo.html?template='+encodeURIComponent(profile.templateId)}>See my business website ↗</a><a href="#business-catalog">Choose another business ↗</a></section>
 </section>
}
