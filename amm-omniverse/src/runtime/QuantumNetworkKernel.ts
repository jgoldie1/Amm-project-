export type NetworkService = {
  key: string
  name: string
  endpoint: string
  protocol: 'https' | 'wss' | 'mesh' | 'content'
  health: 'live' | 'degraded' | 'gated' | 'offline'
  region?: string
  capabilities: string[]
}

export type UraIdentity = {
  subject: string
  did: string
  publicKeyThumbprint: string
  assurance: 'anonymous' | 'verified' | 'high'
  scopes: string[]
  issuedAt: number
  expiresAt: number
}

export type DeviceTrust = {
  deviceId: string
  ownerDid: string
  platform: string
  attestation: 'unverified' | 'software' | 'hardware'
  trustScore: number
  lastSeen: number
  revoked: boolean
}

export type EdgeNode = {
  nodeId: string
  region: string
  provider: string
  transport: 'wifi' | 'fixed-wireless' | 'fiber' | 'cellular' | 'satellite' | 'cloud'
  latencyMs: number
  capacityScore: number
  health: 'live' | 'degraded' | 'gated' | 'offline'
}

export type ContentAddress = {
  cid: string
  mediaType: string
  bytes: number
  sha256: string
  createdAt: number
  ttlSeconds: number
  replicas: string[]
}

export type AccessPath = {
  provider: string
  transport: EdgeNode['transport']
  score: number
  latencyMs: number
  metered: boolean
  roaming: boolean
  regulated: boolean
  status: 'approved' | 'gated' | 'unavailable'
}

export type NetworkEnvelope<T = unknown> = {
  id: string
  service: string
  subjectDid: string
  deviceId: string
  issuedAt: number
  expiresAt: number
  nonce: string
  payload: T
}

const registry = new Map<string, NetworkService>()
const devices = new Map<string, DeviceTrust>()
const edges = new Map<string, EdgeNode>()
const cache = new Map<string, ContentAddress>()

function stableHash(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619)
  return (h >>> 0).toString(16).padStart(8, '0')
}

export function registerNetworkService(service: NetworkService) {
  registry.set(service.key, service)
  return service
}

export function resolveQuantumName(name: string) {
  const normalized = name.trim().toLowerCase().replace(/^quantum:\/\//, '')
  const direct = registry.get(normalized)
  if (direct) return direct
  return [...registry.values()].find(s => s.name.toLowerCase() === normalized || s.capabilities.includes(normalized)) ?? null
}

export function issueUraIdentity(subject: string, scopes: string[] = ['network:read']) : UraIdentity {
  const now = Date.now()
  const safe = subject.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-').slice(0, 80) || 'guest'
  return {
    subject: safe,
    did: `did:ura:tryamm:${safe}:${stableHash(`${safe}:${now}`)}`,
    publicKeyThumbprint: stableHash(`pk:${safe}:${now}`),
    assurance: 'verified',
    scopes,
    issuedAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000,
  }
}

export function registerTrustedDevice(input: Omit<DeviceTrust, 'trustScore' | 'lastSeen' | 'revoked'> & { trustScore?: number }) {
  const device: DeviceTrust = {
    ...input,
    trustScore: Math.max(0, Math.min(100, input.trustScore ?? (input.attestation === 'hardware' ? 90 : input.attestation === 'software' ? 72 : 35))),
    lastSeen: Date.now(),
    revoked: false,
  }
  devices.set(device.deviceId, device)
  return device
}

export function revokeDevice(deviceId: string) {
  const device = devices.get(deviceId)
  if (!device) return false
  devices.set(deviceId, { ...device, revoked: true, trustScore: 0 })
  return true
}

export function canJoinEncryptedMesh(identity: UraIdentity, device: DeviceTrust) {
  return !device.revoked && device.ownerDid === identity.did && device.trustScore >= 60 && identity.expiresAt > Date.now()
}

export function createMeshEnvelope<T>(identity: UraIdentity, device: DeviceTrust, service: string, payload: T): NetworkEnvelope<T> {
  if (!canJoinEncryptedMesh(identity, device)) throw new Error('Device trust or URA identity gate failed')
  const now = Date.now()
  return {
    id: `qnet_${stableHash(`${identity.did}:${device.deviceId}:${service}:${now}`)}`,
    service,
    subjectDid: identity.did,
    deviceId: device.deviceId,
    issuedAt: now,
    expiresAt: now + 60_000,
    nonce: stableHash(`${Math.random()}:${now}`),
    payload,
  }
}

export function registerEdgeNode(node: EdgeNode) {
  edges.set(node.nodeId, node)
  return node
}

export function listHealthyEdges(region?: string) {
  return [...edges.values()].filter(n => (n.health === 'live' || n.health === 'degraded') && (!region || n.region === region))
    .sort((a, b) => (a.latencyMs - b.latencyMs) || (b.capacityScore - a.capacityScore))
}

export function addressContent(input: Omit<ContentAddress, 'cid' | 'createdAt'>) {
  const cid = `qcid:${stableHash(`${input.sha256}:${input.bytes}:${input.mediaType}`)}`
  const entry: ContentAddress = { ...input, cid, createdAt: Date.now() }
  cache.set(cid, entry)
  return entry
}

export function resolveContent(cid: string) {
  const item = cache.get(cid)
  if (!item) return null
  if (Date.now() > item.createdAt + item.ttlSeconds * 1000) {
    cache.delete(cid)
    return null
  }
  return item
}

export function routeHoloGPT(intent: string) {
  const candidate = [...registry.values()].filter(s => s.health !== 'offline' && s.capabilities.some(c => intent.toLowerCase().includes(c.toLowerCase())))
  return candidate[0] ?? resolveQuantumName('hologpt')
}

export function chooseAccessPath(paths: AccessPath[]) {
  const approved = paths.filter(p => p.status === 'approved')
  return approved.sort((a, b) => (b.score - a.score) || (a.latencyMs - b.latencyMs) || Number(a.metered) - Number(b.metered))[0] ?? null
}

export const quantumNetworkKernel = {
  registerNetworkService,
  resolveQuantumName,
  issueUraIdentity,
  registerTrustedDevice,
  revokeDevice,
  canJoinEncryptedMesh,
  createMeshEnvelope,
  registerEdgeNode,
  listHealthyEdges,
  addressContent,
  resolveContent,
  routeHoloGPT,
  chooseAccessPath,
}

registerNetworkService({ key: 'hologpt', name: 'HoloGPT', endpoint: '/api/hologpt', protocol: 'https', health: 'live', capabilities: ['ai', 'assistant', 'routing'] })
registerNetworkService({ key: 'streetverse', name: 'StreetVerse', endpoint: '/streetverse', protocol: 'https', health: 'live', capabilities: ['world', 'city', 'game'] })
registerNetworkService({ key: 'quantum-time', name: 'Quantum Time', endpoint: '/api/quantum-time', protocol: 'wss', health: 'gated', capabilities: ['time', 'history', 'timeline'] })
registerNetworkService({ key: 'pocket-dimensions', name: 'Pocket Dimensions', endpoint: '/api/pocket-dimensions', protocol: 'mesh', health: 'gated', capabilities: ['persistence', 'world-state', 'sync'] })
registerNetworkService({ key: 'wallet', name: 'TRYAMM Wallet', endpoint: '/api/wallet', protocol: 'https', health: 'gated', capabilities: ['wallet', 'payments', 'ledger'] })
registerNetworkService({ key: 'ctv', name: 'TRYAMM CTV', endpoint: '/api/ctv', protocol: 'https', health: 'gated', capabilities: ['ctv', 'tv', 'ads', 'streaming'] })
