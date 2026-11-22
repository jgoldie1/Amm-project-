export type HoloReadinessService='advertising'|'rideshare'|'delivery'|'freight'|'drone'|'payments'|'support'|'identity'|'privacy'|'accessibility'|'safety'|'analytics'
export type HoloReadinessResult={passed:number;total:number;missing:string[]}
export type HoloReadinessReport={
 schema:string;generatedAt:string;scope:string;evidenceSource:string;
 liveProviderChecksPerformed:boolean;realTransactionsPerformed:boolean;
 providerAuthorizations:number;publicLaunchReady:boolean;
 services:Array<{service:HoloReadinessService;ready:boolean;verifiedGates:number;requiredGates:number;missing:string[]}>
 warnings:string[]
}
export declare const HOLO_SERVICES:readonly HoloReadinessService[]
export declare function buildHoloReadinessReport(
 evaluate:(service:HoloReadinessService)=>HoloReadinessResult,
 at?:Date
):HoloReadinessReport
