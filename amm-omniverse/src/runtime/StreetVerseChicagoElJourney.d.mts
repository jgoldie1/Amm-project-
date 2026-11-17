export type JourneyStep={id:string;title:string;instruction:string;action:string;pose:string}
export type JourneyReceipt={step:string;action:string;simulated:boolean;playerPositionAuthority:false;rigAnimationPlayed:false;serverReceiptVerified:false;eventId:string|null;creditsAwarded:0}
export type JourneyState={schema:string;characterId:string;stage:number;station:string;destination:string;doorOpen:boolean;boarded:boolean;pose:'sit'|'hold-rail'|null;trainPosition:number;exited:boolean;localSaveVerified:boolean;inventory:string[];passengerSeatId:string|null;creditsAwarded:0;paymentCreated:false;receipts:JourneyReceipt[];eventIds:string[];lastAction:string}
export const CHICAGO_EL_JOURNEY_SCHEMA:string
export const CHICAGO_EL_JOURNEY_STAGES:readonly JourneyStep[]
export function newChicagoElJourney(characterId?:string):JourneyState
export function validateChicagoElJourney(value:unknown):value is JourneyState
export function advanceChicagoElJourney(input:JourneyState,command:string,options?:{eventId?:string;pose?:'sit'|'hold-rail'}):{ok:boolean;reason:string;state:JourneyState;duplicate?:boolean}
export function saveRestoreChicagoElJourney(state:JourneyState,storage:Pick<Storage,'setItem'|'getItem'>):{ok:boolean;reason:string;state:JourneyState}
export function runChicagoElOnePushTest(storage:Pick<Storage,'setItem'|'getItem'>):{schema:string;timestamp:string;passed:boolean;steps:Array<{step:string;ok:boolean;reason:string}>;saveRestoreVerified:boolean;characterId:string;inventory:string[];poseChosen:string;receipts:JourneyReceipt[];simulatedJourney:true;actual3DCharacterVerified:false;actualTrainBoardingVerified:false;liveCTAData:false;serverSaveVerified:false;livekitVerified:false;platformCertified:false;cashFares:0;creditsAwarded:0;reason:string}
