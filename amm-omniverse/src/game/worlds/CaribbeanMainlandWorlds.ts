export type MainlandCaribbeanWorldId='belize'|'guyana'|'suriname'
export type TransitMode='walk'|'bike'|'car'|'bus'|'boat'|'ferry'|'river'|'plane'|'holo-portal'

export interface MainlandCaribbeanWorld {
 id:MainlandCaribbeanWorldId; name:string; geography:string; capitalHub:string; languages:string[];
 transit:TransitMode[]; environments:string[]; sports:string[]; creator:string[]; missions:string[];
 teenTakeover:boolean; copySmartNpc:boolean; dynamicMissions:boolean; accessibility:boolean; localization:boolean;
}

export const mainlandCaribbeanWorlds:MainlandCaribbeanWorld[]=[
 {id:'belize',name:'Belize Living World',geography:'Central America / Caribbean coast',capitalHub:'Belmopan',languages:['English','Belizean Kriol','Spanish','Garifuna','Maya languages'],transit:['walk','bike','car','bus','boat','ferry','plane','holo-portal'],environments:['Caribbean coast','cayes','barrier reef','mangroves','rainforest','rivers','caves','Maya-inspired archaeology zones'],sports:['football','basketball','cycling','track-field','water-sports'],creator:['music','dance','film','food','crafts','Garifuna-inspired cultural events'],missions:['reef-conservation','island-hop','jungle-exploration','cave-puzzle','sports-tournament','creator-showcase','business','community','secret-history'],teenTakeover:true,copySmartNpc:true,dynamicMissions:true,accessibility:true,localization:true},
 {id:'guyana',name:'Guyana Living World',geography:'Northern South America / Caribbean Community',capitalHub:'Georgetown',languages:['English','Guyanese Creole','Indigenous languages'],transit:['walk','bike','car','bus','boat','river','plane','holo-portal'],environments:['Atlantic coast','Georgetown-style city','rainforest','Rupununi-style savannah','rivers','waterfalls','Guiana Shield'],sports:['cricket','football','basketball','boxing','track-field'],creator:['music','Mashramani-inspired festival','food','film','fashion','storytelling'],missions:['river-expedition','rainforest-exploration','savannah-adventure','sports-circuit','creator-festival','business','wildlife-conservation','community','secret-waterfall'],teenTakeover:true,copySmartNpc:true,dynamicMissions:true,accessibility:true,localization:true},
 {id:'suriname',name:'Suriname Living World',geography:'Northern South America / Caribbean Community',capitalHub:'Paramaribo',languages:['Dutch','Sranan Tongo','Indigenous and community languages'],transit:['walk','bike','car','bus','boat','river','plane','holo-portal'],environments:['Paramaribo-style city','Atlantic coast','rainforest','rivers','interior villages','Guiana Shield'],sports:['football','basketball','swimming','track-field','martial-arts'],creator:['music','dance','food','film','fashion','multicultural festivals'],missions:['river-route','rainforest-expedition','football-circuit','creator-festival','market-business','conservation','community','multilingual-mystery'],teenTakeover:true,copySmartNpc:true,dynamicMissions:true,accessibility:true,localization:true}
]

export const mainlandCaribbeanSharedSystems={
 engines:['unreal','unity','godot','web-holo'],
 systems:['StreetVerse','Living Worlds','Copy Smart NPC','Dynamic Mission Director','Teen Takeover','Stubbs AI','HoloGPT','Quantum Beat','Quantum Lag Buster','Holographic Overlay','Lottie 2.0','OmniPlayer','cloud saves','cross-world avatar','multiplayer parties','translation','captions','audio description','one-hand controls'],
 travelNetwork:['Caribbean Portal Nexus','North America Portal Nexus','air routes','coastal/river routes','regional Holo Portal'],
 progression:['shared avatar','XP','inventory','achievements','business ownership','sports career','creator career','NPC relationships','secret discoveries'],
 contentGuardrails:['use original game maps and art','respect living cultures','avoid sacred-site gamification without review','no real-person likeness without rights','local cultural review before shipping']
} as const
