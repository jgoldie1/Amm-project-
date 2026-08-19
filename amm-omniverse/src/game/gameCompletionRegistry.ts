export type GameReadiness = 'CONCEPT' | 'SPECIFIED' | 'PROTOTYPE' | 'PLAYABLE_BETA' | 'INTEGRATED' | 'TESTED' | 'LIVE';

export type GameCompletionRecord = {
  slug: string;
  name: string;
  current: GameReadiness;
  target: GameReadiness;
  nextMilestone: string;
  blockers: string[];
  browserFirstTasks: string[];
};

export const GAME_COMPLETION_REGISTRY: GameCompletionRecord[] = [
  { slug:'living-city', name:'Living City', current:'PROTOTYPE', target:'PLAYABLE_BETA', nextMilestone:'Mission loop + authoritative save adapter', blockers:['cloud save','multiplayer authority'], browserFirstTasks:['expand missions','inventory/economy persistence','NPC interaction','save adapter'] },
  { slug:'living-flight', name:'Living Flight', current:'SPECIFIED', target:'PROTOTYPE', nextMilestone:'Browser flight sandbox', blockers:['3D flight client','physics tuning'], browserFirstTasks:['flight controls','altitude/speed HUD','checkpoint mission','planet/space transition mock'] },
  { slug:'holobeasts-living-wilds', name:'HoloBeasts: Living Wilds', current:'SPECIFIED', target:'PROTOTYPE', nextMilestone:'Creature encounter loop', blockers:['original creature assets'], browserFirstTasks:['exploration map','encounter','capture/befriend loop','habitat inventory'] },
  { slug:'living-ops-shadow-front', name:'Living Ops: Shadow Front', current:'SPECIFIED', target:'PROTOTYPE', nextMilestone:'Tactical objective sandbox', blockers:['combat assets','network authority'], browserFirstTasks:['movement','objective capture','squad commands','non-real-money progression'] },
  { slug:'paranormal-unit-rift-hunters', name:'Paranormal Unit: Rift Hunters', current:'SPECIFIED', target:'PROTOTYPE', nextMilestone:'Rift investigation mission', blockers:['original paranormal assets'], browserFirstTasks:['scanner','evidence collection','rift event','co-op-ready mission state'] },
  { slug:'holo-battle-omniverse', name:'Holo Battle: Omniverse', current:'SPECIFIED', target:'PROTOTYPE', nextMilestone:'Arena match loop', blockers:['combat balancing','authoritative multiplayer'], browserFirstTasks:['arena','health/score','round timer','bot opponent'] },
  { slug:'living-racing', name:'Living Racing', current:'SPECIFIED', target:'PROTOTYPE', nextMilestone:'Playable time-trial race', blockers:['vehicle physics/assets'], browserFirstTasks:['steering/throttle','lap checkpoints','timer','ghost/best-time save'] },
  { slug:'living-sports', name:'Living Sports', current:'PROTOTYPE', target:'PLAYABLE_BETA', nextMilestone:'One complete sport match loop', blockers:['full rules/physics','online matchmaking'], browserFirstTasks:['pick launch sport','complete scoring clock','AI opponent','career save adapter'] },
  { slug:'living-laser', name:'Living Laser', current:'SPECIFIED', target:'PROTOTYPE', nextMilestone:'Laser-grid arena', blockers:['spatial mode later'], browserFirstTasks:['grid movement','tag/laser mechanic','score','team/bot mode'] },
  { slug:'living-quest', name:'Living Quest', current:'SPECIFIED', target:'PROTOTYPE', nextMilestone:'First quest chain', blockers:['story/content assets'], browserFirstTasks:['NPC dialogue','quest journal','puzzle','reward/save'] },
  { slug:'creator-world', name:'Creator World', current:'SPECIFIED', target:'PROTOTYPE', nextMilestone:'Build-and-save scene editor', blockers:['asset pipeline','UGC moderation'], browserFirstTasks:['place/move objects','save scene','publish private draft','reuse approved assets'] },
  { slug:'streetverse-first-drop', name:'StreetVerse: First Drop', current:'PLAYABLE_BETA', target:'INTEGRATED', nextMilestone:'Cloud save + shared Passport rewards', blockers:['authenticated persistence','backend authority'], browserFirstTasks:['replace local-only save adapter','mission expansion','mobile QA','accessibility QA'] },
];

export function gamePortfolioSummary(records = GAME_COMPLETION_REGISTRY) {
  const order: GameReadiness[] = ['CONCEPT','SPECIFIED','PROTOTYPE','PLAYABLE_BETA','INTEGRATED','TESTED','LIVE'];
  const counts = Object.fromEntries(order.map(state => [state, records.filter(r => r.current === state).length])) as Record<GameReadiness,number>;
  const playableNow = records.filter(r => ['PROTOTYPE','PLAYABLE_BETA','INTEGRATED','TESTED','LIVE'].includes(r.current));
  return { total: records.length, counts, playableNow: playableNow.map(g => g.slug) };
}
