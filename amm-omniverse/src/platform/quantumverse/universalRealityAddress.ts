export type RealityProvenance = 'OBSERVED' | 'MEASURED' | 'DIGITAL_TWIN' | 'RECONSTRUCTED' | 'SIMULATION' | 'ARTISTIC' | 'HYPOTHETICAL'

export type UniversalRealityAddress = {
  world: string
  objectId: string
  scale?: string
  time?: string
  version?: string
  datasetId?: string
  provenance?: RealityProvenance[]
  accessScope?: string
}

const encode = (value: string) => encodeURIComponent(value)
const decode = (value: string) => decodeURIComponent(value)

export function formatURA(address: UniversalRealityAddress) {
  const query = new URLSearchParams()
  if (address.scale) query.set('scale', address.scale)
  if (address.time) query.set('time', address.time)
  if (address.version) query.set('version', address.version)
  if (address.datasetId) query.set('dataset', address.datasetId)
  if (address.provenance?.length) query.set('provenance', address.provenance.join(','))
  if (address.accessScope) query.set('access', address.accessScope)
  const suffix = query.toString()
  return `ura://${encode(address.world)}/${encode(address.objectId)}${suffix ? `?${suffix}` : ''}`
}

export function parseURA(input: string): UniversalRealityAddress {
  if (!input.startsWith('ura://')) throw new Error('Invalid URA scheme.')
  const raw = input.slice('ura://'.length)
  const [pathPart, queryPart = ''] = raw.split('?')
  const [world, objectId] = pathPart.split('/').map(decode)
  if (!world || !objectId) throw new Error('URA requires world and objectId.')
  const query = new URLSearchParams(queryPart)
  const provenance = query.get('provenance')?.split(',').filter(Boolean) as RealityProvenance[] | undefined
  return {
    world,
    objectId,
    scale: query.get('scale') ?? undefined,
    time: query.get('time') ?? undefined,
    version: query.get('version') ?? undefined,
    datasetId: query.get('dataset') ?? undefined,
    provenance,
    accessScope: query.get('access') ?? undefined,
  }
}
