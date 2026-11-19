import {soundEngine,type SoundKey} from '../game/audio/SoundEngine'

// Unified TRYAMM cue registry. Uses our existing synthesized game audio.
// Visual names are effect specifications, not claims of rendered cinematic assets.
// Preview/UI audio is NOT baked into exported reels or film masters.
export type OmniCueCategory='game'|'city'|'vehicle'|'weather'|'emergency'|'health'|'business'|'music'|'live'|'faith'|'education'|'cosmic'|'movie'|'reel'|'accessibility'
export type OmniVisualCue='none'|'pulse'|'spark'|'confetti'|'portal'|'warning'|'rain'|'glow'|'shockwave'|'fade'|'flash'|'title'
export type OmniCue={category:OmniCueCategory;sound:SoundKey;visual:OmniVisualCue;caption:string}
export const OMNI_MEDIA_CUES={
 'ui.confirm':{category:'accessibility',sound:'success',visual:'pulse',caption:'Action confirmed'},
 'ui.error':{category:'accessibility',sound:'error',visual:'warning',caption:'Action needs attention'},
 'game.start':{category:'game',sound:'mission_start',visual:'spark',caption:'Mission started'},
 'game.complete':{category:'game',sound:'mission_complete',visual:'confetti',caption:'Mission complete'},
 'game.reward':{category:'game',sound:'xp_gain',visual:'spark',caption:'Experience gained'},
 'city.walk':{category:'city',sound:'footstep',visual:'none',caption:'Footsteps'},
 'city.crowd':{category:'city',sound:'crowd_ambient',visual:'none',caption:'Crowd nearby'},
 'vehicle.start':{category:'vehicle',sound:'engine_start',visual:'pulse',caption:'Engine starts'},
 'vehicle.drive':{category:'vehicle',sound:'engine_rev',visual:'none',caption:'Engine revs'},
 'vehicle.collision':{category:'vehicle',sound:'metal_crunch',visual:'shockwave',caption:'Vehicle collision'},
 'weather.rain':{category:'weather',sound:'rain',visual:'rain',caption:'Rain'},
 'weather.wind':{category:'weather',sound:'wind',visual:'none',caption:'Wind'},
 'emergency.dispatch':{category:'emergency',sound:'dispatch_tone',visual:'warning',caption:'Emergency dispatch'},
 'emergency.ambulance':{category:'emergency',sound:'ambulance_siren',visual:'warning',caption:'Ambulance approaching'},
 'emergency.fire':{category:'emergency',sound:'fire_alarm',visual:'warning',caption:'Fire alarm'},
 'health.revive':{category:'health',sound:'revive',visual:'glow',caption:'Medical assistance'},
 'business.sale':{category:'business',sound:'transaction_complete',visual:'spark',caption:'Transaction confirmed'},
 'music.mic':{category:'music',sound:'mic_check',visual:'pulse',caption:'Microphone check'},
 'music.applause':{category:'music',sound:'applause',visual:'confetti',caption:'Applause'},
 'music.intro':{category:'music',sound:'level_up',visual:'title',caption:'Musical introduction cue'},
 'music.beat':{category:'music',sound:'beat_drop',visual:'pulse',caption:'Beat drop cue'},
 'music.transition':{category:'music',sound:'vinyl_scratch',visual:'fade',caption:'Music transition cue'},
 'music.performance':{category:'music',sound:'mic_check',visual:'glow',caption:'Performance mic cue'},
 'music.final':{category:'music',sound:'applause',visual:'confetti',caption:'Performance finale'},
 'live.connected':{category:'live',sound:'stream_live',visual:'pulse',caption:'Live room connected'},
 'live.gift':{category:'live',sound:'xp_gain',visual:'glow',caption:'Gift visual event'},
 'faith.blessing':{category:'faith',sound:'blessing',visual:'glow',caption:'Blessing'},
 'education.correct':{category:'education',sound:'success',visual:'spark',caption:'Correct answer'},
 'cosmic.portal':{category:'cosmic',sound:'portal_enter',visual:'portal',caption:'Cosmic portal'},
 'cosmic.blast':{category:'cosmic',sound:'explosion',visual:'shockwave',caption:'Cosmic blast'},
 'movie.scene':{category:'movie',sound:'portal_whoosh',visual:'fade',caption:'Scene transition'},
 'movie.title':{category:'movie',sound:'level_up',visual:'title',caption:'Title card'},
 'movie.action':{category:'movie',sound:'laser_hit',visual:'shockwave',caption:'Action effect'},
 'movie.suspense':{category:'movie',sound:'ghost_detect',visual:'glow',caption:'Suspense effect'},
 'movie.drama':{category:'movie',sound:'notification',visual:'fade',caption:'Dramatic transition'},
 'movie.credits':{category:'movie',sound:'mission_complete',visual:'title',caption:'End credits'},
 'reel.countdown':{category:'reel',sound:'button_click',visual:'pulse',caption:'Recording countdown'},
 'reel.record':{category:'reel',sound:'stream_live',visual:'pulse',caption:'Recording started'},
 'reel.stop':{category:'reel',sound:'notification',visual:'pulse',caption:'Recording stopped'},
 'reel.preview':{category:'reel',sound:'success',visual:'glow',caption:'Clip ready for preview'},
 'reel.save':{category:'reel',sound:'upload_complete',visual:'spark',caption:'Reel saved'},
 'reel.publish':{category:'reel',sound:'success',visual:'confetti',caption:'Reel published'},
} as const satisfies Record<string,OmniCue>
export type OmniCueId=keyof typeof OMNI_MEDIA_CUES

export function playOmniMediaCue(id:OmniCueId,{audible=true}:{audible?:boolean}={}){
 const cue=OMNI_MEDIA_CUES[id]
 if(typeof window==='undefined')return cue
 if(audible) soundEngine.play(cue.sound)
 window.dispatchEvent(new CustomEvent('tryamm:omni-media-cue',{detail:{id,category:cue.category,visual:cue.visual,caption:cue.caption,recordedIntoMedia:false}}))
 window.dispatchEvent(new CustomEvent('tryamm:audio-caption',{detail:{speaker:'SFX',text:cue.caption,key:cue.sound}}))
 return cue
}
