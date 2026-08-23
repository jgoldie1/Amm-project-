export type SpeedLane = 'runtime' | 'world' | 'commerce' | 'creator' | 'assets' | 'guardian';
export type BuildRisk = 'low' | 'medium' | 'high';
export type BuildUnit = {
  id: string;
  goal: string;
  lane: SpeedLane;
  dependencies: string[];
  risk: BuildRisk;
  evidence: Array<'source' | 'route' | 'runtime' | 'persistence' | 'test' | 'deployment'>;
};

export const QUANTUM_SPEED_ENGINE = {
  name: 'TRYAMM Quantum Speed Engine',
  purpose: 'Compress delivery time by parallelizing independent work while preserving verification gates.',
  rule: 'Speed comes from decomposition, reuse, caching, automation and parallelism—not skipping tests or approvals.',
  pipeline: [
    'GOAL INTAKE',
    'HOLOGPT DECOMPOSITION',
    'DEPENDENCY GRAPH',
    'AI CAFE PARALLEL LANES',
    'HOLOFORGE/GLE ASSET REUSE',
    'COMPONENT + API TEMPLATE REUSE',
    'INCREMENTAL BUILD/CACHE',
    'GUARDIAN STATIC + SECURITY + ACCESSIBILITY CHECKS',
    'INTEGRATION TEST',
    'PREVIEW DEPLOY',
    'SMOKE PROOF',
    'HUMAN APPROVAL FOR HIGH-RISK ACTIONS',
    'PRODUCTION RELEASE',
    'TELEMETRY + ROLLBACK',
  ],
} as const;

export function parallelWaves(units: BuildUnit[]) {
  const pending = new Map(units.map(unit => [unit.id, unit]));
  const completed = new Set<string>();
  const waves: BuildUnit[][] = [];
  while (pending.size) {
    const wave = [...pending.values()].filter(unit => unit.dependencies.every(dep => completed.has(dep)));
    if (!wave.length) throw new Error('Build graph contains a missing dependency or cycle');
    waves.push(wave);
    wave.forEach(unit => { pending.delete(unit.id); completed.add(unit.id); });
  }
  return waves;
}

export const FAST_PAGE_FACTORY = [
  'PAGE BRIEF', 'ROUTE CONTRACT', 'DESIGN TOKEN TEMPLATE', 'REUSABLE COMPONENTS',
  'DATA/API CONTRACT', 'ACCESSIBILITY', 'RESPONSIVE STATES', 'ERROR/LOADING STATES',
  'TEST', 'PREVIEW', 'SMOKE', 'PUBLISH',
] as const;
