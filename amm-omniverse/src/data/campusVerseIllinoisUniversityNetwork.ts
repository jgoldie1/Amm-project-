export type CampusNetworkId='uic'|'uiuc'|'siuc'|'siue'|'columbia-chicago'|'loyola-lake-shore'|'northwestern-evanston'|'northwestern-chicago'|'greenville'
export type CampusNetworkNode=Readonly<{id:CampusNetworkId;name:string;region:string;anchor:string;archetype:string;missionFamilies:readonly string[];streetVerseGateway?:string;notes?:string}>
/** Public campus identity labels only. TRYAMM does not imply institutional partnership or endorsement. */
export const ILLINOIS_CAMPUSVERSE_NETWORK:readonly CampusNetworkNode[]=[
 {id:'uic',name:'University of Illinois Chicago',region:'Chicago Near West Side',anchor:'UIC East + West Campus',archetype:'public research university',missionFamilies:['research','health','engineering','business','arts','career'],streetVerseGateway:'uic'},
 {id:'uiuc',name:'University of Illinois Urbana-Champaign',region:'Champaign-Urbana',anchor:'Champaign-Urbana campus',archetype:'public research university',missionFamilies:['engineering','computing','research','business','agriculture','arts','athletics']},
 {id:'siuc',name:'Southern Illinois University Carbondale',region:'Carbondale',anchor:'Carbondale campus',archetype:'public research university',missionFamilies:['engineering','computing','arts-media','business','health','law','education']},
 {id:'siue',name:'Southern Illinois University Edwardsville',region:'Metro East',anchor:'Edwardsville campus',archetype:'public university',missionFamilies:['research','business','health','arts','community-impact']},
 {id:'columbia-chicago',name:'Columbia College Chicago',region:'Chicago South Loop',anchor:'600 S Michigan Ave',archetype:'creative arts/media college',missionFamilies:['film','reels','music','broadcast','design','communications','creator-business'],streetVerseGateway:'south-loop'},
 {id:'loyola-lake-shore',name:'Loyola University Chicago — Lake Shore Campus',region:'Rogers Park / Edgewater',anchor:'Sheridan + Devon / Loyola CTA',archetype:'private Jesuit university',missionFamilies:['science','nursing','arts','sustainability','service','athletics'],streetVerseGateway:'rogers-park'},
 {id:'northwestern-evanston',name:'Northwestern University — Evanston',region:'Evanston',anchor:'Evanston lakefront campus',archetype:'private research university',missionFamilies:['research','engineering','media','entrepreneurship','arts','athletics']},
 {id:'northwestern-chicago',name:'Northwestern University — Chicago',region:'Chicago',anchor:'Chicago campus',archetype:'private research university',missionFamilies:['health','law','research','career'],streetVerseGateway:'northwestern-chicago'},
 {id:'greenville',name:'Greenville University',region:'Greenville, Illinois',anchor:'Jacobie CampusVerse launch campus',archetype:'small private university',missionFamilies:['college-life','athletics','international-relations','cybersecurity']},
]
export const CAMPUSVERSE_INTERCAMPUS_ROUTES=[
 {id:'chicago-college-network',nodes:['uic','columbia-chicago','loyola-lake-shore','northwestern-chicago','northwestern-evanston']},
 {id:'illinois-statewide-college-network',nodes:['uic','uiuc','siuc','siue','greenville']},
 {id:'jacobie-collegebook-network',nodes:['greenville','uic','uiuc','siuc','siue','columbia-chicago','loyola-lake-shore','northwestern-evanston']},
] as const
