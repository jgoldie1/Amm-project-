export type ReuseKind = 'page'|'component'|'api'|'asset'|'world-system'|'commerce-flow'|'creator-flow'|'test';
export type ReuseEntry = {
  id: string;
  kind: ReuseKind;
  tags: string[];
  source: string;
  verifiedAt?: string;
  evidence: string[];
};

export type ChangeSet = {
  changedFiles: string[];
  changedTags: string[];
};

export class ReuseRegistry {
  private entries = new Map<string, ReuseEntry>();
  register(entry: ReuseEntry) { this.entries.set(entry.id, entry); return entry; }
  all() { return [...this.entries.values()]; }
  find(kind: ReuseKind, tags: string[]) {
    const wanted = new Set(tags.map(t=>t.toLowerCase()));
    return this.all()
      .filter(e=>e.kind===kind)
      .map(e=>({entry:e,score:e.tags.reduce((n,t)=>n+(wanted.has(t.toLowerCase())?1:0),0)}))
      .filter(x=>x.score>0)
      .sort((a,b)=>b.score-a.score)
      .map(x=>x.entry);
  }
}

export const REUSE_FIRST_RULES = [
  'SEARCH REGISTRY BEFORE CREATE',
  'EXTEND VERIFIED CONTRACT BEFORE FORKING',
  'REUSE DESIGN TOKENS / ROUTE / API / ASSET / TEST WHEN COMPATIBLE',
  'CREATE NEW ONLY WHEN REQUIREMENTS MATERIALLY DIFFER',
  'REGISTER NEW VERIFIED OUTPUT FOR THE NEXT TASK',
] as const;

export function planDeltaTests(change: ChangeSet, registry: ReuseEntry[]) {
  const touched = new Set(change.changedTags.map(t=>t.toLowerCase()));
  const impacted = registry.filter(entry => entry.tags.some(tag=>touched.has(tag.toLowerCase())));
  const tests = new Set<string>();
  impacted.forEach(entry => entry.evidence.filter(x=>x.startsWith('test:')).forEach(x=>tests.add(x.slice(5))));
  if (change.changedFiles.some(f=>/route|navigation/i.test(f))) tests.add('route-smoke');
  if (change.changedFiles.some(f=>/commerce|payment|checkout|wallet|ledger/i.test(f))) tests.add('money-integrity');
  if (change.changedFiles.some(f=>/world|streetverse|game/i.test(f))) tests.add('world-smoke');
  if (change.changedFiles.some(f=>/media|reel|video|creator/i.test(f))) tests.add('media-smoke');
  tests.add('accessibility-smoke');
  tests.add('production-health');
  return [...tests];
}

export const BUILD_ONCE_PROTOCOL = [
  'BUILD ONCE','VERIFY ONCE','REGISTER','REUSE EVERYWHERE','PARALLELIZE VARIANTS','TEST DELTAS','MERGE ONCE','DEPLOY','TELEMETRY','ROLLBACK IF NEEDED'
] as const;
