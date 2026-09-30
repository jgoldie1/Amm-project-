import type { StreetVerseVec3 } from './streetVerseCartesianNeighborhood'

export type UicEastLandmark=Readonly<{
 id:string; name:string; kind:'campus'|'student-center'|'academic'|'library'|'arena'|'transit'|'parking'|'connector';
 addressLabel?:string; position:StreetVerseVec3; gameplay:readonly string[]; publicShell:boolean;
}>

/**
 * Local gameplay anchors for UIC East Campus. Coordinates are StreetVerse-local,
 * not surveyed property coordinates. Names/addresses are factual labels; game
 * missions and businesses do not imply UIC affiliation or endorsement.
 */
export const UIC_EAST_CAMPUS:readonly UicEastLandmark[]=[
 {id:'uic-east-campus',name:'UIC East Campus',kind:'campus',position:{x:-900,y:0,z:560},publicShell:false,gameplay:['campus district','student-life missions','career missions','pedestrian navigation']},
 {id:'student-center-east',name:'UIC Student Center East',kind:'student-center',addressLabel:'750 S Halsted St, Chicago, IL 60607',position:{x:-760,y:0,z:620},publicShell:true,gameplay:['public-area shell','food/storefront hooks','student NPCs','events waypoint']},
 {id:'university-hall',name:'University Hall',kind:'academic',position:{x:-980,y:0,z:470},publicShell:false,gameplay:['campus landmark','education mission waypoint']},
 {id:'daley-library',name:'Richard J. Daley Library',kind:'library',position:{x:-880,y:0,z:500},publicShell:true,gameplay:['study shell','research quest waypoint','FaithVerse/history research hook']},
 {id:'credit-union-1-arena',name:'Credit Union 1 Arena',kind:'arena',position:{x:-1120,y:0,z:420},publicShell:false,gameplay:['sports/event waypoint','crowd-event shell']},
 {id:'halsted-taylor',name:'Taylor & Halsted Connector',kind:'connector',position:{x:-650,y:0,z:700},publicShell:false,gameplay:['Taylor Street corridor gateway','pedestrian route','vehicle route']},
 {id:'halsted-harrison',name:'Halsted & Harrison Connector',kind:'connector',position:{x:-760,y:0,z:420},publicShell:false,gameplay:['east-campus gateway','transit route']},
 {id:'roosevelt-halsted',name:'Roosevelt & Halsted Connector',kind:'connector',position:{x:-650,y:0,z:900},publicShell:false,gameplay:['south/east connector','Chicago expansion route']},
]

export type StreetVerseDistrictEdge=Readonly<{from:string;to:string;mode:readonly ('walk'|'drive'|'transit')[]}>
export const UIC_TAYLOR_MEDICAL_CONNECTIONS:readonly StreetVerseDistrictEdge[]=[
 {from:'student-center-east',to:'halsted-taylor',mode:['walk','drive']},
 {from:'halsted-taylor',to:'chicago-taylor-alpha',mode:['walk','drive']},
 {from:'chicago-taylor-alpha',to:'uic-west-campus',mode:['walk','drive','transit']},
 {from:'uic-west-campus',to:'illinois-medical-district',mode:['walk','drive','transit']},
 {from:'illinois-medical-district',to:'stroger-hospital',mode:['walk','drive','transit']},
]
