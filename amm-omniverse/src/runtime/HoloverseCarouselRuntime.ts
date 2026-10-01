export type HoloDestination={id:string;label:string;route:string;enabled:boolean;requiresAuth?:boolean}
export const HOLOVERSE_DESTINATIONS:HoloDestination[]=[
{id:'streetverse',label:'StreetVerse',route:'/streetverse',enabled:true},
{id:'faithverse',label:'FaithVerse',route:'/faithverse',enabled:true},
{id:'starverse',label:'StarVerse',route:'/starverse',enabled:true},
{id:'musicverse',label:'MusicVerse',route:'/musicverse',enabled:true},
{id:'sportverse',label:'SportVerse',route:'/sportverse',enabled:true},
{id:'marketplace',label:'Marketplace',route:'/marketplace',enabled:true},
{id:'live',label:'Omni LIVE',route:'/live',enabled:true}
]
export function carouselDestination(id:string){return HOLOVERSE_DESTINATIONS.find(x=>x.id===id&&x.enabled)||null}
export function activateHoloDestination(id:string){const d=carouselDestination(id);if(!d)throw new Error('holo-destination-unavailable');if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:navigate',{detail:{route:d.route,source:'holoverse-carousel'}}));return d}
export const HOLO_CAROUSEL_RUNTIME={swipe:true,keyboard:true,oneHand:true,wrapAround:true,realRoutesOnly:true,noDeadCards:true,activeCardCentered:true} as const
