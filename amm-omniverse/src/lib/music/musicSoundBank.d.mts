export const MUSIC_NOTE_NAMES:readonly string[];
export interface ChordCard{id:string;label:string;intervals:readonly number[]}
export interface BeatBank{id:string;title:string;bpm:number;description:string;steps:Record<string,readonly number[]>}
export interface MusicNote{midi:number;freq:number;name:string}
export const CHORD_CARD_TYPES:readonly ChordCard[];
export const DRUM_BANKS:readonly BeatBank[];
export function makeChordNotes(root:string,type:string,octave?:number):MusicNote[]|null;
export function getBeatPattern(id:string):BeatBank|null;
export function beatEventsForStep(pattern:BeatBank,step:number):number[];
export function clampBeatBpm(value:string|number):number;
