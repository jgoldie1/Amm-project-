export const STARVERSE_MIXED_REALITY_EXPERIENCES=[
 {id:'reach-in-holo-stage',label:'Reach-In Holo Stage',devices:['phone-ar','spatial-headset'],actions:['grab virtual prop','place stage light','trigger approved VFX','open portal','send virtual gift'],fallbacks:['touch','voice','one-hand','switch']},
 {id:'room-64-track',label:'64-Track Studio In Your Room',devices:['phone-ar','spatial-headset'],actions:['move virtual fader','trigger pad','position holographic performer','join remote session'],fallbacks:['voice mix commands','touch mixer','switch presets']},
 {id:'director-room',label:'Mixed Reality Director Room',devices:['phone-ar','spatial-headset'],actions:['place virtual camera','block AI/NPC performer','place lighting','change virtual set','capture scene'],fallbacks:['voice director','touch timeline']},
 {id:'tabletop-streetverse',label:'Tabletop StreetVerse',devices:['phone-ar','spatial-headset'],actions:['inspect district','select building floor','place virtual vehicle','inspect NPC activity','enter full-scale portal'],fallbacks:['touch select','voice query']},
 {id:'accessible-star-coach',label:'Accessible Star Coach',devices:['phone-ar','spatial-headset'],actions:['follow visual coach','complete creator challenge','rehearse performance'],fallbacks:['seated mode','one-hand mode','voice','gaze','switch','reduced motion']},
 {id:'physical-twin-lab',label:'Physical Twin Lab',devices:['phone-ar','spatial-headset'],actions:['simulate device','inspect telemetry','request approved cue','compare physical/digital state'],fallbacks:['simulation-only','voice','touch']}
] as const;

export const STARVERSE_REACH_EXPANSION=[
 'consumer phone AR without requiring a headset',
 'spatial-computing users with hand tracking',
 'accessible creators using voice/gaze/switch/one-hand controls',
 'schools and education robotics demonstrations',
 'artists and studios using virtual production',
 'brands and venues using interactive stages',
 'research partners using simulation-first physical twins',
 'global collaborators sharing one persistent Star Passport'
] as const;
