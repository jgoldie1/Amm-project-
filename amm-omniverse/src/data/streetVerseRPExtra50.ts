import type {RPActionEntry} from './streetVerseRPActionCatalog'

/**
 * 50 original StreetVerse action recipes. They are NOT 50 imported GLB files.
 * They can play as short procedural movements only when the actual BJ rig has
 * matching bones. A future legally sourced and retargeted GLB can replace each
 * recipe without changing the HOLO ACTIONS button or catalog ID.
 */
export type RPExtraPose='wave'|'handshake'|'hug'|'laugh'|'argue'|'sit'|'dance'|'victory'|'pray'|'mechanic'|'scan'|'radio'|'medical'|'basketball'|'pose'|'perform'|'clap'|'bow'
export type RPExtraRecipe=Readonly<{
 id:string;label:string;category:RPActionEntry['category'];purpose:RPActionEntry['purposes'][number];
 pose:RPExtraPose;strength:number;speed:number;phase:number;loopable:boolean
}>
export const STREETVERSE_RP_50_RECIPES:readonly RPExtraRecipe[]=[
 {id:"respectful-salute",label:"Respectful Salute",category:"social",purpose:"greet",pose:"radio",strength:0.92,speed:0.93,phase:0.1,loopable:false},
 {id:"peace-greeting",label:"Peace Greeting",category:"social",purpose:"greet",pose:"wave",strength:0.78,speed:0.84,phase:0.48,loopable:false},
 {id:"big-crowd-wave",label:"Big Crowd Wave",category:"social",purpose:"greet",pose:"wave",strength:1.22,speed:1.26,phase:0.22,loopable:true},
 {id:"come-here-signal",label:"Come Here Signal",category:"social",purpose:"greet",pose:"handshake",strength:1.14,speed:1.15,phase:0.84,loopable:false},
 {id:"friendly-point",label:"Friendly Point",category:"social",purpose:"greet",pose:"scan",strength:1.2,speed:0.94,phase:0.7,loopable:false},
 {id:"applause-cheer",label:"Applause Cheer",category:"social",purpose:"celebrate",pose:"clap",strength:1.01,speed:1.45,phase:0.33,loopable:true},
 {id:"fist-bump-offer",label:"Fist Bump Offer",category:"social",purpose:"greet",pose:"handshake",strength:0.94,speed:0.98,phase:0.58,loopable:false},
 {id:"high-five-offer",label:"High Five Offer",category:"social",purpose:"greet",pose:"wave",strength:1.1,speed:0.88,phase:0.32,loopable:false},
 {id:"confused-shrug",label:"Confused Shrug",category:"emotion",purpose:"react",pose:"argue",strength:0.72,speed:0.71,phase:0.28,loopable:false},
 {id:"approval-gesture",label:"Approval Gesture",category:"emotion",purpose:"react",pose:"pose",strength:0.83,speed:1.02,phase:1.12,loopable:false},
 {id:"side-step-groove",label:"Side Step Groove",category:"dance",purpose:"perform",pose:"dance",strength:0.72,speed:0.73,phase:0.1,loopable:true},
 {id:"double-bounce",label:"Double Bounce",category:"dance",purpose:"perform",pose:"dance",strength:0.91,speed:1.42,phase:0.36,loopable:true},
 {id:"club-groove",label:"Club Groove",category:"dance",purpose:"perform",pose:"dance",strength:1.14,speed:1.19,phase:0.72,loopable:true},
 {id:"shoulder-pop",label:"Shoulder Pop",category:"dance",purpose:"perform",pose:"dance",strength:0.61,speed:1.65,phase:1.2,loopable:true},
 {id:"party-rock",label:"Party Rock",category:"dance",purpose:"celebrate",pose:"dance",strength:1.26,speed:1.22,phase:0.64,loopable:true},
 {id:"slow-sway",label:"Slow Sway",category:"dance",purpose:"perform",pose:"dance",strength:0.47,speed:0.58,phase:0.34,loopable:true},
 {id:"rhythm-pulse",label:"Rhythm Pulse",category:"dance",purpose:"perform",pose:"dance",strength:0.89,speed:1.9,phase:0.82,loopable:true},
 {id:"disco-point",label:"Disco Point",category:"dance",purpose:"perform",pose:"wave",strength:1.05,speed:1.36,phase:1.52,loopable:true},
 {id:"stage-two-step",label:"Stage Two Step",category:"dance",purpose:"perform",pose:"dance",strength:0.72,speed:0.91,phase:1.7,loopable:true},
 {id:"crowd-hype",label:"Crowd Hype",category:"dance",purpose:"celebrate",pose:"victory",strength:1.16,speed:1.6,phase:0.28,loopable:true},
 {id:"electrical-panel-check",label:"Electrical Panel Check",category:"work",purpose:"work",pose:"scan",strength:0.82,speed:0.7,phase:0.32,loopable:true},
 {id:"plumbing-pipe-inspect",label:"Plumbing Pipe Inspect",category:"work",purpose:"work",pose:"mechanic",strength:0.85,speed:0.81,phase:0.98,loopable:true},
 {id:"wrench-work-cycle",label:"Wrench Work Cycle",category:"work",purpose:"work",pose:"mechanic",strength:1.18,speed:1.3,phase:0.48,loopable:true},
 {id:"toolkit-preparation",label:"Toolkit Preparation",category:"work",purpose:"work",pose:"mechanic",strength:0.72,speed:0.7,phase:1.28,loopable:false},
 {id:"construction-hand-signal",label:"Construction Hand Signal",category:"work",purpose:"work",pose:"wave",strength:0.94,speed:1.02,phase:0.94,loopable:false},
 {id:"direct-traffic",label:"Direct Traffic",category:"public-safety",purpose:"serve",pose:"scan",strength:1.21,speed:1.05,phase:0.24,loopable:true},
 {id:"perimeter-check",label:"Perimeter Check",category:"public-safety",purpose:"work",pose:"scan",strength:0.72,speed:0.72,phase:1.18,loopable:true},
 {id:"radio-check-in",label:"Radio Check In",category:"public-safety",purpose:"work",pose:"radio",strength:0.84,speed:1.08,phase:0.54,loopable:false},
 {id:"safety-briefing",label:"Safety Briefing",category:"public-safety",purpose:"serve",pose:"argue",strength:0.7,speed:0.88,phase:1.54,loopable:true},
 {id:"incident-notes",label:"Incident Notes",category:"public-safety",purpose:"work",pose:"pose",strength:0.75,speed:0.62,phase:0.73,loopable:false},
 {id:"basketball-ready",label:"Basketball Ready Stance",category:"sport",purpose:"train",pose:"basketball",strength:0.8,speed:0.84,phase:0.18,loopable:true},
 {id:"low-dribble-motion",label:"Low Dribble Motion",category:"sport",purpose:"train",pose:"basketball",strength:1.18,speed:1.37,phase:0.46,loopable:true},
 {id:"shooting-form",label:"Basketball Shooting Form",category:"sport",purpose:"train",pose:"victory",strength:0.91,speed:0.68,phase:0.74,loopable:false},
 {id:"football-huddle",label:"Football Huddle Gesture",category:"sport",purpose:"train",pose:"pray",strength:0.88,speed:0.8,phase:0.2,loopable:false},
 {id:"soccer-ready",label:"Soccer Ready Pose",category:"sport",purpose:"train",pose:"pose",strength:0.7,speed:1.03,phase:1.24,loopable:true},
 {id:"warmup-arm-swings",label:"Warmup Arm Swings",category:"sport",purpose:"train",pose:"dance",strength:0.65,speed:1.19,phase:1.9,loopable:true},
 {id:"stretch-overhead",label:"Overhead Stretch",category:"sport",purpose:"train",pose:"victory",strength:0.72,speed:0.56,phase:1.48,loopable:true},
 {id:"team-victory-cheer",label:"Team Victory Cheer",category:"sport",purpose:"celebrate",pose:"victory",strength:1.25,speed:1.42,phase:0.74,loopable:true},
 {id:"coach-direction",label:"Coach Direction Signal",category:"sport",purpose:"serve",pose:"scan",strength:1.03,speed:0.87,phase:1.1,loopable:false},
 {id:"referee-signal",label:"Referee Signal",category:"sport",purpose:"serve",pose:"victory",strength:0.82,speed:1.04,phase:0.35,loopable:false},
 {id:"stage-introduction",label:"Stage Introduction",category:"creator",purpose:"perform",pose:"perform",strength:1.08,speed:0.86,phase:0.24,loopable:false},
 {id:"microphone-soundcheck",label:"Microphone Soundcheck",category:"creator",purpose:"record",pose:"radio",strength:0.94,speed:0.75,phase:0.87,loopable:false},
 {id:"dj-audience-hype",label:"DJ Audience Hype",category:"creator",purpose:"perform",pose:"victory",strength:1.22,speed:1.25,phase:0.65,loopable:true},
 {id:"camera-framing",label:"Camera Framing Gesture",category:"creator",purpose:"record",pose:"scan",strength:0.71,speed:0.62,phase:1.37,loopable:false},
 {id:"selfie-ready",label:"Selfie Ready Pose",category:"creator",purpose:"pose",pose:"wave",strength:0.65,speed:0.63,phase:0.72,loopable:false},
 {id:"bow-to-audience",label:"Bow To Audience",category:"creator",purpose:"perform",pose:"bow",strength:0.78,speed:0.6,phase:0.42,loopable:false},
 {id:"prayer-gathering",label:"Prayer Gathering",category:"faith",purpose:"pray",pose:"pray",strength:0.88,speed:0.73,phase:0.48,loopable:true},
 {id:"grateful-response",label:"Grateful Response",category:"faith",purpose:"react",pose:"pray",strength:0.66,speed:0.91,phase:1.13,loopable:false},
 {id:"greet-congregation",label:"Greet Congregation",category:"faith",purpose:"greet",pose:"wave",strength:1.02,speed:1.1,phase:0.82,loopable:false},
 {id:"quiet-reflection",label:"Quiet Reflection",category:"faith",purpose:"pray",pose:"bow",strength:0.54,speed:0.57,phase:1.47,loopable:true},
]

export const STREETVERSE_RP_EXTRA50:readonly RPActionEntry[]=STREETVERSE_RP_50_RECIPES.map(row=>({
 id:row.id,label:row.label,category:row.category,purposes:[row.purpose],
 tags:[...row.label.toLowerCase().split(/\s+/),row.pose,row.category,row.purpose,'streetverse','original'],
 animationClip:row.id,
 gifQuery:row.label+' gesture animation',
 loopable:row.loopable,syncable:true,npcCompatible:true,playerCompatible:true,
 reelFriendly:true,liveFriendly:true,
 durationMs:row.loopable?6000:2600,
}))
export const STREETVERSE_RP_EXTRA_POSE_MAP:Readonly<Record<string,RPExtraRecipe>>=
 Object.fromEntries(STREETVERSE_RP_50_RECIPES.map(row=>[row.id,row]))
