/** Holo Ads public preview contracts. No paid campaign, tracking or 3D placement is active. */
export type HoloAdPlacement='homepage'|'directory'|'streetverse-billboard'|'radio-companion'|'creator-live'
export type HoloAd={id:string;business:string;headline:string;description:string;placement:readonly HoloAdPlacement[];landingAnchor:string;approved:boolean;paid:boolean;hasRights:boolean;status:'demo'|'reviewed'|'active'}
export const HOLO_AD_PREVIEWS:readonly HoloAd[]=[
 {id:'tryamm-websites-demo',business:'TRYAMM Website Studio',headline:'Bring your business online',description:'Website Preview inquiries from $499',placement:['homepage','directory','streetverse-billboard','radio-companion'],landingAnchor:'start-with-tryamm',approved:false,paid:false,hasRights:true,status:'demo'},
 {id:'aniyah-studio-demo',business:'Aniyah 64-Track Studio',headline:'Make your next vocal recording count',description:'Starter vocal-editing inquiries from $35',placement:['homepage','directory','creator-live'],landingAnchor:'tryamm-media-studios',approved:false,paid:false,hasRights:true,status:'demo'},
]
export function mayServeHoloAd(ad:HoloAd,placement:HoloAdPlacement){
 return ad.status==='active'&&ad.approved&&ad.hasRights&&ad.placement.includes(placement)
}
export function previewHoloAds(placement:HoloAdPlacement){return HOLO_AD_PREVIEWS.filter(ad=>ad.placement.includes(placement))}
