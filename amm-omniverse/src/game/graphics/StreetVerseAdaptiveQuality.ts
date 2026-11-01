import type {GraphicsTier} from './StreetVerseNextGenGraphics';
export type AdaptiveGraphicsState={tier:GraphicsTier;slowFrames:number;fastFrames:number;cooldown:number};
export const initialAdaptiveGraphics=(tier:GraphicsTier):AdaptiveGraphicsState=>({tier,slowFrames:0,fastFrames:0,cooldown:0});
const tiers:GraphicsTier[]=['mobile','balanced','cinematic'];
/** Hysteresis avoids quality oscillation. Call only on visible, rendered frames. */
export function updateAdaptiveGraphics(state:AdaptiveGraphicsState,frameMs:number):AdaptiveGraphicsState{
 if(!Number.isFinite(frameMs)||frameMs<=0||frameMs>250)return state;
 const cooldown=Math.max(0,state.cooldown-1);
 const slow=frameMs>28;
 const fast=frameMs<14;
 const slowFrames=slow?state.slowFrames+1:Math.max(0,state.slowFrames-2);
 const fastFrames=fast?state.fastFrames+1:Math.max(0,state.fastFrames-2);
 const i=tiers.indexOf(state.tier);
 if(cooldown===0&&slowFrames>=45&&i>0)return {tier:tiers[i-1],slowFrames:0,fastFrames:0,cooldown:240};
 if(cooldown===0&&fastFrames>=480&&i<2)return {tier:tiers[i+1],slowFrames:0,fastFrames:0,cooldown:480};
 return {tier:state.tier,slowFrames,fastFrames,cooldown};
}
