const LEDGER_KEY = 'tryamm.internalWorldLedger.v1'

export type InternalWorldEventType =
  | 'mission_checkpoint'
  | 'vehicle_interaction'
  | 'boat_interaction'
  | 'animal_discovery'
  | 'creator_clip'
  | 'commerce_touchpoint'

export type InternalWorldLedgerEntry = {
  id: string
  type: InternalWorldEventType
  world: 'streetverse'
  reference: string
  metadata: Record<string, unknown>
  createdAt: string
  previousHash: string
  hash: string
  payoutEligible: false
}

function loadEntries(): InternalWorldLedgerEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEDGER_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function sha256(value: string) {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(value)
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Legacy-browser fallback. This is only a local receipt identifier, never a payout proof.
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return `fallback-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export async function appendInternalWorldEvent(
  type: InternalWorldEventType,
  reference: string,
  metadata: Record<string, unknown> = {},
) {
  const ledger = loadEntries()
  const previousHash = ledger.at(-1)?.hash || 'GENESIS'
  const createdAt = new Date().toISOString()
  const id = globalThis.crypto?.randomUUID?.() || `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const payload = JSON.stringify({ id, type, world: 'streetverse', reference, metadata, createdAt, previousHash })
  const hash = await sha256(payload)
  const entry: InternalWorldLedgerEntry = {
    id,
    type,
    world: 'streetverse',
    reference,
    metadata,
    createdAt,
    previousHash,
    hash,
    payoutEligible: false,
  }
  localStorage.setItem(LEDGER_KEY, JSON.stringify([...ledger, entry].slice(-500)))
  return entry
}

export function getInternalWorldLedger() {
  return loadEntries()
}

export function clearInternalWorldLedger() {
  localStorage.removeItem(LEDGER_KEY)
}
