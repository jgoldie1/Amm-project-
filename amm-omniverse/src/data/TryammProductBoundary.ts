export type TryammProductSide='app'|'game'|'shared'

export type TryammFeatureGroup={
  id:string
  label:string
  side:TryammProductSide
  route?:string
  summary:string
  features:readonly string[]
}

export const TRYAMM_APP_FEATURES:readonly TryammFeatureGroup[]=[
  {id:'creator-social',label:'Creator + Social',side:'app',route:'/live',summary:'Create, publish, stream and grow an audience outside the game simulation.',features:['Omni LIVE / PK','Reels and creator studio','People search and discovery','Families and agencies','Creator profiles and growth tools']},
  {id:'commerce-business',label:'Marketplace + Business',side:'app',route:'/business',summary:'Real marketplace, business onboarding and commerce surfaces.',features:['All American Marketplace','Business Passport / QR onboarding','Vendor portal','Creator commerce','Delivery and business services','Real checkout through server-authoritative payment providers']},
  {id:'workforce',label:'Middleverse Work',side:'app',route:'/workstation',summary:'Work, support, operations and AI-assisted job workflows.',features:['Omni Workstation','Ticket operations','Youth streaming administration','AI call center','Creator support','Business onboarding / scouts','QA and supervisor desks']},
  {id:'communications',label:'Communications',side:'app',summary:'Cross-platform communication and connected-device services.',features:['HoloFon','TRYAMM Connect','Quantum Email','Voice/video/holo calls','Holo Watch controls','Notifications']},
  {id:'media-network',label:'TV + Media Network',side:'app',route:'/network',summary:'Streaming television, music, studio and publishing surfaces.',features:['All American Network','Free TV','Isaiah AI TV','Holo Drama','OTT / FAST / CTV','64 Track Studio / Pro Audio','All American Records / Christian Rap','Kingdoms Press']},
  {id:'faith',label:'Faith + Study',side:'app',route:'/faithverse',summary:'Faith, scripture and ministry experiences.',features:['FaithVerse','Ethiopian Bible Metaverse','Scripture reader','Servants of Christ Network','Study / language tools']},
  {id:'money-care',label:'Money + Care',side:'app',summary:'Non-game financial, payment and care services.',features:['Omni Cash','Aniyah Pay / cross-border payment concepts','OmniCare 360','Rx discount','Telehealth pathways','Transaction and payout ledgers']},
  {id:'education-ai',label:'Education + AI + Labs',side:'app',summary:'Learning, creation and AI-assisted building tools.',features:['HoloGPT / Benny','AI Café','School Network / University portals','Holo Labs','Meshy / 3D asset generation','Construct / creator tools','Security / cybersecurity tools']},
  {id:'travel-property',label:'Travel + Property + Services',side:'app',summary:'Real-world service discovery and business layers.',features:['Holo Ride','Delivery','Stays','PropertyVerse','Global Trade','Business services']},
  {id:'access-safety',label:'Accessibility + Safety + Account',side:'app',summary:'System-wide access, protection and account controls.',features:['One-hand accessibility','Voice / captions / translation','Sign language','Omni Access / OmniWear','Guardian Center','Privacy / account deletion','Youth safety controls']}
]

export const TRYAMM_GAME_FEATURES:readonly TryammFeatureGroup[]=[
  {id:'streetverse-world',label:'StreetVerse World',side:'game',route:'/streetverse',summary:'The playable Chicago living-world simulation.',features:['Circle Park / ABLA spawn','Roosevelt Road / Taylor Street / Pilsen expansion','Buildings, trees, streets and interiors','Chicago districts and travel','Weather, day/night and world events']},
  {id:'player-character',label:'Player + Characters',side:'game',summary:'Playable avatar, NPC and relationship simulation.',features:['One-hand movement and camera','Player character / BJ character pipeline','NPC population and routines','Dialogue, facial/emotional hooks','Persistent relationships and world memory']},
  {id:'missions-story',label:'Missions + Story',side:'game',summary:'StreetVerse progression and playable stories.',features:['First Journey','Meet the Stubbs','Mission markers and completion','Story / RP missions','Public-service careers','007 / MIB / security mission concepts','Time Machine mission bridge']},
  {id:'vehicles-city-life',label:'Vehicles + Living City',side:'game',summary:'Driveable and reactive city systems.',features:['Enter / exit / repair vehicles','Cars, motorcycles and commercial vehicles','Traffic and pedestrians','Ride-share and delivery missions','Police / sheriff / ambulance / fire / rescue gameplay','Accidents and emergency events']},
  {id:'simulation-action',label:'Simulation + Action',side:'game',summary:'World consequences and game-only action systems.',features:['Fire / damage / rescue simulation','Crime and consequence systems','Green / protected zones','Racing / drifting','Sports and mini-games','After Dark protected lane','Animals, crowds and environmental life']},
  {id:'progression-economy',label:'Game Progression',side:'game',summary:'Non-cash player progression that remains separate from real settlement.',features:['XP and mission rewards','POG Play-or-Grow','Game inventory','Unlocks and cosmetics','Family / agency rank','Sponsored mission eligibility']},
  {id:'game-social-media',label:'In-Game Social + Media',side:'game',summary:'Compact bridges that keep the player inside gameplay.',features:['In-game Social panel','People search','Stream Tickets','Party / multiplayer hooks','Game LIVE / PK','Mission-to-Reel capture','HoloFon / Holo Watch game controls','Cast / Holo Cube / TV bridge']}
]

export const TRYAMM_SHARED_SERVICES:readonly TryammFeatureGroup[]=[
  {id:'identity-safety',label:'Identity + Safety Services',side:'shared',summary:'Used by both the app and the game without belonging to either UI.',features:['Authentication / Passport','Age and youth safety','Guardian consent references','Roles and permissions','Report / block / mute','Moderation and audit trails']},
  {id:'social-media-backend',label:'Social + Media Services',side:'shared',summary:'Shared communications infrastructure.',features:['Social graph','Search / discovery','LiveKit / WebRTC','Reel media pipeline','Translation / captions','Notifications','Recording / storage with consent']},
  {id:'commerce-authority',label:'Commerce + Ledger Authority',side:'shared',summary:'The game requests commerce actions; only server systems authorize real money.',features:['Stripe / payment-provider verification','Orders and entitlements','Refunds','Creator / sponsor / agent ledgers','Payout eligibility','Blockchain / provenance records']},
  {id:'ai-data',label:'AI + Data + Infrastructure',side:'shared',summary:'Common intelligence and infrastructure services.',features:['HoloGPT orchestration','AI moderation / triage','Meshy asset pipeline','Supabase persistence','Cloud / CDN / deployment','Observability / telemetry','Device and casting bridges']}
]

export const TRYAMM_PRODUCT_BOUNDARY={
  appRoute:'/',
  gameRoute:'/streetverse',
  rules:[
    'The app owns real accounts, content, business, work, communication and real-money commerce.',
    'The game owns player movement, physics, world state, missions, NPCs, vehicles and non-cash progression.',
    'Shared services connect both products through authenticated server APIs and event bridges.',
    'Game code must never directly approve payouts, payroll, guardian status or real-money settlement.',
    'App code must never own authoritative player physics, mission completion or game-world simulation state.'
  ] as const
}

export function classifyTryammRoute(pathname:string):TryammProductSide{
  if(pathname.startsWith('/streetverse'))return 'game'
  return 'app'
}
