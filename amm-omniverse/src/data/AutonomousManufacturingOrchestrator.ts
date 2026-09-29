import {physicalReleaseGate,reconcilePhysicalTwin,type FabricationReleaseEvidence,type PhysicalTwinInspection} from './DigitalPhysicalTwinController'
import type {FabricationJob,TwelveDPrinterManifest} from './TwelveDPrinterBridge'

export type ManufacturingOrderState='requested'|'engineering-review'|'costed'|'approved'|'fabricating'|'inspection'|'quarantine'|'inventory-ready'|'closed'
export interface ManufacturingOrder{
 id:string;job:FabricationJob;quantity:number;unitMaterialCostUsd:number;estimatedMachineCostUsd:number;
 customerOrInternal:'customer'|'internal';state:ManufacturingOrderState
}
export interface ManufacturingApproval{founderApproved:boolean;engineeringApproved:boolean;budgetApproved:boolean}

export function manufacturingOrderCost(o:ManufacturingOrder){
 const variable=o.quantity*o.unitMaterialCostUsd
 return{materialUsd:variable,machineUsd:o.estimatedMachineCostUsd,totalEstimatedUsd:variable+o.estimatedMachineCostUsd}
}

export function canExecuteManufacturingOrder(o:ManufacturingOrder,m:TwelveDPrinterManifest,e:FabricationReleaseEvidence,a:ManufacturingApproval){
 const release=physicalReleaseGate(m,o.job,e)
 const reasons=[...release.reasons]
 if(o.quantity<1)reasons.push('invalid-quantity')
 if(!a.engineeringApproved)reasons.push('engineering-approval')
 if(!a.budgetApproved)reasons.push('budget-approval')
 if(o.customerOrInternal==='customer'&&!a.founderApproved)reasons.push('founder-commercial-approval')
 return{allowed:reasons.length===0,reasons,cost:manufacturingOrderCost(o)}
}

export function closeInspection(o:ManufacturingOrder,i:PhysicalTwinInspection){
 const twin=reconcilePhysicalTwin(i)
 return{orderId:o.id,nextState:twin.status==='verified-physical-twin'?'inventory-ready':'quarantine',twin}
}

export const AUTONOMOUS_MANUFACTURING_ORCHESTRATOR={
 owners:{
  ceo:'Benny coordinates business priority and Founder approvals',
  cto:'Forge coordinates software/controller readiness',
  distinguished:'Apex reviews cross-stack architecture and exceptional technical risk',
  manufacturing:'Foundry owns digital-to-physical engineering workflow',
  finance:'Ledger validates budget/cost/reconciliation',
  operations:'Nova coordinates queue, inventory and fulfillment',
 },
 flow:['business/product request','engineering review','cost estimate','Founder/budget policy','simulation/release gate','fabrication','inspection','physical twin reconciliation','inventory/quarantine','commerce/fulfillment','financial reconciliation'],
 rule:'AI may coordinate and prepare work, but physical machine execution remains gated by machine safety, qualified review and explicit approvals.',
}

export const MANUFACTURING_COMMAND_CENTER=[
 'orders by state','estimated vs actual cost','machine availability','calibration/maintenance status','material inventory/lots',
 'jobs awaiting approval','jobs running/paused','inspection pass rate','quarantine/nonconformance','rework/scrap',
 'inventory-ready units','customer fulfillment status','revenue/margin by manufactured product','safety/incident evidence',
] as const
