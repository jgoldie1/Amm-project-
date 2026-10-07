export type VerseRating='family'|'teen'|'mature';
export type VerseLayer={
 id:string;label:string;depth:number;rating:VerseRating;
 laws:string[];systems:string[];entry:string[];isolated?:boolean;
};
export const VERSE_OS:VerseLayer[]=[
 {id:'streetverse',label:'StreetVerse Chicago',depth:1,rating:'teen',laws:['grounded physics','persistent consequences'],systems:['neighborhood RP','businesses','schools','police','sheriff','fire','EMS','courts','jobs'],entry:['passport']},
 {id:'civicverse',label:'Green Zone / CivicVerse',depth:2,rating:'family',laws:['lawful career rules','de-escalation'],systems:['academies','detective cases','federal cases','courts','emergency response'],entry:['streetverse']},
 {id:'spyverse',label:'Shadow Agent / 007-style SpyVerse',depth:3,rating:'teen',laws:['stealth','disguise','evidence'],systems:['original espionage','gadgets','infiltration','extraction','international missions'],entry:['streetverse']},
 {id:'shadow-bureau',label:'Shadow Bureau',depth:4,rating:'teen',laws:['classified anomalies','hidden portals'],systems:['original paranormal agency','alien NPCs','artifacts','dimensional investigations'],entry:['spyverse']},
 {id:'cyberverse',label:'CyberVerse / Neon Future',depth:5,rating:'teen',laws:['augmented mobility','networked city'],systems:['drones','robotics','holographic transit','hacking puzzles'],entry:['streetverse']},
 {id:'holoverse',label:'HoloVerse',depth:6,rating:'family',laws:['constructible reality'],systems:['World Forger','Holo Lab','summoned stages','vehicles','structures','portals'],entry:['streetverse','cyberverse']},
 {id:'timeverse',label:'TimeVerse',depth:7,rating:'teen',laws:['branching timelines','period rules'],systems:['historic/future Chicago','time missions','timeline consequences'],entry:['holoverse']},
 {id:'spaceverse',label:'SpaceVerse',depth:8,rating:'family',laws:['variable gravity','planetary travel'],systems:['Earth','Moon','Mars','orbital stations','space economy'],entry:['holoverse']},
 {id:'multiverse',label:'MultiVerse',depth:9,rating:'teen',laws:['parallel world states'],systems:['alternate districts','alternate characters','branch missions'],entry:['timeverse','spaceverse']},
 {id:'omniverse',label:'Omniverse',depth:10,rating:'teen',laws:['cross-verse passport','portable identity'],systems:['routing','inventory','XP','creator identity','commerce'],entry:['multiverse']},
 {id:'after-dark',label:'Omniverse After Dark',depth:11,rating:'mature',laws:['age gate','night economy'],systems:['noir investigations','nightlife','underground racing','high-risk missions'],entry:['omniverse'],isolated:true},
 {id:'double-after-dark',label:'Double After Dark',depth:12,rating:'mature',laws:['age gate','clandestine access'],systems:['secret societies','fictional underground economy','paranormal cases','rare world events'],entry:['after-dark'],isolated:true},
 {id:'quantumverse',label:'QuantumVerse',depth:13,rating:'teen',laws:['programmable physics','reality fractures'],systems:['gravity shifts','time dilation','portals','quantum dash','probability events'],entry:['omniverse']},
 {id:'architect',label:'Construct / Architect Layer',depth:14,rating:'teen',laws:['permissioned creation','moderated generation'],systems:['AI mission forge','building forge','NPC behavior forge','VFX forge','mini-game forge'],entry:['quantumverse']},
 {id:'faithverse',label:'FaithVerse / Kingdom of Yahisrael',depth:6,rating:'family',laws:['protected peaceful branch','no mature prerequisite'],systems:['Scripture exploration','history','education','music','community','peaceful building'],entry:['streetverse'],isolated:true},
];
export const ORIGINAL_IP_RULES=[
 'SpyVerse uses original characters, agencies, gadgets and names; no James Bond/007 protected expression.',
 'Shadow Bureau uses original paranormal-agency characters and lore; no Men in Black protected expression.',
 'All generated content inherits Verse rating, moderation and platform policy gates.'
] as const;
