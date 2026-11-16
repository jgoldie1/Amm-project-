export interface PhysicalFormat {id:string;label:string;requiredAssets:string[]}
export interface FanMarketingStage {id:string;label:string;instruction:string}
export const PHYSICAL_RELEASE_FORMATS:readonly PhysicalFormat[];
export const FAN_MARKETING_STAGES:readonly FanMarketingStage[];
export interface DirectMusicCostInput {units:string|number;pricePerUnit:string|number;manufacturingTotal:string|number;artworkTotal:string|number;packagingPerUnit:string|number;postagePerUnit:string|number;paymentFeePercent:string|number;paymentFeeFixed:string|number;marketingTotal:string|number;royaltyPerUnit:string|number;refundReservePerUnit:string|number}
export interface DirectMusicMargin {gross:number;variablePerUnit:number;fixed:number;totalCost:number;netBeforeTax:number;breakEvenUnits:number|null;marginPercent:number|null;note:string}
export function calculateDirectMusicMargin(input:DirectMusicCostInput):DirectMusicMargin|null;
