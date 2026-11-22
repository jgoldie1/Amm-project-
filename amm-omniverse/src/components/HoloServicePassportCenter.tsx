import {useState} from 'react'
import {TRYAMM_CONSTITUTION_RULES,evaluateGuardianCovenant,type ComplianceEvidence} from '../foundation/holoServiceGuardianCovenant'
import {evaluatePassport,type HoloServicePassport,type PassportService} from '../foundation/holoServicePassport'
const roles=['company','driver','courier','farm','advertiser','merchant','service-provider'] as const
const services=['advertising','rideshare','delivery','freight','drone','farm-discovery','commerce','gallery'] as const
const empty=():HoloServicePassport=>({
 id:'',displayName:'',roles:[],serviceScopes:[],operationalRegions:[],
 consentGranted:false,consentDocumentRef:null,status:'draft',
 approvedAt:null,approvedBy:null,expiresAt:null,providerAuthority:null,
 providerReference:null,credentials:[],rightsApproved:false
})
const field:React.CSSProperties={minHeight:48,width:'100%',padding:12,background:'#091b2c',border:'1px solid #6994a8',borderRadius:10,color:'#fff',fontSize:16,boxSizing:'border-box'}
const btn:React.CSSProperties={minHeight:54,padding:'12px 14px',borderRadius:12,background:'#153e53',border:'1px solid #79b3cb',color:'#fff',fontWeight:800}
export default function HoloServicePassportCenter(){
 const [draft,setDraft]=useState<HoloServicePassport>(empty)
 const [region,setRegion]=useState('Chicago, IL')
 const [service,setService]=useState<PassportService>('delivery')
 const result=evaluatePassport(draft,service,region)
 const compliance:ComplianceEvidence={humanApproved:false,humanApproverId:null,policyVersion:'TRYAMM Guardian Covenant',policyReviewReference:null,riskReviewed:false,consentCurrent:false,privacyReviewReference:null,incidentEscalationAvailable:false,authorizationReference:null,auditRecordReference:null,providerResponseVerified:false,valueLedgerReference:null,simulation:true}
 const governed=evaluateGuardianCovenant('publish-provider',compliance)
 return <section aria-label="HoloService Passport review" style={{background:'#0d2738',border:'1px solid #4a7186',borderRadius:16,padding:16,color:'#fff',marginTop:12}}>
  <h3 style={{marginTop:0}}>HoloService Passport</h3>
  <p style={{color:'#ffdba5',lineHeight:1.65}}>Private planning form only. This form does not issue a license, verify identity, enroll a driver, publish a farm, initiate payment or authorize dispatch. Do not enter license scans or private documents here.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
   <label>Business or operator display name<input style={field} value={draft.displayName} onChange={e=>setDraft(p=>({...p,displayName:e.target.value}))}/></label>
   <label>Operating region<input style={field} value={region} onChange={e=>setRegion(e.target.value)}/></label>
   <label>Service category<select style={field} value={service} onChange={e=>setService(e.target.value as PassportService)}>{services.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
   <label>Provider role<select style={field} value={draft.roles[0]||''} onChange={e=>setDraft(p=>({...p,roles:e.target.value?[e.target.value as typeof roles[number]]:[]}))}><option value="">Choose role</option>{roles.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:12}}>
   <button type="button" style={btn} onClick={()=>setDraft(empty())}>Clear planning form</button>
   <a href="/holo-readiness" style={{...btn,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>View launch requirements</a>
  </div>
  <p role="status" style={{color:'#ffdba5'}}>Production authorization: BLOCKED. {result.missing.length} passport and {governed.missing.length} constitutional compliance checks are not satisfied.</p>
  <details><summary style={{minHeight:48,cursor:'pointer'}}>Guardian Covenant and AI Law Compliance</summary><ul>{Object.values(TRYAMM_CONSTITUTION_RULES).map(rule=><li key={rule}>{rule}</li>)}</ul><p>These internal rules do not replace applicable transportation, aviation, food, privacy, consumer protection or payment laws. Signed approval evidence and staffed incident escalation must be verified by the backend before production use.</p><button type="button" style={btn} onClick={()=>{const fn=(window as any).__showCompliance;if(typeof fn==='function')fn()}}>Open TRYAMM Compliance Center</button></details>
  <details><summary style={{minHeight:48,cursor:'pointer'}}>Required provider evidence</summary>
   <p>Trusted administrator review, time-limited credential verification, documented customer consent, approved service scope, approved operating region, provider identity and applicable permits. Dispatch, payments and advertising also require separate transaction authorization.</p>
  </details>
 </section>
}
