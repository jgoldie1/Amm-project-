export const REGULATED_CARE_GATEWAY = {
  principle: 'Navigation may be open; diagnosis, treatment, prescribing, insurance advice/enrollment and PHI workflows require verified authority and privacy gates.',
  lanes: {
    navigation: { gate: 'standard-account', actions: ['find-care','benefits-education','appointment-routing','non-diagnostic-resource-navigation'] },
    clinicalCare: { gate: 'licensed-provider', actions: ['clinical-visit','diagnosis','treatment-plan'], required: ['identity','active-license','jurisdiction','scope','organization-approval','clinical-consent'] },
    prescribing: { gate: 'authorized-prescriber', required: ['active-prescriber-license','jurisdiction','scope','patient-relationship','medication-workflow','audit-log'] },
    insurance: { gate: 'licensed-agent-broker-or-approved-enrollment-partner', required: ['identity','NPN-when-applicable','state-license/LOA','Marketplace-registration-when-applicable','consumer-consent','privacy/security-agreement'] },
    phi: { gate: 'HIPAA-role-and-contract', required: ['covered-entity-or-business-associate-determination','BAA-when-required','minimum-necessary-role','encryption','audit','retention','incident-response'] }
  },
  aiRules: ['AI may educate, navigate, summarize and assist authorized professionals','AI must not impersonate a licensed clinician/agent','clinical/coverage decisions require the authorized human or approved regulated workflow','emergency symptoms route to emergency instructions rather than game/economy flows'],
  economyIsolation: ['no Holo Credit purchase required for emergency routing','no game reward changes clinical priority','no health data used for ad targeting','health ledger separated from game/creator economy'],
} as const

export const LIVING_ECONOMIC_WORLD = ['JOB','MONEY','BUSINESS','HEALTH/CARE NAVIGATION','COMMUNITY','ENTERTAINMENT','EDUCATION','CREATOR WORK','OWNERSHIP','FAMILY','WORLD MEMORY','LEGACY'] as const
