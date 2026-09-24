export type OneHandAction='MOVE'|'CAMERA'|'INTERACT'|'ATTACK'|'BLOCK'|'DODGE'|'JUMP'|'SPRINT'|'ENTER_VEHICLE'|'DRIVE'|'BRAKE'|'MENU'|'ABILITY'
export type OneHandMode='LEFT_HAND'|'RIGHT_HAND'|'TOUCH_ONLY'|'SINGLE_STICK'|'VOICE_ASSIST'

export type OneHandProfile={
 mode:OneHandMode
 autoCamera:boolean
 cameraSnap:boolean
 autoSprint:boolean
 autoAccelerate:boolean
 autoTarget:boolean
 contextualAction:boolean
 holdToToggle:boolean
 comboAssist:boolean
 qteAssist:boolean
 gameSpeed:number
 largeTouchTargets:boolean
 voiceCommands:boolean
}

export const DEFAULT_ONE_HAND_PROFILE:OneHandProfile={
 mode:'LEFT_HAND',autoCamera:true,cameraSnap:true,autoSprint:true,autoAccelerate:true,autoTarget:true,
 contextualAction:true,holdToToggle:true,comboAssist:true,qteAssist:true,gameSpeed:0.85,largeTouchTargets:true,voiceCommands:true,
}

export function validateOneHandProfile(p:OneHandProfile){
 if(p.gameSpeed<0.5||p.gameSpeed>1)throw new Error('one-hand game speed must be between 0.5 and 1')
 return p
}

export const ONE_HAND_GAMEPLAY_CONTRACT={
 worlds:['STREETVERSE','LIVING_WORLD','GAMESVERSE'],
 core:[
  'one-stick-or-thumb movement',
  'automatic or snap camera',
  'single contextual ACTION button',
  'tap instead of required hold',
  'toggle sprint aim block accelerate where applicable',
  'no required simultaneous buttons',
  'no required rapid button mashing',
  'combo actions may collapse to one contextual input',
  'optional auto-target and aim assist',
  'optional auto-accelerate and simplified steering',
  'mission choices use large A B C touch targets',
  'pause or slow-time for eligible single-player encounters',
  'voice shortcuts supplement but never replace touch access',
  'all essential actions are remappable',
 ],
 presets:{
  STREETVERSE:['MOVE','ACTION','COMBAT','PHONE'],
  LIVING_WORLD:['MOVE','ACTION','TALK','BUILD'],
  GAMESVERSE:['MOVE','ACTION','ABILITY','PAUSE'],
 },
} as const

export function contextualOneHandAction(context:'ON_FOOT'|'COMBAT'|'VEHICLE'|'DIALOGUE'){
 if(context==='VEHICLE')return['DRIVE','BRAKE','EXIT']
 if(context==='COMBAT')return['ATTACK','BLOCK_OR_DODGE','ABILITY']
 if(context==='DIALOGUE')return['CHOICE_A','CHOICE_B','CHOICE_C']
 return['INTERACT','JUMP_OR_CLIMB','PHONE']
}
