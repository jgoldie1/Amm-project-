export const UNIVERSITY_PROGRESS_CONTRACT = {
  path: 'ENROLL → COURSE → MODULE → ASSIGNMENT/LAB/IMMERSIVE MISSION → EVIDENCE → FACULTY/AI ASSIST → VERIFIED COMPLETION → CREDENTIAL ELIGIBILITY → ISSUANCE → OPPORTUNITY',
  studentCan: ['save module progress','submit learning evidence','link immersive/GameVerse mission evidence','view credential status','reopen progress on another device'],
  trustedOnly: ['mark evidence verified','issue or revoke credential','change program completion requirements','assert accreditation/licensure'],
  credentialTruth: 'TRYAMM records learning evidence and internal credentials. Accreditation, licensure, transfer credit, government recognition and professional eligibility require the appropriate external approvals and must never be inferred from an in-app badge.',
  worldBridge: ['Immersive Library','GameVerse','HoloArena University XR Lab','Movie Box portfolio','Marketplace/Employer opportunities'],
  accessibility: 'Accessibility accommodations are part of the learning contract and are never paywalled or counted as a lower level of completion.',
} as const
