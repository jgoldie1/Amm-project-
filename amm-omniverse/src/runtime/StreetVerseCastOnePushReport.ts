import {importOriginalCastZip} from './StreetVerseLocalCastImport'
import {STREETVERSE_RECOVERED_CAST} from '../data/StreetVerseRecoveredCastAssets'

type CharacterProof={status:'not_loaded'|'mounted'|'failed';animationCount:number;rigged:boolean;rigQuality?:'production'|'prototype'|'incomplete';boneCount?:number;reason?:string}
export type CastOnePushReport={
 schema:'tryamm.streetverse.cast-one-push.v1'
 generatedAt:string
 archive:{filename:string;verified:boolean;error?:string;validatedAssets:readonly {role:string;filename:string;bytes:number;sha256:string;skins:number;animations:number;diagnostic:boolean}[]}
 characters:{bj:CharacterProof;jacobie:CharacterProof;lateasia:CharacterProof}
 checks:{hashesVerified:boolean;threeMounted:boolean;threeRiggedAndAnimated:boolean;recoveredNpcMixerAdvanced:{jacobie:boolean;lateasia:boolean};realAnimationPlaybackProven:false;chromebookVisualAcceptanceProven:false}
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
  archive:{filename:file.name,verified:false,validatedAssets:[]},
  characters:{
   bj:{status:'not_loaded',animationCount:0,rigged:false},
   jacobie:{status:'not_loaded',animationCount:0,rigged:false},
   lateasia:{status:'not_loaded',animationCount:0,rigged:false},
  },
  checks:{hashesVerified:false,threeMounted:false,threeRiggedAndAnimated:false,recoveredNpcMixerAdvanced:{jacobie:false,lateasia:false},realAnimationPlaybackProven:false,chromebookVisualAcceptanceProven:false},
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
  const d=(event as CustomEvent<{version?:string;skeletonAnimationCount?:number;localSession?:boolean}>).detail
  if(d?.version!=='V15'||d.localSession!==true||!bjValidated)return
  proof.characters.bj={status:'mounted',animationCount:Number(d.skeletonAnimationCount)||bjClips,rigged:true}
  finish('bj')
 }
 const onCast=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string;localSession?:boolean;rigAudit?:{animationCount?:number;skinnedMeshes?:number;boneCount?:number;quality?:'production'|'prototype'|'incomplete'}}>).detail
  if(d?.localSession!==true)return
  const role=d.characterId==='jacobie-stubbs'?'jacobie':d.characterId==='lateasia-monroe'?'lateasia':null
  if(!role)return
  const audit=d.rigAudit
  const rigged=Boolean(audit&&Number(audit.skinnedMeshes)>0&&Number(audit.boneCount)>0)
  proof.characters[role]={status:'mounted',animationCount:Number(audit?.animationCount)||0,rigged,rigQuality:audit?.quality,boneCount:audit?.boneCount}
  finish(role)
 }
 const onMixerTick=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string;localSession?:boolean;mixerAdvanced?:boolean}>).detail
  if(!d||d.localSession!==true||d.mixerAdvanced!==true)return
  if(d.characterId==='jacobie-stubbs')proof.checks.recoveredNpcMixerAdvanced.jacobie=true
  if(d.characterId==='lateasia-monroe')proof.checks.recoveredNpcMixerAdvanced.lateasia=true
 }
 const onUnavailable=(event:Event)=>{
  const d=(event as CustomEvent<{role?:string;state?:string;reason?:string;localSession?:boolean}>).detail
  if(!d||d.localSession!==true||(d.role!=='jacobie'&&d.role!=='lateasia')||d.state!=='unavailable')return
  proof.characters[d.role]={status:'failed',animationCount:0,rigged:false,reason:d.reason||'GLB unavailable'}
  finish(d.role)
 }
 window.addEventListener('tryamm:bj-v15-asset-audit',onRigAudit)
 window.addEventListener('tryamm:streetverse-bj-hero-mounted',onHero)
 window.addEventListener('tryamm:streetverse-character-registered',onCast)
 window.addEventListener('tryamm:streetverse-recovered-character-status',onUnavailable)
 window.addEventListener('tryamm:streetverse-cast-animation-tick',onMixerTick)
 try{
  await importOriginalCastZip(file)
  proof.archive.verified=true
  proof.checks.hashesVerified=true
  proof.archive.validatedAssets=(Object.entries(STREETVERSE_RECOVERED_CAST) as Array<[keyof typeof STREETVERSE_RECOVERED_CAST,(typeof STREETVERSE_RECOVERED_CAST)[keyof typeof STREETVERSE_RECOVERED_CAST]]>).map(([role,asset])=>({
   role,filename:asset.filename,bytes:asset.bytes,sha256:asset.sha256,skins:asset.skins,animations:asset.animationCount,diagnostic:asset.diagnostic
  }))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-v15-preview',{detail:{source:'cast-one-push-report'}}))
  await Promise.race([done,new Promise<void>(resolve=>setTimeout(resolve,35000))])
  // Allow the real world renderer's next frame to advance loaded mixers.
  if(pending.size===0)await new Promise<void>(resolve=>setTimeout(resolve,150))
  proof.checks.threeMounted=Object.values(proof.characters).every(character=>character.status==='mounted')
  // A mesh in the scene is not a playable animated character without its actual rig and clips.
  proof.checks.threeRiggedAndAnimated=Object.values(proof.characters).every(character=>character.status==='mounted'&&character.rigged&&character.animationCount>0)
  proof.result=proof.checks.threeMounted&&proof.checks.threeRiggedAndAnimated?'mounted_not_visual_verified':'incomplete'
 }catch(error){
  proof.archive.error=error instanceof Error?error.message:'Archive verification failed'
  proof.result='archive_rejected'
 }finally{
  window.removeEventListener('tryamm:bj-v15-asset-audit',onRigAudit)
  window.removeEventListener('tryamm:streetverse-bj-hero-mounted',onHero)
  window.removeEventListener('tryamm:streetverse-character-registered',onCast)
  window.removeEventListener('tryamm:streetverse-recovered-character-status',onUnavailable)
  window.removeEventListener('tryamm:streetverse-cast-animation-tick',onMixerTick)
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

/**
 * Owner-directed share of a JSON report. Native device share sheets (when
 * available) are not delivery receipts; selection/receipt remain external.
 * Explicit user tap required. Never uploads the GLB or original photos.
 */
export async function shareCastOnePushReport(report:CastOnePushReport):Promise<'handed_to_device'|'unsupported'|'cancelled'>{
 const name='StreetVerse_One_Push_Cast_Report_'+new Date(report.generatedAt).toISOString().replace(/[:.]/g,'-')+'.json'
 const file=new File([JSON.stringify(report,null,2)],name,{type:'application/json'})
 if(typeof navigator.share!=='function'||typeof navigator.canShare!=='function'||!navigator.canShare({files:[file]}))return 'unsupported'
 try{
  await navigator.share({title:'StreetVerse cast test report',text:'TRYAMM StreetVerse one-push diagnostic report (not production acceptance)',files:[file]})
  return 'handed_to_device'
 }catch(error){
  if(error instanceof DOMException&&error.name==='AbortError')return 'cancelled'
  throw error
 }
}
