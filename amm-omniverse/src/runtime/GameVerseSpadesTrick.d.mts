export type Card={suit:'C'|'D'|'H'|'S';rank:string}
export type Practice={schema:string;seed:number;hands:Card[][];leader:number;turn:number;plays:Array<{seat:number;card:Card}>;tricks:number[];completed:number;spadesBroken:boolean;finished:boolean;history:Array<{winner:number;cards:Array<{seat:number;card:Card}>}>;mode:string;cashValue:number}
export const SUITS:readonly string[]
export const RANKS:readonly string[]
export const SPADE_TRICK_RULES:Readonly<Record<string,string|boolean>>
export function deck():Card[]
export function deal(seed?:number):Card[][]
export function legal(hand:Card[],lead?:string,spadesBroken?:boolean):Card[]
export function newSpadesPractice(seed?:number):Practice
export function playCard(state:Practice,seat:number,card:Card):{ok:boolean;error?:string;state:Practice}
export function autoPlayToHuman(state:Practice):Practice
export function practiceReceipt(state:Practice):Record<string,unknown>
