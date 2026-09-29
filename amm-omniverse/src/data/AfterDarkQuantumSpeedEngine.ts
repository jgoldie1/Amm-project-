import {resolveAfterDarkRuntime,type AfterDarkRuntimeContext} from './AfterDarkLivingWorldRuntime'

export interface AfterDarkQuantumTask{
 id:string;lane:'world'|'population'|'mobility'|'mission'|'media'|'render'|'commerce'|'accessibility';
 dependsOn:string[];speculative:boolean;cacheable:boolean;priority:number;
}

export function compileAfterDarkQuantumGraph(ctx:AfterDarkRuntimeContext):AfterDarkQuantumTask[]{
 const runtime=resolveAfterDarkRuntime(ctx)
 if(!runtime.active)return[]
 return[
  {id:'world',lane:'world',dependsOn:[],speculative:false,cacheable:true,priority:100},
  {id:'accessibility',lane:'accessibility',dependsOn:[],speculative:false,cacheable:true,priority:100},
  {id:'population',lane:'population',dependsOn:['world'],speculative:true,cacheable:true,priority:85},
  {id:'mobility',lane:'mobility',dependsOn:['world'],speculative:true,cacheable:true,priority:85},
  {id:'mission',lane:'mission',dependsOn:['world','population'],speculative:false,cacheable:true,priority:90},
  {id:'render',lane:'render',dependsOn:['world'],speculative:true,cacheable:true,priority:95},
  {id:'media',lane:'media',dependsOn:['world'],speculative:true,cacheable:true,priority:70},
  {id:'commerce',lane:'commerce',dependsOn:['mission'],speculative:false,cacheable:false,priority:100},
 ]
}

export function readyAfterDarkQuantumTasks(tasks:AfterDarkQuantumTask[],completed:string[]){
 const done=new Set(completed)
 return tasks.filter(t=>!done.has(t.id)&&t.dependsOn.every(d=>done.has(d))).sort((a,b)=>b.priority-a.priority)
}

export const AFTER_DARK_QUANTUM_SPEED_ENGINE={
 name:'After Dark Quantum Speed Engine',
 meaning:'Software parallelism, pipelining, caching, incremental rebuild and safe prefetch; not quantum-computing hardware.',
 acceleration:[
  'prewarm nighttime district before sunset/entry','parallelize population, mobility, rendering and media',
  'cache certified venue/environment variants','incrementally rebuild only changed missions/assets',
  'prefetch adjacent districts and likely mission assets','stream LOD by device tier',
  'batch NPC schedules, ambience and media manifests','critical-path scheduling for mission start',
 ] as const,
 protectedLanes:[
  'commerce and reward settlement never speculative','adult access checks never bypassed',
  'minor separation never bypassed','rights and certification never skipped',
  'accessibility remains high priority','privacy/jurisdiction gates remain authoritative',
 ] as const,
}

export function canSpeculateAfterDarkTask(task:AfterDarkQuantumTask){
 return task.speculative&&task.lane!=='commerce'&&task.lane!=='accessibility'
}
