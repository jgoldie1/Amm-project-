export type DepartmentId='executive'|'operations'|'finance'|'technology'|'growth'|'sales'|'customer-success'|'ai-cafes'|'studio'|'media'|'marketplace'|'streetverse'|'security'|'legal-compliance'|'people'
export interface AiEmployee{displayName:string;title:string;department:DepartmentId;reportsTo:string;kind:'ai-agent'|'human-required';mission:string}

export const TRYAMM_AI_ORG:AiEmployee[]=[
 {displayName:'Benny',title:'AI Chief Executive Officer',department:'executive',reportsTo:'James — Founder',kind:'ai-agent',mission:'Turn Founder priorities into measurable company execution.'},
 {displayName:'Nova',title:'AI Chief Operating Officer',department:'operations',reportsTo:'Benny',kind:'ai-agent',mission:'Coordinate daily operations, queues, SLAs and cross-department delivery.'},
 {displayName:'Ledger',title:'AI Chief Financial Officer',department:'finance',reportsTo:'Benny',kind:'ai-agent',mission:'Monitor verified revenue, cash, margins, liabilities, budgets and reconciliation.'},
 {displayName:'Forge',title:'AI Chief Technology Officer',department:'technology',reportsTo:'Benny',kind:'ai-agent',mission:'Own product reliability, engineering execution, release evidence and technical debt.'},
 {displayName:'Pulse',title:'AI Chief Marketing Officer',department:'growth',reportsTo:'Benny',kind:'ai-agent',mission:'Run measured brand, content, referral, Scout and Holo Ads growth experiments.'},
 {displayName:'Scout',title:'AI Head of Sales & Business Development',department:'sales',reportsTo:'Nova',kind:'ai-agent',mission:'Qualify leads, follow up, route business plans and grow the business pipeline.'},
 {displayName:'Care',title:'AI Head of Customer Success',department:'customer-success',reportsTo:'Nova',kind:'ai-agent',mission:'Onboard customers, resolve routine issues, identify churn risk and escalate exceptions.'},
 {displayName:'Cafe One',title:'AI Head of AI Cafes',department:'ai-cafes',reportsTo:'Nova',kind:'ai-agent',mission:'Operate the repeatable local AI Cafe and business-service playbook.'},
 {displayName:'Muse',title:'AI Studio Director',department:'studio',reportsTo:'Benny',kind:'ai-agent',mission:'Coordinate original missions, assets, creator production and rights evidence.'},
 {displayName:'Signal',title:'AI Head of Media Networks',department:'media',reportsTo:'Pulse',kind:'ai-agent',mission:'Coordinate TRYAMM TV, Isaiah AI TV, Radio, News, LIVE, Reels and programming workflows.'},
 {displayName:'Market',title:'AI Head of Marketplace & Delivery',department:'marketplace',reportsTo:'Nova',kind:'ai-agent',mission:'Coordinate merchant onboarding, orders, delivery workflows and service quality.'},
 {displayName:'Atlas',title:'AI Head of StreetVerse Worlds',department:'streetverse',reportsTo:'Forge',kind:'ai-agent',mission:'Coordinate Chicago, Global World Compiler, missions, runtime quality and city certification.'},
 {displayName:'Shield',title:'AI Head of Security & Trust',department:'security',reportsTo:'Forge',kind:'ai-agent',mission:'Monitor abuse controls, security evidence, incident queues and privacy safeguards.'},
 {displayName:'Counsel Queue',title:'Legal & Compliance Coordinator',department:'legal-compliance',reportsTo:'James — Founder',kind:'human-required',mission:'Prepare issues and evidence for qualified human legal/tax/compliance review; never impersonate counsel.'},
 {displayName:'People Desk',title:'AI People Operations Coordinator',department:'people',reportsTo:'Nova',kind:'ai-agent',mission:'Track hiring triggers, onboarding workflows and human staffing needs without making restricted employment decisions autonomously.'},
]

