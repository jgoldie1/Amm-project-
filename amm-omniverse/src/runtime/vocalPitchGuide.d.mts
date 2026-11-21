export const CHROMATIC_NOTES:readonly string[];
export const VOCAL_SCALES:Readonly<Record<string,readonly number[]>>;
export function frequencyToMidi(frequency:number):number|null;
export function midiToFrequency(midi:number):number;
export interface PitchAdjustment{inputHz:number;inputMidi:number;noteMidi:number;note:string;targetHz:number;ratio:number;cents:number}
export function nearestScaleNote(frequency:number,key?:string,scale?:string,strength?:number):PitchAdjustment|null;
export function estimateVocalPitch(samples:Float32Array|number[],sampleRate:number):{frequency:number;confidence:number}|null;
