export type StandaloneSiteProfile={
  slug:string
  name:string
  tagline:string
  description:string
  appPath:string
  capabilities:string[]
  phone?:string
  domain?:string
}

export const STANDALONE_SITE_REGISTRY:StandaloneSiteProfile[]=[
  {slug:'streetverse',name:'StreetVerse',tagline:'The living-world game and commerce city',description:'Play, create, work, race, deliver, discover businesses and connect missions to the wider TRYAMM ecosystem.',appPath:'/streetverse',capabilities:['living-world game','missions','racing','delivery','creator economy','business locations','Holo Fon','Holo Music','Stubbs AI']},
  {slug:'holoverse',name:'Holoverse',tagline:'The holographic experience layer',description:'The public gateway for TRYAMM holographic, AR, VR, mixed-reality and world experiences.',appPath:'/',capabilities:['AR/VR/MR','world portals','holographic experiences','creator tools','StreetVerse bridge','Stubbs AI']},
  {slug:'holo-music',name:'Holo Music',tagline:'Music across the living world',description:'A rights-aware music experience for StreetVerse, creators, LIVE, vehicles, stores and events.',appPath:'/',capabilities:['music discovery','creator attribution','spatial audio','commerce links','live experiences','Stubbs AI']},
  {slug:'holo-gpt',name:'HoloGPT',tagline:'Stubbs AI conversational gateway',description:'AI assistance across TRYAMM, StreetVerse, business, creator and holographic experiences.',appPath:'/',capabilities:['AI assistant','business help','creator help','world navigation','accessibility','Stubbs AI']},
  {slug:'holo-fon',name:'Holo Fon',tagline:'The communication gateway for the Omniverse',description:'Telecom, messaging, accessibility, wallet and world navigation in one connected experience.',appPath:'/',capabilities:['telecom','messaging','accessibility','wallet bridge','StreetVerse','Stubbs AI']},
  {slug:'holo-delivery',name:'Holo Delivery',tagline:'Delivery connected to the living world',description:'Local delivery, marketplace fulfillment and mission-based delivery experiences.',appPath:'/',capabilities:['delivery','tracking','marketplace','StreetVerse missions','merchant tools','Stubbs AI']},
  {slug:'holo-drone',name:'Holo Drone',tagline:'Drone missions connected to the living world',description:'Approved drone delivery, media, mapping and mission workflows connected to TRYAMM and StreetVerse, with real-world provider and compliance gates.',appPath:'/',capabilities:['drone missions','delivery support','media capture','mapping workflows','tracking','StreetVerse bridge','provider gates','Stubbs AI']},
  {slug:'holo-marketplace',name:'Holo Marketplace',tagline:'Shop the All American Marketplace network',description:'Products, services, creator commerce and immersive discovery connected to TRYAMM.',appPath:'/',capabilities:['marketplace','stores','creator commerce','product discovery','Holo Ads','Stubbs AI']},
  {slug:'holo-drama',name:'Holo Drama',tagline:'Interactive stories and immersive entertainment',description:'Story, performance and interactive entertainment connected to TRYAMM media experiences.',appPath:'/',capabilities:['interactive media','stories','creator tools','streaming','immersive entertainment','Stubbs AI']},
  {slug:'holo-ride-share',name:'Holo Ride Share',tagline:'Mobility connected to StreetVerse and TRYAMM',description:'Ride discovery and mobility experiences designed to connect the physical and digital ecosystem.',appPath:'/',capabilities:['ride discovery','mobility','StreetVerse','business network','Stubbs AI']},
  {slug:'holo-search',name:'Holo Search',tagline:'Search across the TRYAMM ecosystem',description:'Discover businesses, creators, worlds, products, media and services through Stubbs AI.',appPath:'/',capabilities:['AI search','business discovery','creator discovery','product discovery','world discovery','Stubbs AI']},
  {slug:'holo-ads',name:'Holo Ads',tagline:'Immersive advertising and product placement',description:'Advertising, sponsorship and product-placement experiences across TRYAMM, StreetVerse and media.',appPath:'/',capabilities:['ads','sponsorship','product placement','creator campaigns','analytics','Stubbs AI']},
]

export function getStandaloneSite(slug:string){return STANDALONE_SITE_REGISTRY.find(site=>site.slug===slug)}
