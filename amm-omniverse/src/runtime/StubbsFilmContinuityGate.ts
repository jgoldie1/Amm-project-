/**
 * Stubbs AI Film Continuity Gate — original, provider-neutral production planning.
 * This creates validation decisions only; it does not generate or publish media.
 */
import type {ProductionBible} from '../foundation/productionBibleFoundation'

export type FilmPrevisShot={
 sceneId:string;shotId:string;locationId:string;cameraAngle:'north'|'south'|'east'|'west'|'close'|'wide';
 characterIds:string[];assetIds:string[];referenceImageIds:string[];
 grayboxApproved:boolean;lightingPreset:string;durationSeconds:number
}
export type FilmGateResult={approved:boolean;errors:string[];warnings:string[]}
export function auditFilmPrevisShot(bible:ProductionBible,shot:FilmPrevisShot):FilmGateResult{
 const errors:string[]=[],warnings:string[]=[]
 const continuity=bible.continuity.find(c=>c.sceneId===shot.sceneId&&c.shotId===shot.shotId)
 if(!continuity)errors.push('continuity_record_missing')
 else{
  if(continuity.locationId!==shot.locationId)errors.push('location_mismatch')
  for(const id of shot.characterIds)if(!continuity.characterIds.includes(id))errors.push('character_not_in_continuity:'+id)
 }
 if(!bible.approvedShotIds.includes(shot.shotId))errors.push('shot_not_approved')
 if(!shot.grayboxApproved)errors.push('previs_not_approved')
 if(!Number.isFinite(shot.durationSeconds)||shot.durationSeconds<=0||shot.durationSeconds>120)errors.push('invalid_duration')
 if(!shot.lightingPreset.trim())errors.push('lighting_not_locked')
 if(!shot.referenceImageIds.length)warnings.push('no_reference_images')
 if(!bible.accessibility.captionsRequired)warnings.push('captions_not_required_by_bible')
 const rights=bible.rights
 for(const assetId of shot.assetIds){
  const grant=rights.find(r=>r.subjectId===assetId&&r.subjectType==='3d-asset'&&r.approved)
  if(!grant||!grant.evidenceRef||!grant.territories.length)errors.push('asset_rights_unverified:'+assetId)
 }
 return {approved:errors.length===0,errors,warnings}
}
/** Deterministic coverage report; doesn't invent images or scene geometry. */
export function analyzeFilmCameraCoverage(shots:FilmPrevisShot[]){
 const groups=new Map<string,Set<FilmPrevisShot['cameraAngle']>>()
 for(const shot of shots){
  const angles=groups.get(shot.locationId)||new Set<FilmPrevisShot['cameraAngle']>()
  angles.add(shot.cameraAngle);groups.set(shot.locationId,angles)
 }
 return [...groups].map(([locationId,angles])=>({
  locationId,angles:[...angles],fourDirectionReady:['north','south','east','west'].every(a=>angles.has(a as FilmPrevisShot['cameraAngle'])),
 }))
}
