export type StarPerformanceReceipt={
 performanceId:string;creatorId:string;verseId:'starverse';take:number;
 capturedAt:string;durationMs:number;source:'reach-in-stage'|'live'|'studio';
 rights:'creator-owned'|'licensed-collab';collaborators:string[];
};
export type StarDistributionPlan={
 reel:boolean;longForm:boolean;languages:string[];regions:string[];
 destinations:string[];requiresCreatorApproval:boolean;
};
export const STAR_PERFORMANCE_PIPELINE=[
 'capture performance receipt','finalize recording','creator rights/provenance check',
 'Reel Composer draft','caption/transcript','translation/localization preview',
 'creator approval','publish to TRYAMM destinations','award verified Star Passport XP',
 'calculate server-authoritative eligible earnings','write ledger references',
 'measure audience response','AI coach recommends next opportunity'
] as const;
export const DEFAULT_STAR_DISTRIBUTION:StarDistributionPlan={
 reel:true,longForm:true,languages:['creator-original'],regions:['creator-approved'],
 destinations:['TRYAMM Reels','StarVerse profile','creator channel'],
 requiresCreatorApproval:true
};
export const STAR_XP_EVENTS={
 rehearsal_complete:25,audition_complete:75,first_publish:100,verified_collab:125,
 live_performance:150,challenge_complete:200,headline_event:500,mentor_session:100
} as const;
export const STAR_EARNINGS_SOURCES=[
 'eligible gifts/tips','tickets','subscriptions','sponsorship allocations',
 'creator commerce','licensed collaboration splits','challenge reward pools','studio/agency services'
] as const;
export const STAR_LEDGER_RULES=[
 'client events never directly credit payable balance',
 'server verifies payment/event before earnings credit',
 'collaboration split is immutable on finalized receipt',
 'refund/chargeback creates auditable reversal',
 'creator can inspect source performance and split',
 'publication and monetization respect age/rating/rights gates'
] as const;
