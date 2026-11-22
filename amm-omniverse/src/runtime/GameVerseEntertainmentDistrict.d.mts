export type EntertainmentVenue={id:string;name:string;kind:string;activity:string;mission:string;dialogue:string}
export type EntertainmentDistrictState={version:1;visited:string[];lastVenue:string|null}
export type EntertainmentVisitResult={ok:boolean;state:EntertainmentDistrictState;venue:EntertainmentVenue|null;duplicate:boolean}
export const ENTERTAINMENT_DISTRICT_KEY:string
export const ENTERTAINMENT_VENUES:readonly EntertainmentVenue[]
export const ENTERTAINMENT_MONEY_RULES:Readonly<Record<string,boolean|string>>
export function safeDistrictState(value:unknown):EntertainmentDistrictState
export function visitEntertainmentVenue(state:unknown,id:string):EntertainmentVisitResult
