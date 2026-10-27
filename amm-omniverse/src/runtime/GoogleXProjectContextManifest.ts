/** GoogleX project-context manifest: no network, secrets, private memory or automatic startup side effects. */
export const GOOGLEX_PROJECT_SOURCES=Object.freeze([
 {id:'repo',path:'README.md',purpose:'project-overview'},
 {id:'agents',path:'AGENTS.md',purpose:'agent-operating-charter'},
 {id:'legacy',path:'docs/gameplay/STREETVERSE_LEGACY_MECHANICS_PRESERVATION_AUDIT_2026-10.md',purpose:'existing-gameplay-preservation'},
 {id:'memory',path:'docs/architecture/GOOGLEX_MEMORY_GITHUB_CONTINUITY_BRIDGE.md',purpose:'approved-memory-design'}
])
const SAFE_QUERY=/^[a-zA-Z0-9 _./-]{1,120}$/
export function planGoogleXContext(query:string,opts:{authenticated:boolean;projectApproved:boolean;includePrivate:boolean;maxSources?:number}){
 if(!opts.authenticated||!opts.projectApproved)return{ready:false,reason:'authorization_required',sources:[]}
 if(opts.includePrivate)return{ready:false,reason:'private_data_not_allowed_in_public_repo_index',sources:[]}
 if(!SAFE_QUERY.test(query))return{ready:false,reason:'invalid_query',sources:[]}
 const cap=Math.min(Math.max(Math.floor(opts.maxSources??4),1),4)
 return{ready:true,reason:'repo_source_plan_only',sources:GOOGLEX_PROJECT_SOURCES.slice(0,cap)}
}
export const GOOGLEX_CONTEXT_POLICY=Object.freeze({maxSources:4,modelTokenBudget:0,readOnly:true,noAutoPublish:true,noSecretExport:true,noCrossBusinessLeakage:true})
