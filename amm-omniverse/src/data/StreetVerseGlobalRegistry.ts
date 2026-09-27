export type StreetVerseCityStatus='live-alpha'|'building'|'planned'
export interface StreetVerseCity{
 id:string;name:string;country:string;region:string
 status:StreetVerseCityStatus
 spawn:{x:number;z:number}
 features:string[]
}

export const STREETVERSE_GLOBAL_CITIES:StreetVerseCity[]=[
 {id:'chicago',name:'Chicago',country:'United States',region:'Illinois',status:'live-alpha',spawn:{x:0,z:48},features:['living city','StreetVerse Radio','local news','business twins','missions','lakefront','transit','Holo Ads']},
 {id:'lagos',name:'Lagos',country:'Nigeria',region:'Lagos',status:'building',spawn:{x:0,z:0},features:['StreetVerse Global','local business network','music','creator economy','weather','marketplace']},
 {id:'abuja',name:'Abuja',country:'Nigeria',region:'FCT',status:'building',spawn:{x:0,z:0},features:['StreetVerse Global','business network','government/civic district abstractions','weather','marketplace']},
 {id:'new-york',name:'New York City',country:'United States',region:'New York',status:'planned',spawn:{x:0,z:0},features:['media','business','creator economy']},
 {id:'los-angeles',name:'Los Angeles',country:'United States',region:'California',status:'planned',spawn:{x:0,z:0},features:['film','music','creator economy']},
 {id:'accra',name:'Accra',country:'Ghana',region:'Greater Accra',status:'planned',spawn:{x:0,z:0},features:['business','culture','music']},
 {id:'nairobi',name:'Nairobi',country:'Kenya',region:'Nairobi County',status:'planned',spawn:{x:0,z:0},features:['technology','business','culture']},
 {id:'johannesburg',name:'Johannesburg',country:'South Africa',region:'Gauteng',status:'building',spawn:{x:0,z:0},features:['business','music','creator economy','StreetVerse Global','marketplace']},
 {id:'cape-town',name:'Cape Town',country:'South Africa',region:'Western Cape',status:'planned',spawn:{x:0,z:0},features:['tourism','business','culture','creator economy']},
 {id:'addis-ababa',name:'Addis Ababa',country:'Ethiopia',region:'Addis Ababa',status:'building',spawn:{x:0,z:0},features:['culture','business','FaithVerse connections','creator economy','StreetVerse Global']},
]

export const getStreetVerseCity=(id:string|undefined)=>
 STREETVERSE_GLOBAL_CITIES.find(c=>c.id===id)||STREETVERSE_GLOBAL_CITIES[0]

export const STREETVERSE_GLOBAL_RULES={
 citySelectionUsesExplicitUserChoice:true,
 noPreciseUserLocationRequired:true,
 localWeatherMayUseCityLevelData:true,
 sourceBackedLandmarksOnly:true,
 noSensitiveInfrastructureDetail:true,
 businessTwinsRequireOwnerAuthorization:true,
 rightsRequiredForPersistentMediaAssets:true,
 sharedPassportIdentityAndLedger:true,
 sharedTvRadioNewsAndHoloAds:true,
} as const
