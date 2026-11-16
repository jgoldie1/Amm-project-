export const SUGGESTED_DISTRIBUTION_FEE_PERCENT:number;
export const DISTRIBUTION_FEE_MAX_PERCENT:number;
export const PHYSICAL_DISTRIBUTION_POLICY:{feeBasis:string;exclusiveWithStudioPlatformShare:boolean;noDoubleFee:boolean;excludedFromFee:readonly string[];nationalScope:string;conditions:readonly string[];note:string};
export function quoteDistributionFee(input:{itemSubtotal:number;feePercent?:number;refundedSubtotal?:number;alreadyPlatformCharged?:boolean}):{netItemSubtotal:number;distributionFee:number;artistMerchantItemProceedsBeforeOtherCosts:number;feePercent:number;excluded:string[];alreadyPlatformCharged:boolean;estimated:boolean}|null;
export interface IndependentChartCategory{id:string;title:string;metric:string;eligibleFormats:string[];defaultWindowDays:number}
export const INDEPENDENT_CHART_CATEGORIES:readonly IndependentChartCategory[];
export const CHART_GOVERNANCE:{branding:string;reporting:string;antiFraud:string;privacy:string;separation:string;status:string};
export interface ChartEvent{saleId:string;artistId:string;trackId:string;timestamp:number;status:string;paymentVerified:boolean;fulfillmentVerified:boolean;rightsApproved:boolean;suspicious:boolean;artistOptIn:boolean}
export function aggregateIndependentMusicCharts(events:ChartEvent[],range:{start:number;end:number}):Array<{artistId:string;trackId:string;verifiedUnits:number}>;
