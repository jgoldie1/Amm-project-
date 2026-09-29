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
 {id:'accra',name:'Accra',country:'Ghana',region:'Greater Accra',status:'building',spawn:{x:0,z:0},features:['business','culture','music']},
 {id:'nairobi',name:'Nairobi',country:'Kenya',region:'Nairobi County',status:'building',spawn:{x:0,z:0},features:['technology','business','culture']},
 {id:'johannesburg',name:'Johannesburg',country:'South Africa',region:'Gauteng',status:'building',spawn:{x:0,z:0},features:['business','music','creator economy','StreetVerse Global','marketplace']},
 {id:'cape-town',name:'Cape Town',country:'South Africa',region:'Western Cape',status:'planned',spawn:{x:0,z:0},features:['tourism','business','culture','creator economy']},
 {id:'addis-ababa',name:'Addis Ababa',country:'Ethiopia',region:'Addis Ababa',status:'building',spawn:{x:0,z:0},features:['culture','business','FaithVerse connections','creator economy','StreetVerse Global']},
 {id:'toronto',name:'Toronto',country:'Canada',region:'Ontario',status:'planned',spawn:{x:0,z:0},features:['North America shared infrastructure','business','media','creator economy']},
 {id:'kingston',name:'Kingston',country:'Jamaica',region:'Kingston',status:'planned',spawn:{x:0,z:0},features:['Caribbean','music','creator economy','business']},
 {id:'mexico-city',name:'Mexico City',country:'Mexico',region:'Mexico City',status:'planned',spawn:{x:0,z:0},features:['Latin America','business','culture','media']},
 {id:'sao-paulo',name:'São Paulo',country:'Brazil',region:'São Paulo',status:'planned',spawn:{x:0,z:0},features:['Latin America','business','creator economy','marketplace']},
 {id:'london',name:'London',country:'United Kingdom',region:'England',status:'planned',spawn:{x:0,z:0},features:['Europe','business','media','creator economy']},
 {id:'paris',name:'Paris',country:'France',region:'Île-de-France',status:'planned',spawn:{x:0,z:0},features:['Europe','culture','creator economy','business']},
 {id:'dubai',name:'Dubai',country:'United Arab Emirates',region:'Dubai',status:'planned',spawn:{x:0,z:0},features:['Middle East','business','marketplace','media']},
 {id:'mumbai',name:'Mumbai',country:'India',region:'Maharashtra',status:'planned',spawn:{x:0,z:0},features:['Asia-Pacific','film','music','business']},
 {id:'tokyo',name:'Tokyo',country:'Japan',region:'Tokyo',status:'planned',spawn:{x:0,z:0},features:['Asia-Pacific','technology','media','business']},
 {id:'seoul',name:'Seoul',country:'South Korea',region:'Seoul',status:'planned',spawn:{x:0,z:0},features:['Asia-Pacific','music','technology','creator economy']},
 {id:'singapore',name:'Singapore',country:'Singapore',region:'Singapore',status:'planned',spawn:{x:0,z:0},features:['Southeast Asia','business','technology','marketplace']},
 {id:'sydney',name:'Sydney',country:'Australia',region:'New South Wales',status:'planned',spawn:{x:0,z:0},features:['Asia-Pacific','media','business','creator economy']},
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


export const STREETVERSE_GLOBALIZATION_WAVES={
 1:['chicago','lagos','abuja','accra','nairobi','johannesburg','addis-ababa'],
 2:['cape-town'],
 3:['new-york','los-angeles','toronto'],
 4:['kingston','mexico-city','sao-paulo'],
 5:['london','paris','dubai'],
 6:['mumbai','tokyo','seoul','singapore','sydney'],
 7:STREETVERSE_GLOBAL_CITIES.map(city=>city.id),
} as const

export const GLOBAL_CONVERGENCE_REQUIREMENTS=[
 'Passport/auth','navigation','accessibility','media/news/radio/weather','Holo LIVE/Reels/TV',
 'businesses/QR/Scout','Marketplace/Delivery','Holo Ads','creator/music/sync/rights revenue',
 'verified checkout','entitlements','internal ledger','analytics','localization','performance','testing','release certification',
] as const
