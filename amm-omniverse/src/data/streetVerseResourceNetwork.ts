export type StreetVerseResourceCategory=
 'recreation'|'community'|'food'|'mobility'|'creator'|'education'|'business'|'jobs'|'ecology'|'wellness'

export const STREETVERSE_RESOURCE_NETWORK=[
 {id:'recreation',label:'Play & Sports',examples:['Basketball','Pool','Tennis','Playground']},
 {id:'community',label:'Community',examples:['Senior Commons','Courtyard','Family visits']},
 {id:'food',label:'Food & Cookout',examples:['Grills','Food businesses','Delivery']},
 {id:'mobility',label:'Mobility',examples:['Owned vehicles','Ride share','Transit']},
 {id:'creator',label:'Creator',examples:['LIVE/PK','Reels','Creator Pass','Discord']},
 {id:'education',label:'Learning',examples:['CampusVerse','CollegeBook','FaithVerse study']},
 {id:'business',label:'Business',examples:['Marketplace','Vehicle dealer','Street businesses']},
 {id:'jobs',label:'Jobs',examples:['Missions','Middleverse Jobs','Delivery work']},
 {id:'ecology',label:'Ecology',examples:['Gardens','Pollinators','Insect Explorer']},
 {id:'wellness',label:'Wellness',examples:['Swimming','Aqua fitness','Senior movement']},
] as const

export const STREETVERSE_RESOURCE_EVENTS:Record<string,StreetVerseResourceCategory>={
 'tryamm:circle-park-basketball-play':'recreation',
 'tryamm:pool-session-progress':'wellness',
 'tryamm:circle-park-activity-progress':'recreation',
 'tryamm:senior-commons-activity':'community',
 'tryamm:vehicle-spawn-request':'mobility',
 'tryamm:streetverse-vehicle-controlled':'mobility',
 'tryamm:reel-moment':'creator',
 'tryamm:live-audience-action-request':'creator',
 'tryamm:campusverse-travel':'education',
 'tryamm:collegebook-open':'education',
 'tryamm:streetverse-commerce-open':'business',
 'tryamm:streetverse-mission-complete':'jobs',
 'tryamm:insect-ecology-discovered':'ecology',
} as const

export const requestResourcePassportReward=(used:string[])=>window.dispatchEvent(new CustomEvent('tryamm:resource-passport-reward-request',{detail:{used,serverValidate:true}}))
