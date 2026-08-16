export type ContinentalCaribbeanId='belize'|'guyana'|'suriname'
export type TravelMode='walk'|'bike'|'car'|'bus'|'rail'|'river'|'boat'|'ferry'|'plane'|'holo-portal'
export type Activity='sports'|'creator'|'business'|'exploration'|'education'|'community'|'nature'|'racing'|'rescue'|'secret-mission'|'teen-takeover'

export interface ContinentalWorld {
 id:ContinentalCaribbeanId
 name:string
 capital:string
 region:string
 languages:string[]
 travel:TravelMode[]
 biomes:string[]
 sports:string[]
 creator:string[]
 economy:string[]
 activities:Activity[]
 hubs:string[]
 secretMissionSeeds:string[]
}

export const continentalCaribbeanWorlds:ContinentalWorld[]=[
 {id:'belize',name:'Belize Living World',capital:'Belmopan',region:'Central America / Caribbean Community',languages:['English','Kriol','Spanish','Garifuna','Maya localization hooks'],travel:['walk','bike','car','bus','boat','ferry','plane','holo-portal'],biomes:['Caribbean coast','cayes','reef','mangrove','rainforest','rivers','caves'],sports:['football','basketball','track','cycling','water sports'],creator:['music','dance','film','food','heritage','digital creators'],economy:['tourism','food','fishing','creator businesses','transport','marketplace'],activities:['sports','creator','business','exploration','education','community','nature','rescue','secret-mission','teen-takeover'],hubs:['Belmopan','Belize City','San Pedro','Caye Caulker','western rainforest gateway','southern cultural gateway'],secretMissionSeeds:['Reef Signal','Cave Frequency','Mangrove Courier','Lost Holo Marker']},
 {id:'guyana',name:'Guyana Living World',capital:'Georgetown',region:'South America / Caribbean Community',languages:['English','Guyanese Creole localization','Indigenous language hooks'],travel:['walk','bike','car','bus','river','boat','plane','holo-portal'],biomes:['Atlantic coast','rainforest','rivers','waterfalls','savannah','Guiana Shield'],sports:['cricket','football','basketball','boxing','track'],creator:['music','film','food','fashion','storytelling','digital creators'],economy:['agriculture','marketplace','transport','creator businesses','tourism','technology'],activities:['sports','creator','business','exploration','education','community','nature','racing','rescue','secret-mission','teen-takeover'],hubs:['Georgetown','coastal corridor','river gateway','savannah gateway','rainforest expedition hub'],secretMissionSeeds:['River Echo','Waterfall Relay','Savannah Night Run','Georgetown Archive']},
 {id:'suriname',name:'Suriname Living World',capital:'Paramaribo',region:'South America / Caribbean Community',languages:['Dutch','Sranan Tongo','English support','community language hooks'],travel:['walk','bike','car','bus','river','boat','plane','holo-portal'],biomes:['Atlantic coast','rainforest','rivers','wetlands','interior'],sports:['football','basketball','swimming','track','combat sports'],creator:['music','dance','film','food','fashion','multilingual creators'],economy:['marketplace','food','transport','creator businesses','tourism','technology'],activities:['sports','creator','business','exploration','education','community','nature','racing','rescue','secret-mission','teen-takeover'],hubs:['Paramaribo','coastal gateway','river gateway','rainforest expedition hub','interior cultural hub'],secretMissionSeeds:['Paramaribo After Dark','River Code','Rainforest Beacon','Hidden Frequency']}
]

export const continentalCaribbeanSharedSystems={
 worldNetwork:['StreetVerse','Living Worlds','Caribbean Portal Nexus','GameVerse Nexus'],
 ai:['Copy Smart NPC','Dynamic Mission Director','Stubbs AI','HoloGPT'],
 gameplay:['persistent NPC relationships','branching missions','business ownership','properties','sports careers','creator careers','vehicle ownership','world events','secret missions','multiplayer parties'],
 media:['OmniPlayer','AI TV','podcasts','live streaming','Quantum Beat','spatial audio'],
 holo:['Holographic Overlay','AR','VR','MR','Holo Portal','remote HoloPresence'],
 safety:['Teen Takeover protected lane','age-appropriate missions','guardian controls','moderation','coarse location','purchase controls'],
 accessibility:['one-hand controls','voice navigation','captions','audio description','high contrast','reduced motion','remapping','translation'],
 engines:['Unreal','Unity','Godot','Web/Holo']
} as const

export const continentalCaribbeanCampaigns=[
 {id:'three-mainlands-circuit',title:'Three Mainlands Circuit',worlds:['belize','guyana','suriname'],modes:['travel','sports','creator','business','exploration'],description:'A persistent campaign linking the three mainland CARICOM worlds through air, sea, river and Holo Portal travel.'},
 {id:'rainforest-network',title:'Rainforest Network',worlds:['belize','guyana','suriname'],modes:['nature','exploration','rescue','secret-mission'],description:'Environmental exploration and fictional mystery missions spanning rainforest, river and coastal biomes.'},
 {id:'caribbean-champions-mainland',title:'Caribbean Champions: Mainland Series',worlds:['belize','guyana','suriname'],modes:['sports'],description:'Original football, cricket, basketball, boxing, track and water-sport events connected to the wider Caribbean Champions Circuit.'},
 {id:'creator-trade-route',title:'Creator & Marketplace Route',worlds:['belize','guyana','suriname'],modes:['creator','business'],description:'Players build studios, shops, transport services and creator venues while participating in regional showcases.'}
] as const

export function getContinentalWorld(id:ContinentalCaribbeanId){return continentalCaribbeanWorlds.find(w=>w.id===id)}
