// StreetVerse BusinessVerse: data-driven mission templates.
// Catalog definitions only; no claim of 3D interiors, live orders, or verified payments.
export type BusinessCategory='nightlife'|'restaurant'|'bakery'|'catering'|'beauty'|'wellness'|'logistics'|'construction'|'healthcare'|'security'|'media'|'retail'|'education'|'finance'
export type JobStep='check_in'|'accept_order'|'collect_ingredients'|'prepare'|'cook'|'bake'|'plate'|'package'|'deliver'|'serve'|'clean'|'inspect'|'dispatch'|'perform'|'checkout'
export type BusinessTemplate={id:string;name:string;owner:string;categories:BusinessCategory[];roles:string[];missionSteps:JobStep[];supportsXR:boolean;realCheckout:'provider_verified_only'}
export const BUSINESSVERSE_VENUES:BusinessTemplate[]=[
 {id:'kevon-capital-nights',name:'Capital Nights',owner:'Kevon',categories:['nightlife','finance'],roles:['bartender','dj','security','forex_tutor'],missionSteps:['check_in','serve','clean'],supportsXR:true,realCheckout:'provider_verified_only'},
 {id:'lateasia-monroe-after-dark',name:'Monroe After Dark',owner:'LaTeasia',categories:['nightlife','beauty'],roles:['stylist','promoter','bartender','dj'],missionSteps:['check_in','serve','checkout'],supportsXR:true,realCheckout:'provider_verified_only'},
 {id:'nikki-frances-skyline',name:'Frances Skyline Lounge',owner:'Nikki',categories:['nightlife','logistics'],roles:['dispatcher','driver','bartender','dj'],missionSteps:['check_in','dispatch','deliver'],supportsXR:true,realCheckout:'provider_verified_only'},
 {id:'sculptify-nightlife-dining',name:'Sculptify Nightlife & Fine Dining',owner:'Sculptify',categories:['nightlife','restaurant','wellness'],roles:['chef','host','server','bartender','manager'],missionSteps:['check_in','accept_order','collect_ingredients','prepare','cook','plate','serve','clean'],supportsXR:true,realCheckout:'provider_verified_only'},
 {id:'alphonso-mike-club',name:'Alphonso & Mike Club',owner:'Alphonso and Mike',categories:['nightlife','media'],roles:['dj','promoter','security','bartender'],missionSteps:['check_in','perform','serve'],supportsXR:true,realCheckout:'provider_verified_only'},
 {id:'michael-fine-dining-catering',name:'Michael Fine Dining & Catering',owner:'Michael',categories:['restaurant','bakery','catering'],roles:['chef','baker','pastry_chef','caterer','driver'],missionSteps:['check_in','accept_order','collect_ingredients','prepare','cook','bake','plate','package','deliver'],supportsXR:true,realCheckout:'provider_verified_only'}
]
export const CATEGORY_MISSION_STEPS:Record<BusinessCategory,JobStep[]>={
 nightlife:['check_in','perform','serve'],restaurant:['accept_order','prepare','cook','plate','serve'],bakery:['accept_order','prepare','bake','package'],catering:['accept_order','prepare','cook','package','deliver'],beauty:['check_in','serve','checkout'],wellness:['check_in','serve'],logistics:['dispatch','inspect','deliver'],construction:['check_in','inspect'],healthcare:['check_in','inspect'],security:['check_in','inspect'],media:['check_in','perform'],retail:['check_in','package','checkout'],education:['check_in','perform'],finance:['check_in','inspect']
}
export function createBusinessMission(template:BusinessTemplate,playerId:string,missionId:string){
 if(!template||!template.id||!playerId||!missionId)throw Error('MISSING_MISSION_FIELDS')
 return {missionId,playerId,businessId:template.id,steps:[...template.missionSteps],state:'available' as const,settlement:'none' as const}
}
// The same generator works for future templates; it does NOT invent or certify 500 actual websites.
export function createCategoryTemplate(id:string,name:string,owner:string,category:BusinessCategory):BusinessTemplate{
 if(!CATEGORY_MISSION_STEPS[category]||!id||!name||!owner)throw Error('INVALID_BUSINESS_TEMPLATE')
 return {id,name,owner,categories:[category],roles:[],missionSteps:[...CATEGORY_MISSION_STEPS[category]],supportsXR:true,realCheckout:'provider_verified_only'}
}
