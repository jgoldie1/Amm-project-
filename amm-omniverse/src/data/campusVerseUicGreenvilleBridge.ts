export type CampusId='uic'|'greenville'
export type CampusBook=Readonly<{id:string;title:string;subject:string;campus:CampusId;kind:'open-resource'|'student-note'|'licensed-link'|'mission-guide';access:'open'|'permission-required'}>

export const CAMPUSVERSE_CAMPUSES={
 uic:{id:'uic' as const,name:'University of Illinois Chicago',role:'Chicago alumni/history + East/West Campus StreetVerse gateway'},
 greenville:{id:'greenville' as const,name:'Greenville University',role:'Jacobie launch campus + CollegeBook anchor'},
} as const

/**
 * Cross-campus library registry. Do not copy copyrighted textbooks into TRYAMM.
 * Store original mission guides/student-owned notes, open resources, or authorized links.
 */
export const CAMPUSVERSE_COLLEGEBOOK_LIBRARY:readonly CampusBook[]=[
 {id:'uic-history-mission-guide',title:'UIC / Chicago Campus History Mission Guide',subject:'Chicago & campus history',campus:'uic',kind:'mission-guide',access:'open'},
 {id:'greenville-jacobie-orientation',title:'Jacobie Greenville Orientation Book',subject:'Campus orientation',campus:'greenville',kind:'mission-guide',access:'open'},
 {id:'greenville-international-relations',title:'International Relations Study Workspace',subject:'International Relations',campus:'greenville',kind:'student-note',access:'permission-required'},
 {id:'greenville-jacobie-vision',title:'Jacobie Vision Cybersecurity Lab Book',subject:'Cybersecurity',campus:'greenville',kind:'mission-guide',access:'open'},
]

export const CAMPUSVERSE_BRIDGES=[
 {id:'uic-greenville-collegebook',from:'uic',to:'greenville',surfaces:['CollegeBook','CampusVerse','Skills Passport','Holo LIVE','CrossVerse PK','Middleverse Jobs'],preserveIdentity:true},
] as const

export const JACOBIE_CAMPUS_PATH={
 character:'Jacobie',
 launchCampus:'greenville' as const,
 milestone:'November 20',
 tracks:['college life','athletics','international relations','Jacobie Vision cybersecurity'],
 flow:['Greenville University','CollegeBook','Major Missions','CrossVerse PK','Holo LIVE','Skills Passport','Middleverse Jobs'],
} as const
