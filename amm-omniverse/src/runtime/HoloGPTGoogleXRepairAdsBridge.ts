/**
 * HoloGPT / AI Cafe work intake across GoogleX and Holo Ads.
 * Planning only: no API calls, model execution, ad delivery, or repairs.
 */
import {planGoogleXContext} from './GoogleXProjectContextManifest'
import {detectRepairLayer,normalizeErrorSignature} from './HoloGPTAutonomousRepairEngine'
import {HOLO_AD_PRODUCTS} from './HoloAdsRevenueRuntime'

export type TaskRequest={
 kind:'streetverse-repair'|'holo-ads-draft';
 projectApproved:boolean;authenticated:boolean;containsPrivateData:boolean;
 log?:string;productId?:string;businessId?:string;ownerApproved?:boolean;
}
export function planHoloGPTWork(request:TaskRequest){
 if(!request.authenticated||!request.projectApproved)return{ok:false,reason:'project_authorization_required',next:'stop' as const}
 if(request.containsPrivateData)return{ok:false,reason:'private_data_requires_scoped_backend',next:'stop' as const}
 if(request.kind==='streetverse-repair'){
  if(!request.log||request.log.length>5000)return{ok:false,reason:'bounded_failure_evidence_required',next:'stop' as const}
  const context=planGoogleXContext('streetverse repair',{authenticated:true,projectApproved:true,includePrivate:false,maxSources:4})
  return{ok:context.ready,reason:'repair_case_planned',next:'sandbox_red_test' as const,
   layer:detectRepairLayer(request.log),signature:normalizeErrorSignature(request.log),
   contextPaths:context.sources.map(x=>x.path),modelExecution:false,autoDeploy:false}
 }
 const product=HOLO_AD_PRODUCTS.find(x=>x.id===request.productId)
 if(!product||!request.businessId||!/^[a-z0-9_-]{1,64}$/i.test(request.businessId))return{ok:false,reason:'approved_product_and_business_required',next:'stop' as const}
 return{ok:true,reason:'draft_requires_review',next:'owner_review' as const,
  campaign:{productId:product.id,businessId:request.businessId,status:'draft',billing:'not_authorized',publicOnly:true},
  modelExecution:false,autoPublish:false}
}
export const HOLOGPT_QUANTUM_BRIDGE_POLICY=Object.freeze({
 readOnlyContext:true,privatePlayerMemoryForAds:false,adultDeviceTelemetryForAds:false,
 crossBusinessDataForAds:false,autoSpend:false,autoPublish:false,autoDeploy:false,
})
