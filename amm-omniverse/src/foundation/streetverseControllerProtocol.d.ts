export const CONTROL_EVENT:string
export const ACTION_EVENT:string
export type ControlContext='street'|'home'|'workplace'|'range'|'sports'|'grocery'|'trucking'|'housing'|'health'|'parkour'|'rescue'|'missions'
export type ControlButton='A'|'B'|'X'|'Y'|'LB'|'RB'|'LT'|'RT'|'L3'|'R3'|'START'|'SELECT'|'UP'|'DOWN'|'LEFT'|'RIGHT'
export const CONTEXTS:Readonly<Record<ControlContext,readonly string[]>>
export const BUTTON_LABELS:Readonly<Record<ControlButton,string>>
export function validContext(context:string):context is ControlContext
export function resolveAction(context:ControlContext,index?:number):string
export function makeControlIntent(input:{button:ControlButton;context:ControlContext;source?:string;action?:string|null}):Readonly<{schema:string;source:string;button:ControlButton;context:ControlContext;action:string|null;authoritative:false}>
export function normalizeStick(x:number,y:number,deadzone?:number):{x:number;y:number}
