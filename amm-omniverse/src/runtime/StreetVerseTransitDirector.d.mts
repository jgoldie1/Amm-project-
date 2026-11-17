export type TransitStop={id:string;label:string;city:string;mode:string;worldStatus:string}
export type TransitLeg={ok:boolean;status?:string;simulated:boolean;from?:TransitStop;to?:TransitStop;routeType?:string;playableTransfer?:boolean;authoritativeSave?:boolean;boardingVerified?:boolean;weatherVerified?:boolean;riderPositionUnchanged?:boolean;priceMinor?:number;requires?:string[]}
export const STREETVERSE_TRANSIT_STOPS:readonly TransitStop[]
export const STREETVERSE_TRANSIT_RECOMMENDED_ROUTE:readonly string[]
export const STREETVERSE_TRANSIT_CONTRACT:Readonly<Record<string,boolean>>
export function planStreetVerseTransit(from:string,to:string):TransitLeg
export function smokeTestTransit():{schema:string;allPlansValid:boolean;legs:TransitLeg[];simulationOnly:true;actualBoardingVerified:false;actualStreamingVerified:false;saveRestoreVerified:false}
export function installStreetVerseTransitDirector():()=>void
