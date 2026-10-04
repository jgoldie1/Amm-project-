export type BackChannel='email'|'sms'|'push'|'qr-passport'|'loyalty'|'referral'|'creator-affiliate'|'customer-portal'
export type ConsentState='unknown'|'opted-in'|'opted-out'
export type BackChannelContact={id:string;businessId:string;email?:string;phone?:string;channels:Partial<Record<BackChannel,ConsentState>>;source:string;createdAt:string}
export type BackChannelCampaign={id:string;businessId:string;name:string;channels:BackChannel[];audienceCount:number;status:'draft'|'review'|'scheduled'|'sending'|'complete'|'cancelled';offer?:string}

export const BACK_CHANNEL_RULES={
 permissionBased:true,
 consentRequiredForMarketing:true,
 optOutRequired:true,
 noPurchasedSpamLists:true,
 noHiddenTracking:true,
 frequencyControls:true,
 verifiedSenderRequired:true,
} as const

export function canSendBackChannel(input:{contact:BackChannelContact;channel:BackChannel;transactional?:boolean}){
 const state=input.contact.channels[input.channel]||'unknown'
 if(input.transactional)return{allowed:state!=='opted-out',reason:state==='opted-out'?'contact_opted_out':'transactional_message_allowed_subject_to_provider_rules'}
 return{allowed:state==='opted-in',reason:state==='opted-in'?'marketing_consent_verified':'marketing_opt_in_required'}
}

export const BACK_CHANNEL_FLOW=[
 'CAPTURE LEAD','CONSENT','CUSTOMER PROFILE','SEGMENT','OFFER / MESSAGE','CHANNEL POLICY',
 'SEND / SCHEDULE','CLICK / VISIT','BOOK / BUY / JOIN','ATTRIBUTION','LOYALTY / FOLLOW-UP','OPT-OUT / PREFERENCE CENTER'
] as const

export const BACK_CHANNEL_VALUE='Owned, permission-based customer relationships that reduce dependence on third-party social algorithms and connect directly to booking, commerce, LIVE, StreetVerse and loyalty.'