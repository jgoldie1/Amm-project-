export type SensoryChannel='visual'|'audio'|'haptic'|'smell-cue'|'taste-cue';
export type AcousticZone='outdoor'|'indoor'|'vehicle-cabin'|'tunnel'|'club'|'restaurant'|'waterfront'|'forest';

export type SensoryEmitter={
 id:string;
 kind:'animal'|'vehicle'|'weather'|'music'|'crowd'|'food'|'environment'|'npc';
 position:[number,number,number];
 channels:SensoryChannel[];
 baseGain?:number;
 tags:string[];
};

export type VehicleAcoustics={
 vehicleId:string;
 windowsOpen:number; // 0..1
 doorsOpen:number;   // 0..1
 cabinIsolation:number; // 0..1
 engineGain:number;
 exteriorGain:number;
};

export const MULTISENSORY_WORLD_RULES=[
 '3D/SPATIAL AUDIO follows source position and listener orientation',
 'Walls/doors/windows change occlusion and low-pass filtering',
 'Vehicle windows down blend exterior traffic/weather/animal sound into cabin audio',
 'Indoor/outdoor transitions crossfade ambience and reverberation',
 'Animals emit species/behavior/location-aware sound cues',
 'Weather drives rain/wind/thunder ambience plus visual and haptic cues where supported',
 'Restaurants/food stalls may expose descriptive aroma/flavor metadata as simulated smell/taste cues',
 'Browser/device experiences must not claim physical smell or taste without compatible external hardware',
 'Accessibility provides captions, visual sound indicators, reduced sensory mode and independent channel controls',
] as const;

export const SENSORY_PIPELINE=[
 'WORLD EVENT','EMITTER','DISTANCE/DIRECTION','OCCLUSION','ZONE REVERB','VEHICLE/BUILDING APERTURE STATE',
 'DEVICE CAPABILITY','ACCESSIBILITY PROFILE','MIX','OUTPUT + CAPTION/VISUAL CUE'
] as const;

export function exteriorBlend(v:VehicleAcoustics){
 const aperture=Math.min(1,Math.max(0,(v.windowsOpen*.75)+(v.doorsOpen*.25)));
 return Math.min(1,Math.max(0,(1-v.cabinIsolation)*.35+aperture*.65));
}

export function simulatedFoodCues(input:{name:string;aroma?:string[];flavor?:string[];temperature?:string;texture?:string}){
 return {
  label:input.name,
  smellCue:input.aroma?.join(', ')||'not provided',
  tasteCue:input.flavor?.join(', ')||'not provided',
  temperature:input.temperature||'not provided',
  texture:input.texture||'not provided',
  physicalOutput:false,
 };
}
