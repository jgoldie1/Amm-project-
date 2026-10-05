export const KINGDOM_WORKBOOK_IDENTITY={
 title:'The Kingdom Workbook',
 subtitle:'Where Heaven Meets Earth',
 journeySteps:66,
 recoveredThemes:['Scripture','identity','faith','stewardship','leadership','Kingdom living','family covenant','legacy'],
 privacyRule:'Journal, prayer, covenant and reflection drafts stay on this device unless a secure, explicit publish flow is used.',
} as const

export type KingdomWorkbookSection='scripture'|'identity'|'faith'|'stewardship'|'leadership'|'kingdom-living'|'family-covenant'|'legacy'
export const KINGDOM_WORKBOOK_PHASES:readonly {id:KingdomWorkbookSection;label:string;from:number;to:number;focus:string}[]=[
 {id:'scripture',label:'SCRIPTURE FOUNDATION',from:1,to:8,focus:'Reading, source-aware study, reflection and application.'},
 {id:'identity',label:'IDENTITY',from:9,to:16,focus:'Identity, purpose, responsibility and the Kingdom-versus-system framework.'},
 {id:'faith',label:'FAITH + DISCIPLINE',from:17,to:24,focus:'Faith, prayer, discipline, service and daily practice.'},
 {id:'stewardship',label:'STEWARDSHIP',from:25,to:32,focus:'Time, gifts, resources, work, money and responsible stewardship.'},
 {id:'leadership',label:'LEADERSHIP',from:33,to:40,focus:'Service leadership, wisdom, accountability and community responsibility.'},
 {id:'kingdom-living',label:'KINGDOM LIVING',from:41,to:50,focus:'Family, community, service, creation, work and building where heaven meets earth.'},
 {id:'family-covenant',label:'FAMILY COVENANT',from:51,to:58,focus:'Family values, commitments, teaching, inheritance and generational responsibility.'},
 {id:'legacy',label:'LEGACY + REMEMBRANCE',from:59,to:66,focus:'Book of Remembrance, testimony, service record, lessons learned and legacy.'},
] as const

export const KINGDOM_WORKBOOK_PROMPTS=[
 'What did I learn from today’s study?',
 'What should change in my actions because of it?',
 'Who can I serve or help today?',
 'What responsibility am I avoiding?',
 'What am I building that can bless my family or community?',
 'What should be remembered and passed to the next generation?',
] as const