export type ProjectFact = {
  id: string
  text: string
  status: 'LOCKED' | 'OPEN' | 'SUPERSEDED' | 'BLOCKED' | 'DONE'
  source?: string
  updatedAt: string
}

export type CompletionReceipt = {
  id: string
  changed: string
  where: string
  evidence?: string
  status: 'DONE' | 'PARTIAL' | 'BLOCKED'
  nextBlocker?: string
  createdAt: string
}

export type RecallState = {
  facts: ProjectFact[]
  receipts: CompletionReceipt[]
  nextActions: string[]
}

export function dedupeFacts(facts: ProjectFact[]) {
  const seen = new Map<string, ProjectFact>()
  for (const fact of facts) {
    const key = fact.text.trim().toLowerCase()
    const existing = seen.get(key)
    if (!existing || Date.parse(fact.updatedAt) > Date.parse(existing.updatedAt)) seen.set(key, fact)
  }
  return Array.from(seen.values())
}

export function detectContradictions(facts: ProjectFact[]) {
  const active = facts.filter(f => f.status === 'LOCKED' || f.status === 'DONE')
  const superseded = facts.filter(f => f.status === 'SUPERSEDED')
  return superseded.flatMap(oldFact => active
    .filter(current => current.id === oldFact.id && current.text !== oldFact.text)
    .map(current => ({ old: oldFact, current })))
}

export function shouldRepeatIntent(intent: string, recentReceipts: CompletionReceipt[]) {
  const needle = intent.trim().toLowerCase()
  return !recentReceipts.some(receipt => `${receipt.changed} ${receipt.where}`.toLowerCase().includes(needle))
}

export function buildRecallBrief(state: RecallState) {
  return {
    locked: dedupeFacts(state.facts).filter(f => f.status === 'LOCKED' || f.status === 'DONE'),
    blockers: state.facts.filter(f => f.status === 'BLOCKED'),
    nextActions: state.nextActions.slice(0, 3),
    latestReceipts: [...state.receipts].sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 10),
    contradictions: detectContradictions(state.facts),
  }
}
