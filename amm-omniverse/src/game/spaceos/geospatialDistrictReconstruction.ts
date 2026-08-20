export type GeoSourceKind = 'public_map'|'licensed_satellite'|'user_photogrammetry'|'city_open_data'|'manual_blueprint'
export type InteriorPrivacy = 'public'|'authorized_private'|'procedural_only'
export type CirculationKind = 'stairs'|'elevator'|'ramp'|'escalator'|'hallway'|'doorway'

export interface GeoReferenceSource {
  id: string
  kind: GeoSourceKind
  licenseApproved: boolean
  attributionRequired: boolean
  sourceLabel: string
  captureDate?: string
}

export interface BuildingFootprint {
  id: string
  sourceIds: string[]
  polygon: Array<[number, number]>
  approximateHeightMeters: number
  floorCount?: number
  roofType?: string
  publicFacadeOnly: boolean
}

export interface InteriorCirculation {
  id: string
  kind: CirculationKind
  fromFloor: number
  toFloor: number
  accessible: boolean
  widthMeters: number
  capacity?: number
}

export interface SpaceOSBuildingTwin {
  id: string
  footprint: BuildingFootprint
  privacy: InteriorPrivacy
  floors: number
  units: Array<{
    id: string
    floor: number
    type: 'apartment'|'house'|'retail'|'office'|'studio'|'utility'|'public'
    authorizedPrivateInterior: boolean
    proceduralInterior: boolean
  }>
  circulation: InteriorCirculation[]
  glbAssetId?: string
  collisionReady: boolean
  lodReady: boolean
  navigationReady: boolean
  xrReady: boolean
}

export interface ReconstructionInput {
  footprint: BuildingFootprint
  sources: GeoReferenceSource[]
  requestedPrivacy: InteriorPrivacy
  requestedFloors?: number
  includeElevator: boolean
  includeAccessibleRoute: boolean
}

export interface ReconstructionDecision {
  allowed: boolean
  blockers: string[]
  normalizedFloors: number
  privacy: InteriorPrivacy
  requiredProof: string[]
}

export function evaluateReconstruction(input: ReconstructionInput): ReconstructionDecision {
  const blockers: string[] = []
  const sourceMap = new Map(input.sources.map(s => [s.id, s]))
  for (const sourceId of input.footprint.sourceIds) {
    const source = sourceMap.get(sourceId)
    if (!source) blockers.push(`Missing source metadata for ${sourceId}.`)
    else if (!source.licenseApproved) blockers.push(`Source ${source.sourceLabel} is not approved for reconstruction use.`)
  }
  if (input.requestedPrivacy === 'authorized_private' && input.footprint.publicFacadeOnly) {
    blockers.push('Private interior reconstruction requires owner/user authorization or user-supplied interior data.')
  }
  const normalizedFloors = Math.max(1, Math.min(200, input.requestedFloors ?? input.footprint.floorCount ?? Math.max(1, Math.round(input.footprint.approximateHeightMeters / 3.1))))
  return {
    allowed: blockers.length === 0,
    blockers,
    normalizedFloors,
    privacy: blockers.length && input.requestedPrivacy === 'authorized_private' ? 'procedural_only' : input.requestedPrivacy,
    requiredProof: [
      'source_license_or_open_data_rights',
      'footprint_geometry_validation',
      'height_floor_estimate_review',
      'no_unapproved_private_interior_reconstruction',
      'stairs_and_elevator_connectivity',
      'accessible_route_validation',
      'navigation_mesh_validation',
      'collision_validation',
      'glb_lod_material_budget',
      'mobile_render_budget',
      'xr_render_budget',
    ],
  }
}

export function buildDefaultCirculation(floors: number, includeElevator: boolean, includeAccessibleRoute: boolean): InteriorCirculation[] {
  const out: InteriorCirculation[] = []
  for (let floor = 1; floor < floors; floor++) {
    out.push({id:`stairs-${floor}-${floor+1}`,kind:'stairs',fromFloor:floor,toFloor:floor+1,accessible:false,widthMeters:1.2})
  }
  if (includeElevator && floors > 1) {
    out.push({id:'main-elevator',kind:'elevator',fromFloor:1,toFloor:floors,accessible:true,widthMeters:1.5,capacity:8})
  }
  if (includeAccessibleRoute && !includeElevator && floors > 1) {
    out.push({id:'accessible-route-required',kind:'ramp',fromFloor:1,toFloor:Math.min(2,floors),accessible:true,widthMeters:1.5})
  }
  return out
}

export const SPACEOS_DISTRICT_PIPELINE = [
  'licensed_or_open_geospatial_reference',
  'building_footprint_and_height',
  'spaceos_digital_twin',
  'procedural_or_authorized_private_interior',
  'stairs_elevator_accessible_circulation',
  'holoforge_glb_generation_or_asset_reuse',
  'collision_and_navigation_mesh',
  'lod_and_material_budget',
  'quantum_cone_lens_render_qa',
  'black_poc_skin_hair_eye_teeth_lighting_qa',
  'district_streaming',
  'world_pulse_and_character_population',
  'live_multiplayer_save_rejoin',
] as const

export const DISTRICT_01_SPACEOS_PROOF = [
  'building_exterior_matches_approved_reference_within_tolerance',
  'public_and_private_data_are_separated',
  'player_can_enter_public_building',
  'stairs_reach_expected_floors',
  'elevator_or_accessible_route_reaches_required_floors',
  'apartment_house_units_stream_without_exposing_real_private_interior',
  'glb_loads_and_lod_switches_without_visible_breakage',
  'mobile_and_xr_frame_budgets_pass',
] as const
