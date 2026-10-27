/** Stubbs AI Film Engine self-hosted job manifest; no direct network, payments or execution. */
export type FilmJobStage='previs'|'render'|'edit'|'export'|'storage'|'distribution'|'device-test'
export type FilmJobState='pending'|'approved'|'running'|'verified'|'failed'
export type FilmEngineJob={
 id:string;productionId:string;stage:FilmJobStage;status:FilmJobState
 inputRefs:string[];outputRefs:string[];rightsApproved:boolean
 approvalRequired:boolean;approvedBy?:string;verificationHash?:string
}
const STAGES:readonly FilmJobStage[]=['previs','render','edit','export','storage','distribution','device-test']
export function nextFilmStage(stage:FilmJobStage):FilmJobStage|null{
 const i=STAGES.indexOf(stage);return i<0||i>=STAGES.length-1?null:STAGES[i+1]
}
/** A verified artifact and human approval are mandatory before promotion.
 * Publishing is never automatic, and a reference is not media bytes.
 */
export function mayAdvanceFilmJob(job:FilmEngineJob):{allowed:boolean;reason:string}{
 if(job.status!=='verified')return{allowed:false,reason:'job_not_verified'}
 if(!job.verificationHash||!job.outputRefs.length)return{allowed:false,reason:'missing_verified_output'}
 if(!job.rightsApproved)return{allowed:false,reason:'rights_review_required'}
 if(job.approvalRequired&&!job.approvedBy)return{allowed:false,reason:'human_approval_required'}
 if(job.stage==='device-test')return{allowed:false,reason:'pipeline_complete'}
 return{allowed:true,reason:'ready_for_next_stage'}
}
export type FilmExportProfile='preview-720p'|'reel-1080p'|'episode-1080p'
export function exportParameters(profile:FilmExportProfile){
 switch(profile){
 case 'preview-720p':return{width:1280,height:720,fps:24,container:'mp4',videoCodec:'h264',audioCodec:'aac'}
 case 'reel-1080p':return{width:1080,height:1920,fps:30,container:'mp4',videoCodec:'h264',audioCodec:'aac'}
 case 'episode-1080p':return{width:1920,height:1080,fps:24,container:'mp4',videoCodec:'h264',audioCodec:'aac'}
 }
}
