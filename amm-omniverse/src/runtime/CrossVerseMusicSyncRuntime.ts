import type {CrossVersePlatform} from './CrossVerseConsentRuntime';

export type MusicSyncUse =
  | 'verse-radio'
  | 'game-mission'
  | 'character-theme'
  | 'vehicle-radio'
  | 'live-performance'
  | 'reel'
  | 'advertisement'
  | 'product-placement'
  | 'ctv-program'
  | 'fast-program'
  | 'ott-program';

export interface MusicRightsParty {
  partyId:string;
  role:'master-owner'|'publisher'|'songwriter'|'artist'|'label'|'administrator';
  shareBps:number;
  payableAccountId?:string;
}

export interface MusicSyncLicense {
  licenseId:string;
  trackId:string;
  title:string;
  recordingId?:string;
  compositionId?:string;
  masterCleared:boolean;
  publishingCleared:boolean;
  platforms:CrossVersePlatform[];
  uses:MusicSyncUse[];
  territories:string[];
  startsAtIso:string;
  endsAtIso?:string;
  active:boolean;
  currency:string;
  flatFeeMinor?:number;
  perQualifiedPlayMinor?:number;
  revenueShareBps?:number;
  rightsParties:MusicRightsParty[];
}

export interface MusicSyncCue {
  cueId:string;
  licenseId:string;
  trackId:string;
  platform:CrossVersePlatform;
  use:MusicSyncUse;
  contextId:string;
  startSeconds:number;
  endSeconds?:number;
  disclosure?:string;
}

export interface MusicSyncPlayEvent {
  eventId:string;
  cueId:string;
  trackId:string;
  platform:CrossVersePlatform;
  qualified:boolean;
  secondsPlayed:number;
  grossRevenueMinor?:number;
  occurredAtIso:string;
}

export interface MusicSyncPayable {
  eventId:string;
  licenseId:string;
  trackId:string;
  partyId:string;
  currency:string;
  amountMinor:number;
  status:'pending-verification'|'verified'|'payable'|'paid'|'reversed';
}

export function musicSyncAllowed(
  license:MusicSyncLicense,
  cue:MusicSyncCue,
  territory:string,
  atIso:string,
):boolean{
  if(!license.active||!license.masterCleared||!license.publishingCleared)return false;
  if(license.licenseId!==cue.licenseId||license.trackId!==cue.trackId)return false;
  if(!license.platforms.includes(cue.platform)||!license.uses.includes(cue.use))return false;
  if(!license.territories.includes('*')&&!license.territories.includes(territory))return false;
  const at=Date.parse(atIso),start=Date.parse(license.startsAtIso),end=license.endsAtIso?Date.parse(license.endsAtIso):Infinity;
  return Number.isFinite(at)&&at>=start&&at<=end;
}

export function validateMusicRightsShares(license:MusicSyncLicense):boolean{
  const total=license.rightsParties.reduce((sum,party)=>sum+Math.max(0,party.shareBps||0),0);
  return total===10000;
}

export function calculateAuthorizedMusicSyncPayables(
  license:MusicSyncLicense,
  cue:MusicSyncCue,
  event:MusicSyncPlayEvent,
  territory:string,
):MusicSyncPayable[]{
  if(!musicSyncAllowed(license,cue,territory,event.occurredAtIso))return [];
  if(event.cueId!==cue.cueId||event.trackId!==cue.trackId||event.platform!==cue.platform)return [];
  if(!validateMusicRightsShares(license))return [];
  return calculateMusicSyncPayables(license,event);
}

export function calculateMusicSyncPayables(
  license:MusicSyncLicense,
  event:MusicSyncPlayEvent,
):MusicSyncPayable[]{
  if(!event.qualified)return [];
  const base=Math.max(0,license.perQualifiedPlayMinor||0)
    +Math.round(Math.max(0,event.grossRevenueMinor||0)*Math.max(0,license.revenueShareBps||0)/10000);
  if(base<=0)return [];
  return license.rightsParties
    .filter(p=>p.shareBps>0)
    .map(p=>({
      eventId:event.eventId,
      licenseId:license.licenseId,
      trackId:license.trackId,
      partyId:p.partyId,
      currency:license.currency,
      amountMinor:Math.round(base*p.shareBps/10000),
      status:'pending-verification' as const,
    }));
}

export const MUSIC_SYNC_SERVER_VERIFICATION_REQUIRED=true;
export const MUSIC_SYNC_REQUIRES_MASTER_AND_PUBLISHING_CLEARANCE=true;
