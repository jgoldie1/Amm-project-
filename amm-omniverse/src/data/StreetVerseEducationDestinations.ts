/**
 * Chicago education destinations for the West Side / Village rollout.
 * Directory entries are NOT claims of playable geometry or school access.
 * Verify every current school name, location and availability against CPS,
 * ISBE or institution-maintained records before public map placement.
 */
export type SchoolLevel='elementary'|'high-school'|'college'|'university'
export type CampusStatus='reference-only'|'exterior-staged'|'interior-preview'|'playable-verified'
export type SchoolDestination={id:string;name:string;level:SchoolLevel;district:string;status:CampusStatus;source:string;access:'public-exterior-only'|'fictional-interior'}
export const WEST_SIDE_EDUCATION_DESTINATIONS:readonly SchoolDestination[]=[
 {id:'uic-east',name:'University of Illinois Chicago — East Campus',level:'university',district:'near-west-side',status:'reference-only',source:'uic-campus-reference',access:'public-exterior-only'},
 {id:'uic-west',name:'University of Illinois Chicago — West Campus',level:'university',district:'near-west-side',status:'reference-only',source:'uic-campus-reference',access:'public-exterior-only'},
 {id:'malcolm-x',name:'Malcolm X College',level:'college',district:'near-west-side',status:'reference-only',source:'institution-verification-pending',access:'public-exterior-only'},
 {id:'st-ignatius',name:'St. Ignatius College Prep',level:'high-school',district:'near-west-side',status:'reference-only',source:'st-ignatius-reference',access:'public-exterior-only'},
 {id:'holy-family-school',name:'Holy Family School — historical reference',level:'elementary',district:'near-west-side',status:'reference-only',source:'historical-verification-pending',access:'fictional-interior'},
 {id:'holy-angels',name:'Holy Angels School — historical reference',level:'elementary',district:'chicago',status:'reference-only',source:'historical-verification-pending',access:'fictional-interior'},
 {id:'andrew-jackson',name:'Andrew Jackson Language Academy — name/location verification pending',level:'elementary',district:'near-west-side',status:'reference-only',source:'cps-verification-pending',access:'public-exterior-only'},
 {id:'university-chicago',name:'University of Chicago',level:'university',district:'hyde-park',status:'reference-only',source:'institution-verification-pending',access:'public-exterior-only'},
 {id:'uillinois',name:'University of Illinois — campus selection pending',level:'university',district:'illinois-gateway',status:'reference-only',source:'institution-verification-pending',access:'public-exterior-only'},
 {id:'siu',name:'Southern Illinois University — campus selection pending',level:'university',district:'illinois-gateway',status:'reference-only',source:'institution-verification-pending',access:'public-exterior-only'},
]
export function educationInDistrict(district:string){return WEST_SIDE_EDUCATION_DESTINATIONS.filter(s=>s.district===district)}
export function isSchoolPlayable(id:string){return WEST_SIDE_EDUCATION_DESTINATIONS.some(s=>s.id===id&&s.status==='playable-verified')}
