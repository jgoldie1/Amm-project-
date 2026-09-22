export type QuantumSpeedMode='eco'|'balanced'|'boost'
export type QuantumWorkClass='render'|'simulation'|'network'|'asset'|'ui'
export type QuantumSpeedBudget={frameMs:number;simulationHz:number;maxConcurrentJobs:number;prefetchRadius:number}

export const QUANTUM_SPEED_BUDGETS:Record<QuantumSpeedMode,QuantumSpeedBudget>={
 eco:{frameMs:33.3,simulationHz:15,maxConcurrentJobs:2,prefetchRadius:1},
 balanced:{frameMs:16.7,simulationHz:30,maxConcurrentJobs:4,prefetchRadius:2},
 boost:{frameMs:16.7,simulationHz:60,maxConcurrentJobs:6,prefetchRadius:3},
}

export type QuantumSpeedSample={fps:number;frameMs:number;memoryPressure?:number;networkRttMs?:number;thermalPressure?:number}

export function chooseQuantumSpeedMode(sample:QuantumSpeedSample):QuantumSpeedMode{
 const pressure=Math.max(sample.memoryPressure||0,sample.thermalPressure||0)
 if(pressure>=0.8||sample.fps<24||sample.frameMs>40)return'eco'
 if(pressure<=0.45&&sample.fps>=50&&(sample.networkRttMs??0)<180)return'boost'
 return'balanced'
}

export function quantumJobPriority(kind:QuantumWorkClass,visible=true){
 const base:Record<QuantumWorkClass,number>={ui:100,render:90,simulation:70,network:60,asset:40}
 return base[kind]+(visible?10:0)
}

export function shouldDeferQuantumJob(kind:QuantumWorkClass,sample:QuantumSpeedSample){
 const mode=chooseQuantumSpeedMode(sample)
 return mode==='eco'&&(kind==='asset'||kind==='simulation')
}


export type QuantumLagSignal={frameSpikeMs:number;networkRttMs:number;inputDelayMs:number;queuedJobs:number}
export type QuantumLagAction='none'|'defer-background'|'reduce-simulation'|'reduce-stream-radius'|'recover'

export function quantumLagActions(signal:QuantumLagSignal):QuantumLagAction[]{
 const actions:QuantumLagAction[]=[]
 if(signal.frameSpikeMs>45||signal.inputDelayMs>120)actions.push('defer-background')
 if(signal.frameSpikeMs>70||signal.queuedJobs>8)actions.push('reduce-simulation')
 if(signal.networkRttMs>250||signal.queuedJobs>12)actions.push('reduce-stream-radius')
 return actions.length?actions:['none']
}

export function quantumLagRecovery(signal:QuantumLagSignal){
 const stable=signal.frameSpikeMs<24&&signal.networkRttMs<160&&signal.inputDelayMs<70&&signal.queuedJobs<4
 return {stable,action:stable?'recover' as const:'none' as const}
}
