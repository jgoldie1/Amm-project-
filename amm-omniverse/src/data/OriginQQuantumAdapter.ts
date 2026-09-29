export type QuantumBackend='classical-fallback'|'pyqpanda3-cpuqvm'|'pyqpanda3-gpuqvm'|'originq-qcloud'
export type QuantumWorkload='routing'|'scheduling'|'resource-allocation'|'mission-batching'|'asset-batching'|'traffic-optimization'

export const ORIGINQ_PYQPANDA3_ADAPTER={
 upstream:'OriginQ/pyqpanda3-skill',
 license:'Apache-2.0',
 strategy:'adapter-not-vendored-copy',
 defaultBackend:'classical-fallback' as QuantumBackend,
 developmentBackend:'pyqpanda3-cpuqvm' as QuantumBackend,
 optionalBackends:['pyqpanda3-gpuqvm','originq-qcloud'] as QuantumBackend[],
 credentials:'server-side-only',
 execution:'async',
}

export interface QuantumOptimizationRequest{
 id:string;workload:QuantumWorkload;cityId?:string;variables:number;
 objective:'minimize-latency'|'minimize-cost'|'maximize-throughput'|'balance-load';
 classicalBaselineRequired:true;
}
export interface QuantumOptimizationResult{
 requestId:string;backend:QuantumBackend;candidate:unknown;verified:boolean;
 classicalBaselineScore?:number;candidateScore?:number;used:boolean;
}

export function selectQuantumBackend(input:{providerEnabled:boolean;gpuEnabled:boolean;cloudAuthorized:boolean;variables:number}):QuantumBackend{
 if(input.cloudAuthorized&&input.variables>25)return'originq-qcloud'
 if(input.providerEnabled&&input.gpuEnabled&&input.variables>=15)return'pyqpanda3-gpuqvm'
 if(input.providerEnabled&&input.variables<=20)return'pyqpanda3-cpuqvm'
 return'classical-fallback'
}

export function acceptQuantumCandidate(result:QuantumOptimizationResult){
 if(!result.verified||result.candidateScore==null||result.classicalBaselineScore==null)return false
 return result.candidateScore>result.classicalBaselineScore
}

export const QUANTUM_ROUTER_POLICY={
 eligible:['routing','scheduling','resource-allocation','mission-batching','asset-batching','traffic-optimization'] as QuantumWorkload[],
 never:['rendering-frame-loop','payments','ledger-settlement','auth','age-assurance','rights-approval','safety-moderation'],
 rule:'Quantum candidates are advisory optimization results. Deterministic classical systems remain authoritative and are always available.',
 benchmark:'A quantum path must beat the classical baseline on a measured objective before TRYAMM uses the candidate.',
}

export const STREETVERSE_QUANTUM_CONNECTION={
 quantumSpeedEngine:'software parallelism/pipelining/cache remains the primary runtime accelerator',
 quantumProvider:'PyQPanda3 is an optional optimization backend, not a replacement for OmniFabric or the Quantum Speed Engine',
 chicago:['traffic scheduling','mission batch scheduling','asset production scheduling','district resource allocation'],
 global:['city build scheduling','fleet/resource allocation','cross-city workload batching'],
 afterDark:['venue/mission scheduling','traffic/resource balancing'],
}
