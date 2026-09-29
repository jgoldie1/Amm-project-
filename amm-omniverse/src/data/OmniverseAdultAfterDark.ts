export type AfterDarkVenue='nightlife'|'restaurant'|'music'|'comedy'|'cinema'|'social-lounge'|'night-market'|'mystery'|'racing'|'creator-studio'
export type AfterDarkRating='18+'|'21+-jurisdictional'

export interface AfterDarkDistrict{
 id:string;cityId:string;name:string;venues:AfterDarkVenue[];rating:AfterDarkRating;
 openLocalHour:number;closeLocalHour:number;missions:string[];businessIds:string[];
}

export const OMNIVERSE_ADULT_AFTER_DARK={
 name:'Omniverse Adult After Dark',
 purpose:'Age-gated nighttime entertainment, social, creator, business and cinematic adventure layer.',
 entry:[
  'explicit adult-lane selection','age-assurance appropriate to jurisdiction and feature',
  'separate teen/12+ discovery and recommendations','clear content/rating labels',
 ] as const,
 experiences:[
  'nightlife and social lounges','restaurants and late-night food','live music and creator performances',
  'comedy and cinema','night markets and shopping','mystery/detective adventures',
  'stylized night racing','adult career and hospitality missions','Holo LIVE after-dark shows',
  'city-to-city nightlife passports and events',
 ] as const,
 commerce:[
  'venue tickets','creator subscriptions','eligible gifts','restaurant/business offers',
  'merchandise','sponsorships','Holo Ads','PPV entertainment',
 ] as const,
}

export const AFTER_DARK_SAFETY_AND_COMPLIANCE={
 noMinors:true,
 noMinorAdultMatching:true,
 consentControls:true,
 blockMuteReport:true,
 antiHarassmentModeration:true,
 noSexualServicesMarketplace:true,
 noIllegalDrugMarketplace:true,
 noRealWorldCrimeInstruction:true,
 noRealFacilitySecurityDetail:true,
 noClientAwardedMoney:true,
 jurisdictionalRestrictedCommerceDisabledByDefault:true,
 privacyMinimized:true,
 preciseLocationOptional:true,
 accessibleAlternatives:true,
}

export function afterDarkAccess(input:{adultLane:boolean;ageAssured:boolean;featureJurisdictionAllowed:boolean}){
 const allowed=input.adultLane&&input.ageAssured&&input.featureJurisdictionAllowed
 return{allowed,reason:allowed?'allowed':'adult lane, age assurance, or jurisdiction gate missing'}
}

export const AFTER_DARK_NIGHT_CYCLE=[
 'sunset-transition','restaurant-and-market-rush','live-show-prime-time','nightlife-and-adventure',
 'late-night-mystery','closing-and-safe-return','dawn-reset',
] as const

export const AFTER_DARK_GLOBAL_TEMPLATE={
 cloneable:['access gates','venue runtime','mission grammar','media hooks','commerce hooks','moderation','night-cycle'],
 localize:['hours','laws','venue types','music','businesses','language','transport','cultural review','restricted commerce'],
}
