export const SAMPLE_RIGHTS_REGISTRY = {
  submission: {
    required: ['trackId','submitterUserId','sampleStartMs','sampleEndMs','sourceType','rightsClaim','territories','evidenceRefs'],
    sourceTypes: ['original-recording','licensed-master','licensed-composition','public-domain-verified','user-upload-unknown'],
    states: ['draft','submitted','fingerprinting','possible-match','clearance-needed','cleared','rejected','disputed'],
  },
  detection: {
    methods: ['audio-fingerprint','spectral-similarity','metadata-match','human-review'],
    rule: 'Detection is a risk signal, not automatic proof of infringement or ownership.',
    outputs: ['no-signal','possible-match','strong-match','manual-review-required'],
  },
  clearance: {
    checks: ['master-rights','composition-rights','territory','term','media-uses','monetization','attribution','revenue-share'],
    blockCommercialReleaseWhen: ['clearance-needed','rejected','disputed'],
  },
  provenance: {
    preserve: ['submitted-audio-hash','fingerprint-id','evidence','review-history','clearance-document-refs','decision','reviewer','timestamp'],
  },
} as const

export const MUSIC_MONETIZATION_CONTRACT = {
  principle: 'Pay for access, tools, experiences, promotion, tickets and eligible digital goods—not for fake popularity or guaranteed chart placement.',
  revenue: [
    'creator subscription tiers',
    'optional studio/movie production tools',
    'Holo Credit digital effect/tool purchases',
    'concert/event tickets and memberships',
    'merchandise and Battle Deck/store commerce',
    'clearly labeled advertising/promotion',
    'marketplace commissions where disclosed',
    'agency services and eligible commissions',
    'venue/movie/replay packages',
  ],
  prohibited: ['pay-for-organic-chart-rank','pay-for-fake-streams','pay-for-fake-fans','undisclosed-payola','sample-clearance-bypass'],
} as const
