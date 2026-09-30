import {BJ_STUBBS_CHARACTER,BJ_STUBBS_ASSET_IDS} from './streetVerseBJStubbsCharacter'

export const STREETVERSE_NAMED_CHARACTERS={
 'bj-stubbs':BJ_STUBBS_CHARACTER,
} as const

export type StreetVerseNamedCharacterId=keyof typeof STREETVERSE_NAMED_CHARACTERS

export const STREETVERSE_HERO_CHARACTER_ID:StreetVerseNamedCharacterId='bj-stubbs'

export function getStreetVerseNamedCharacter(id:string){
 return STREETVERSE_NAMED_CHARACTERS[id as StreetVerseNamedCharacterId]
}

export function characterForAsset(assetId:string){
 if(assetId===BJ_STUBBS_ASSET_IDS.current||assetId===BJ_STUBBS_ASSET_IDS.futurePhotoMatched)return BJ_STUBBS_CHARACTER
 return undefined
}

export function announceStreetVerseCharacterReady(detail:{
 id:StreetVerseNamedCharacterId
 assetId:string
 era?:'current'|'younger'
 photoMatched?:boolean
 source:string
}){
 const character=getStreetVerseNamedCharacter(detail.id)
 if(!character)return
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-ready',{detail:{
  characterId:character.id,
  displayName:character.displayName,
  role:character.role,
  era:detail.era||character.currentEra,
  assetId:detail.assetId,
  status:character.status,
  photoMatched:Boolean(detail.photoMatched),
  identityContinuityKey:character.id,
  source:detail.source,
 }}))
}
