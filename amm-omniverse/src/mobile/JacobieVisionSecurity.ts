export const JACOBIE_VISION_SECURITY={
 name:'Jacobie Vision Cybersecurity',
 purpose:'Defense-in-depth security program for TRYAMM Mobile, All American Mobile, agencies, families, franchises, HoloFon and the broader TRYAMM ecosystem.',
 principles:['zero trust by default','least privilege','verify identity and device continuously','privacy/data minimization','secure-by-design APIs','defense in depth','auditable actions','safe recovery','human escalation for high-risk events'],
 protect:['TRYAMM accounts','family/youth accounts','agency/dealer portals','subscriber and eSIM workflows','number-port workflows','billing and rebate ledgers','HoloFon identity','Quantum WiFi/VPN policy','network telemetry','marketplace/streaming cross-account links'],
 controls:[
  'passkeys/MFA and risk-based authentication',
  'device trust and session inventory',
  'SIM-swap and account-takeover risk signals when approved provider APIs exist',
  'port-out lock/PIN workflow when supported by carrier',
  'role-based access for family, agency, dealer, franchise and support staff',
  'server-side authorization and RLS for user-owned data',
  'secret vaulting and key rotation; no provider secrets in browser bundles',
  'encryption in transit and at rest plus post-quantum-ready crypto migration policy',
  'fraud/anomaly scoring for activations, referrals, rebates and payouts',
  'rate limiting, abuse controls and bot defenses',
  'signed/audited admin actions and immutable security-event evidence where appropriate',
  'dependency, secret, SAST/DAST and malware scanning in CI',
  'incident response, containment, recovery and customer notification playbooks',
  'backups, restore drills and business-continuity tests',
  'guardian privacy/safety controls for youth accounts',
 ],
 operations:['Security Operations dashboard','risk queue','incident case management','provider outage/fraud alerts','dealer/agency security scorecard','family security center','HoloGPT security assistant with human escalation'],
 truth:'Jacobie Vision is a security architecture and operating program; it does not claim quantum immunity or guaranteed prevention. Controls must be tested, monitored and updated against real threats.',
} as const

export const JACOBIE_VISION_PATH='PERSON → FAMILY → AGENCY → DEALER → FRANCHISE → TRYAMM MOBILE / ALL AMERICAN MOBILE → JACOBIE VISION SECURITY → MARKETPLACE → STREAMING → CREATOR ECONOMY → HOLOFON'
