export type PortalKind = 'car-window'|'car-door'|'house-window'|'house-door'|'office-door'|'store-door'|'elevator-door'|'garage-door'|'club-door';
export type PortalState = 'closed'|'cracked'|'half'|'open';

export type HumanSound = 'breathing'|'footstep'|'cloth'|'heartbeat'|'cough'|'sneeze'|'laugh'|'cry'|'whisper'|'talk'|'shout'|'sing'|'eat'|'drink'|'chew'|'swallow'|'yawn'|'snore';

export const PHYSICAL_AUDIO_PORTALS = {
  rule: 'Every door/window is an acoustic portal. State changes alter occlusion, reverb bleed and exterior/interior mix.',
  portals: ['car-window','car-door','house-window','house-door','office-door','store-door','elevator-door','garage-door','club-door'] as PortalKind[],
  states: ['closed','cracked','half','open'] as PortalState[],
} as const;

export const HUMAN_SOUND_SYSTEM = {
  emitters: ['breathing','footstep','cloth','heartbeat','cough','sneeze','laugh','cry','whisper','talk','shout','sing','eat','drink','chew','swallow','yawn','snore'] as HumanSound[],
  context: ['age/profile-safe voice set','surface/material','movement speed','fatigue','weather','room acoustics','distance','direction','privacy/accessibility'],
} as const;

export type ScentIngredient = { id:string; label:string; maxPercent:number; safetyRef?:string };
export type ScentRecipe = { id:string; label:string; ingredients:Array<{ingredientId:string; percent:number}>; intensity:number; durationMs:number };
export type ScentDeviceCapability = { connected:boolean; channels:number; supportedIngredientIds:string[]; emergencyStop:boolean };

export const SMELLOGIC = {
  name: 'Smellogic Scent Engine',
  purpose: 'Translate approved world aroma metadata into a bounded recipe for compatible external scent hardware.',
  safetyRule: 'Never infer that essential oils are safe to inhale. Hardware output requires an approved ingredient library, concentration/exposure limits, ventilation rules, allergy/pet/child restrictions, user opt-in and emergency stop.',
  pipeline: ['WORLD AROMA EVENT','SCENT PROFILE','DEVICE CAPABILITIES','USER OPT-IN','INGREDIENT SAFETY ALLOWLIST','RECIPE','CONCENTRATION/EXPOSURE LIMIT','DISPENSE','VENT/PURGE','AUDIT'],
} as const;

export function canDispenseScent(recipe:ScentRecipe, device:ScentDeviceCapability, approved:Set<string>){
  if(!device.connected || !device.emergencyStop) return {ok:false, reason:'Compatible device and emergency stop required'} as const;
  if(recipe.intensity < 0 || recipe.intensity > 1) return {ok:false, reason:'Intensity outside allowed range'} as const;
  const total=recipe.ingredients.reduce((sum,item)=>sum+item.percent,0);
  if(Math.abs(total-100)>0.01) return {ok:false, reason:'Recipe must total 100%'} as const;
  const unsupported=recipe.ingredients.find(item=>!approved.has(item.ingredientId)||!device.supportedIngredientIds.includes(item.ingredientId));
  if(unsupported) return {ok:false, reason:`Ingredient not approved/supported: ${unsupported.ingredientId}`} as const;
  return {ok:true, reason:'Recipe structurally eligible for device-specific safety validation'} as const;
}

export const SENSORY_WORLD_LOOP = [
  'NPC/PLAYER MOVES','HUMAN + ANIMAL + VEHICLE EMITTERS','DOOR/WINDOW PORTAL STATE','INDOOR/OUTDOOR ACOUSTICS','WEATHER + MATERIAL RESPONSE','FOOD AROMA/FLAVOR METADATA','OPTIONAL SMELLOGIC DEVICE','HAPTICS/VISUALS','ACCESSIBILITY MIX','CREATOR CAPTURE',
] as const;
