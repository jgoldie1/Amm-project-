export type FleetAssetType='tractor'|'straight-truck'|'box-truck'|'cargo-van'|'trailer'|'reefer-trailer'|'flatbed-trailer'
export type FleetAssetStatus='available'|'assigned'|'in-service'|'maintenance'|'out-of-service'
export type DriverStatus='available'|'driving'|'rest'|'off-duty'|'review'

export type FleetAsset={
 id:string;ownerId:string;type:FleetAssetType;label:string;vinLast4?:string;plateRef?:string;
 status:FleetAssetStatus;powertrain?:'diesel'|'gas'|'electric'|'hybrid'|'hydrogen';
 odometerMiles?:number;nextServiceMiles?:number;inspectionDueAt?:string;insuranceVerified:boolean;complianceVerified:boolean
}

export type FleetDriver={
 id:string;carrierId:string;displayName:string;status:DriverStatus;licenseClass?:string;
 endorsements:string[];medicalStatus:'unknown'|'verified'|'review';identityVerified:boolean;
 insuranceEligible:boolean;preferredLanes?:string[];homeBase?:string
}

export type FleetAssignment={
 id:string;shipmentId:string;tractorId?:string;trailerId?:string;driverId:string;
 assignedAt:string;status:'planned'|'accepted'|'dispatched'|'completed'|'cancelled';
 externalBookingConfirmed:boolean
}

export function fleetAssetReady(asset:FleetAsset){
 const blockers:string[]=[]
 if(asset.status!=='available')blockers.push('asset_not_available')
 if(!asset.insuranceVerified)blockers.push('insurance_not_verified')
 if(!asset.complianceVerified)blockers.push('compliance_not_verified')
 if(asset.inspectionDueAt&&Date.parse(asset.inspectionDueAt)<Date.now())blockers.push('inspection_due')
 if(asset.nextServiceMiles&&asset.odometerMiles&&asset.odometerMiles>=asset.nextServiceMiles)blockers.push('maintenance_due')
 return{eligible:blockers.length===0,blockers}
}

export function driverReady(driver:FleetDriver){
 const blockers:string[]=[]
 if(driver.status!=='available')blockers.push('driver_not_available')
 if(!driver.identityVerified)blockers.push('identity_not_verified')
 if(!driver.insuranceEligible)blockers.push('insurance_eligibility_not_verified')
 if(driver.medicalStatus!=='verified')blockers.push('medical_status_not_verified')
 return{eligible:blockers.length===0,blockers}
}

export const FLEET_MANAGEMENT_FLOW=[
 'ASSET REGISTER','DRIVER REGISTER','INSURANCE / COMPLIANCE CHECK','MAINTENANCE / INSPECTION',
 'LOAD MATCH','DRIVER + EQUIPMENT ASSIGNMENT','RATE / MARGIN REVIEW','DISPATCH','GPS / MILESTONE TRACKING',
 'FUEL / CHARGING / TOLLS','BOL / POD','DELIVERY','SETTLEMENT','MAINTENANCE LEARNING LOOP'
] as const