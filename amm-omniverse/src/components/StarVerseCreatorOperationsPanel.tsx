import {useState} from 'react'
import{
 STAR_COMPETITION_TRACKS,STAR_RIGHTS_ASSETS,STAR_SPONSOR_PLACEMENTS,
 newStarCreatorOps,loadStarCreatorOps,saveStarCreatorOps,clearStarCreatorOps,
 prepareCompetitionRunOfShow,starLocalAnalytics,starRightsReleaseGate,
 type StarCreatorOps,type StarCompetitionTrack,type StarRightsAsset,type StarRightsStatus,type StarSponsorPlacement,
} from '../runtime/StarVerseCreatorOperations'

type Tab='passport'|'competition'|'rights'|'sponsor'|'captions'|'analytics'
const tabs:ReadonlyArray<{id:Tab;label:string}>=[
 {id:'passport',label:'★ Talent Passport'},{id:'competition',label:'🎤 Star Competition'},
 {id:'rights',label:'🔐 Rights Vault'},{id:'sponsor',label:'📣 Sponsorships'},
 {id:'captions',label:'🌐 Captions + Translation'},{id:'analytics',label:'📊 Analytics'},
]
const field:React.CSSProperties={width:'100%',boxSizing:'border-box',background:'#060f1c',border:'1px solid #5a7891',borderRadius:10,color:'#fff',fontSize:16,padding:'12px 13px'}
const button:React.CSSProperties={minHeight:48,border:'1px solid #6592a9',borderRadius:12,background:'#142c40',color:'#fff',padding:'12px 14px',fontSize:13,fontWeight:850,cursor:'pointer'}
const card:React.CSSProperties={border:'1px solid #314b61',background:'#0b1827',padding:14,borderRadius:14}
const hint:React.CSSProperties={color:'#adcad9',fontSize:12,lineHeight:1.65}
const randomId=()=>typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)

