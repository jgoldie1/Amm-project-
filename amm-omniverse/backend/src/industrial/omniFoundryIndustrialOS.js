// OmniFoundry Industrial OS
// Control-plane model for robotics, 12D manufacturing, agriculture, mobility,
// factory replication and product commercialization.
// Safety-critical physical control remains in certified local controllers;
// this module is orchestration/policy, not a flight/vehicle/industrial controller.

export const INDUSTRIAL_DIVISIONS = Object.freeze({
  robotics: ['factory', 'warehouse', 'construction', 'agriculture', 'inspection', 'service'],
  printing12D: ['industrial_parts', 'build_components', 'furniture', 'textiles', 'food'],
  agriculture: ['controlled_environment', 'hydroponics', 'aeroponics', 'aquaponics', 'fish', 'livestock_support'],
  mobility: ['ground', 'marine', 'unmanned_air', 'passenger_air_future'],
  factories: ['micro_foundry', 'terplex', 'googleplex'],
});

export const PRODUCT_GATES = Object.freeze([
  'requirements_approved',
  'hazard_analysis_complete',
  'engineering_design_complete',
  'digital_twin_validated',
  'prototype_built',
  'prototype_tests_passed',
  'bom_costed',
  'supply_chain_qualified',
  'regulatory_path_identified',
  'certification_complete_if_required',
  'pilot_production_passed',
  'quality_plan_active',
  'service_repair_plan_active',
  'human_release_approval',
]);

export const FACTORY_MODULES = Object.freeze([
  'power_microgrid',
  'water_recovery',
  'communications',
  'robotics_cells',
  '12d_printing',
  'machine_vision_qa',
  'warehouse',
  'agri_aqua',
  'training_center',
  'repair_remanufacture',
]);

export function evaluateProductReadiness(status = {}) {
  const missing = PRODUCT_GATES.filter((gate) => status[gate] !== true);
  return {
    readyForCommercialRelease: missing.length === 0,
    passed: PRODUCT_GATES.length - missing.length,
    total: PRODUCT_GATES.length,
    missing,
  };
}

export function selectFactoryModules(requested = []) {
  const valid = [...new Set(requested)].filter((x) => FACTORY_MODULES.includes(x));
  const invalid = [...new Set(requested)].filter((x) => !FACTORY_MODULES.includes(x));
  return { valid, invalid, complete: invalid.length === 0 };
}

export function buildDigitalProductPassport({ productId, manufacturer, model, firmwareVersion, certifications = [], provenanceRefs = [] }) {
  if (!productId || !manufacturer || !model) throw new Error('productId, manufacturer and model are required');
  return {
    productId,
    manufacturer,
    model,
    firmwareVersion: firmwareVersion || null,
    certifications,
    provenanceRefs,
    // Store sensitive telemetry off-chain. Anchor only approved hashes/proofs to El Saturn.
    elSaturnAnchorPolicy: 'hashes_and_authorized_proofs_only',
  };
}

export function authorizeIndustrialCommand({ safetyCritical = false, certifiedController = false, humanApproved = false }) {
  if (safetyCritical && !certifiedController) return { allowed: false, reason: 'certified_local_controller_required' };
  if (safetyCritical && !humanApproved) return { allowed: false, reason: 'human_safety_approval_required' };
  return { allowed: true, reason: 'policy_passed' };
}
