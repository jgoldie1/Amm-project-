export type CivicCareer='alderperson-simulation'|'mayor-simulation'|'county-executive-simulation'|'governor-simulation'|'president-simulation'
export type JusticeCareer='court-clerk'|'bailiff'|'attorney'|'public-defender'|'prosecutor'|'judge-simulation'|'sheriff-deputy'|'correctional-officer'|'corrections-staff'|'probation-officer'
export type PublicSafetyCareer='security-officer'|'dispatcher'|'investigator'|'federal-agent-simulation'|'protective-detail-simulation'|'intelligence-agent-fiction'|'international-agent-fiction'

export const CIVIC_JUSTICE_CAREERS={
 civic:['alderperson-simulation','mayor-simulation','county-executive-simulation','governor-simulation','president-simulation'] as CivicCareer[],
 justice:['court-clerk','bailiff','attorney','public-defender','prosecutor','judge-simulation','sheriff-deputy','correctional-officer','corrections-staff','probation-officer'] as JusticeCareer[],
 safety:['security-officer','dispatcher','investigator','federal-agent-simulation','protective-detail-simulation','intelligence-agent-fiction','international-agent-fiction'] as PublicSafetyCareer[]
}

export const JUSTICE_LOCATIONS=[
 'municipal-court-simulation','county-court-simulation','state-court-simulation','federal-court-simulation',
 'county-jail-simulation','state-prison-simulation','federal-prison-simulation','reentry-center-simulation'
] as const

export const JUSTICE_GAMEPLAY_LOOPS=[
 'incident -> lawful investigation simulation -> case file -> charging decision simulation -> court -> disposition -> corrections/reentry',
 'inmate intake -> classification -> housing assignment -> programs/jobs -> visitation -> release/reentry',
 'court filing -> clerk workflow -> hearing calendar -> courtroom roles -> order/judgment simulation',
 'election/civic progression -> office simulation -> budget/policy proposal -> legislative/administrative process -> measurable city simulation effects'
] as const

export const CIVIC_JUSTICE_GUARDRAILS=[
 'All elected-office paths are neutral fictional gameplay; TRYAMM does not endorse candidates, parties or political choices.',
 'FBI, protective-service, intelligence, MIB-style and 007-style experiences are fictional simulations and do not imply government affiliation.',
 'Do not reproduce classified, sensitive, tactical, security, prison-escape, surveillance-evasion or protective-detail procedures.',
 'Courts, jail and prison gameplay must distinguish fictional simulation from real legal advice or real case outcomes.',
 'Inmates and defendants are synthetic fictional characters unless a lawful historical/public source is deliberately used.',
 'Security gameplay focuses on de-escalation, lawful reporting, access control, emergency response and public safety rather than operational wrongdoing.',
 'Real agency names, seals, uniforms, trademarks, facilities and datasets require rights/source review before production use.'
] as const
