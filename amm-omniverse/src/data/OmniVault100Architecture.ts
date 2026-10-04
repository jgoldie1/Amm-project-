export type OmniVaultWorkload=
 |'hologpt-inference'
 |'world-state'
 |'digital-twin'
 |'media-render'
 |'asset-forge'
 |'stream-relay'
 |'cache'
 |'backup'
 |'cybersecurity'
 |'telemetry'
 |'manufacturing'
 |'middleverse-workforce'

export const OMNIVAULT_100_ARCHITECTURE={
 id:'omnivault-100',
 product:'OmniVault 100',
 role:'regional-core',
 status:'architecture' as const,
 truthBoundary:'OmniVault 100 is the TRYAMM regional data-center/private-cloud architecture. Software routing may target this layer before physical facilities are commissioned, but no physical capacity, power reserve, carrier cross-connect, GPU fleet or 100-hour storage capacity is marked live without verified infrastructure.',
 purpose:[
  'regional private cloud and compute',
  'AI/HoloGPT inference and orchestration',
  'StreetVerse digital-twin and world-state hosting',
  'media/rendering and asset-forge workloads',
  'secure storage, backup and recovery',
  'cybersecurity and telemetry aggregation',
  'manufacturing/OmniFoundry workloads',
  'Middleverse workforce services',
  'FON edge aggregation and failover',
 ],
 hierarchy:[
  'Holo FON / TRYAMM standalone app',
  'Pocket / tablet / workstation edge',
  'AI Cafe / Business Server Package managed edge',
  'OmniVault 100 regional core',
  'approved cloud / carrier / satellite / internet providers',
 ] as const,
 workloads:[
  'hologpt-inference','world-state','digital-twin','media-render','asset-forge','stream-relay',
  'cache','backup','cybersecurity','telemetry','manufacturing','middleverse-workforce',
 ] as readonly OmniVaultWorkload[],
 resilience:{
  dualDcBusDesign:true,
  nPlusOneConversion:true,
  upsAndGenerationDesign:true,
  storageDesignHours:100,
  redundantCoolingDesign:true,
  monitoring:true,
  isolatedTenantWorkloads:true,
  encryptedStorage:true,
  regionalFailover:true,
  edgeStoreAndForward:true,
 },
 fonIntegration:{
  edgeAggregation:true,
  worldStateSync:true,
  holoCallRelay:true,
  creatorMediaRelay:true,
  hologptRouting:true,
  quantumMemorySync:true,
  timeMachineCache:true,
  oracleCache:true,
  middleverseJobs:true,
  businessServerBackhaul:true,
  emergencyOfflineQueue:true,
  carrierAuthority:false,
  spectrumAuthority:false,
  esimAuthority:false,
 },
 revenueModel:{
  categories:[
   'managed compute',
   'private cloud',
   'secure storage and backup',
   'AI workloads',
   'rendering and digital-twin hosting',
   'monitoring and maintenance',
   'capacity reservations',
   'energy/resilience services',
   'manufacturing workloads',
   'software and infrastructure licenses',
  ],
  rule:'Revenue becomes authoritative only from contracted/funded capacity and server-verified metering; architecture alone does not create earnings.',
 },
} as const

export function omniVaultCanRun(workload:string){
 return (OMNIVAULT_100_ARCHITECTURE.workloads as readonly string[]).includes(workload)
}
