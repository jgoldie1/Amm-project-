import type { StreetVerseVec3 } from './streetVerseCartesianNeighborhood'

export type CivicLandmark = Readonly<{
  id:string
  name:string
  kind:'university'|'medical-district'|'hospital'|'historic-hospital'
  addressLabel?:string
  position:StreetVerseVec3
  publicAccess:'exterior-only'|'public-lobby-shell'|'district-zone'
  gameplay:string[]
  factualNote:string
}>

/**
 * StreetVerse Chicago civic/education/medical anchors.
 * Positions are local gameplay coordinates for streaming/navigation, not survey coordinates.
 * Real institutions are represented as landmarks; fictional missions must not imply
 * affiliation, endorsement, real patient data, or access to restricted clinical spaces.
 */
export const UIC_MEDICAL_DISTRICT_LANDMARKS:readonly CivicLandmark[]=[
  {
    id:'uic-west-campus',
    name:'University of Illinois Chicago — West Campus',
    kind:'university',
    addressLabel:'UIC West Campus / Medical Center area',
    position:{x:0,y:0,z:900},
    publicAccess:'district-zone',
    gameplay:['campus navigation','education missions','career missions','student-life NPC shell','transit waypoint'],
    factualNote:'UIC West Campus contains health-sciences facilities; exact building geometry is a later verified-map layer.',
  },
  {
    id:'uic-college-of-medicine',
    name:'UIC College of Medicine — Chicago',
    kind:'university',
    addressLabel:'1853 W Polk St, Chicago, IL 60612',
    position:{x:160,y:0,z:940},
    publicAccess:'public-lobby-shell',
    gameplay:['education waypoint','career exploration','research-story shell'],
    factualNote:'Public landmark representation only; no claim of UIC affiliation or endorsement.',
  },
  {
    id:'illinois-medical-district',
    name:'Illinois Medical District',
    kind:'medical-district',
    position:{x:300,y:0,z:1040},
    publicAccess:'district-zone',
    gameplay:['district navigation','accessibility route','transit waypoint','health-care career shell'],
    factualNote:'District-scale anchor used to stream nearby medical/campus blocks.',
  },
  {
    id:'stroger-hospital',
    name:'John H. Stroger, Jr. Hospital of Cook County',
    kind:'hospital',
    addressLabel:'1969 W Ogden Ave, Chicago, IL 60612',
    position:{x:430,y:0,z:1120},
    publicAccess:'public-lobby-shell',
    gameplay:['exterior landmark','public lobby shell','health-care career shell','accessibility waypoint'],
    factualNote:'Current Cook County Health hospital. Gameplay does not simulate real emergency care or expose patient information.',
  },
  {
    id:'old-cook-county-hospital',
    name:'Old Cook County Hospital — Historic Landmark Layer',
    kind:'historic-hospital',
    position:{x:510,y:0,z:1080},
    publicAccess:'exterior-only',
    gameplay:['time-machine history waypoint','architecture/history story shell'],
    factualNote:'Historical layer kept distinct from current Stroger Hospital operations.',
  },
]

export const findMedicalDistrictLandmark=(id:string)=>
  UIC_MEDICAL_DISTRICT_LANDMARKS.find((landmark)=>landmark.id===id)
