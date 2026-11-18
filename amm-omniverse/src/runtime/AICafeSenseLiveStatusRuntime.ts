import {DEFAULT_STREAM_DESTINATIONS} from './UniversalCreatorStreamBridge'
import {MULTISENSORY_WORLD_RULES,simulatedFoodCues} from '../world/MultiSensoryWorldEngine'

/** Read-only evidence surface. Do not infer broadcast readiness from an account login
 * or from code supporting a platform. Do not fabricate physical smell/taste hardware.
 */
export type ConnectionEvidence='checking'|'configured'|'unconfigured'|'unverified'|'error'
export type SenseOutput='device-supported'|'software-simulated'|'not-supported'
export type CafeSenseLiveReport={
 fiveSenses:{visual:SenseOutput;audio:SenseOutput;haptic:SenseOutput;smell:SenseOutput;taste:SenseOutput;physicalSmellTaste:false};
 livekit:{status:ConnectionEvidence;twoDeviceVerified:false};
 destinations:Array<{platform:string;label:string;connected:boolean;verifiedBroadcast:false}>;
 notes:string[];
}
export function evaluateCafeSenseLiveStatus(input:{hasCanvas:boolean;hasAudio:boolean;hasVibration:boolean;liveStatus?:unknown;requestFailed?:boolean}):CafeSenseLiveReport{
 const status=input.liveStatus&&typeof input.liveStatus==='object'?input.liveStatus as Record<string,unknown>:{}
 const config=input.requestFailed?'error':input.liveStatus===undefined?'checking':status.configured===true?'configured':'unconfigured'
 return {
  fiveSenses:{
   visual:input.hasCanvas?'device-supported':'not-supported',
   audio:input.hasAudio?'device-supported':'not-supported',
   haptic:input.hasVibration?'device-supported':'not-supported',
   smell:'software-simulated',taste:'software-simulated',physicalSmellTaste:false,
  },
  livekit:{status:config,twoDeviceVerified:false},
  destinations:DEFAULT_STREAM_DESTINATIONS.filter(d=>d.platform==='tryamm'||d.platform==='tiktok'||d.platform==='bigo').map(d=>({
   platform:d.platform,label:d.label,connected:d.platform==='tryamm'?config==='configured':false,verifiedBroadcast:false,
  })),
  notes:[
   'Five-sense scene metadata is not physical smell or taste. Haptic availability is not a hardware output test.',
   'TikTok social authorization and TikTok LIVE broadcasting are different permissions.',
   'BIGO LIVE requires verified platform permissions and an actual publishing session.',
   'LiveKit server configuration alone does not prove a successful two-device stream.',
  ]
 }
}
export function cafeFoodSenseExample(){
 return simulatedFoodCues({name:'Coffee sensory description',aroma:['roasted coffee'],flavor:['rich','slightly bitter'],temperature:'warm',texture:'smooth'})
}
export const AI_CAFE_SENSE_LIVE_POLICY={readOnly:true,realGifts:false,realBroadcastClaimWithoutProof:false,physicalSmellTaste:false,retainsPlatformNativeMonetization:true,supportsSensoryAccessibility:true,ruleCount:MULTISENSORY_WORLD_RULES.length} as const
