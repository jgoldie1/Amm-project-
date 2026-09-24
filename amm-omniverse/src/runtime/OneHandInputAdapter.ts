import {DEFAULT_ONE_HAND_PROFILE,type OneHandProfile} from './OneHandGameplayAccessibility'
export type Vec2={x:number;y:number}
export type WorldInputFrame={move:Vec2;look:Vec2;interact:boolean;primary:boolean;secondary:boolean;ability:boolean;jump:boolean;sprint:boolean;brake:boolean;pause:boolean}
export type OneHandTouchFrame={stick?:Vec2;actionPressed?:boolean;combatPressed?:boolean;abilityPressed?:boolean;menuPressed?:boolean;brakePressed?:boolean;context:'ON_FOOT'|'COMBAT'|'VEHICLE'|'DIALOGUE'}
const clamp=(n:number)=>Math.max(-1,Math.min(1,n))
export function adaptOneHandInput(t:OneHandTouchFrame,p:OneHandProfile=DEFAULT_ONE_HAND_PROFILE):WorldInputFrame{
 const move={x:clamp(t.stick?.x??0),y:clamp(t.stick?.y??0)};const moving=Math.abs(move.x)+Math.abs(move.y)>.08
 return{move,look:{x:0,y:0},interact:!!t.actionPressed&&t.context==='ON_FOOT',primary:!!t.combatPressed&&t.context==='COMBAT',secondary:!!t.actionPressed&&t.context==='COMBAT',ability:!!t.abilityPressed,jump:!!t.actionPressed&&t.context==='ON_FOOT',sprint:p.autoSprint&&moving&&t.context==='ON_FOOT',brake:!!t.brakePressed&&t.context==='VEHICLE',pause:!!t.menuPressed}
}
export const ONE_HAND_HUD={zones:{thumbStick:'lower-accessible-side',action:'lower-opposite',combat:'above-action',ability:'above-combat',menu:'top-reachable'},minimumTargetPx:48,dynamicLabels:true,hapticsOptional:true,simultaneousPressRequired:false,orientation:['PORTRAIT','LANDSCAPE']} as const
export const WORLD_INPUT_BRIDGE={contract:'World controllers consume WorldInputFrame, not raw keyboard/gamepad/touch events.',benefit:'StreetVerse, Living World and GamesVerse can share the same one-hand, adaptive-controller and future voice input layer.'} as const
