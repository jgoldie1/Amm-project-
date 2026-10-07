export type PhysicalTwinTransport='simulation'|'websocket'|'mqtt-adapter'|'vendor-adapter';
export type PhysicalTwinDeviceClass='lighting'|'stage-prop'|'education-robot'|'soft-robot-demo'|'fabrication-demo'|'accessibility-device'|'warehouse-demo'|'drone-simulator'|'iot-sensor';

export type SafetyEnvelope={
 maxCommandHz:number;maxVelocity?:number;maxForce?:number;workspace?:string;
 requiresHumanEnable:boolean;emergencyStop:boolean;allowedActions:string[];
};
export type PhysicalTwinDevice={
 id:string;label:string;class:PhysicalTwinDeviceClass;transport:PhysicalTwinTransport;
 mode:'simulation-only'|'approved-hardware';safety:SafetyEnvelope;
 telemetry:string[];versePermissions:string[];
};

export const PHYSICAL_TWIN_GENERATIONS=[
 {id:'gen1',label:'Phone AR',inputs:['touch','voice','camera pose'],outputs:['AR stage','virtual props','digital twin telemetry'],hardware:'simulation-only'},
 {id:'gen2',label:'Spatial MR',inputs:['hand tracking','controller','gaze','voice','accessible switch'],outputs:['reach-in interaction','spatial portals','shared studio/stage'],hardware:'simulation-first'},
 {id:'gen3',label:'Physical Twin Gateway',inputs:['approved device telemetry'],outputs:['allowlisted device commands','digital-twin state'],hardware:'opt-in approved adapters only'}
] as const;

export const PHYSICAL_TWIN_PIPELINE=[
 'StarVerse event','identity/role permission','device allowlist','digital twin simulation',
 'safety-envelope validation','human enable when required','rate/force/workspace clamp',
 'approved adapter command','device telemetry','state reconciliation','audit log','emergency stop/rollback'
] as const;

export const PHYSICAL_TWIN_STARTERS:PhysicalTwinDevice[]=[
 {id:'holo-stage-lighting',label:'Holo Stage Lighting Twin',class:'lighting',transport:'vendor-adapter',mode:'simulation-only',safety:{maxCommandHz:10,requiresHumanEnable:true,emergencyStop:true,allowedActions:['scene','brightness','approved cue']},telemetry:['online','scene','brightness'],versePermissions:['starverse','holoverse']},
 {id:'soft-robot-flower-demo',label:'Soft Robot Flower Research Twin',class:'soft-robot-demo',transport:'vendor-adapter',mode:'simulation-only',safety:{maxCommandHz:2,requiresHumanEnable:true,emergencyStop:true,allowedActions:['open-demo','close-demo','neutral']},telemetry:['online','position','fault'],versePermissions:['starverse','holoverse','architect']},
 {id:'education-robot-demo',label:'Education Robot Twin',class:'education-robot',transport:'vendor-adapter',mode:'simulation-only',safety:{maxCommandHz:2,requiresHumanEnable:true,emergencyStop:true,allowedActions:['wave-demo','point-demo','neutral']},telemetry:['online','pose','fault'],versePermissions:['starverse','faithverse','holoverse']},
 {id:'accessibility-switch-twin',label:'Accessible Control Twin',class:'accessibility-device',transport:'vendor-adapter',mode:'simulation-only',safety:{maxCommandHz:5,requiresHumanEnable:true,emergencyStop:true,allowedActions:['activate','release']},telemetry:['online','input-state'],versePermissions:['starverse','streetverse','holoverse']}
];

export function physicalTwinCommandAllowed(device:PhysicalTwinDevice,action:string,humanEnabled:boolean){
 if(device.mode!=='approved-hardware')return {allowed:false,reason:'simulation-only device'};
 if(!device.safety.allowedActions.includes(action))return {allowed:false,reason:'action not allowlisted'};
 if(device.safety.requiresHumanEnable&&!humanEnabled)return {allowed:false,reason:'human enable required'};
 return {allowed:true,reason:'approved adapter command may proceed'};
}
