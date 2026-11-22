import {FAITHVERSE_NATION_CAST} from './FaithVerseNationCastAndTree'
import {MIRACLE_SCENES} from './FaithVerseMiraclesCatalog'

export type FaithCastRequirement={
 role:string;group:string;humanoidRig:'adult'|'mixed-adult'|'youth';
 actions:readonly string[];productionGLB:string|null;skinVerified:boolean;
 animationVerified:boolean;mobileVerified:boolean;accessibilityCaptions:true
}
const COMMON=['idle','walk','turn','talk','gesture','sit'] as const
const cast:FaithCastRequirement[]=[
 {role:'Yeshua',group:'hebrew-families',humanoidRig:'adult',actions:[...COMMON,'walk_water','heal_gesture','calm_storm','food_blessing','tree_scene_solemn'],productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true},
 {role:'Peter',group:'hebrew-families',humanoidRig:'adult',actions:[...COMMON,'boat_board','fish_net','step_on_water','hand_reach'],productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true},
 {role:'disciples',group:'hebrew-families',humanoidRig:'mixed-adult',actions:[...COMMON,'boat_row','fish_net','pray'],productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true},
 {role:'Mary',group:'hebrew-families',humanoidRig:'adult',actions:[...COMMON,'greet','comfort'],productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true},
 {role:'Martha',group:'hebrew-families',humanoidRig:'adult',actions:[...COMMON,'greet','grief'],productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true},
 {role:'Lazarus',group:'hebrew-families',humanoidRig:'adult',actions:[...COMMON,'rise','walk_out'],productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true},
 {role:'Jairus',group:'hebrew-families',humanoidRig:'adult',actions:[...COMMON,'plead','comfort'],productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true},
 {role:'Hebrew crowd / families',group:'hebrew-families',humanoidRig:'mixed-adult',actions:[...COMMON,'gather','listen','share_food'],productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true},
 {role:'Roman officials and guards',group:'roman-administration',humanoidRig:'mixed-adult',actions:[...COMMON,'stand_guard','observe'],productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true}
]
for(const nation of FAITHVERSE_NATION_CAST){
 if(nation.id==='hebrew-families'||nation.id==='roman-administration')continue
 cast.push({role:nation.name,group:nation.id,humanoidRig:'mixed-adult',actions:COMMON,productionGLB:null,skinVerified:false,animationVerified:false,mobileVerified:false,accessibilityCaptions:true})
}
export const FAITHVERSE_CAST_REQUIREMENTS:readonly FaithCastRequirement[]=cast
export const FAITHVERSE_CAST_READINESS=Object.freeze({
 plannedRoleGroups:cast.length,canonicalMiracleScenes:MIRACLE_SCENES.length,
 cast3DReady:cast.every(x=>Boolean(x.productionGLB&&x.skinVerified&&x.animationVerified&&x.mobileVerified)),
 rigEvidenceVerified:false,sceneLightingVerified:false,deviceAcceptanceVerified:false,
 voiceAndLipSyncVerified:false,
 note:'A prepared cast contract is not a verified character mesh. All actual GLBs, humanoid animation, material and likeness acceptance remain gated.'
})
