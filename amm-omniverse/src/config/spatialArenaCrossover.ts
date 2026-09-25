export type SpatialArenaId='quantum-tag'|'tactical-realms-global-conflict'

export const SPATIAL_ARENA_CROSSOVER={
  'quantum-tag':{
    title:'Quantum Tag',
    tone:'non-lethal spatial competition',
    modes:['SOLO','TEAM','TIME_SHIFT','CAPTURE','TERRITORY','PORTAL_RUN'],
    surfaces:['PHONE','TABLETOP_AR','ROOM_AR','VR','MR'],
    passport:['best-score','rank','team-rating','tournament-history','replay-metadata'],
    omnideckHooks:['authorized-ar-anchors','room-mesh','portal-placement','replay-capture'],
    moneyRule:'virtual scoring by default; paid competition requires separate server-authoritative eligibility and jurisdiction checks',
  },
  'tactical-realms-global-conflict':{
    title:'Tactical Realms: Global Conflict',
    campaignLabel:'Global Conflict / WWIII Universe',
    tone:'original fictional tactical action',
    modes:['TRAINING','TEAM_BATTLE','CAPTURE','SURVIVAL','RANKED','CAMPAIGN'],
    surfaces:['PHONE','DESKTOP','VR','MR'],
    passport:['squad-role','mission-record','rank','loadout-mastery','campaign-progress','replay-metadata'],
    omnideckHooks:['holographic-command-table','mission-briefing','squad-markers','replay-capture'],
    originalIpBoundary:'No Call of Duty, Battlefield, Fortnite, GTA or other third-party characters, maps, logos, audio, UI or story assets.',
  },
} as const

export function getSpatialArena(id:SpatialArenaId){
  return SPATIAL_ARENA_CROSSOVER[id]
}
