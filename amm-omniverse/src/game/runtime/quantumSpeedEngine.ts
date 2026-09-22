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
