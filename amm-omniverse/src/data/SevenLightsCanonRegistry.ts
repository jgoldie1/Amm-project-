export type CanonCharacter={id:string;name:string;role:string;notes:string[]}
export type CanonSeason={season:number;title:string;episodes:number;arc:string}

export const SEVEN_LIGHTS_CANON={
 title:'Seven Lights of YAHAVAH',
 format:{seasons:7,episodesPerSeason:13,totalCoreEpisodes:91,standardRuntimeMinutes:'24–28',eventFinaleMinutes:'40–45'},
 foundation:['Black Hebrew Israelite-centered original fantasy/sci-fi mythology','faith','discipline','identity','wisdom','Hebrew culture','parables','Fruit of the Spirit'],
 hero:{id:'ariel',name:'Ari’el',age:33,origin:'Chicago',identity:'Black Hebrew Israelite connected to Judah',visual:['locs'],rule:'Ari’el can fail, learn and mature; he is distinct from YAHAVAH and Yahushua.'},
 characters:[
  {id:'morah-oriah',name:'Morah Oriah',role:'mentor',notes:['wisdom and instruction']},
  {id:'judah-lion',name:'Judah',role:'lion companion / Judah symbol',notes:['original Seven Lights canon']},
  {id:'tamar',name:'Tamar',role:'ally',notes:[]},{id:'zuri',name:'Zuri',role:'ally',notes:[]},{id:'malaki',name:'Malaki',role:'ally',notes:[]},{id:'gavriel',name:'Gavriel',role:'ally',notes:[]},
  {id:'ketzer',name:'Ketzer',role:'villain',notes:[]},{id:'zaqan',name:'Zaqan',role:'villain',notes:[]},{id:'mamon-rex',name:'Mamon Rex',role:'villain',notes:[]},{id:'rageborn',name:'Rageborn',role:'villain',notes:[]},{id:'lady-vanity',name:'Lady Vanity',role:'villain',notes:[]},{id:'nehash',name:'Nehash',role:'villain',notes:[]},{id:'forgetters',name:'The Forgetters',role:'enemy faction',notes:[]},
 ] satisfies CanonCharacter[],
 worldTerms:['Eretz-Or','Seven Lights','Seven Assemblies','Seven Seals','Seven Trumpets','HaMashiach Fire'],
 powerRules:['HaMashiach Fire requires meekness and self-control, not rage.','Power progression must reinforce character, discipline and responsibility rather than erase consequences.'],
 seasons:[
  {season:1,title:'Seven Lights',episodes:13,arc:'Ari’el awakens to Eretz-Or, the Lights, his calling and the first conflict with the Forgetters.'},
  {season:2,title:'Seven Assemblies',episodes:13,arc:'Ephesus, Smyrna, Pergamum, Thyatira, Sardis, Philadelphia and Laodicea become the spiritual/story framework.'},
  {season:3,title:'Seven Seals',episodes:13,arc:'The seals escalate the mystery, responsibility and cost of Ari’el’s calling.'},
  {season:4,title:'Seven Trumpets',episodes:13,arc:'Warnings, choices and consequences expand across the world.'},
  {season:5,title:'Two Kingdoms',episodes:13,arc:'Competing kingdoms force alliances, betrayals and tests of identity.'},
  {season:6,title:'Fall of Babylon',episodes:13,arc:'The corrupt system reaches its reckoning and the heroes face their largest coordinated conflict.'},
  {season:7,title:'All Things Made New',episodes:13,arc:'Restoration, final choices and the culmination of the Seven Lights saga.'},
 ] satisfies CanonSeason[],
 openingEpisode:{season:1,episode:1,title:'When the Light Went Out'},
 media:['streaming animation','manga/comic','interactive episodes','StreetVerse missions','Construct experiences','game cinematics','cards','merchandise'],
} as const

export const DUEL_REALMS_CANON={
 title:'Omniverse Duel Realms',
 hero:'AMARI',
 aiCompanion:'Chapelle',
 villains:['the False Prophet','Void Empress'],
 realms:['Fire','Water','Sky','Earth','Light','Shadow','Sound','Tech','Judah','Saturn'],
 factions:['Judah Vanguard','Quantum Architects','Living World Keepers','Echo Travelers','Holo Sentinels','Restoration Guild'],
 deck:{size:'40–60',startingHand:5,lifeEnergy:8000,phases:['Draw','Energy','Summon','Strategy','Battle','End'],classes:['Warrior','Beast','Spirit','Tech','Spell','Trap','Realm','Fusion','Champion']},
 establishedScale:{originalCards:100,originalRealms:10,originalCreatures:10},
 systems:['ancient holographic scroll cards','AI battle spirits','tournament arcs','corrupted card-system villains','Hebrew feast mechanics','Quantum Mantles'],
 quantumMantles:['holographic projection','shields','drones','plasma visuals','acoustic force','scanning','AR guidance','adaptive armor','vehicles','healing navigation','translation','AI tactical support'],
 connectedBrands:['El Saturn Chain','Set Apart Music Network','All American Streaming University'],
} as const

export const STORY_CANON_INTEGRATION={
 streetVerse:['canon missions','character encounters','faction reputation','world events','boss encounters','unlockable Champion experiences'],
 construct:['Benny contextual guide','Vector navigation','Chronicle lore intelligence','world-anchored story cards','scan-to-lore','episode/mission handoff'],
 publishing:['season bible','episode registry','manga chapter registry','character bible','power rules','realm/faction registry','continuity ledger'],
 rightsRule:'Keep all finished characters, costumes, weapons, names, symbols and story expression original to TRYAMM/Seven Lights/Duel Realms; archetype inspiration must not copy protected franchise expression.',
 physicalProjection:false,
} as const

export function getSevenLightsSeason(season:number){return SEVEN_LIGHTS_CANON.seasons.find(s=>s.season===season)}
export function getCanonCharacter(name:string){const q=name.toLowerCase();return SEVEN_LIGHTS_CANON.characters.find(c=>c.name.toLowerCase()===q)|| (SEVEN_LIGHTS_CANON.hero.name.toLowerCase()===q?SEVEN_LIGHTS_CANON.hero:undefined)}
