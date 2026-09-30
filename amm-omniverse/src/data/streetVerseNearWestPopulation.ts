import type {StreetVerseVec3} from './streetVerseCartesianNeighborhood'

export type NearWestNpcRole='student'|'resident'|'worker'|'visitor'|'merchant'|'driver'|'medical-worker'
export type NearWestNpc=Readonly<{id:string;displayName:string;role:NearWestNpcRole;homeZone:string;position:StreetVerseVec3;routine:readonly string[];missionHook?:string}>
export type NearWestTrafficSpawn=Readonly<{id:string;kind:'car'|'bus'|'delivery';position:StreetVerseVec3;route:string;speed:number}>

const npc=(id:string,displayName:string,role:NearWestNpcRole,homeZone:string,x:number,z:number,routine:string[],missionHook?:string):NearWestNpc=>({id,displayName,role,homeZone,position:{x,y:0,z},routine,missionHook})

/** Fictional ambient population. No NPC represents a real student, patient or employee. */
export const NEAR_WEST_NPCS:readonly NearWestNpc[]=[
 npc('nw-student-01','Jordan','student','uic-east-campus',-770,610,['campus','library','food']),
 npc('nw-student-02','Maya','student','uic-east-campus',-850,520,['library','student-center','transit']),
 npc('nw-resident-01','Dre','resident','taylor-street',-520,710,['home','Taylor Street','park']),
 npc('nw-resident-02','Elena','resident','taylor-street',-330,690,['home','shop','restaurant']),
 npc('nw-merchant-01','Sam','merchant','taylor-street',24,18,['open shop','serve customers','close shop'],'taylor-business-intro'),
 npc('nw-merchant-02','Renee','merchant','taylor-street',120,18,['prep','serve','delivery'],'taylor-food-delivery-intro'),
 npc('nw-worker-01','Chris','worker','uic-west-campus',20,900,['transit','campus','lunch']),
 npc('nw-medical-01','Avery','medical-worker','medical-district',310,1030,['transit','work','food']),
 npc('nw-medical-02','Taylor','medical-worker','stroger',420,1110,['work','transit']),
 npc('nw-driver-01','Malik','driver','near-west',-640,760,['pickup','Taylor Street','UIC'],'near-west-first-ride'),
 npc('nw-visitor-01','Nia','visitor','near-west',-650,700,['Taylor Street','UIC','medical district']),
 npc('nw-resident-03','Luis','resident','near-west',-150,740,['home','business','transit']),
]

export const NEAR_WEST_TRAFFIC:readonly NearWestTrafficSpawn[]=[
 {id:'traffic-01',kind:'car',position:{x:-600,y:0,z:700},route:'taylor-east-west-01',speed:8},
 {id:'traffic-02',kind:'car',position:{x:-400,y:0,z:700},route:'taylor-east-west-01',speed:7},
 {id:'traffic-03',kind:'delivery',position:{x:-100,y:0,z:700},route:'taylor-east-west-01',speed:6},
 {id:'traffic-04',kind:'bus',position:{x:-650,y:0,z:560},route:'halsted-south-01',speed:5},
 {id:'traffic-05',kind:'car',position:{x:190,y:0,z:950},route:'medical-link-01',speed:7},
]

export const NEAR_WEST_AMBIENT_MISSIONS= [
 {id:'taylor-business-intro',label:'Meet a Taylor Street merchant',rewardXp:75},
 {id:'taylor-food-delivery-intro',label:'Make a neighborhood delivery',rewardXp:100},
 {id:'near-west-first-ride',label:'Take a ride between Taylor Street and UIC',rewardXp:90},
 {id:'uic-campus-orientation',label:'Explore the UIC campus gateways',rewardXp:60},
 {id:'medical-district-career',label:'Explore fictional health-care career stations',rewardXp:80},
] as const
