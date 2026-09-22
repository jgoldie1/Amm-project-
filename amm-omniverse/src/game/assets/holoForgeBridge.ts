import {getStubbsPassport} from '../characters/meetTheStubbsFamilyFriends'
import {createHoloForgeManifest,type HoloForgeAssetRequest,type HoloForgeManifest} from './holoForge'

export function characterPassportToHoloForge(nameOrId:string,options?:{provenance?:string;target?:HoloForgeAssetRequest['target'];worldId?:string}):HoloForgeManifest|null{
 const passport=getStubbsPassport(nameOrId)
 if(!passport)return null
 const request:HoloForgeAssetRequest={
  id:`character:${passport.id}`,
  kind:'character',
  title:passport.displayName,
  worldId:options?.worldId||passport.worlds[0]||'StreetVerse',
  prompt:`Create the approved in-world character asset for ${passport.displayName}. Roles: ${passport.roles.join(', ')}. Preserve accessibility, mobile performance, and world consistency.`,
  referencePolicy:passport.referencePolicy,
  provenance:options?.provenance,
  target:options?.target||'web-mobile',
 }
 return createHoloForgeManifest(request)
}

export type HoloForgeWorldAssetSeed={id:string;kind:HoloForgeAssetRequest['kind'];title:string;prompt:string;neighborhoodId?:string;referencePolicy?:HoloForgeAssetRequest['referencePolicy'];provenance?:string}

export function worldAssetsToHoloForge(worldId:string,seeds:HoloForgeWorldAssetSeed[],target:HoloForgeAssetRequest['target']='web-mobile'){
 return seeds.map(seed=>createHoloForgeManifest({id:seed.id,kind:seed.kind,title:seed.title,worldId,neighborhoodId:seed.neighborhoodId,prompt:seed.prompt,referencePolicy:seed.referencePolicy||'original-generated',provenance:seed.provenance,target}))
}
