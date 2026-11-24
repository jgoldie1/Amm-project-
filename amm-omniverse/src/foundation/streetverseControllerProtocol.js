/** Shared input envelope for virtual controls, keyboard and browser gamepads.
 * An adapter may subscribe to events; no 3D animation is promised by this protocol.
 */
export const CONTROL_EVENT='tryamm:streetverse-control-intent'
export const ACTION_EVENT='tryamm:player-local-action'
export const CONTEXTS=Object.freeze({
 street:['talk','help','drive','enter'],
 home:['cook','eat','rest','talk'],
 workplace:['work','serve','talk','help'],
 range:['aim','target','reload','holster'],
 sports:['practice','pass','shoot-ball','defend'],
 grocery:['shop','stock','checkout','deliver'],
 trucking:['load','inspect','drive','unload'],
 housing:['enter','furnish','clean','rest'],
 health:['check-in','support','call-clinician','handoff'],
 parkour:['jump','vault','climb','land'],
 rescue:['call-dispatch','assist','evacuate','handoff'],
 missions:['inspect','collect','talk','complete']
})
export const BUTTON_LABELS=Object.freeze({
 A:'INTERACT',B:'BACK',X:'SECONDARY',Y:'ACTION WHEEL',
 LB:'PREVIOUS TOOL',RB:'NEXT TOOL',LT:'AIM / BRAKE',RT:'USE / ACCELERATE',
 L3:'SPRINT',R3:'CAMERA',START:'PAUSE',SELECT:'MAP',
 UP:'D-PAD UP',DOWN:'D-PAD DOWN',LEFT:'D-PAD LEFT',RIGHT:'D-PAD RIGHT'
})
export function validContext(context){return Object.hasOwn(CONTEXTS,context)}
export function resolveAction(context,index=0){const choices=CONTEXTS[context]||[];return choices[Math.min(choices.length-1,Math.max(0,Math.trunc(index)))]||'talk'}
export function makeControlIntent(input){
 if(!input||typeof input!=='object'||!BUTTON_LABELS[input.button])throw new TypeError('Unknown controller button')
 const context=validContext(input.context)?input.context:'street'
 return Object.freeze({schema:'tryamm.controller.intent.v1',source:input.source||'touch',button:input.button,context,action:input.action||null,authoritative:false})
}
export function normalizeStick(x,y,deadzone=.18){
 const a=Math.max(-1,Math.min(1,Number(x)||0)),b=Math.max(-1,Math.min(1,Number(y)||0))
 const magnitude=Math.hypot(a,b)
 if(magnitude<deadzone)return {x:0,y:0}
 const scaled=Math.min(1,(magnitude-deadzone)/(1-deadzone))
 return {x:+(a/magnitude*scaled).toFixed(3),y:+(b/magnitude*scaled).toFixed(3)}
}
