export const AAA_PILLARS = [
  'environment-assets',
  'characters-facial-animation',
  'vehicle-physics',
  'motion-capture-animation',
  'materials-lighting',
  'vfx',
  'sound-design',
  'crowd-ai',
  'traffic-ai',
  'combat-gameplay',
  'multiplayer-netcode',
  'cinematic-direction',
  'optimization',
  'qa',
] as const;

export const COMMERCE_KPIS = [
  'gmv',
  'tryammRevenue',
  'orders',
  'suppliers',
  'rfqs',
  'openPurchaseOrders',
  'inventoryValue',
  'shipmentsInTransit',
  'customsHolds',
  'warehouseStock',
  'liveSales',
  'sellerPayableBalance',
  'refunds',
  'supplierRisk',
  'grossMargin',
  'countries',
  'tradeCorridors',
] as const;

export type CommerceKpi = (typeof COMMERCE_KPIS)[number];
export type AaaPillar = (typeof AAA_PILLARS)[number];

export type RolloutScope = 'illinois' | 'united-states' | 'world';

export interface RolloutStage {
  id: RolloutScope;
  name: string;
  gate: string;
  regions: string[];
  exitCriteria: string[];
}

export const WORLD_ROLLOUT: RolloutStage[] = [
  {
    id: 'illinois',
    name: 'Illinois First',
    gate: 'Golden Order paid pilot is verified end-to-end',
    regions: ['Chicago', 'Illinois logistics corridor', 'Illinois seller network'],
    exitCriteria: [
      'At least one verified Golden Order settles successfully',
      'Inventory and shipment state reconcile to the commerce ledger',
      'Founder dashboard exposes all required commerce KPIs',
      'StreetVerse visual state never overrides authoritative money or inventory state',
      'Performance and accessibility release gates pass',
    ],
  },
  {
    id: 'united-states',
    name: 'United States Expansion',
    gate: 'Illinois operating model is repeatable and profitable',
    regions: ['All U.S. states and territories as supported'],
    exitCriteria: [
      'Reusable state onboarding package exists',
      'Tax, logistics, inventory and seller compliance adapters are configurable by state',
      'Trade corridor KPIs aggregate by state and national view',
      'AAA world streaming profile holds target performance at expanded scale',
    ],
  },
  {
    id: 'world',
    name: 'Global Expansion',
    gate: 'U.S. multi-state operations are stable and repeatable',
    regions: ['Nigeria/Africa corridors', 'Additional countries and global trade corridors'],
    exitCriteria: [
      'Country adapters cover customs, settlement, logistics and marketplace requirements',
      'FX and cross-border payment rails reconcile with the authoritative ledger',
      'Supplier risk and corridor margin reporting are live',
      'World representation is streamed by region instead of loading the globe at full detail',
    ],
  },
];

export interface GoldenOrderSnapshot {
  id: string;
  corridor: string;
  sellerId: string;
  supplierId: string;
  status:
    | 'rfq'
    | 'quoted'
    | 'po-open'
    | 'funded'
    | 'in-production'
    | 'in-transit'
    | 'customs-hold'
    | 'warehouse-received'
    | 'live-sale'
    | 'delivered'
    | 'settled'
    | 'refunded';
  currency: string;
  gmv: number;
  tryammRevenue: number;
  grossMargin: number;
  inventoryValue: number;
  sellerPayableBalance: number;
  updatedAt: string;
}

export interface AaaReadinessScore {
  pillar: AaaPillar;
  status: 'missing' | 'foundation' | 'production-ready';
  evidence?: string[];
}

export interface CommerceFoundationState {
  rollout: RolloutScope;
  activeGoldenOrder?: GoldenOrderSnapshot;
  aaaReadiness: AaaReadinessScore[];
  kpis: Record<CommerceKpi, number>;
}

export const createEmptyCommerceFoundationState = (): CommerceFoundationState => ({
  rollout: 'illinois',
  aaaReadiness: AAA_PILLARS.map((pillar) => ({ pillar, status: 'foundation' })),
  kpis: {
    gmv: 0,
    tryammRevenue: 0,
    orders: 0,
    suppliers: 0,
    rfqs: 0,
    openPurchaseOrders: 0,
    inventoryValue: 0,
    shipmentsInTransit: 0,
    customsHolds: 0,
    warehouseStock: 0,
    liveSales: 0,
    sellerPayableBalance: 0,
    refunds: 0,
    supplierRisk: 0,
    grossMargin: 0,
    countries: 0,
    tradeCorridors: 0,
  },
});

export const canAdvanceRollout = (
  current: RolloutScope,
  completedCriteria: string[],
): boolean => {
  const stage = WORLD_ROLLOUT.find((candidate) => candidate.id === current);
  if (!stage) return false;
  return stage.exitCriteria.every((criterion) => completedCriteria.includes(criterion));
};
