export type KingdomArchitectureSlot=Readonly<{
 id:string
 district:string
 filename:string
 fallback:string
 targetHeightMeters:number
 interior:string[]
 peopleRoles:string[]
 mission:string
 providerState:'missing-production-glb'|'ready'
}>

export const KINGDOM_YAHISRAEL_ARCHITECTURE_SLOTS:readonly KingdomArchitectureSlot[]=[
 {id:'assembly-court',district:'Assembly & Prayer Court',filename:'KY_ASSEMBLY_PRAYER_COURT.glb',fallback:'walkable shell + benches + reflection lectern',targetHeightMeters:12,interior:['assembly seating','reflection lectern','community teaching area'],peopleRoles:['elder','parents','youth student'],mission:'assembly-reflection',providerState:'missing-production-glb'},
 {id:'servants-center',district:'Servants of Christ Service Center',filename:'KY_SERVANTS_SERVICE_CENTER.glb',fallback:'walkable shell + service desks + shelves',targetHeightMeters:10,interior:['service intake','care desk','community mission desk'],peopleRoles:['service coordinator','volunteers'],mission:'community-service',providerState:'missing-production-glb'},
 {id:'legacy-workbook',district:'Family Legacy + Kingdom Workbook Hall',filename:'KY_FAMILY_LEGACY_HALL.glb',fallback:'walkable shell + family table + remembrance shelves',targetHeightMeters:9,interior:['family covenant table','Book of Remembrance lectern','legacy library'],peopleRoles:['family historian','parent','child/family learner'],mission:'family-covenant',providerState:'missing-production-glb'},
 {id:'hebrew-school',district:'Metaverse Bible • Hebrew School + Scripture House',filename:'KY_METAVERSE_BIBLE_HEBREW_SCHOOL.glb',fallback:'walkable classroom + desks + scripture screen + shelves',targetHeightMeters:11,interior:['Metaverse Bible classroom','Hebrew/Paleo-Hebrew study','Strong’s study','KJV 1611 comparison','Faith Chrono entry'],peopleRoles:['Hebrew teacher','teen student','young-adult students'],mission:'metaverse-bible-study',providerState:'missing-production-glb'},
 {id:'press-ai-cafe',district:'Kingdoms Press + AI Café',filename:'KY_KINGDOMS_PRESS_AI_CAFE.glb',fallback:'walkable press hall + shelves + writing tables + AI Café',targetHeightMeters:12,interior:['editorial desk','creator writing tables','AI Café','HoloBook publishing station'],peopleRoles:['editor','writer','AI Café host'],mission:'publish-remembrance',providerState:'missing-production-glb'},
 {id:'broadcast-house',district:'All American Network Broadcast House',filename:'KY_ALL_AMERICAN_NETWORK_BROADCAST.glb',fallback:'walkable studio + cameras + stage + control desk',targetHeightMeters:15,interior:['broadcast stage','camera floor','producer/control desk','LIVE/Reel station'],peopleRoles:['host','producer','camera operator'],mission:'kingdom-broadcast',providerState:'missing-production-glb'},
] as const

export const KINGDOM_PHOTOREAL_UPGRADE_POLICY={
 preserveFallback:true,
 originalOrLicensedOnly:true,
 mobileOptimized:true,
 accessibleEntryRequired:true,
 preserveGameplayAnchors:true,
 productionClaimRequiresGlbEvidence:true,
 architectureProviderStatus:'provider-artifact-required',
} as const
