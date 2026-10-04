export type CampusNetworkId=
 |'uic'
 |'uiuc'
 |'uis'
 |'malcolm-x'
 |'malcolm-x-west'
 |'siuc'
 |'siue'
 |'siu-medicine-springfield'
 |'siue-dental-alton'
 |'siue-east-st-louis'
 |'columbia-chicago'
 |'loyola-lake-shore'
 |'northwestern-evanston'
 |'northwestern-chicago'
 |'greenville'

export type CampusNetworkNode=Readonly<{
 id:CampusNetworkId
 name:string
 region:string
 anchor:string
 archetype:string
 missionFamilies:readonly string[]
 streetVerseGateway?:string
 notes?:string
 system?:'University of Illinois System'|'Southern Illinois University System'|'City Colleges of Chicago'|'Independent'
}>

/** Public campus identity labels only. TRYAMM does not imply institutional partnership or endorsement. */
export const ILLINOIS_CAMPUSVERSE_NETWORK:readonly CampusNetworkNode[]=[
 {id:'uic',name:'University of Illinois Chicago',region:'Chicago Near West Side',anchor:'UIC East + West Campus',archetype:'public research university',missionFamilies:['research','health','engineering','business','arts','career'],streetVerseGateway:'uic',system:'University of Illinois System'},
 {id:'uiuc',name:'University of Illinois Urbana-Champaign',region:'Champaign-Urbana',anchor:'Urbana-Champaign campus',archetype:'public research university',missionFamilies:['engineering','computing','research','business','agriculture','arts','athletics'],system:'University of Illinois System'},
 {id:'uis',name:'University of Illinois Springfield',region:'Springfield',anchor:'Springfield campus',archetype:'public regional university',missionFamilies:['public-affairs','business','computer-science','psychology','research','online-learning'],system:'University of Illinois System'},

 {id:'malcolm-x',name:'Malcolm X College',region:'Chicago West Side',anchor:'1900 W Jackson Blvd',archetype:'community college / healthcare education center',missionFamilies:['health-sciences','nursing','virtual-hospital','career','transfer','web-development'],streetVerseGateway:'near-west',system:'City Colleges of Chicago'},
 {id:'malcolm-x-west',name:'Malcolm X College West Campus',region:'Chicago West Side',anchor:'4624 W Madison St',archetype:'community college satellite campus',missionFamilies:['career','adult-education','community-health','skills-passport'],streetVerseGateway:'west-side',system:'City Colleges of Chicago'},

 {id:'siuc',name:'Southern Illinois University Carbondale',region:'Carbondale',anchor:'Carbondale campus',archetype:'public research university',missionFamilies:['engineering','computing','arts-media','business','health','law','education'],system:'Southern Illinois University System'},
 {id:'siue',name:'Southern Illinois University Edwardsville',region:'Edwardsville / Metro East',anchor:'Edwardsville campus',archetype:'public university',missionFamilies:['research','business','health','arts','engineering','community-impact'],system:'Southern Illinois University System'},
 {id:'siu-medicine-springfield',name:'SIU School of Medicine',region:'Springfield',anchor:'Springfield medical campus',archetype:'medical school / clinical education',missionFamilies:['medicine','clinical-training','research','public-health'],system:'Southern Illinois University System'},
 {id:'siue-dental-alton',name:'SIU School of Dental Medicine',region:'Alton',anchor:'Alton dental medicine campus',archetype:'dental school / clinical education',missionFamilies:['dentistry','clinical-training','community-health','research'],system:'Southern Illinois University System'},
 {id:'siue-east-st-louis',name:'SIUE East St. Louis Center',region:'East St. Louis',anchor:'East St. Louis Center',archetype:'community education center',missionFamilies:['community-impact','education','workforce','youth-programs'],system:'Southern Illinois University System'},

 {id:'columbia-chicago',name:'Columbia College Chicago',region:'Chicago South Loop',anchor:'600 S Michigan Ave',archetype:'creative arts/media college',missionFamilies:['film','reels','music','broadcast','design','communications','creator-business'],streetVerseGateway:'south-loop',system:'Independent'},
 {id:'loyola-lake-shore',name:'Loyola University Chicago — Lake Shore Campus',region:'Rogers Park / Edgewater',anchor:'Sheridan + Devon / Loyola CTA',archetype:'private Jesuit university',missionFamilies:['science','nursing','arts','sustainability','service','athletics'],streetVerseGateway:'rogers-park',system:'Independent'},
 {id:'northwestern-evanston',name:'Northwestern University — Evanston',region:'Evanston',anchor:'Evanston lakefront campus',archetype:'private research university',missionFamilies:['research','engineering','media','entrepreneurship','arts','athletics'],system:'Independent'},
 {id:'northwestern-chicago',name:'Northwestern University — Chicago',region:'Chicago',anchor:'Chicago campus',archetype:'private research university',missionFamilies:['health','law','research','career'],streetVerseGateway:'northwestern-chicago',system:'Independent'},
 {id:'greenville',name:'Greenville University',region:'Greenville, Illinois',anchor:'Jacobie CampusVerse launch campus',archetype:'small private university',missionFamilies:['college-life','athletics','international-relations','cybersecurity'],system:'Independent'},
]

export const CAMPUSVERSE_INTERCAMPUS_ROUTES=[
 {id:'u-of-i-system',nodes:['uic','uiuc','uis']},
 {id:'siu-system',nodes:['siuc','siue','siu-medicine-springfield','siue-dental-alton','siue-east-st-louis']},
 {id:'chicago-west-side-college-network',nodes:['uic','malcolm-x','malcolm-x-west']},
 {id:'chicago-college-network',nodes:['uic','malcolm-x','columbia-chicago','loyola-lake-shore','northwestern-chicago','northwestern-evanston']},
 {id:'illinois-statewide-college-network',nodes:['uic','uiuc','uis','malcolm-x','siuc','siue','greenville']},
 {id:'jacobie-collegebook-network',nodes:['greenville','uic','uiuc','uis','malcolm-x','siuc','siue','columbia-chicago','loyola-lake-shore','northwestern-evanston']},
] as const
