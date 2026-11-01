export type ImpactKind='repair'|'collision'|'damage'|'mission-complete'|'reward'|'interaction';
export type ImpactProfile={kind:ImpactKind;shakePx:number;flashMs:number;hapticMs:number;soundKey:string;caption:string;intensity:number};
const PROFILES:Record<ImpactKind,ImpactProfile>={
 repair:{kind:'repair',shakePx:1,flashMs:100,hapticMs:30,soundKey:'repair-success',caption:'Repair successful',intensity:.25},
 collision:{kind:'collision',shakePx:5,flashMs:130,hapticMs:80,soundKey:'collision',caption:'Vehicle impact',intensity:.8},
 damage:{kind:'damage',shakePx:4,flashMs:110,hapticMs:70,soundKey:'damage',caption:'Damage received',intensity:.7},
 'mission-complete':{kind:'mission-complete',shakePx:0,flashMs:180,hapticMs:45,soundKey:'mission-complete',caption:'Mission complete',intensity:.5},
 reward:{kind:'reward',shakePx:0,flashMs:90,hapticMs:25,soundKey:'reward',caption:'Reward earned',intensity:.3},
 interaction:{kind:'interaction',shakePx:1,flashMs:50,hapticMs:15,soundKey:'interaction',caption:'Interaction registered',intensity:.2}
};
export type ImpactSettings={reducedMotion:boolean;reducedFlashing:boolean;muted:boolean;haptics:boolean};
export function resolveImpact(kind:ImpactKind,settings:ImpactSettings):ImpactProfile{
 const profile=PROFILES[kind];return {...profile,shakePx:settings.reducedMotion?0:profile.shakePx,flashMs:settings.reducedFlashing?0:profile.flashMs,hapticMs:settings.haptics?profile.hapticMs:0,soundKey:settings.muted?'':profile.soundKey};
}
export type ImpactEvent={id:string;kind:ImpactKind;at:number;source:'mission'|'vehicle'|'player'|'npc'};
export function acceptImpact(previous:ImpactEvent[],event:ImpactEvent):ImpactEvent[]{
 if(previous.some(item=>item.id===event.id))return previous;
 return [...previous.slice(-49),event];
}
// Client-side visual feedback only; never changes authoritative health, money or XP.
