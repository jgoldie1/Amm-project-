export type Storefront={id:string;name:string;category:string;summary:string;services:readonly string[];stage:'preview';accent:string}
export const STREETVERSE_STOREFRONTS:readonly Storefront[]=[
{id:'nuemerica',name:'Nuemerica',category:'Culture and creator commerce',summary:'Creative community, music, media and merchandise concepts.',services:['Creator showcase','Music and media inquiries','Digital merchandise planning'],stage:'preview',accent:'#c39bff'},
{id:'stubbs-mobility',name:'Stubbs Mobility',category:'Accessibility and independent living',summary:'Accessibility-focused digital storefront concept and service inquiries.',services:['Accessible living inquiries','One-handed technology','Mobility product discovery'],stage:'preview',accent:'#83e9cd'},
{id:'sculptify',name:'Sculptify BeautyVerse',category:'Wellness and beauty',summary:'Body sculpting, wellness, academy and beauty-service discovery.',services:['Wellness inquiries','Beauty service requests','Academy information'],stage:'preview',accent:'#f7b1d4'},
{id:'la-teasia',name:'La Teasia Monroe Beauty House',category:'Beauty and creator services',summary:'Salon services, creator streaming and booking inquiries.',services:['Salon appointment inquiries','Beauty creator media','Service consultations'],stage:'preview',accent:'#f2bf82'}
]
export function storefrontById(id:string){return STREETVERSE_STOREFRONTS.find(s=>s.id===id)}
