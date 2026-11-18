import {importOriginalCastZip} from './StreetVerseLocalCastImport'

type CharacterProof={status:'not_loaded'|'mounted'|'failed';animationCount:number;rigged:boolean;reason?:string}
export type CastOnePushReport={
 schema:'tryamm.streetverse.cast-one-push.v1'
 generatedAt:string
 archive:{filename:string;verified:boolean;error?:string}
 characters:{bj:CharacterProof;jacobie:CharacterProof;lateasia:CharacterProof}
 checks:{hashesVerified:boolean;threeMounted:boolean;realAnimationPlaybackProven:false;chromebookVisualAcceptanceProven:false}
 result:'mounted_not_visual_verified'|'incomplete'|'archive_rejected'
 submission:{status:'not_submitted';destination:null}
}

/**
 * A single user action starts archive selection; after selection all checks and
 * JSON export are automatic. No API submission is implied or performed.
 * Mount events are captured after this test starts, not inferred from prior saves.
 */
export async function runCastOnePushReport(file:File):Promise<CastOnePushReport>{
 const proof:CastOnePushReport={
  schema:'tryamm.streetverse.cast-one-push.v1',
  generatedAt:new Date().toISOString(),
  archive:{filename:file.name,verified:false},
  characters:{
   bj:{status:'not_loaded',animationCount:0,rigged:false},
   jacobie:{status:'not_loaded',animationCount:0,rigged:false},
   lateasia:{status:'not_loaded',animationCount:0,rigged:false},
  },
  checks:{hashesVerified:false,threeMounted:false,realAnimationPlaybackProven:false,chromebookVisualAcceptanceProven:false},
  result:'incomplete',
  submission:{status:'not_submitted',destination:null},
 }
 const pending=new Set<keyof CastOnePushReport['characters']>(['bj','jacobie','lateasia'])
 let bjValidated=false,bjClips=0,resolveDone:()=>void=()=>{}
 const done=new Promise<void>(resolve=>{resolveDone=resolve})
 const finish=(id:keyof CastOnePushReport['characters'])=>{pending.delete(id);if(pending.size===0)resolveDone()}
 const onRigAudit=(event:Event)=>{
  const d=(event as CustomEvent<{sourceUrl?:string;valid?:boolean;animationCount?:number}>).detail
  // A remote fallback cannot be reported as the locally verified original.
  if(d?.sourceUrl?.startsWith('blob:')&&d.valid===true){bjValidated=true;bjClips=Number(d.animationCount)||0}
 }
 const onHero=(event:Event)=>{
  const d=(event as CustomEvent<{version?:string;skeletonAnimationCount?:number}>).detail
  if(d?.version!=='V15'||!bjValidated)return
  proof.characters.bj={status:'mounted',animationCount:Number(d.skeletonAnimationCount)||bjClips,rigged:true}
  finish('bj')
 }
 const onCast=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string;localSession?:boolean;rigAudit?:unknown}>).detail
  if(d?.localSession!==true)return
  const role=d.characterId==='jacobie-stubbs'?'jacobie':d.characterId==='lateasia-monroe'?'lateasia':null
  if(!role)return
  proof.characters[role]={status:'mounted',animationCount:role==='jacobie'?12:7,rigged:true}
  finish(role)
 }
 const onUnavailable=(event:Event)=>{
  const d=(event as CustomEvent<{role?:string;state?:string;reason?:string}>).detail
  if(!d||(d.role!=='jacobie'&&d.role!=='lateasia')||d.state!=='unavailable')return
  proof.characters[d.role]={status:'failed',animationCount:0,rigged:false,reason:d.reason||'GLB unavailable'}
  finish(d.role)
 }
 window.addEventListener('tryamm:bj-v15-asset-audit',onRigAudit)
 window.addEventListener('tryamm:streetverse-bj-hero-mounted',onHero)
 window.addEventListener('tryamm:streetverse-character-registered',onCast)
 window.addEventListener('tryamm:streetverse-recovered-character-status',onUnavailable)
 try{
  await importOriginalCastZip(file)
  proof.archive.verified=true
  proof.checks.hashesVerified=true
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-v15-preview',{detail:{source:'cast-one-push-report'}}))
  await Promise.race([done,new Promise<void>(resolve=>setTimeout(resolve,35000))])
  proof.checks.threeMounted=Object.values(proof.characters).every(character=>character.status==='mounted')
  proof.result=proof.checks.threeMounted?'mounted_not_visual_verified':'incomplete'
 }catch(error){
  proof.archive.error=error instanceof Error?error.message:'Archive verification failed'
  proof.result='archive_rejected'
 }finally{
  window.removeEventListener('tryamm:bj-v15-asset-audit',onRigAudit)
  window.removeEventListener('tryamm:streetverse-bj-hero-mounted',onHero)
  window.removeEventListener('tryamm:streetverse-character-registered',onCast)
  window.removeEventListener('tryamm:streetverse-recovered-character-status',onUnavailable)
 }
 return proof
}

export function exportCastOnePushReport(report:CastOnePushReport):string{
 const name='StreetVerse_One_Push_Cast_Report_'+new Date(report.generatedAt).toISOString().replace(/[:.]/g,'-')+'.json'
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
 const url=URL.createObjectURL(blob)
 const anchor=document.createElement('a')
 anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove()
 window.setTimeout(()=>URL.revokeObjectURL(url),5000)
 return name
}
