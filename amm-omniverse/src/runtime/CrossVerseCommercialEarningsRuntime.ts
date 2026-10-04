import {
  type CommercialAttributionEvent,
  type CommercialConsentTerms,
  type CrossVerseConsentRecord,
  type CrossVersePlatform,
  commercialUseAllowed,
  calculateCommercialEarningMinor,
} from './CrossVerseConsentRuntime';

export type SponsorshipPlacementKind =
  | 'wardrobe'
  | 'vehicle'
  | 'held-product'
  | 'business-location'
  | 'mission'
  | 'live-overlay'
  | 'reel'
  | 'ctv-spot'
  | 'fast-spot'
  | 'ott-spot'
  | 'environment-signage';

export interface SponsorshipPlacement {
  placementId:string;
  campaignId:string;
  brandId:string;
  productId?:string;
  personId:string;
  characterId?:string;
  platform:CrossVersePlatform;
  kind:SponsorshipPlacementKind;
  disclosureLabel:'Sponsored'|'Paid partnership'|'Advertisement'|'Product placement';
  startsAtIso:string;
  endsAtIso?:string;
  active:boolean;
}

export interface PayableLedgerEntry {
  ledgerEntryId:string;
  personId:string;
  campaignId:string;
  placementId:string;
  eventId:string;
  currency:string;
  amountMinor:number;
  status:'pending-verification'|'verified'|'payable'|'paid'|'reversed';
  createdAtIso:string;
}

export function authorizePlacement(
  consent:CrossVerseConsentRecord,
  terms:CommercialConsentTerms,
  placement:SponsorshipPlacement,
):boolean{
  const use=placement.kind==='held-product'||placement.kind==='wardrobe'||placement.kind==='vehicle'||placement.kind==='business-location'||placement.kind==='environment-signage'
    ? 'product-placement'
    : 'sponsorship';
  return placement.active&&commercialUseAllowed(consent,terms,placement.platform,use);
}

export function createPayableLedgerEntry(
  consent:CrossVerseConsentRecord,
  terms:CommercialConsentTerms,
  placement:SponsorshipPlacement,
  event:CommercialAttributionEvent,
):PayableLedgerEntry|null{
  if(!authorizePlacement(consent,terms,placement))return null;
  if(event.placementId!==placement.placementId||event.platform!==placement.platform)return null;
  const amountMinor=calculateCommercialEarningMinor(terms,event);
  if(amountMinor<=0)return null;
  return {
    ledgerEntryId:`sponsor:${event.eventId}`,
    personId:event.personId,
    campaignId:event.campaignId,
    placementId:event.placementId,
    eventId:event.eventId,
    currency:terms.currency,
    amountMinor,
    status:'pending-verification',
    createdAtIso:event.occurredAtIso,
  };
}

export function markCommercialEventVerified(entry:PayableLedgerEntry):PayableLedgerEntry{
  if(entry.status!=='pending-verification')return entry;
  return {...entry,status:'verified'};
}

export function makeCommercialEarningPayable(entry:PayableLedgerEntry):PayableLedgerEntry{
  if(entry.status!=='verified')throw new Error('Commercial earning must be verified before becoming payable');
  return {...entry,status:'payable'};
}

export const SPONSORSHIP_DISCLOSURE_REQUIRED=true;
export const CLIENT_REPORTED_EVENTS_ARE_PAYABLE=false;
