export type IsaiahDaypart='overnight'|'morning'|'daytime'|'prime'|'late-night'
export type IsaiahShowKind='ai-original'|'talent-show'|'music'|'comedy'|'talk'|'game-show'|'reality'|'animation'|'creator-showcase'|'movie-block'

export interface IsaiahShow{
 id:string; title:string; kind:IsaiahShowKind; daypart:IsaiahDaypart
 durationMinutes:number; original:boolean; rightsCleared:boolean
 aiAssisted:boolean; syntheticDisclosureRequired:boolean
}

export const ISAIAH_24_HOUR_CLOCK=[
 {daypart:'overnight',hours:'12a–6a',formats:['replays','creator blocks','music','animation']},
 {daypart:'morning',hours:'6a–10a',formats:['morning entertainment','music','positive creator stories']},
 {daypart:'daytime',hours:'10a–4p',formats:['talk','game shows','creator academy','auditions']},
 {daypart:'prime',hours:'4p–10p',formats:['Anyone Can Be a Star','AI originals','Holo LIVE','talent competitions','premieres']},
 {daypart:'late-night',hours:'10p–12a',formats:['comedy','cyphers','interviews','after-show']},
] as const

export const ISAIAH_REVENUE_LANES=[
 'FAST / linear advertising',
 'direct TRYAMM ad inventory',
 'sponsorships and branded segments',
 'channel subscriptions / premium ad-free tier',
 'eligible PPV premieres and live events',
 'tickets for live / Holo events',
 'viewer gifts during eligible LIVE programming',
 'music and soundtrack commerce',
 'creator merchandise',
 'show merchandise',
 'licensed format / distribution rights',
 'product placement with disclosure',
 'creator and business showcase packages',
 'replay / VOD advertising',
 'Reels discovery into commerce',
] as const

export const AI_SHOW_FACTORY=[
 'original show bible and rights record',
 'human-approved premise and episode brief',
 'script / storyboard assistance',
 'character and likeness authorization',
 'asset generation / production',
 'music and media rights check',
 'human editorial review',
 'age rating / moderation review',
 'synthetic-media disclosure when required',
 'episode master and captions',
 'schedule into linear channel',
 'derive trailers / Reels',
 'measure retention and revenue',
 'renew, revise or retire based on evidence',
] as const

export const ISAIAH_REVENUE_RULES={
 noGuaranteedIncome:true,
 noArtificialViewsOrEngagement:true,
 noMassProducedLowValueAiSpam:true,
 originalOrLicensedProgrammingRequired:true,
 humanEditorialApprovalRequired:true,
 syntheticMediaDisclosureWhenRequired:true,
 likenessConsentRequired:true,
 musicRightsRequired:true,
 youthSafeguardsRequired:true,
 adsAndSponsorshipsDisclosed:true,
 rankedTalentResultsCannotBeBought:true,
 serverVerifiedPayments:true,
 creatorSplitsDeclaredBeforePayout:true,
 refundsAndChargebacksReversible:true,
} as const

export const ISAIAH_NETWORK_FLYWHEEL=[
 'StarVerse discovers talent',
 'Anyone Can Be a Star develops talent',
 'AI-assisted studio creates original programming',
 'Isaiah AI TV schedules 24/7 channel',
 'Holo LIVE creates appointment viewing',
 'TRYAMM TV / FAST / CTV / OTT expands distribution',
 'ads / sponsors / tickets / subscriptions / commerce generate verified revenue',
 'creator and rights-holder splits post to ledger',
 'Reels and replay bring viewers back to StarVerse',
 'successful formats receive production reinvestment',
] as const
