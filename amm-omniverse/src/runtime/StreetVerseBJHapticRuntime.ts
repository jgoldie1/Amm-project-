/**
 * Optional accessibility-friendly gameplay vibration. This cannot reproduce pain.
 * Default OFF, never vibrates continuously, and uses only brief low-intensity pulses.
 */
export type BJHapticCue='minor-hit'|'major-hit'|'heartbeat'|'medical-scan'|'recovery'
export interface BJHapticDevice {vibrate?:(pattern:number|number[])=>boolean}
export function createBJHapticRuntime(device:BJHapticDevice,now:()=>number=()=>Date.now()){
  let enabled=false
  let lastPulse=-Infinity
  const patterns:Record<BJHapticCue,number|number[]>={
    'minor-hit':18,
    'major-hit':[25,80,25],
    'heartbeat':[12,90,12],
    'medical-scan':12,
    'recovery':10,
  }
  return {
    setEnabled(value:boolean){enabled=value===true;if(!enabled)try{device.vibrate?.(0)}catch{}},
    isEnabled(){return enabled},
    cue(type:BJHapticCue){
      if(!enabled||now()-lastPulse<800)return false
      if(typeof device.vibrate!=='function')return false
      lastPulse=now()
      try{return device.vibrate(patterns[type])===true}catch{return false}
    },
    dispose(){enabled=false;try{device.vibrate?.(0)}catch{}},
  }
}
