/** Fictional StreetVerse placements near real Chicago landmarks, NOT actual leased or occupied retail units. */
export const STREETVERSE_RETAIL_DISTRICTS=[
 {id:'mag-mile',name:'Magnificent Mile Flagship',businessId:'stubbs-mobility',district:'North Michigan Avenue / Streeterville',landmark:'Water Tower area',description:'Accessible flagship showroom concept for mobility technology; use fictional facade and generic address.',status:'staging'},
 {id:'river-north',name:'River North Creator Flagship',businessId:'nuemerica',district:'River North / North Bridge corridor',landmark:'Chicago River–Michigan Avenue approaches',description:'A creator commerce, music and Holo Ads destination; virtual shell only.',status:'staging'},
 {id:'mag-mile-beauty',name:'Magnificent Mile Beauty Preview',businessId:'sculptify',district:'North Michigan Avenue corridor',landmark:'Michigan Avenue shopping district',description:'Optional beauty and wellness portal, not a real store lease.',status:'concept'},
 {id:'tampa-crossverse',name:'La Teasia Tampa CrossVerse',businessId:'la-teasia',district:'Tampa CrossVerse',landmark:'Tampa virtual destination',description:'Keep the Tampa business associated with Tampa; offer an intercity portal from Chicago.',status:'concept'}
] as const
export function findRetailPlacement(businessId:string){return STREETVERSE_RETAIL_DISTRICTS.find(x=>x.businessId===businessId)}
