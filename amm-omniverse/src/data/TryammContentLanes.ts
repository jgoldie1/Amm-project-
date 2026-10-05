export type TryammContentLaneId=
  |'kingdom-yahisrael'
  |'faithverse'
  |'streetverse-global'
  |'streetverse-global-new-america'
  |'streetverse-after-dark'

export type TryammContentLanePolicy=Readonly<{
  id:TryammContentLaneId
  label:string
  faithBased:boolean
  setApart:boolean
  weaponsAllowed:boolean
  combatAllowed:boolean
  afterDarkAllowed:boolean
  adultThemesAllowed:boolean
  realisticGoreAllowed:boolean
  minAudienceBand:'under-12'|'age-12'|'teen'|'adult'
  purpose:string
}>

export const TRYAMM_CONTENT_LANES:Readonly<Record<TryammContentLaneId,TryammContentLanePolicy>>={
  'kingdom-yahisrael':{
    id:'kingdom-yahisrael',
    label:'Kingdom of Yahisrael • Where Heaven Meets Earth',
    faithBased:true,
    setApart:true,
    weaponsAllowed:false,
    combatAllowed:false,
    afterDarkAllowed:false,
    adultThemesAllowed:false,
    realisticGoreAllowed:false,
    minAudienceBand:'under-12',
    purpose:'Saints, Scripture, worship, service, family, learning, fellowship, creation and righteous community life.',
  },
  faithverse:{
    id:'faithverse',
    label:'FaithVerse',
    faithBased:true,
    setApart:true,
    weaponsAllowed:false,
    combatAllowed:false,
    afterDarkAllowed:false,
    adultThemesAllowed:false,
    realisticGoreAllowed:false,
    minAudienceBand:'under-12',
    purpose:'Scripture study, Hebrew learning, ministry, family, worship and immersive faith experiences.',
  },
  'streetverse-global':{
    id:'streetverse-global',
    label:'StreetVerse Global',
    faithBased:false,
    setApart:false,
    weaponsAllowed:false,
    combatAllowed:false,
    afterDarkAllowed:false,
    adultThemesAllowed:false,
    realisticGoreAllowed:false,
    minAudienceBand:'age-12',
    purpose:'Global living cities, jobs, creator economy, businesses, travel, sports, culture and social RP.',
  },
  'streetverse-global-new-america':{
    id:'streetverse-global-new-america',
    label:'StreetVerse Global • New America RP',
    faithBased:false,
    setApart:false,
    weaponsAllowed:true,
    combatAllowed:true,
    afterDarkAllowed:false,
    adultThemesAllowed:false,
    realisticGoreAllowed:false,
    minAudienceBand:'teen',
    purpose:'Optional open-world action/RP lane with fictional non-graphic combat, public-safety gameplay, factions, missions and consequences.',
  },
  'streetverse-after-dark':{
    id:'streetverse-after-dark',
    label:'StreetVerse After Dark',
    faithBased:false,
    setApart:false,
    weaponsAllowed:false,
    combatAllowed:false,
    afterDarkAllowed:true,
    adultThemesAllowed:true,
    realisticGoreAllowed:false,
    minAudienceBand:'adult',
    purpose:'Separate adult-only fictional nightlife/story lane. Never reachable from Kingdom of Yahisrael or FaithVerse.',
  },
} as const

export const KINGDOM_SET_APART_POLICY={
  lane:'kingdom-yahisrael' as const,
  saintsAndFamilies:true,
  heavenOnEarthTheme:true,
  scriptureAndService:true,
  afterDark:false,
  adultLane:false,
  weapons:false,
  combat:false,
  explicitSexualContent:false,
  gambling:false,
  intoxicantGameplay:false,
  prohibitedCrossVerseTargets:['streetverse-after-dark'],
  allowedPortalPrefixes:['/kingdom','/kingdom-of-yahisrael','/kingdom-workbook','/metaverse-bible','/faithverse','/ethiopian-bible','/kingdoms-press','/servants-of-christ','/network'],
} as const

export function lanePolicy(id:string|undefined){
  return TRYAMM_CONTENT_LANES[(id||'streetverse-global') as TryammContentLaneId]||TRYAMM_CONTENT_LANES['streetverse-global']
}

export function audienceBandRank(band:string|undefined){
  return ({'under-12':0,'age-12':1,teen:2,adult:3} as Record<string,number>)[String(band||'')]??-1
}

export function isLaneAllowedForAudience(laneId:TryammContentLaneId,band:string|undefined){
  const policy=TRYAMM_CONTENT_LANES[laneId]
  return audienceBandRank(band)>=audienceBandRank(policy.minAudienceBand)
}
