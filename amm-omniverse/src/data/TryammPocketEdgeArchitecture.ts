export type TryammEdgeNodeClass='pocket'|'tablet'|'workstation'|'cafe'|'business'|'cloud'
export type TryammEdgeWorkClass='cache-sync'|'world-state-sync'|'light-ai'|'media-thumbnail'|'asset-optimize'|'offline-reconcile'|'telemetry-aggregate'

export const TRYAMM_POCKET_EDGE_ARCHITECTURE={
  product:'TRYAMM Pocket Edge Node',
  visionName:'phone-size edge node connected to OmniVault 100 regional core',
  truthBoundary:'A phone is an edge-compute/cache/sync node, not a hyperscale data center. Heavy compute remains on workstation, cafe/business, OmniVault 100 regional-core, or approved cloud nodes.',
  infrastructureHierarchy:['pocket/tablet','workstation','cafe/business managed edge','OmniVault 100 regional core','approved cloud/provider'] as const,
  regionalCore:{
    id:'omnivault-100',
    role:'regional private-cloud/data-center tier',
    preferredWork:['hologpt-inference','world-state','digital-twin','media-render','asset-forge','stream-relay','backup','cybersecurity','telemetry','middleverse-workforce'],
    currentState:'architecture; physical capacity is not marked live until verified',
  },
  nodeClasses:{
    pocket:{
      examples:['phone','small handheld'],
      preferredWork:['cache-sync','world-state-sync','offline-reconcile','telemetry-aggregate','light-ai'],
      limits:['battery','thermal headroom','memory','mobile-network cost','background execution limits'],
    },
    tablet:{
      examples:['tablet','large mobile device'],
      preferredWork:['cache-sync','world-state-sync','media-thumbnail','light-ai','offline-reconcile'],
      limits:['battery','thermal headroom','browser/background limits'],
    },
    workstation:{
      examples:['desktop','laptop'],
      preferredWork:['light-ai','media-thumbnail','asset-optimize','world-state-sync','cache-sync'],
      limits:['local resource budget','user activity'],
    },
    cafe:{
      examples:['TRYAMM AI Cafe managed node'],
      preferredWork:['light-ai','media-thumbnail','asset-optimize','cache-sync','world-state-sync'],
      limits:['site bandwidth','managed-node trust','operator policy'],
    },
    business:{
      examples:['TRYAMM Business Server Package'],
      preferredWork:['light-ai','media-thumbnail','asset-optimize','cache-sync','world-state-sync','telemetry-aggregate'],
      limits:['business policy','tenant isolation','managed-node trust'],
    },
    cloud:{
      examples:['Vercel','Render','managed GPU/CPU providers'],
      preferredWork:['all supported server workloads'],
      limits:['provider quotas','cost','regional availability'],
    },
  },
  security:{
    leasePolicy:'same-owner or explicitly managed/trusted nodes only in v1',
    rawSecretsOnEdge:false,
    rawAuthorizationStored:false,
    sensitivePayloads:'opaque references or locally encrypted envelopes; never plaintext secrets in job metadata',
    middleWearGateway:true,
    redHatSentinel:true,
    swarmShield:true,
    audit:true,
    idempotency:true,
    deviceAttestation:'REGISTERED software trust in v1; do not claim hardware attestation',
  },
  resilience:{
    offlineFirst:true,
    contentAddressedCache:true,
    boundedParallelism:true,
    batteryAware:true,
    thermalAwareWhenPlatformExposesSignal:true,
    regionalCoreFailover:true,
    cloudFallback:true,
    safeDegradation:true,
    noSingleNodeRequired:true,
  },
  economics:{
    principle:'Use local/owned compute when safe and efficient; move heavy or sensitive workloads to managed nodes/cloud.',
    possibleFuture:'Business/cafe server packages may earn for approved managed workloads after metering, abuse controls and legal/compliance review.',
    currentState:'architecture/building; no earnings claim until metering and payout authority are production-certified',
  },
} as const
