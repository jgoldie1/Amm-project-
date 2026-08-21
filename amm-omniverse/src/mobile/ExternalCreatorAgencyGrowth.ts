export type ExternalPlatform='tiktok'|'bigo'|'twitch'|'youtube'|'instagram'|'facebook'|'kick'|'other'
export type AgencyRole='owner'|'manager'|'recruiter'|'coach'|'creator'|'moderator'|'analyst'

export const EXTERNAL_CREATOR_INVITES={
 purpose:'Let creators invite people they already know or publicly reach on other platforms into TRYAMM using trackable codes and share links without scraping or importing private platform data.',
 sources:['TikTok','BIGO LIVE','Twitch','YouTube','Instagram','Facebook','Kick','Other'],
 methods:['copy invite link','QR code','creator code','agency code','share sheet','campaign landing page'],
 attribution:'SOURCE → INVITE CODE/LINK → TRYAMM SIGNUP → CONSENT → ATTRIBUTION RECORD → CREATOR/AGENCY RELATIONSHIP → ELIGIBILITY → REWARD LEDGER',
 truth:'TRYAMM may attribute traffic from external platforms, but cannot claim another platform transferred followers, users or accounts unless an approved API/partnership and user authorization support that transfer.',
} as const

export const AGENCY_CREATION_PATH=[
 'Sign in with an eligible adult/business account',
 'Choose START AN AGENCY',
 'Create agency name, profile, markets and specialties',
 'Complete identity/business verification when required',
 'Accept agency/creator program terms',
 'Create owner and staff roles',
 'Generate agency invite code + referral links',
 'Recruit creators through permission-based outreach and public share links',
 'Creators accept invitation and choose relationship/permissions',
 'Set server-side commission/reward split rules where program terms allow',
 'Run onboarding/training/quota coaching',
 'Launch campaigns, LIVE teams, PK teams, movie/reel projects and marketplace/mobile campaigns',
 'Track performance, eligible Beans/rebates/commissions and compliance',
] as const

export const AGENCY_TOOLS={
 people:['creator roster','staff/role management','pending invites','creator application inbox','coach assignments','guardian-aware youth roster'],
 growth:['invite codes','QR links','source attribution','campaign links','conversion funnel','regional/diaspora recruiting','creator referral tree'],
 creatorSuccess:['quota coach','Bean Vault view','creator tier progress','training missions','content calendar','LIVE/PK schedule','movie/reel production board','collaboration matching'],
 business:['commission ledger','eligible rebate ledger','campaign budgets','brand/marketplace leads','mobile activation referrals','invoices/receipts','tax workflow status'],
 operations:['moderation queue','policy standing','incident/escalation log','Jacobie Vision security score','staff audit log','support cases'],
 analytics:['signups by source','activation rate','retention','creator output','LIVE hours','reel/movie performance','qualified revenue events','fraud/reversal rate'],
} as const

export const AGENCY_GROWTH_RULES=[
 'No password sharing, scraping private follower lists, automated unsolicited messaging, fake followers, fake engagement or account impersonation.',
 'External-platform names are attribution/source labels; TRYAMM does not imply endorsement or partnership without written authorization.',
 'Commission and rebate balances are created only from verified eligible events in the server-side ledger.',
 'Creators must be able to leave or change an agency relationship subject to published contract/program rules.',
 'Youth creator participation uses stricter age/guardian rules and cannot create independent adult agency contracts or unrestricted cash-out.',
 'Agency staff only receive the minimum permissions needed for their role.',
] as const

export const AGENCY_GROWTH_LOOP='INVITE FROM TIKTOK/BIGO/TWITCH/OTHER → JOIN TRYAMM → CREATE/CLAIM PROFILE → JOIN OR START AGENCY → TRAIN → QUOTA COACH → LIVE/PK → REELS/MOVIES → AUDIENCE → BEANS/REBATES → MARKETPLACE/MOBILE CAMPAIGNS → VERIFIED EARNINGS → RETENTION → INVITE NEXT CREATOR'

export function buildInviteUrl(code:string,source:ExternalPlatform='other',base='https://tryamm.online'){
 const c=encodeURIComponent(code.trim().toUpperCase())
 const s=encodeURIComponent(source)
 return `${base}/?invite=${c}&source=${s}`
}
