export type StreetVerseReconstructionAuthority='geometry'|'land-use'|'appearance'|'historical-context'
export type StreetVerseReconstructionConfidence='authoritative-public-data'|'official-reference'|'visual-reference'|'historical-reference'

export type StreetVerseReconstructionSource={
  id:string
  label:string
  authority:StreetVerseReconstructionAuthority
  confidence:StreetVerseReconstructionConfidence
  url:string
  scope:readonly string[]
  notes:string
}

export const STREETVERSE_CHICAGO_RECONSTRUCTION_SOURCES:readonly StreetVerseReconstructionSource[]=[
  {
    id:'chicago-building-footprints',
    label:'City of Chicago Building Footprints',
    authority:'geometry',
    confidence:'authoritative-public-data',
    url:'https://data.cityofchicago.org/Buildings/Chicago-Building-Footprints/ssaf-e4ub',
    scope:['building-footprints','block-massing','setbacks'],
    notes:'Use as the primary public-data authority for exterior building footprint geometry. Height, facade and interior detail require separate evidence.'
  },
  {
    id:'chicago-street-centerlines',
    label:'City of Chicago Street Center Lines',
    authority:'geometry',
    confidence:'authoritative-public-data',
    url:'https://data.cityofchicago.org/Transportation/Street-Center-Lines/6imu-meau',
    scope:['street-alignment','intersection-layout','corridor-routing'],
    notes:'Use as the primary public-data authority for street alignment. Lane count, curb geometry and temporary traffic control need separate evidence.'
  },
  {
    id:'chicago-zoning-current',
    label:'City of Chicago Zoning Districts (current)',
    authority:'land-use',
    confidence:'authoritative-public-data',
    url:'https://data.cityofchicago.org/Community-Economic-Development/Boundaries-Zoning-Districts-current-/7cve-jgbp',
    scope:['zoning','land-use-context','development-context'],
    notes:'Current zoning context only; zoning is not a substitute for surveyed building geometry or ownership/title records.'
  },
  {
    id:'roosevelt-square-current',
    label:'Roosevelt Square current development reference',
    authority:'appearance',
    confidence:'official-reference',
    url:'https://www.relatedmidwest.com/our-company/properties/roosevelt-square',
    scope:['roosevelt-square','taylor-street','contemporary-development'],
    notes:'Use for current development character and public-facing project facts; do not infer inaccessible interiors.'
  },
  {
    id:'uic-campus-reference',
    label:'University of Illinois Chicago campus visual reference',
    authority:'appearance',
    confidence:'official-reference',
    url:'https://today.uic.edu/the-best-of-uic/',
    scope:['uic','campus-architecture','public-realm'],
    notes:'Use for campus architectural language and public-space appearance, not exact private interior geometry.'
  },
  {
    id:'holy-family-reference',
    label:'Church of the Holy Family visual reference',
    authority:'appearance',
    confidence:'official-reference',
    url:'https://holyfamilychicago.org/',
    scope:['holy-family','gothic-facade','steeple'],
    notes:'Use for exterior landmark proportions and facade cues. Interior layout remains reconstructed unless separately sourced.'
  },
  {
    id:'st-ignatius-reference',
    label:'St. Ignatius College Prep public visual reference',
    authority:'appearance',
    confidence:'visual-reference',
    url:'https://openhousechicago.org/sites/site/st-ignatius-college-prep/',
    scope:['st-ignatius','historic-masonry','tower','campus-entry'],
    notes:'Use for exterior public-facing visual cues. Do not claim exact interior reconstruction without plans or verified reference material.'
  }
] as const

export const STREETVERSE_CHICAGO_PROOF_ZONE={
  id:'circle-roosevelt-taylor-uic-v8',
  label:'Circle Park → Roosevelt → Taylor → UIC',
  reconstructionMode:'public-data-grounded-game-reconstruction',
  exactDigitalTwin:false,
  exteriorGeometryAuthority:['chicago-building-footprints','chicago-street-centerlines'],
  landUseAuthority:['chicago-zoning-current'],
  appearanceReferences:['roosevelt-square-current','uic-campus-reference','holy-family-reference','st-ignatius-reference'],
  interiorPolicy:'Only model verified public interiors as measured. All other interiors are labeled reconstructed/inferred.',
  releaseRule:'No exact-digital-twin claim unless footprint, elevation and interior geometry are separately verified.'
} as const
