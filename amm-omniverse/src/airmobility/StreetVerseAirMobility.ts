export type AirObjectKind='aircraft'|'drone'|'evtol'|'flying-car'|'helicopter'
export type AirObjectSource='adsb-provider'|'remote-id-provider'|'authorized-utm'|'simulation'
export type AirObject={id:string;kind:AirObjectKind;source:AirObjectSource;lat:number;lon:number;altitudeFt:number;headingDeg:number;speedKts:number;callsign?:string;updatedAt:string;readOnly:boolean}

export const STREETVERSE_AIR_MOBILITY={
  purpose:'Overlay authorized/read-only aviation data and simulation traffic into StreetVerse so visible aircraft, drones and future eVTOL/flying-car corridors can populate the open world without controlling real aircraft.',
  layers:[
    'inbound/outbound airport traffic overlay',
    'read-only aircraft positions from authorized ADS-B provider',
    'read-only drone Remote ID/authorized UTM adapter where lawful and available',
    'simulated helicopters, drones, eVTOLs and flying cars',
    'airport/vertiport/helipad nodes',
    'geofenced no-fly/special-use display zones',
    'weather/visibility influence for simulation',
    'StreetVerse World Memory aviation events',
  ],
  hardRule:'TRYAMM does not issue real ATC clearances, command real drones, steer real aircraft, or represent game routing as regulatory authorization.',
} as const

export const AIRSPACE_PIPELINE=[
  'AUTHORIZED DATA PROVIDER',
  'NORMALIZE POSITION/ALTITUDE/HEADING/SPEED',
  'REMOVE OR REDUCE SENSITIVE DATA AS REQUIRED',
  'GEOFENCE WORLD REGION',
  'MATCH TO STREETVERSE SKY',
  'RENDER READ-ONLY LIVE OBJECT OR SIMULATION TWIN',
  'SEPARATION/VISUALIZATION ENGINE',
  'WORLD EVENT / MISSION',
  'WORLD MEMORY',
] as const

export const EVTOL_FLYING_CAR_PATHWAY={
  phases:[
    'simulation-only electric/flying-car vehicles',
    'virtual vertiports and charging pads',
    'city air corridors and altitude bands',
    'route reservation simulation',
    'conflict detection and reroute simulation',
    'fleet/operator missions and maintenance jobs',
    'future authorized provider integration for real AAM data',
  ],
  controllerRoles:[
    'StreetVerse Air Mobility Controller',
    'Vertiport Coordinator',
    'Drone Operations Dispatcher',
    'Air Mobility Safety Monitor',
    'Charging/Fleet Technician',
    'Weather/Routing Analyst',
    'Emergency Diversion Coordinator',
  ],
  controllerTruth:'These are game/training/simulation roles unless a separately authorized real aviation operation, employer, certification and regulatory program exists.',
} as const

export const AIR_MOBILITY_MISSIONS=[
  {id:'airport-rush',name:'Airport Rush',goal:'Track inbound and outbound simulated/live-read-only traffic and route player ground jobs around arrivals.'},
  {id:'drone-corridor',name:'Drone Corridor',goal:'Plan a safe simulated delivery corridor while respecting displayed geofences and Remote ID awareness.'},
  {id:'vertiport-launch',name:'Vertiport Launch',goal:'Open a virtual eVTOL vertiport, charge aircraft and coordinate simulated departures.'},
  {id:'sky-grid',name:'Sky Grid Controller',goal:'Sequence simulated flying cars/eVTOLs through city corridors without conflicts.'},
  {id:'weather-diversion',name:'Weather Diversion',goal:'Respond to simulated weather degradation and divert traffic safely.'},
  {id:'emergency-lane',name:'Emergency Lane',goal:'Clear a simulated corridor for EMS/public-safety aviation.'},
] as const

export const PROVIDER_GATES={
  aircraft:'ADS-B/API provider credentials + terms + rate limits + privacy review',
  drones:'Remote ID/UTM provider authorization + applicable FAA rules + location/privacy controls',
  evtol:'AAM provider/vertiport/operator data agreement when available',
  maps:'licensed map/airspace/geofence data',
  production:'server-side proxy, caching, telemetry, incident handling, data freshness labels',
} as const
