export type RecoveryStatus='recovered'|'identified'|'license-review'|'convert'|'wire'|'test'|'missing'
export type RecoveryLane={id:string;label:string;status:RecoveryStatus;priority:number;targets:string[];rules:string[]}

export const RECOVERY_POLICY=[
  'archive-first','preserve-originals','verify-license-before-import','open-data-second','convert-and-optimize','map-to-runtime','test-before-green','create-only-when-missing'
] as const

export const LIVING_WORLD_RECOVERY_LANES:RecoveryLane[]=[
  {id:'chicago',label:'Chicago buildings + interiors',status:'identified',priority:1,targets:['buildings','interiors','roads','transit','parks','nightlife','restaurants','shops','mission-spaces','waterfront','marinas'],rules:['prefer-recovered','license-gate','LOD','collision','mobile-budget']},
  {id:'characters',label:'Characters + animation',status:'identified',priority:2,targets:['player-variants','citizens','workers','performers','mission-NPCs','locomotion','interaction','emotes'],rules:['preserve-original-rigs','retarget-before-create','accessibility-variants']},
  {id:'animals',label:'Living wildlife',status:'identified',priority:3,targets:['dogs','cats','birds','fish','insects','urban-wildlife','marine-life','horses'],rules:['species-safe','LOD','ambient-AI','traffic-avoidance','no-protected-model-copying']},
  {id:'vehicles',label:'Vehicles + mobility',status:'identified',priority:4,targets:['cars','foreign-style-luxury-originals','performance-cars','buses','bikes','service-vehicles','boats','yachts','ferries','accessible-mobility'],rules:['generic-or-owned-design','no-unlicensed-brand-copying','physics-test','traffic-LOD','water-physics-test']},
  {id:'economy',label:'Internal blockchain + revenue proof',status:'wire',priority:5,targets:['sponsored-missions','creator-gifts','subscriptions','marketplace','holo-ads','streaming','academy','jobs','telecom','property','publishing','events'],rules:['append-only-ledger','server-authoritative-rewards','idempotent-settlement','source-proof','restricted-reserve','reconcile-before-payout']},
  {id:'puerto-rico',label:'Puerto Rico living districts',status:'identified',priority:6,targets:['San Juan','Viejo San Juan','El Yunque','Ponce','Rincon','Culebra','Vieques','terrain','roads','buildings','coastline','vegetation','ambience'],rules:['archive-first','OSM-ODbL-attribution','USGS-public-data','culture-review','no-commercial-scraping']},
  {id:'holo-xr',label:'Holo / VR / AR assets',status:'identified',priority:7,targets:['portals','holographic-UI','XR-props','interaction-zones','reduced-motion-fallback'],rules:['webxr-budget','2D-fallback','comfort-test']},
  {id:'judah',label:'TRYAMM / Judah original branding',status:'identified',priority:8,targets:['lion','crest','portal-marks','signage','UI-motifs'],rules:['owned-originals-first','trademark-review','preserve-source']},
  {id:'audio',label:'World audio + Quantum Beat',status:'identified',priority:9,targets:['city-ambience','nature','vehicles','boats','footsteps','interactions','missions','spatial-audio'],rules:['rights-proof','attribution','volume-safety','captions-or-visual-cues']},
  {id:'spaceverse',label:'SpaceVerse models',status:'identified',priority:10,targets:['spacecraft','planets','terrain','stations','mission-props','navigation-visuals'],rules:['archive-first','public-science-data-allowed','no-misleading-realism-claims']},
  {id:'creator',label:'Reel Creator assets',status:'identified',priority:11,targets:['overlays','stickers','backgrounds','transitions','location-cards','mission-cards','teleport-deeplinks'],rules:['rights-proof','mobile-export','creator-attribution']},
  {id:'legacy',label:'Older Living Worlds + game packages',status:'identified',priority:12,targets:['archives','prototypes','maps','prefabs','textures','audio','scripts','missions'],rules:['deduplicate','hash-original','license-gate','map-before-rewrite']},
]

export const SHARED_WORLD_STATE=[
  'one-avatar','one-xp','one-level','one-reputation','one-inventory','one-accessibility-passport','one-language-profile','one-world-memory','one-mission-history','one-creator-identity','one-economic-identity'
] as const

export const WORLD_TRAVEL_LOOP=[
  'choose-district','load-checkpoint','spawn-avatar','stream-local-assets','discover-mission','complete-event','award-server-verified-progress','write-ledger-proof','capture-clip','attach-location','publish-or-save','deep-link-back-to-world','travel-next-district'
] as const

export const ASSET_GREEN_GATE=[
  'source-recorded','license-approved','checksum-recorded','optimized','LOD-ready','collision-ready','runtime-mapped','mobile-tested','desktop-tested','accessibility-tested','performance-budget-passed','human-approved'
] as const
