export const CONSTRUCT_EARN_PATHS=[
 {id:'world-builder',learn:'Cursor + Construct basics',build:'rooms, stages, storefronts, districts',sell:'approved templates, commissioned worlds, premium experiences'},
 {id:'creator-producer',learn:'StarVerse Studio + AI Editor',build:'songs, reels, shows, MR premieres',sell:'tickets, subscriptions, gifts, sponsorships, creator commerce'},
 {id:'asset-maker',learn:'World Forger schemas',build:'original props, environments, stage kits, approved avatars',sell:'licensed creator assets and template packs'},
 {id:'experience-host',learn:'LIVE + Reality Sandbox',build:'events, classes, competitions, tours',sell:'tickets, memberships, sponsor placements'},
 {id:'business-builder',learn:'Construct Business Lens',build:'virtual storefronts and interactive product experiences',sell:'setup/service packages and commerce commissions'},
 {id:'teacher',learn:'certified Construct curriculum',build:'classes and guided projects',sell:'training cohorts, school/business workshops'}
] as const;

export const CONSTRUCT_LEARN_EARN_LADDER=[
 'Learn: complete guided Cursor/Construct mission',
 'Build: finish a small publishable project',
 'Prove: pass safety, rights, accessibility and performance checks',
 'Publish: creator approves listing/experience',
 'Earn: eligible transaction/event is server verified',
 'Level up: portfolio unlocks harder commissions and teaching tracks',
 'Teach: qualified creators can mentor cohorts using the same curriculum'
] as const;

export const MONEY_GUARDRAILS=[
 'show gross price, platform/payment fees, collaborator splits and estimated creator net separately',
 'never promise earnings or guaranteed customers',
 'server verifies purchases, refunds, rewards and payable balances',
 'rights/provenance required for monetized assets',
 'paid sponsorships require disclosure',
 'minors use age-appropriate commerce and platform controls',
 'teachers cannot sell get-rich-quick claims; curriculum teaches skills, costs, risk and measurable outcomes'
] as const;
