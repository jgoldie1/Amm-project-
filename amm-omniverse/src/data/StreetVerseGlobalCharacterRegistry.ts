import {getStreetVerseCity} from './StreetVerseGlobalRegistry'

export type GlobalCharacterRole=
  |'city-guide'
  |'creator'
  |'business'
  |'community'
  |'mobility'
  |'media'
  |'nightlife'
  |'student'
  |'mentor'

export interface GlobalCharacterProfile{
  id:string
  displayName:string
  fictional:true
  cityId:string
  role:GlobalCharacterRole
  roleLabel:string
  languages:string[]
  missionLane:string
  visualSlot:string
  afterDarkEligible:boolean
  adultOnlyAfterDark:boolean
}

const FIRST_WAVE_CAST:Record<string,GlobalCharacterProfile[]>={
 chicago:[
  {id:'chi-amara-guide',displayName:'Amara Reed',fictional:true,cityId:'chicago',role:'city-guide',roleLabel:'West Side / City Guide',languages:['English'],missionLane:'StreetVerse Global: Living City Story',visualSlot:'sv-black-woman-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'chi-malik-creator',displayName:'Malik Stone',fictional:true,cityId:'chicago',role:'creator',roleLabel:'Music / Reel Creator',languages:['English'],missionLane:'Creator Exchange',visualSlot:'sv-black-man-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'chi-sofia-business',displayName:'Sofia Cruz',fictional:true,cityId:'chicago',role:'business',roleLabel:'Neighborhood Business Scout',languages:['English','Spanish'],missionLane:'Business Connection',visualSlot:'sv-latina-woman-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'chi-darius-mobility',displayName:'Darius Cole',fictional:true,cityId:'chicago',role:'mobility',roleLabel:'Transit / Safe Return Driver',languages:['English'],missionLane:'Safe Return / Mobility',visualSlot:'sv-black-man-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
 ],
 lagos:[
  {id:'lagos-tobi-guide',displayName:'Tobi Adeyemi',fictional:true,cityId:'lagos',role:'city-guide',roleLabel:'Lagos City Guide',languages:['English','Yoruba','Nigerian Pidgin'],missionLane:'StreetVerse Global: Living City Story',visualSlot:'sv-black-man-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'lagos-zainab-business',displayName:'Zainab Bello',fictional:true,cityId:'lagos',role:'business',roleLabel:'Market / Business Connector',languages:['English'],missionLane:'Business Connection',visualSlot:'sv-black-woman-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'lagos-ife-creator',displayName:'Ife Okoro',fictional:true,cityId:'lagos',role:'creator',roleLabel:'Music / Film Creator',languages:['English','Nigerian Pidgin'],missionLane:'Creator Exchange',visualSlot:'sv-black-woman-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'lagos-chidi-mobility',displayName:'Chidi Nwosu',fictional:true,cityId:'lagos',role:'mobility',roleLabel:'Mobility / Ferry Connector',languages:['English'],missionLane:'Safe Return / Mobility',visualSlot:'sv-black-man-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
 ],
 abuja:[
  {id:'abuja-amina-guide',displayName:'Amina Yusuf',fictional:true,cityId:'abuja',role:'city-guide',roleLabel:'Abuja City Guide',languages:['English','Hausa'],missionLane:'StreetVerse Global: Living City Story',visualSlot:'sv-black-woman-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'abuja-daniel-business',displayName:'Daniel Eze',fictional:true,cityId:'abuja',role:'business',roleLabel:'Business Network Connector',languages:['English'],missionLane:'Business Connection',visualSlot:'sv-black-man-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'abuja-hauwa-media',displayName:'Hauwa Musa',fictional:true,cityId:'abuja',role:'media',roleLabel:'Media / Community Host',languages:['English','Hausa'],missionLane:'Creator Exchange',visualSlot:'sv-black-woman-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
 ],
 accra:[
  {id:'accra-kofi-guide',displayName:'Kofi Mensah',fictional:true,cityId:'accra',role:'city-guide',roleLabel:'Accra City Guide',languages:['English','Twi'],missionLane:'StreetVerse Global: Living City Story',visualSlot:'sv-black-man-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'accra-ama-creator',displayName:'Ama Boateng',fictional:true,cityId:'accra',role:'creator',roleLabel:'Music / Fashion Creator',languages:['English','Twi'],missionLane:'Creator Exchange',visualSlot:'sv-black-woman-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'accra-kwame-business',displayName:'Kwame Owusu',fictional:true,cityId:'accra',role:'business',roleLabel:'Business / Market Connector',languages:['English'],missionLane:'Business Connection',visualSlot:'sv-black-man-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
 ],
 nairobi:[
  {id:'nairobi-wanjiku-guide',displayName:'Wanjiku Kamau',fictional:true,cityId:'nairobi',role:'city-guide',roleLabel:'Nairobi City Guide',languages:['English','Swahili'],missionLane:'StreetVerse Global: Living City Story',visualSlot:'sv-black-woman-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'nairobi-brian-tech',displayName:'Brian Otieno',fictional:true,cityId:'nairobi',role:'creator',roleLabel:'Tech / Creator Connector',languages:['English','Swahili'],missionLane:'Creator Exchange',visualSlot:'sv-black-man-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'nairobi-aisha-business',displayName:'Aisha Noor',fictional:true,cityId:'nairobi',role:'business',roleLabel:'Business / Community Connector',languages:['English','Swahili'],missionLane:'Business Connection',visualSlot:'sv-black-woman-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
 ],
 johannesburg:[
  {id:'joburg-thabo-guide',displayName:'Thabo Mokoena',fictional:true,cityId:'johannesburg',role:'city-guide',roleLabel:'Johannesburg City Guide',languages:['English','Zulu'],missionLane:'StreetVerse Global: Living City Story',visualSlot:'sv-black-man-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'joburg-naledi-creator',displayName:'Naledi Dlamini',fictional:true,cityId:'johannesburg',role:'creator',roleLabel:'Amapiano / Fashion Creator',languages:['English','Zulu'],missionLane:'Creator Exchange',visualSlot:'sv-black-woman-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'joburg-sipho-business',displayName:'Sipho Khumalo',fictional:true,cityId:'johannesburg',role:'business',roleLabel:'Business / Community Connector',languages:['English'],missionLane:'Business Connection',visualSlot:'sv-black-man-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
 ],
 'addis-ababa':[
  {id:'addis-hana-guide',displayName:'Hana Bekele',fictional:true,cityId:'addis-ababa',role:'city-guide',roleLabel:'Addis Ababa City Guide',languages:['Amharic','English'],missionLane:'StreetVerse Global: Living City Story',visualSlot:'sv-black-woman-youngadult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'addis-dawit-business',displayName:'Dawit Tesfaye',fictional:true,cityId:'addis-ababa',role:'business',roleLabel:'Business / Culture Connector',languages:['Amharic','English'],missionLane:'Business Connection',visualSlot:'sv-black-man-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:'addis-selam-creator',displayName:'Selam Alemu',fictional:true,cityId:'addis-ababa',role:'creator',roleLabel:'Culture / Media Creator',languages:['Amharic','English'],missionLane:'Creator Exchange',visualSlot:'sv-black-woman-adult-01',afterDarkEligible:true,adultOnlyAfterDark:true},
 ],
}

const FALLBACK_SLOTS=['sv-multiracial-youngadult-01','sv-black-man-adult-01','sv-black-woman-adult-01','sv-south-asian-adult-01','sv-east-asian-youngadult-01','sv-mena-adult-01'] as const

function hash(value:string){
 let h=2166136261
 for(const ch of value){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
 return Math.abs(h>>>0)
}

export function getGlobalCityCharacterCast(cityId:string):GlobalCharacterProfile[]{
 const direct=FIRST_WAVE_CAST[cityId]
 if(direct)return direct
 const city=getStreetVerseCity(cityId)
 return [
  {id:`${city.id}-guide-01`,displayName:`${city.name} Guide`,fictional:true,cityId:city.id,role:'city-guide',roleLabel:`${city.name} City Guide`,languages:['Local language support','English'],missionLane:'StreetVerse Global: Living City Story',visualSlot:FALLBACK_SLOTS[hash(city.id)%FALLBACK_SLOTS.length],afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:`${city.id}-creator-01`,displayName:`${city.name} Creator`,fictional:true,cityId:city.id,role:'creator',roleLabel:'Creator / Culture Connector',languages:['Local language support'],missionLane:'Creator Exchange',visualSlot:FALLBACK_SLOTS[hash(city.id+'creator')%FALLBACK_SLOTS.length],afterDarkEligible:true,adultOnlyAfterDark:true},
  {id:`${city.id}-business-01`,displayName:`${city.name} Business Connector`,fictional:true,cityId:city.id,role:'business',roleLabel:'Business / Community Connector',languages:['Local language support'],missionLane:'Business Connection',visualSlot:FALLBACK_SLOTS[hash(city.id+'business')%FALLBACK_SLOTS.length],afterDarkEligible:true,adultOnlyAfterDark:true},
 ]
}

export const STREETVERSE_GLOBAL_CHARACTER_POLICY={
 fictionalCityCastByDefault:true,
 noRealResidentTracking:true,
 realPersonLikenessRequiresAuthorization:true,
 genericRigDoesNotClaimLikeness:true,
 citySpecificLanguageAndCultureReviewRequiredBeforeProductionCertification:true,
 childAndTeenAfterDarkBlocked:true,
 oneSharedRigPackWithCitySpecificCasting:true,
} as const
