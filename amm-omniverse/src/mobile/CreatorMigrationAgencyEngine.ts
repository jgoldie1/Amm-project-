export type SourcePlatform='TikTok'|'BIGO LIVE'|'Twitch'|'YouTube'|'Instagram'|'Facebook'|'Other'

export const CREATOR_INVITE_ENGINE={
 purpose:'Let creators, families and approved agencies invite people they know from other platforms to create their own TRYAMM account using a transparent referral code or share link.',
 sources:['TikTok','BIGO LIVE','Twitch','YouTube','Instagram','Facebook','Other'] as SourcePlatform[],
 methods:['copy invite link','QR code','share sheet','email/SMS with consent','creator bio/link-in-bio landing page','agency recruiting landing page'],
 attribution:'SOURCE PLATFORM → INVITE CODE → LANDING PAGE → SIGN UP → CONSENT → ATTRIBUTION → ELIGIBILITY → VERIFIED REWARD',
 guardrails:[
  'No scraping private contacts, follower lists or credentials from another platform.',
  'No automated unsolicited DMs, spam, impersonation or claims that another platform endorses TRYAMM.',
  'Import content only through user-authorized/exported data or approved APIs and subject to rights/terms.',
  'A referral code records attribution; it does not transfer ownership, employment status or guaranteed earnings.',
 ],
} as const

export const AGENCY_OS={
 purpose:'Give an approved TRYAMM agency the tools to recruit, onboard, coach and support creators while creators retain their own accounts and see the applicable terms.',
 tools:[
  'agency profile + verification','unique agency invite code/QR','creator applications','creator roster','roles/permissions','onboarding checklist','training academy',
  'Quota Coach dashboard','Bean milestone dashboard','LIVE/PK schedule','campaign workspace','movie/reel content calendar','analytics','creator support tickets',
  'commission/rebate ledger','family/team splits','payout eligibility status','fraud/risk alerts','contract/consent records','offboarding + attribution history',
 ],
 creatorProtections:[
  'creator sees agency relationship and program terms','creator account credentials remain private','agency cannot withdraw creator funds','server-side role authorization',
  'clear exit/offboarding workflow','no guaranteed-income claims','youth participation requires guardian and age/program controls',
 ],
} as const

export const CREATOR_PORTABILITY={
 profile:['display name','bio','links','skills/categories','languages','public portfolio links'],
 content:['user-owned/original uploads','rights-cleared media','authorized exported metadata'],
 neverImport:['passwords/session tokens','private messages without explicit lawful support','copyrighted media the user lacks rights to republish','another platform private follower data'],
}

export const AGENCY_GROWTH_LOOP='INVITE CREATOR → SIGN UP → CHOOSE INDEPENDENT / FAMILY / AGENCY → VERIFY RELATIONSHIP → ONBOARD → QUOTA COACH → CREATE/LIVE/PK/MOVIES → VERIFIED MILESTONES → BEANS/REBATES → ELIGIBLE EARNINGS → LEDGER/SPLITS → JACOBIE VISION RISK CHECK → CREATOR GROWS → CREATOR CAN BUILD OWN TEAM/AGENCY'

export const CREATOR_INDEPENDENCE_RULE='TRYAMM should compete by giving creators better tools and transparent economics, not by locking them in. A creator can remain independent or join an eligible family/agency program under published terms.'
