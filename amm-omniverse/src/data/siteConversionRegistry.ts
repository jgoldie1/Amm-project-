export type SiteConversionProfile={
  slug:string
  primaryCta:string
  secondaryCta:string
  leadTitle:string
  leadCopy:string
  funnel:string[]
}

export const SITE_CONVERSION_REGISTRY:SiteConversionProfile[]=[
  {slug:'streetverse',primaryCta:'ENTER STREETVERSE',secondaryCta:'CREATE IN STREETVERSE',leadTitle:'Enter the living world',leadCopy:'Play, complete missions, discover businesses, create content and move through the connected TRYAMM economy.',funnel:['discover','enter','play','create','earn','return']},
  {slug:'holoverse',primaryCta:'ENTER HOLOVERSE',secondaryCta:'EXPLORE WORLDS',leadTitle:'Enter the holographic layer',leadCopy:'Move from discovery into connected AR, VR, MR and world experiences.',funnel:['discover','explore','enter','create','connect']},
  {slug:'holo-music',primaryCta:'OPEN HOLO MUSIC',secondaryCta:'CREATE MUSIC',leadTitle:'Create and experience music across the living world',leadCopy:'Connect music to creators, StreetVerse, LIVE, stores, vehicles and rights-aware commerce.',funnel:['discover','listen','create','publish','monetize']},
  {slug:'holo-ride-share',primaryCta:'OPEN HOLO RIDE SHARE',secondaryCta:'FIND A RIDE',leadTitle:'Move through the physical and digital city',leadCopy:'Connect mobility discovery with StreetVerse, business destinations and the TRYAMM network.',funnel:['discover','request','route','arrive','connect']},
  {slug:'holo-drone',primaryCta:'OPEN HOLO DRONE',secondaryCta:'START A DRONE MISSION',leadTitle:'Connect drone operations to the living world',leadCopy:'Coordinate approved delivery, media, mapping and mission workflows with provider and compliance gates.',funnel:['discover','request','verify','dispatch','track']},
  {slug:'holo-marketplace',primaryCta:'SHOP THE MARKETPLACE',secondaryCta:'START SELLING',leadTitle:'Buy, sell and discover across the network',leadCopy:'Connect products, services, creators and StreetVerse businesses to one commerce path.',funnel:['discover','shop','buy','sell','return']},
]

export function getSiteConversion(slug:string){return SITE_CONVERSION_REGISTRY.find(x=>x.slug===slug)}
