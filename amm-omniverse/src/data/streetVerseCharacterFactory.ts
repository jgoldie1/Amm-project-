import {BJ_STUBBS_DNA} from './streetVerseBJStubbsCharacter'
import {cloneStreetVerseCharacterDNA,type StreetVerseCharacterDNA} from './streetVerseCharacterDNA'

export const STREETVERSE_CHARACTER_FACTORY_PIPELINE=[
 'IDENTITY',
 'REFERENCE LOCK',
 'CHARACTER DNA',
 'PROCEDURAL BLOCKOUT',
 'FACE / HAIR / WARDROBE PASS',
 'RIG CONTRACT',
 'ANIMATION SLOTS',
 'GAMEPLAY DEVELOPMENT',
 'LIKENESS QA',
 'PHOTO-MATCH UPGRADE',
] as const

export type StreetVerseCharacterFactoryInput=Readonly<{
 id:string
 displayName:string
 role:string
 body?:Partial<StreetVerseCharacterDNA['body']>
 face?:Partial<StreetVerseCharacterDNA['face']>
 appearance?:Partial<StreetVerseCharacterDNA['appearance']>
 wardrobe?:Partial<StreetVerseCharacterDNA['wardrobe']>
 animation?:Partial<StreetVerseCharacterDNA['animation']>
 eras?:StreetVerseCharacterDNA['eras']
 progression?:Partial<StreetVerseCharacterDNA['progression']>
}>

export function createCharacterFromBJTemplate(input:StreetVerseCharacterFactoryInput){
 return cloneStreetVerseCharacterDNA(BJ_STUBBS_DNA,input)
}

export function validateStreetVerseCharacterDNA(dna:StreetVerseCharacterDNA){
 const errors:string[]=[]
 if(!dna.id.trim())errors.push('id')
 if(!dna.displayName.trim())errors.push('displayName')
 if(!dna.role.trim())errors.push('role')
 if(dna.body.heightScale<.75||dna.body.heightScale>1.30)errors.push('body.heightScale')
 if(dna.face.eyeSpacing<.75||dna.face.eyeSpacing>1.30)errors.push('face.eyeSpacing')
 if(dna.face.jawWidth<.70||dna.face.jawWidth>1.35)errors.push('face.jawWidth')
 if(!dna.eras.length)errors.push('eras')
 if(!dna.progression.skillTracks.length)errors.push('progression.skillTracks')
 return{ok:errors.length===0,errors}
}

export function requestStreetVerseCharacterBuild(dna:StreetVerseCharacterDNA){
 const validation=validateStreetVerseCharacterDNA(dna)
 if(!validation.ok)throw new Error('Invalid StreetVerse character DNA: '+validation.errors.join(', '))
 window.dispatchEvent(new CustomEvent('tryamm:character-build-request',{detail:{
  dna,
  pipeline:STREETVERSE_CHARACTER_FACTORY_PIPELINE,
  source:'streetverse-character-factory',
  preserveRigContract:true,
  preserveIdentityContinuity:true,
 }}))
}

export function requestPhotoMatchUpgrade(detail:{
 characterId:string
 referenceIds:readonly string[]
 authorized:boolean
}){
 if(!detail.authorized)throw new Error('Photo-match upgrade requires authorized reference material')
 window.dispatchEvent(new CustomEvent('tryamm:character-photo-match-request',{detail:{
  ...detail,
  preserveRigContract:true,
  preserveProgression:true,
  preserveInventory:true,
  source:'streetverse-character-factory',
 }}))
}

export const STREETVERSE_CHARACTER_FACTORY={
 templateCharacterId:'bj-stubbs',
 templateVersion:'bj-realism-v4',
 dnaVersion:'character-dna-v1',
 sameRigForNamedCharacters:true,
 sameDevelopmentRuntimeForNamedCharacters:true,
 photoMatchCanReplaceHeadWithoutResettingGameplay:true,
} as const
