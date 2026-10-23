import {CARD_CATALOG, type OmniCard} from './CardCatalog'
import {startScreenToWorld,type MaterializationRequest} from '../../runtime/StreetVerseScreenToWorldXR'
/** Owner's original Omni cards become QR-linked digital collectables.
 * QR carries a public product locator only, NEVER a transferable ownership token.
 */
export const OMNI_MR_PRODUCT={id:'omni-holo-deck',title:'Omni Holographic Deck',version:1,cardCount:CARD_CATALOG.length,
 supported:['screen-preview','ar-device-when-certified','vr-headset-when-certified'],
 checkout:'server-verified-only',entitlements:'authenticated-owner-check-required',ranked:'server-authoritative'} as const
export const SCI_FI_ARENA_EQUIPMENT=[
 {id:'photon-tag-emitter',name:'Photon Tag Emitter',effect:'virtual-target-tag',realWorldWeapon:false},
 {id:'stasis-shield',name:'Stasis Shield',effect:'virtual-shield',realWorldWeapon:false},
 {id:'pulse-beacon',name:'Pulse Beacon',effect:'virtual-location-marker',realWorldWeapon:false},
 {id:'specter-scanner',name:'Specter Scanner',effect:'fictional-anomaly-scan',realWorldWeapon:false},
] as const
const ID=/^[a-z0-9][a-z0-9-]{1,79}$/
export function omniCardProductLocator(cardId:string){
 const card=CARD_CATALOG.find(c=>c.id===cardId)
 if(!card)return null
 return '/omni-holo-deck.html?card='+encodeURIComponent(card.id)
}
export function resolveOmniCardLocator(cardId:string):OmniCard|null{
 return CARD_CATALOG.find(c=>c.id===cardId)||null
}
export function createCardMaterialization(cardId:string,approvedAssetId:string,rightsCleared:boolean){
 const card=resolveOmniCardLocator(cardId)
 if(!card||!ID.test(approvedAssetId))throw Error('invalid_card_materialization')
 const request:MaterializationRequest={entityId:'omni-card-'+card.id,source:'omni-card',assetId:approvedAssetId,ownerApproved:true,rightsCleared}
 return startScreenToWorld(request)
}
export const DIGITAL_PRODUCT_SECURITY={
 qrContainsNoSecrets:true,qrDoesNotProveOwnership:true,ownershipRequiresAuthenticatedServer:true,
 antiReplayForRedemption:true,untrustedUserCardsNeedModeration:true,sourceRightsRequired:true,
 paidAccessRequiresVerifiedReceipt:true,physicalWeaponsExcluded:true,randomPaidPacksDisabled:true,
 ageControlsRequired:true,
} as const