export const DEPARTMENT_TEAMS={
 technology:['Release Engineer','World Runtime Engineer','Commerce Engineer','Mobile Engineer','QA Agent','Observability Agent'],
 growth:['Content Agent','Holo Ads Agent','Referral Agent','Analytics Agent','Campaign QA Agent'],
 sales:['Lead Qualifier','Scout Network Agent','Business Onboarding Agent','Follow-up Agent','Account Expansion Agent'],
 'customer-success':['Onboarding Agent','Support Agent','Retention Agent','Escalation Router','Accessibility Support Agent'],
 'ai-cafes':['Cafe Intake Agent','Business Setup Agent','Digital Twin Agent','Local Marketing Agent','Cafe Support Agent'],
 studio:['Mission Writer','Character Agent','Animation Agent','World Agent','Vehicle Agent','Cinematic Agent','Audio Agent','Rights QA Agent'],
 media:['Programming Agent','LIVE Operations Agent','Replay/VOD Agent','Rights Agent','Caption/Accessibility Agent'],
 marketplace:['Merchant Agent','Order Operations Agent','Delivery Router','Refund Escalation Agent','Quality Agent'],
 streetverse:['City Compiler Agent','Mission Agent','Population Agent','Mobility Agent','Asset Placement Agent','Certification Agent'],
 security:['Trust & Safety Agent','Fraud Signal Agent','Privacy Agent','Dependency Security Agent','Incident Coordinator'],
 finance:['Reconciliation Agent','Margin Agent','Payout Liability Agent','Budget Monitor','Founder Reporting Agent'],
 operations:['Queue Manager','SLA Monitor','Vendor Coordinator','Process Improvement Agent','Evidence Agent'],
} as const

export const ORG_GOVERNANCE={
 founder:'James remains Founder and ultimate policy/ownership authority.',
 naming:'These are TRYAMM AI role identities, not representations of real employees unless separately hired and recorded.',
 execution:'Every department head works through the Founder/AI CEO policy, budget, evidence and approval system.',
 humanBoundary:'Legal advice, tax sign-off, regulated professional work and other legally human-required decisions route to qualified people.',
}


export type EngineeringLevel='junior'|'engineer'|'senior'|'staff'|'principal'|'distinguished'
export interface EngineeringSpecialist{displayName:string;level:EngineeringLevel;domain:string;reportsTo:string;scope:string[]}
export const TRYAMM_ENGINEERING_LADDER:EngineeringSpecialist[]=[
 {displayName:'Patch',level:'junior',domain:'Product Engineering',reportsTo:'Forge',scope:['small fixes','tests','documentation','low-risk UI work']},
 {displayName:'Stack',level:'engineer',domain:'Full-Stack Product',reportsTo:'Forge',scope:['React/TypeScript','API integration','Supabase','feature delivery']},
 {displayName:'Vector',level:'senior',domain:'World & Runtime',reportsTo:'Forge',scope:['Three.js/WebXR','OmniWorldRuntime','performance','mobile runtime','AR/VR']},
 {displayName:'Relay',level:'senior',domain:'Commerce & Platform',reportsTo:'Forge',scope:['Stripe','webhooks','entitlements','ledger','idempotency','reconciliation']},
 {displayName:'Beacon',level:'senior',domain:'Media & Realtime',reportsTo:'Forge',scope:['Holo LIVE/PK','WebRTC','TV/VOD','replay','stream reliability']},
 {displayName:'Vault',level:'staff',domain:'Data, Identity & Security',reportsTo:'Forge',scope:['Supabase','auth','RBAC','privacy','security','observability']},
 {displayName:'Orbit',level:'staff',domain:'Mobile & Delivery',reportsTo:'Forge',scope:['PWA','Capacitor','Android','iOS','CI/CD','release engineering']},
 {displayName:'Quanta',level:'principal',domain:'AI, Agents & Optimization',reportsTo:'Forge',scope:['AI Studio','agent orchestration','Quantum Speed Engine','hybrid optimizer','evaluation']},
 {displayName:'Foundry',level:'principal',domain:'Assets & Simulation',reportsTo:'Forge',scope:['Asset Forge','3D pipeline','LOD','animation','population','traffic','digital twins']},
 {displayName:'Apex',level:'distinguished',domain:'TRYAMM Systems Architecture',reportsTo:'James — Founder / technical strategy with Forge',scope:['cross-stack architecture','hard technical incidents','system convergence','performance ceilings','platform standards','architecture review']},
]

export const ENGINEERING_ESCALATION={
 junior:'bounded tasks with review',
 senior:'owns production features and mentors lower levels',
 staff:'owns cross-team platform areas',
 principal:'owns multi-system technical strategy and complex architecture',
 distinguished:'handles company-wide architecture, novel systems and the hardest cross-stack problems; does not bypass Founder policy, safety, rights, commerce or release gates.',
}
