export const HOLO_AD_PRODUCTS = [
  { id:'holo_banner', name:'Holo Banner', priceUsd:250, use:'Feed, marketplace or creator placement' },
  { id:'holo_popup', name:'Holo Spatial Pop-Up', priceUsd:500, use:'Interactive world or LIVE placement' },
  { id:'holo_interactive', name:'Interactive Holo Experience', priceUsd:1000, use:'Clickable or playable branded experience' },
  { id:'world_takeover', name:'World Takeover', priceUsd:2500, use:'Featured world sponsorship window' },
  { id:'sponsored_mission', name:'Sponsored Mission', priceUsd:5000, use:'Branded server-verified mission' },
  { id:'tournament_sponsor', name:'Skill Tournament Sponsor', priceUsd:10000, use:'Eligible skill tournament sponsorship' },
] as const;

export const HOLO_AD_NET_ALLOCATION = {
  rewardReservePercent:25,
  operationsPercent:50,
  growthPercent:15,
  contingencyPercent:10,
} as const;

export function allocateVerifiedAdNet(netCents:number){
  const net=Math.max(0,Math.round(netCents));
  const rewardReserveCents=Math.floor(net*.25);
  const operationsCents=Math.floor(net*.50);
  const growthCents=Math.floor(net*.15);
  const contingencyCents=net-rewardReserveCents-operationsCents-growthCents;
  return {netCents:net,rewardReserveCents,operationsCents,growthCents,contingencyCents};
}

export const PAYOUT_FUNDING_RULES = [
  'Allocate only from verified settled advertising net, never from an unverified checkout.',
  'Subtract provider fees, taxes, refunds, disputes and contractual creator liabilities before reserve funding.',
  'Keep Holo Credits closed-loop; a user credit balance is not a cash payout reserve.',
  'Sponsored mission and skill-tournament cash programs cannot activate until their restricted reserve is funded.',
  'Never fund chance-based poker payouts from this reserve.',
  'Pause new cash reward issuance automatically when restricted reserves are insufficient.',
] as const;
