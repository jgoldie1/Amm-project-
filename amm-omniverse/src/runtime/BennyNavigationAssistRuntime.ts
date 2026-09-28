export type GuideStep={id:string;instruction:string;targetId?:string;intent?:string}
export function startGuidedRoute(steps:GuideStep[]){if(typeof window==='undefined')return;window.dispatchEvent(new CustomEvent('tryamm:benny-guided-route',{detail:{steps,precisionMovementRequired:false,canSkip:true,canEscape:true}}))}
export function announceGuideStep(step:GuideStep){if(typeof window==='undefined')return;window.dispatchEvent(new CustomEvent('tryamm:guide-step',{detail:{...step,outputs:['visual','caption','speech-optional','sign-when-certified']}}))}
