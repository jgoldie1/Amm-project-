export type ProductionDiscipline='characters'|'animation'|'writing'|'physics'|'vehicles'|'environment-art'|'cinematics'|'sound'|'qa'|'optimization'
export interface ProductionCell{discipline:ProductionDiscipline;ownedSystems:string[];automation:string[];certification:string[]}

export const STREETVERSE_STUDIO_FACTORY:ProductionCell[]=[
 {discipline:'characters',ownedSystems:['Asset Forge','Asset Passports','identity/style packs'],automation:['generate variants','retopology','rig','LOD'],certification:['likeness/rights','rig','mobile budget']},
 {discipline:'animation',ownedSystems:['motion library','retarget graph','motion matching'],automation:['retarget','foot placement','facial/lip-sync'],certification:['temporal stability','collision','accessibility']},
 {discipline:'writing',ownedSystems:['story bible','character memory','mission graph','city lore'],automation:['branch drafting','continuity checks','localization'],certification:['editorial review','rights','age lane']},
 {discipline:'physics',ownedSystems:['world interaction rules','vehicle/character physics profiles'],automation:['device-tier simplification','determinism checks'],certification:['gameplay stability','reward authority']},
 {discipline:'vehicles',ownedSystems:['vehicle archetypes','traffic AI','interior/HUD adapters'],automation:['LOD','damage variants','traffic routing'],certification:['performance','rights/branding']},
 {discipline:'environment-art',ownedSystems:['city style packs','procedural districts','Extreme Reality'],automation:['asset placement','splat/mesh hybrid','weather materials'],certification:['source provenance','geographic honesty','performance']},
 {discipline:'cinematics',ownedSystems:['camera grammar','scene sequencer','Holo/Reel capture'],automation:['shot planning','camera blocking','edit variants'],certification:['continuity','rights','captioning']},
 {discipline:'sound',ownedSystems:['spatial ambience','music rights router','voice/dialogue pipeline'],automation:['occlusion zones','mix tiers','caption/transcript'],certification:['rights','loudness','accessibility']},
 {discipline:'qa',ownedSystems:['70x70 audit','city certification','visual regression'],automation:['smoke tests','mission graph checks','asset evidence checks'],certification:['release evidence','no false live status']},
 {discipline:'optimization',ownedSystems:['LOD streaming','OmniFabric','Quantum Speed Engine'],automation:['device profiling','cache/incremental builds','critical path scheduling'],certification:['frame/memory/crash budgets']},
]

export const DUPLICATION_TEMPLATE={
 referenceWorld:'chicago',
 rule:'Build Chicago as the certified reference production, then duplicate systems—not Chicago-specific culture—through city manifests and reviewed local style packs.',
 cloneable:['runtime','production cells','mission framework','commerce/media hooks','accessibility','QA','render tiers'],
 localize:['geography','architecture','transport','weather','culture/language','businesses','missions','media programming','rights'],
}

export function studioReadiness(evidence:Partial<Record<ProductionDiscipline,string>>){
 const missing=STREETVERSE_STUDIO_FACTORY.map(x=>x.discipline).filter(x=>!evidence[x])
 return{total:STREETVERSE_STUDIO_FACTORY.length,verified:STREETVERSE_STUDIO_FACTORY.length-missing.length,missing,productionReady:missing.length===0}
}
