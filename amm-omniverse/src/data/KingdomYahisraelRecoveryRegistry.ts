export type KingdomYahisraelPillarId=
 'judah-gate'|'faithverse'|'scripture-school'|'kingdom-district'|'servants-of-christ'|'kingdoms-press'|'set-apart'|'seven-lights'|'living-worlds'|'broadcast'

export type KingdomYahisraelPillar={
 id:KingdomYahisraelPillarId;label:string;subtitle:string;route?:string;status:'existing'|'existing-gated'|'converging';
 sourceFiles:string[];capabilities:string[];boundary?:string
}

export const KINGDOM_YAHISRAEL_IDENTITY={
 canonicalDisplayName:'Kingdom of Yahisrael • Judah',
 brandLine:'Where Heaven Meets Earth',
 legacyProjectTitle:'The System vs The Kingdom: Where Heaven Meets Earth',
 visualLanguage:{cyan:'AI / portals',gold:'Judah / achievement / legacy',violet:'dimensional travel'},
 principles:['faith','identity','service','stewardship','family legacy','education','creation','community responsibility'],
 route:'/kingdom-of-yahisrael',
} as const

export const KINGDOM_YAHISRAEL_PILLARS:readonly KingdomYahisraelPillar[]=[
 {id:'judah-gate',label:'Judah Command Gate',subtitle:'Lion of Judah identity + holographic gateway',status:'existing',sourceFiles:['src/components/JudahSplash.tsx','src/components/LionOfJudahHolo.tsx','public/media/tryamm-judah-splash-web-v2.mp4'],capabilities:['Judah visual identity','holographic gateway','creator/live overlay variants','reduced-motion fallback']},
 {id:'faithverse',label:'FaithVerse',subtitle:'Immersive Ethiopian Bible + faith world',route:'/faithverse',status:'existing',sourceFiles:['src/components/EthiopianBibleMetaverse.tsx','src/components/FaithHoloBook.tsx','src/components/FaithScriptureReader.tsx'],capabilities:['Ethiopian canon study','KJV reading lane','HoloBook','Faith Chrono','accessible study']},
 {id:'scripture-school',label:'Scripture + Hebrew School',subtitle:'81-canon metadata • TRYAMM 88-book curriculum • Hebrew • Strong’s',route:'/ethiopian-bible',status:'existing',sourceFiles:['src/data/FaithVerseStudyLibrary.ts','src/components/FaithHoloBook.tsx'],capabilities:['81-book Ethiopian canon metadata','custom 88-book curriculum','KJV 1611 study layer','Paleo-Hebrew script study','Strong’s study','source-label integrity'],boundary:'Official canon metadata, custom curriculum, translations, lexicons, commentary, AI explanation and reconstructions remain distinctly labeled.'},
 {id:'kingdom-district',label:'Kingdom District',subtitle:'Playable Kingdom / StreetVerse world',route:'/kingdom',status:'existing',sourceFiles:['public/streetverse-kingdom/index.html','src/components/KingdomDistrictRoute.tsx','src/runtime/KingdomStreetVerseBridge.ts'],capabilities:['walkable district','vehicles','traffic','human-character layer','RP Omnibar','missions bridge','Reels','OmniBox','CampusVerse/CrossVerse travel']},
 {id:'servants-of-christ',label:'Servants of Christ',subtitle:'Ministry • study • teaching • service',route:'/servants-of-christ',status:'existing',sourceFiles:['src/components/ServantsOfChristMinistry.tsx'],capabilities:['Bible studies','classes','LIVE teaching','service missions','human review']},
 {id:'kingdoms-press',label:'Kingdoms Press',subtitle:'Books • HoloBooks • audio • publishing • royalties',route:'/kingdoms-press',status:'existing-gated',sourceFiles:['src/components/KingdomsPressHub.tsx','src/components/KingdomsPressOperations.tsx','src/services/pressCafeOperations.ts'],capabilities:['authoring','rights','accessibility','translation','ebook/audio/HoloBook','book club','author events','network distribution'],boundary:'Print, ISBN, retail stores and third-party distribution remain provider-gated until verified.'},
 {id:'set-apart',label:'Set Apart Kingdom Chain',subtitle:'Sabbath • New Moon • covenant • ministry • legacy • service attestations',status:'existing',sourceFiles:['../supabase/migrations/20260904195500_set_apart_kingdom_chain_layer.sql'],capabilities:['server-only hash anchoring','faith/community records','legacy attestations','service attestations'],boundary:'Not a payment ledger and not a claim of governmental, citizenship, tax, property or legal sovereignty.'},
 {id:'seven-lights',label:'Seven Lights of YAHAVAH',subtitle:'Original Judah-centered story canon',status:'existing',sourceFiles:['src/data/SevenLightsCanonRegistry.ts'],capabilities:['7 seasons / 91 core episodes','Ari’el','Judah lion companion','StreetVerse missions','interactive episodes','game cinematics','manga/comic','merchandise']},
 {id:'living-worlds',label:'Living Worlds / CrossVerse',subtitle:'One Passport • shared identity • world travel',status:'converging',sourceFiles:['src/components/LivingWorldsUniverse.tsx','src/services/livingWorlds.ts','src/runtime/CrossVerseCampusVerseBridge.ts'],capabilities:['shared identity','world sessions','cross-world state','creator identity','accessibility passport','mission history','CrossVerse travel']},
 {id:'broadcast',label:'Kingdom Media + Broadcast',subtitle:'LIVE • Reels • All American Network • Isaiah AI TV',route:'/network',status:'converging',sourceFiles:['src/components/AllAmericanNetworkHub.tsx','src/components/OTTIsaiahTV.tsx','src/components/LiveCenter.tsx'],capabilities:['LIVE teaching/performance','Reels','network distribution','creator shows','faith programming','StarVerse crossover']},
] as const

export const KINGDOM_YAHISRAEL_PATH=[
 'ENTER THROUGH JUDAH GATE',
 'CHOOSE STUDY / SERVICE / BUILD / CREATE / PLAY',
 'FAITHVERSE + SCRIPTURE SCHOOL',
 'KINGDOM DISTRICT + LIVING WORLD',
 'SERVICE / FAMILY / COMMUNITY MISSIONS',
 'CREATE BOOK / SONG / REEL / SHOW / LESSON',
 'KINGDOMS PRESS + STAR STUDIO + NETWORK DISTRIBUTION',
 'SERVER-VERIFIED PROGRESS / COMMERCE / LEGACY RECORDS',
 'RETURN THROUGH ONE PASSPORT / ONE WORLD MEMORY',
] as const

export const KINGDOM_RECOVERY_RULES=[
 'reuse-before-rebuild',
 'preserve-existing-routes-and-assets',
 'source-label-scripture-and-history',
 'faith-community-records-are-not-governmental-authority',
 'money-remains-server-authoritative',
 'one-passport-one-world-memory',
 'mobile-one-hand-accessibility',
 'googolplex-regression-protection',
] as const