export default function StarVerseCreatorOperationsPanel({onApplyStageName}:{onApplyStageName?:(value:string)=>void}){
 const [tab,setTab]=useState<Tab>('passport')
 const [ops,setOps]=useState<StarCreatorOps>(()=>loadStarCreatorOps())
 const [notice,setNotice]=useState('Drafts stay in this browser. No real applications, payments or ads are submitted.')
 const [rightsType,setRightsType]=useState<StarRightsAsset>('music')
 const [rightsName,setRightsName]=useState('')
 const [rightsClaim,setRightsClaim]=useState<StarRightsStatus>('unverified')
 const [sponsorName,setSponsorName]=useState('')
 const [sponsorPlacement,setSponsorPlacement]=useState<StarSponsorPlacement>('episode')
 const [sponsorConcept,setSponsorConcept]=useState('')
 const [clearConfirm,setClearConfirm]=useState(false)
 const update=(transform:(current:StarCreatorOps)=>StarCreatorOps)=>{
  setOps(before=>{const next=saveStarCreatorOps(transform(before));return next})
  setNotice('Local planning draft saved on this device. No external service was contacted.')
 }
 const setPassport=(values:Partial<StarCreatorOps['passport']>)=>update(v=>({...v,passport:{...v.passport,...values}}))
 const setCaptions=(values:Partial<StarCreatorOps['captions']>)=>update(v=>({...v,captions:{...v.captions,...values}}))
 const addRight=()=>{
  if(rightsName.trim().length<3){setNotice('Give the asset a descriptive title first.');return}
  update(v=>({...v,rights:[...v.rights.slice(-19),{id:randomId(),assetType:rightsType,assetLabel:rightsName.trim(),claim:rightsClaim,
   notes:'Creator-entered claim only; no license is verified.',verified:false,commercialUseAuthorized:false}]}))
  setRightsName('')
 }
 const addSponsor=()=>{
  if(sponsorName.trim().length<2||sponsorConcept.trim().length<10){setNotice('Enter a draft brand label and a short sponsorship concept.');return}
  update(v=>({...v,sponsor:[...v.sponsor.slice(-9),{id:randomId(),brandLabel:sponsorName.trim(),
   placement:sponsorPlacement,concept:sponsorConcept.trim(),budgetCents:0,status:'LOCAL_PROPOSAL',contractSigned:false,inventoryReserved:false,moneyMoved:false}]}))
  setSponsorName('');setSponsorConcept('')
 }
 const mark=(step:StarCreatorOps['milestones'][number])=>update(v=>({...v,milestones:v.milestones.includes(step)?v.milestones.filter(x=>x!==step):[...v.milestones,step]}))
 const analytics=starLocalAnalytics(ops)
 const gate=starRightsReleaseGate(ops)
 const competition=prepareCompetitionRunOfShow(ops)
 const exportCopy=()=>{
  const data=JSON.stringify({schema:'tryamm.starverse.creator-operations-export.v1',ops,competition,analytics,rightsGate:gate},null,2)
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}))
  const a=document.createElement('a');a.href=url;a.download='starverse-creator-operations-local.json';a.click()
  window.setTimeout(()=>URL.revokeObjectURL(url),1000)
  setNotice('Local planning JSON export initiated. This contains your stage name, so store it privately.')
 }
 const clear=()=>{
  clearStarCreatorOps();setOps(newStarCreatorOps());setClearConfirm(false)
  setNotice('Local StarVerse creator-operations draft cleared from this browser.')
 }
 const locales=['en','es','fr','pt','ar','sw','yo','ig','ha','zh','ja']
 return <section aria-label="StarVerse creator operations" style={{...card,margin:'20px 0',borderColor:'#785fb0'}}>
  <h2 style={{margin:'0 0 6px',fontSize:24}}>StarVerse Talent Passport + Creator Operations</h2>
  <p style={hint}>Prepare a free talent-show concept, rights checklist, captions, sponsor proposal and production metrics. Everything is local-preview only; creator and network accounts are not verified here.</p>
  <div role="status" aria-live="polite" style={{...card,marginBottom:12,fontSize:12,color:'#ffdb98'}}>{notice}</div>
  <nav aria-label="Creator operations tabs" style={{display:'flex',gap:8,overflowX:'auto',padding:'0 0 10px'}}>
   {tabs.map(x=><button type="button" key={x.id} onClick={()=>setTab(x.id)} aria-current={tab===x.id?'page':undefined} style={{...button,whiteSpace:'nowrap',flexShrink:0,background:tab===x.id?'#24506a':'#142c40'}}>{x.label}</button>)}
  </nav>
  {tab==='passport'&&<div style={card}>
   <h3>Private Talent Passport</h3>
   <p style={hint}>This is not a verified identity document. Only use a stage name—no legal ID, street address or date of birth.</p>
   <label style={hint}>Stage name<input style={field} maxLength={90} value={ops.passport.stageName} onChange={e=>setPassport({stageName:e.target.value})}/></label>
   <label style={{...hint,display:'block',marginTop:9}}>Creator bio<textarea rows={3} style={field} maxLength={280} value={ops.passport.bio} onChange={e=>setPassport({bio:e.target.value})}/></label>
   <label style={{...hint,display:'block',marginTop:9}}>Portfolio notes (not a public link or upload)<textarea rows={3} style={field} maxLength={280} value={ops.passport.portfolioNotes} onChange={e=>setPassport({portfolioNotes:e.target.value})}/></label>
   <h4>Talents and interests</h4>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{STAR_COMPETITION_TRACKS.map(t=><label key={t.id} style={{...card,display:'flex',gap:8,alignItems:'center'}}><input type="checkbox" checked={ops.passport.skills.includes(t.id)} onChange={e=>setPassport({skills:e.target.checked?[...ops.passport.skills,t.id]:ops.passport.skills.filter(id=>id!==t.id)})}/>{t.label}</label>)}</div>
   <h4>Accessibility defaults</h4>
   <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
    {(['captions','reducedMotion','oneHandControls'] as const).map(x=><label key={x} style={{...card,display:'flex',gap:8}}><input type="checkbox" checked={ops.passport.accessibilityPreferences[x]} onChange={e=>setPassport({accessibilityPreferences:{...ops.passport.accessibilityPreferences,[x]:e.target.checked}})}/>{x==='oneHandControls'?'One-hand controls':x==='reducedMotion'?'Reduced motion':'Captions'}</label>)}
   </div>
   <button style={{...button,marginTop:12}} disabled={!ops.passport.stageName.trim()||!onApplyStageName} onClick={()=>{onApplyStageName?.(ops.passport.stageName);setNotice('Stage name copied into the current audition draft. Save that audition separately.')}}>Use stage name in audition draft</button>
  </div>}
  {tab==='competition'&&<div style={card}>
   <h3>Who Wants to Be a Star? — Free Showcase</h3>
   <p style={hint}>This is a sample episode rundown, not an active casting form or a verified voting contest. Gifts cannot purchase winning votes.</p>
   <label style={hint}>Episode concept title<input style={field} maxLength={110} value={ops.competition.episodeTitle} onChange={e=>update(v=>({...v,competition:{...v.competition,episodeTitle:e.target.value}}))}/></label>
   <label style={{...hint,display:'block',marginTop:9}}>Talent category<select style={field} value={ops.competition.track} onChange={e=>update(v=>({...v,competition:{...v.competition,track:e.target.value as StarCompetitionTrack}}))}>{STAR_COMPETITION_TRACKS.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
   <ol style={{lineHeight:1.75,fontSize:13}}>{competition.rounds.map(x=><li key={x.id}>{x.label}</li>)}</ol>
   <p style={hint}>Verified contestants: 0 • verified audience votes: 0 • active competitions: 0. Anti-fraud scoring, consent and guardian verification are required before launch.</p>
   <button style={button} onClick={()=>mark('audition-plan')}>Mark competition plan drafted</button>
   <button style={{...button,marginLeft:8}} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:pk-story-open',{detail:{source:'starverse-competition'}}))}>Open PK Story Arena</button>
  </div>}
  {tab==='rights'&&<div style={card}>
   <h3>Creator Rights Vault — metadata checklist</h3>
   <p style={hint}>No licenses or personal documents are uploaded, verified, or stored on a server. Ownership claims do not establish publication rights.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(195px,1fr))',gap:8}}>
    <label style={hint}>Asset type<select style={field} value={rightsType} onChange={e=>setRightsType(e.target.value as StarRightsAsset)}>{STAR_RIGHTS_ASSETS.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
    <label style={hint}>Asset label<input style={field} maxLength={120} value={rightsName} onChange={e=>setRightsName(e.target.value)} placeholder="Original song / footage"/></label>
    <label style={hint}>Claim to review<select style={field} value={rightsClaim} onChange={e=>setRightsClaim(e.target.value as StarRightsStatus)}>
     <option value="unverified">Unverified</option><option value="creator-claims-ownership">Creator claims ownership</option><option value="needs-licensor-review">Need license review</option>
    </select></label>
   </div>
   <button style={{...button,marginTop:10}} onClick={addRight}>Add unverified rights item</button>
   <div style={{marginTop:12,display:'grid',gap:7}}>{ops.rights.map(r=><div key={r.id} style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><span style={hint}><b>{r.assetLabel}</b> · {r.assetType}<span style={{display:'block'}}>Status: {r.claim} • clearance NOT verified</span></span><button style={button} onClick={()=>update(v=>({...v,rights:v.rights.filter(x=>x.id!==r.id)}))}>Remove</button></div>)}</div>
   <p style={hint}>Rights entries: {gate.unverified}. Verified releases: 0. Commercial publishing: blocked until verified third-party documents and editorial approval.</p>
   <button style={button} onClick={()=>mark('rights-checklist')}>Mark metadata checklist drafted</button>
  </div>}
  {tab==='sponsor'&&<div style={card}>
   <h3>All American Creator Sponsorships</h3>
   <p style={hint}>Prepare a proposal for a brand or local business. This does not contact a sponsor, reserve ad inventory, bill an advertiser, pay a creator, or guarantee approval.</p>
   <label style={hint}>Brand/business label<input style={field} maxLength={100} value={sponsorName} onChange={e=>setSponsorName(e.target.value)} placeholder="Potential sponsor"/></label>
   <label style={{...hint,display:'block',marginTop:9}}>Placement type<select style={field} value={sponsorPlacement} onChange={e=>setSponsorPlacement(e.target.value as StarSponsorPlacement)}>{STAR_SPONSOR_PLACEMENTS.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
   <label style={{...hint,display:'block',marginTop:9}}>Creative proposal<textarea style={field} rows={3} maxLength={240} value={sponsorConcept} onChange={e=>setSponsorConcept(e.target.value)} placeholder="How the sponsor fits the show without pressuring viewers"/></label>
   <button style={{...button,marginTop:10}} onClick={addSponsor}>Save sponsorship concept</button>
   <div style={{display:'grid',gap:7,marginTop:12}}>{ops.sponsor.map(x=><div key={x.id} style={card}><b>{x.brandLabel} — {x.placement}</b><p style={hint}>{x.concept}</p><p style={hint}>DRAFT ONLY • $0 booked • no contract</p><button style={button} onClick={()=>update(v=>({...v,sponsor:v.sponsor.filter(s=>s.id!==x.id)}))}>Remove concept</button></div>)}</div>
   <button style={{...button,marginTop:12}} onClick={()=>mark('sponsor-proposal')}>Mark sponsor planning drafted</button>
  </div>}
  {tab==='captions'&&<div style={card}>
   <h3>Global Captions + Language Plan</h3>
   <p style={hint}>Plan languages and accessibility. Automatic speech recognition, translation accuracy, caption exports and human review are not supplied by this preview tool.</p>
   <label style={hint}>Original production language<select style={field} value={ops.captions.originalLanguage} onChange={e=>setCaptions({originalLanguage:e.target.value})}>{locales.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
   <h4>Requested translation languages</h4>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{locales.filter(x=>x!==ops.captions.originalLanguage).map(x=><label key={x} style={{...card,display:'flex',gap:8}}><input type="checkbox" checked={ops.captions.translationLanguages.includes(x)} onChange={e=>setCaptions({translationLanguages:e.target.checked?[...ops.captions.translationLanguages,x].slice(0,4):ops.captions.translationLanguages.filter(v=>v!==x)})}/>{x}</label>)}</div>
   <p style={hint}>Planned: {ops.captions.translationLanguages.length} language(s). Human-reviewed captions: not attached. Never label machine translation as certified.</p>
   <button style={button} onClick={()=>mark('caption-plan')}>Mark caption plan drafted</button>
  </div>}
  {tab==='analytics'&&<div style={card}>
   <h3>Production Progress — local data only</h3>
   <p style={hint}>These are counts of planning records saved on this phone/computer. They are not real user sign-ups, show views, social reach, streaming analytics or revenue.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8}}>
    {[
     ['Draft steps',analytics.localProductionProgress+'/'+analytics.localMilestoneTotal],
     ['Rights to verify',String(analytics.rightsMetadataItems)],
     ['Sponsor concepts',String(analytics.sponsorConcepts)],
     ['Languages planned',String(analytics.captionLanguagesPlanned)],
    ].map(([name,value])=><div key={name} style={{...card,textAlign:'center'}}><div style={{fontSize:22,fontWeight:950}}>{value}</div><div style={hint}>{name}</div></div>)}
   </div>
   <div style={{...card,marginTop:10}}><b>Verified audience reach:</b> Not connected <div><b>Verified views:</b> Not connected</div><div><b>Creator revenue:</b> Not connected</div><div><b>Digital billboard impressions:</b> Not connected</div></div>
   <h4>Checklist</h4>
   {(['draft','audition-plan','rights-checklist','caption-plan','sponsor-proposal','billboard-concept','broadcast-draft'] as const).map(x=><label key={x} style={{...hint,display:'block',padding:7}}><input type="checkbox" checked={ops.milestones.includes(x)} onChange={()=>mark(x)}/> {x.replaceAll('-',' ')} (planning only)</label>)}
  </div>}
  <footer style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
   <button style={button} onClick={exportCopy}>Export local creator planning file</button>
   {!clearConfirm?<button style={button} onClick={()=>setClearConfirm(true)}>Clear local creator-operations data…</button>:<>
    <button style={{...button,borderColor:'#db6969'}} onClick={clear}>Confirm clear this browser</button>
    <button style={button} onClick={()=>setClearConfirm(false)}>Cancel</button>
   </>}
  </footer>
 </section>
}
