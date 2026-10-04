export type ElectricFleetKind='delivery-van'|'box-truck'|'straight-truck'|'tractor'|'yard-tractor'|'shuttle'|'bus'
export type ChargerType='level2'|'dc-fast'|'megawatt'|'depot'
export type ElectricFleetAsset={
 id:string;kind:ElectricFleetKind;ownerId:string;batteryKwh:number;socPercent:number;
 estimatedRangeMiles:number;payloadLb:number;status:'available'|'assigned'|'charging'|'maintenance'|'out-of-service';
 chargerTypes:ChargerType[];homeDepotId?:string;lastChargeAt?:string;nextServiceMiles?:number
}
export type ChargingStop={id:string;assetId:string;location:string;chargerType:ChargerType;targetSocPercent:number;estimatedMinutes:number;authoritative:boolean}

export function electricAssetReady(asset:ElectricFleetAsset,input:{tripMiles:number;reservePercent?:number;payloadLb?:number}){
 const blockers:string[]=[]
 const reserve=Math.max(5,input.reservePercent??15)
 const payload=Math.max(0,input.payloadLb||0)
 if(asset.status!=='available')blockers.push('vehicle_not_available')
 if(payload>asset.payloadLb)blockers.push('payload_exceeds_capacity')
 const usableRange=asset.estimatedRangeMiles*Math.max(0,(asset.socPercent-reserve)/100)
 if(input.tripMiles>usableRange)blockers.push('charging_stop_required')
 return{eligible:blockers.length===0,blockers,usableRangeMiles:Math.round(usableRange),chargingStopRequired:blockers.includes('charging_stop_required')}
}

export const ELECTRIC_FLEET_FLOW=[
 'LOAD / ROUTE','PAYLOAD CHECK','SOC / RANGE CHECK','CHARGER AVAILABILITY','CHARGING PLAN',
 'DISPATCH','ENERGY / RANGE TRACKING','DELIVERY / POD','DEPOT RETURN','CHARGE / MAINTENANCE','COST / UPTIME LEARNING'
] as const