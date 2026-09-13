export type OperationalObjectType =
  | 'PLACE' | 'FACILITY' | 'AGENCY' | 'BUSINESS' | 'ASSET' | 'VEHICLE'
  | 'INFRASTRUCTURE' | 'INCIDENT' | 'HAZARD' | 'MISSION' | 'SUPPLY_NODE'
  | 'PUBLIC_ALERT' | 'DATA_SOURCE'

export type DataClassification = 'PUBLIC' | 'AUTHORIZED' | 'RESTRICTED'

export type OperationalObject = {
  id: string
  type: OperationalObjectType
  name: string
  classification: DataClassification
  sourceId: string
  updatedAt: string
  location?: { lat: number; lon: number }
  links?: Array<{ relation: string; targetId: string }>
  attributes?: Record<string, string | number | boolean | null>
}

export type OperationalAction = {
  id: string
  label: string
  requiresRole: string[]
  requiresHumanApproval: boolean
  auditRequired: boolean
  executeMode: 'SIMULATE' | 'AUTHORIZED_API'
}

export const operationalOntologyPolicy = {
  name: 'Stubbs Operational Ontology',
  purpose: 'Connect lawful data, AI recommendations and authorized operations to Planet Clone.',
  principles: [
    'SOURCE_LINEAGE_REQUIRED',
    'LEAST_PRIVILEGE_ACCESS',
    'PURPOSE_BASED_ACCESS',
    'HUMAN_APPROVAL_FOR_HIGH_IMPACT_ACTIONS',
    'AUDIT_EVERY_OPERATIONAL_ACTION',
    'DATA_MINIMIZATION_AND_EXPIRATION',
    'SIMULATION_SEPARATED_FROM_REAL_OPERATIONS',
  ],
  prohibitedCapabilities: [
    'COVERT_PERSON_TRACKING',
    'PRIVATE_COMMUNICATION_INTERCEPTION',
    'UNAUTHORIZED_CAMERA_ACCESS',
    'RESTRICTED_DATABASE_BYPASS',
    'BIOMETRIC_MASS_SURVEILLANCE',
    'AUTONOMOUS_HIGH_IMPACT_ENFORCEMENT',
  ],
} as const

export const ontologyLinks = [
  'LOCATED_AT', 'OPERATED_BY', 'SUPPLIES', 'DEPENDS_ON', 'AFFECTED_BY',
  'RESPONDS_TO', 'SERVES', 'CONNECTED_TO', 'ASSIGNED_TO', 'SOURCE_FOR',
] as const

export const publicOperationsActions: OperationalAction[] = [
  { id: 'ack-alert', label: 'Acknowledge public alert', requiresRole: ['operator'], requiresHumanApproval: false, auditRequired: true, executeMode: 'AUTHORIZED_API' },
  { id: 'simulate-evacuation', label: 'Simulate evacuation', requiresRole: ['planner','operator'], requiresHumanApproval: false, auditRequired: true, executeMode: 'SIMULATE' },
  { id: 'stage-resources', label: 'Stage response resources', requiresRole: ['operator'], requiresHumanApproval: true, auditRequired: true, executeMode: 'AUTHORIZED_API' },
  { id: 'publish-advisory', label: 'Publish approved advisory', requiresRole: ['operator','communications'], requiresHumanApproval: true, auditRequired: true, executeMode: 'AUTHORIZED_API' },
]

export function canUseOperationalObject(object: OperationalObject, grants: DataClassification[]) {
  return grants.includes(object.classification)
}

export function buildOperationalContext(objects: OperationalObject[]) {
  return {
    generatedAt: new Date().toISOString(),
    objectCount: objects.length,
    byType: objects.reduce<Record<string, number>>((acc, object) => {
      acc[object.type] = (acc[object.type] || 0) + 1
      return acc
    }, {}),
    sources: [...new Set(objects.map(object => object.sourceId))],
    objects,
  }
}
