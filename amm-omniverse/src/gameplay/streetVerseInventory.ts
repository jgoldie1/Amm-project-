export type InventoryCategory = 'CLOTHING'|'ELECTRONICS'|'HOME'|'VEHICLE'|'CREATOR_GEAR'|'MISSION_ITEM'|'BUSINESS_GOODS'|'COLLECTIBLE'|'FOOD'|'ACCESSIBILITY'
export type InventoryLocation = 'PLAYER'|'HOME'|'VEHICLE'|'BUSINESS'|'WAREHOUSE'

export interface StreetVerseInventoryItem {
  id:string
  sku:string
  name:string
  category:InventoryCategory
  quantity:number
  location:InventoryLocation
  ownerId:string
  digitalTwinId?:string
  missionLocked?:boolean
  tradeable:boolean
  giftable:boolean
  marketplaceEligible:boolean
  physicalFulfillment?:boolean
  evidenceRefs:string[]
}

export interface InventoryTransfer {
  id:string
  itemId:string
  fromOwnerId:string
  toOwnerId:string
  quantity:number
  action:'MOVE'|'GIFT'|'TRADE_IN'|'LIST'|'SELL'|'MISSION_REWARD'
  serverVerified:boolean
}

export const STREETVERSE_INVENTORY_SURFACES=Object.freeze([
  'POCKET_INVENTORY','HOME_INVENTORY','VEHICLE_STORAGE','BUSINESS_INVENTORY','VIRTUAL_WAREHOUSE','MARKETPLACE','HOLO_CLIP_CAROUSEL'
] as const)

export const STREETVERSE_INVENTORY_POLICY=Object.freeze({
  persistentSaveRequired:true,
  serverAuthoritativeOwnership:true,
  clientMayMutateAuthoritativeInventory:false,
  duplicateClaimProtectionRequired:true,
  digitalItemPassportSupported:true,
  missionRewardsRequireServerVerification:true,
  marketplaceTransferRequiresServerVerification:true,
  physicalAndVirtualGoodsRemainDistinct:true,
  streetCreditSeparateFromRewardBalance:true,
  rewardBalanceSeparateFromPayableBalance:true,
  realMoneySettlementRequiresProvider:true,
})

export function canTransferInventory(item:StreetVerseInventoryItem,transfer:InventoryTransfer){
  if(!transfer.serverVerified||transfer.quantity<=0||transfer.quantity>item.quantity)return false
  if(transfer.action==='GIFT'&&!item.giftable)return false
  if((transfer.action==='SELL'||transfer.action==='LIST'||transfer.action==='TRADE_IN')&&!item.tradeable)return false
  if((transfer.action==='SELL'||transfer.action==='LIST')&&!item.marketplaceEligible)return false
  if(item.missionLocked&&transfer.action!=='MISSION_REWARD')return false
  return true
}
