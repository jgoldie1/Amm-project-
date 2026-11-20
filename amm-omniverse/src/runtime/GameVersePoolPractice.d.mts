export type Ball={x:number;y:number;vx:number;vy:number}
export type PoolState={schema:string;cue:Ball;target:Ball;potted:boolean;shots:number;complete:boolean;cashValue:number}
export const POOL_PRACTICE_RULES:Readonly<Record<string,string|boolean>>
export const POOL_POCKETS:readonly (readonly number[])[]
export function newPoolPractice():PoolState
export function shootPoolPractice(state:PoolState,angle?:number,power?:number):{ok:boolean;state:PoolState;error?:string;message?:string}
export function poolPracticeReceipt(state:PoolState):Record<string,unknown>
