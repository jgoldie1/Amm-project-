export type GateStatus = 'blocked'|'source'|'wired'|'tested'|'deployed'|'green';

export type StreetVerseWave = {
  id: 1|2|3|4|5;
  name: string;
  weight: 20;
  status: GateStatus;
  requiredProof: string[];
};

export const STREETVERSE_WAVES:StreetVerseWave[] = [
  {id:1,name:'Playable Core',weight:20,status:'wired',requiredProof:['production /streetverse route','player input','save/load','mission runtime','device smoke']},
  {id:2,name:'Living World',weight:20,status:'source',requiredProof:['world streaming','NPC schedules','traffic','weather/day-night','interiors','performance budget']},
  {id:3,name:'Creator + HoloMusic',weight:20,status:'source',requiredProof:['real video encode','edit/effects','save to phone','publish','HoloMusic rights/attribution','Quantum Beat sync']},
  {id:4,name:'Commerce + Money',weight:20,status:'source',requiredProof:['real inventory','Guardian server auth','real payment webhook','fulfillment/tracking','50/30/20 ledger','creator attribution','reorder']},
  {id:5,name:'Multiplayer + XR + Device',weight:20,status:'source',requiredProof:['server-authoritative multiplayer','OmniInput gamepad','Volcano controller smoke','WebXR/OpenXR','VR/MR device smoke','Quantum Lag Buster telemetry']},
];

const scoreByStatus:Record<GateStatus,number> = {blocked:0,source:0.25,wired:0.5,tested:0.75,deployed:0.9,green:1};

export function convergencePercent(waves=STREETVERSE_WAVES){
  return Math.round(waves.reduce((sum,w)=>sum + w.weight * scoreByStatus[w.status],0));
}

export function isStreetVerse100Percent(waves=STREETVERSE_WAVES){
  return waves.every(w=>w.status==='green') && convergencePercent(waves)===100;
}

export const CONVERGENCE_RULE = '100% may be displayed only when all five 20% waves are GREEN with runtime and production proof.' as const;
