import {MEET_THE_STUBBS_FAMILY_FRIENDS,type StubbsCharacterPassport} from '../game/characters/meetTheStubbsFamilyFriends'

export type FamilyVisualStatus='certified-likeness'|'authorized-reference-pending'|'generated-original-ready'|'generated-original-pending'

const GENERIC_VISUAL_SLOTS=[
  'sv-black-man-youngadult-01',
  'sv-black-woman-youngadult-01',
  'sv-black-man-adult-01',
  'sv-black-woman-adult-01',
  'sv-black-man-senior-01',
  'sv-black-woman-senior-01',
  'sv-white-man-youngadult-01',
  'sv-white-woman-youngadult-01',
  'sv-latino-man-adult-01',
  'sv-latina-woman-adult-01',
  'sv-east-asian-youngadult-01',
  'sv-south-asian-adult-01',
  'sv-mena-adult-01',
  'sv-multiracial-youngadult-01',
] as const

function hashId(id:string){
  let h=2166136261
  for(const ch of id){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
  return Math.abs(h>>>0)
}

export function genericVisualSlotForCharacter(id:string){
  if(id==='bj-stubbs')return 'sv-bj-stubbs-v6'
  if(id==='james-stubbs')return 'sv-james-body-base-v1'
  return GENERIC_VISUAL_SLOTS[hashId(id)%GENERIC_VISUAL_SLOTS.length]
}

export function familyCharacterVisualStatus(character:StubbsCharacterPassport):FamilyVisualStatus{
  if(character.id==='bj-stubbs')return 'authorized-reference-pending'
  return character.referencePolicy==='authorized-reference'?'authorized-reference-pending':'generated-original-ready'
}

export const STREETVERSE_FAMILY_CHARACTER_PRODUCTION=MEET_THE_STUBBS_FAMILY_FRIENDS
  .filter(character=>!character.id.startsWith('social-creator-'))
  .map(character=>({
    characterId:character.id,
    displayName:character.displayName,
    relationship:character.relationship,
    roles:character.roles,
    worlds:character.worlds,
    referencePolicy:character.referencePolicy,
    visualStatus:familyCharacterVisualStatus(character),
    visualSlot:genericVisualSlotForCharacter(character.id),
    realPersonLikeness:character.id==='bj-stubbs'?false:false,
    standInUntilAuthorizedReference:character.referencePolicy==='authorized-reference',
    persistent:character.persistent,
  }))

export const STREETVERSE_FAMILY_CHARACTER_POLICY={
  bjPriority:true,
  familyFriendsPlayable:true,
  cousinsAndExtendedFamilyUseRegistryRelationships:true,
  noInventedLikeness:true,
  authorizedReferenceRequiredForRealPersonMatch:true,
  generatedOriginalsCanShipWithoutLikenessClaims:true,
  genericStandInsAllowedUntilReferenceReady:true,
  finalLikenessNeverClaimedFromGenericSlot:true,
} as const
