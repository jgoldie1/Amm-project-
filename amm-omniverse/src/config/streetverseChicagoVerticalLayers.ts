export type ChicagoVerticalLayerId =
  | 'elevated-sky'
  | 'street'
  | 'lower-service'
  | 'pedway-subway'
  | 'river-deep'

export type ChicagoVerticalLayer = {
  id: ChicagoVerticalLayerId
  label: string
  order: number
  realWorldBasis: string[]
  gameplay: string[]
  mobility: string[]
  atmosphere: string[]
  transitions: string[]
  performanceTier: 'full-3d'|'hybrid'|'lightweight-compatible'
}

export const STREETVERSE_CHICAGO_VERTICAL_LAYERS: ChicagoVerticalLayer[] = [
  {
    id:'elevated-sky',
    label:"Elevated / 'L' / Rooftop Layer",
    order:5,
    realWorldBasis:['CTA elevated Loop structures','elevated stations','bridges','publicly accessible rooftop/terrace experiences where permitted'],
    gameplay:['L operator missions','station transfers','creator skyline events','rooftop venues','elevated chase/race set pieces in fictionalized spaces'],
    mobility:['CTA-style rail simulation','stairs','elevators','station platforms','pedestrian bridges'],
    atmosphere:['train rumble','wind','high-city ambience','night skyline','station announcements'],
    transitions:['station stairs','station elevators','building elevators','public bridges'],
    performanceTier:'full-3d',
  },
  {
    id:'street',
    label:'Street / Sidewalk / Storefront Layer',
    order:4,
    realWorldBasis:['surface streets','sidewalks','bus corridors','storefronts','parks','public plazas'],
    gameplay:['resident life','business ownership','rideshare','delivery','sports','creator missions','social RP','events'],
    mobility:['walking','cars','buses','bikes','powersports where lawful/game-appropriate','accessible curb routes'],
    atmosphere:['traffic','crowds','weather','storefront audio','street events'],
    transitions:['building entrances','stations','ramps','parking/service entrances','riverwalk access points'],
    performanceTier:'lightweight-compatible',
  },
  {
    id:'lower-service',
    label:'Lower Road / Service Layer',
    order:3,
    realWorldBasis:['Lower Wacker-style lower roadways','loading/service streets','parking/service circulation'],
    gameplay:['delivery logistics','rideshare shortcuts','service-business missions','vehicle missions','fictional emergency-routing scenarios'],
    mobility:['cars','delivery vehicles','service vehicles','ramps','parking connections'],
    atmosphere:['concrete reverb','vehicle echo','artificial lighting','reduced daylight','service activity'],
    transitions:['road ramps','parking ramps','building service elevators','publicly accessible vertical connectors'],
    performanceTier:'hybrid',
  },
  {
    id:'pedway-subway',
    label:'Pedway / Subway Layer',
    order:2,
    realWorldBasis:['Chicago Pedway','Red Line subway','Blue Line subway','station mezzanines and public transfer passages'],
    gameplay:['commuter missions','transit transfers','retail kiosks','winter-weather routing','creator popups','fictional investigation/puzzle missions'],
    mobility:['walking','accessible elevators','escalators','subway trains','station transfers'],
    atmosphere:['train arrival','tunnel reverb','foot traffic','indoor retail ambience','wayfinding'],
    transitions:['station stairs','elevators','escalators','Pedway-building connectors','surface entrances'],
    performanceTier:'lightweight-compatible',
  },
  {
    id:'river-deep',
    label:'River / Riverwalk / Deep Infrastructure Layer',
    order:1,
    realWorldBasis:['Chicago River','Riverwalk','bridge levels','public riverfront connections','fictionalized deep infrastructure inspired by utility/transit systems'],
    gameplay:['riverwalk creator events','water taxi/ferry-style mobility concepts','bridge events','river commerce','environmental missions','fictional deep-infrastructure story spaces'],
    mobility:['walking','river craft where implemented','elevators','ramps','bridge approaches'],
    atmosphere:['water','bridge machinery ambience','river traffic','echoing lower spaces','weather reflections'],
    transitions:['riverwalk stairs/elevators','public ramps','bridge connections','fictionalized game-only deep-access portals'],
    performanceTier:'hybrid',
  },
]

export const STREETVERSE_CHICAGO_VERTICAL_RULES = {
  model: 'five-layer-game-abstraction-not-official-city-designation',
  verticalConnectorsRequired: true,
  sameMissionCanCrossLayers: true,
  preserveAccessibilityRoute: true,
  noRestrictedAccessDirections: true,
  noLiveSurveillanceRouting: true,
  fictionalizeNonPublicInfrastructure: true,
  streamLayersByDistanceAndMission: true,
  sharedWorldState: ['time','weather','events','traffic','transit','crowds','mission-state'],
  pilotArea: 'The Loop',
} as const
