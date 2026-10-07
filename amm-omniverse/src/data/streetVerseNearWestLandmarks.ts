export type NearWestLandmark=Readonly<{
 id:string
 label:string
 address:string
 kind:'school'|'faith'
 x:number
 z:number
 missionId:string
 sourceTruth:'real-world-address'
 geometryAuthority:'gameplay-reconstruction'
}>

export const NEAR_WEST_LANDMARKS:readonly NearWestLandmark[]=[
 {id:'saint-ignatius-college-prep',label:'St. Ignatius College Prep',address:'1076 W Roosevelt Rd, Chicago, IL',kind:'school',x:-770,z:868,missionId:'ignatius-campus-memory',sourceTruth:'real-world-address',geometryAuthority:'gameplay-reconstruction'},
 {id:'holy-family-church',label:'Holy Family Church',address:'1080 W Roosevelt Rd, Chicago, IL',kind:'faith',x:-810,z:868,missionId:'holy-family-history-faith',sourceTruth:'real-world-address',geometryAuthority:'gameplay-reconstruction'},
]

export const ROOSEVELT_LANDMARK_SAFE_ZONE={x:-790,z:870,radius:62,label:'ST. IGNATIUS / HOLY FAMILY SAFE ZONE'} as const
