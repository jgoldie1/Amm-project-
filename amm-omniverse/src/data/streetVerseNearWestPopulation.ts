import type {StreetVerseVec3} from './streetVerseCartesianNeighborhood'

export type NearWestNpcRole='student'|'resident'|'worker'|'visitor'|'merchant'|'driver'|'medical-worker'|'security'|'creator'|'faith-volunteer'
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
 npc('nw-security-01','Andre','security','circle-park',-865,835,['gate','courtyard','Roosevelt'],'circle-park-community-watch'),
 npc('nw-security-02','Monique','security','circle-park',-815,825,['courtyard','school','gate'],'circle-park-community-watch'),
 npc('nw-creator-01','Keisha','creator','taylor-street',-560,690,['studio','cafe','street interview'],'taylor-creator-session'),
 npc('nw-creator-02','Devin','creator','roosevelt',-650,915,['Roosevelt','recording','delivery'],'roosevelt-live-content'),
 npc('nw-faith-01','Naomi','faith-volunteer','holy-family',-810,870,['church','community table','Roosevelt'],'holy-family-community-help'),
 npc('nw-student-03','Marcus','student','uic-east-campus',-735,625,['class','library','Taylor Street'],'uic-campus-orientation'),
 npc('nw-student-04','Aaliyah','student','uic-west-campus',-1010,720,['health sciences','transit','food'],'medical-district-career'),
 npc('nw-merchant-03','Tanya','merchant','roosevelt',-610,920,['open shop','customers','inventory'],'roosevelt-business-intro'),
 npc('nw-resident-04','Darnell','resident','circle-park',-840,845,['home','park','store'],'circle-park-neighbor-intro'),
 npc('nw-resident-05','Sofia','resident','pilsen',-350,520,['home','arts','food'],'pilsen-community-art'),
 npc('nw-driver-02','Terrence','driver','near-west',-720,900,['pickup','Roosevelt','Taylor'],'near-west-first-ride'),
 npc('nw-worker-02','Imani','worker','medical-district',-1040,930,['transit','clinic','lunch'],'medical-district-career'),
]

export const NEAR_WEST_TRAFFIC:readonly NearWestTrafficSpawn[]=[
 {id:'traffic-01',kind:'car',position:{x:-600,y:0,z:700},route:'taylor-east-west-01',speed:8},
 {id:'traffic-02',kind:'car',position:{x:-400,y:0,z:700},route:'taylor-east-west-01',speed:7},
 {id:'traffic-03',kind:'delivery',position:{x:-100,y:0,z:700},route:'taylor-east-west-01',speed:6},
 {id:'traffic-04',kind:'bus',position:{x:-650,y:0,z:560},route:'halsted-south-01',speed:5},
 {id:'traffic-05',kind:'car',position:{x:190,y:0,z:950},route:'medical-link-01',speed:7},
 {id:'traffic-06',kind:'car',position:{x:-720,y:0,z:905},route:'roosevelt-east-west-02',speed:7},
 {id:'traffic-07',kind:'delivery',position:{x:-540,y:0,z:705},route:'taylor-east-west-02',speed:6},
 {id:'traffic-08',kind:'bus',position:{x:-820,y:0,z:575},route:'halsted-north-02',speed:5},
 {id:'traffic-09',kind:'car',position:{x:-900,y:0,z:835},route:'circle-park-loop-01',speed:5},
 {id:'traffic-10',kind:'delivery',position:{x:-1030,y:0,z:930},route:'medical-service-01',speed:5},
]

export const NEAR_WEST_AMBIENT_MISSIONS= [
 {id:'taylor-business-intro',label:'Meet a Taylor Street merchant',rewardXp:75},
 {id:'taylor-food-delivery-intro',label:'Make a neighborhood delivery',rewardXp:100},
 {id:'near-west-first-ride',label:'Take a ride between Taylor Street and UIC',rewardXp:90},
 {id:'uic-campus-orientation',label:'Explore the UIC campus gateways',rewardXp:60},
 {id:'medical-district-career',label:'Explore fictional health-care career stations',rewardXp:80},
 {id:'circle-park-community-watch',label:'Walk the Circle Park community safety route',rewardXp:90},
 {id:'taylor-creator-session',label:'Record a Taylor Street creator session',rewardXp:110},
 {id:'roosevelt-live-content',label:'Capture a Roosevelt Road live content moment',rewardXp:105},
 {id:'holy-family-community-help',label:'Help at the Roosevelt faith/community stop',rewardXp:85},
 {id:'roosevelt-business-intro',label:'Meet a Roosevelt Road business owner',rewardXp:100},
 {id:'circle-park-neighbor-intro',label:'Meet a Circle Park neighbor',rewardXp:70},
 {id:'pilsen-community-art',label:'Visit a Pilsen community art stop',rewardXp:95},
] as const
