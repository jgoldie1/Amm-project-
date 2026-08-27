export type CTVCampaign = {
  id: string
  creativeUrl: string
  landingUrl?: string
  budgetMinor: number
  currency: 'USD'
  geo: string[]
  audience?: string[]
  startsAt: string
  endsAt: string
}

export type CTVPlacement = {
  provider: string
  externalId?: string
  status: 'draft' | 'submitted' | 'live' | 'paused' | 'gated' | 'failed'
  estimatedCpmMinor?: number
  reason?: string
}

export interface CTVProvider {
  key: string
  name: string
  capabilities: string[]
  isConfigured(): boolean
  quote(campaign: CTVCampaign): Promise<CTVPlacement>
  launch(campaign: CTVCampaign): Promise<CTVPlacement>
  pause(externalId: string): Promise<CTVPlacement>
}

class GatedProvider implements CTVProvider {
  constructor(public key: string, public name: string, public capabilities: string[] = ['ctv']) {}
  isConfigured(){ return false }
  async quote(){ return { provider:this.key,status:'gated',reason:`${this.name} credentials/contract not configured` } as CTVPlacement }
  async launch(){ return { provider:this.key,status:'gated',reason:`${this.name} credentials/contract not configured` } as CTVPlacement }
  async pause(){ return { provider:this.key,status:'gated',reason:`${this.name} credentials/contract not configured` } as CTVPlacement }
}

const providers = new Map<string, CTVProvider>()

export function registerCTVProvider(provider: CTVProvider){ providers.set(provider.key, provider); return provider }
export function listCTVProviders(){ return [...providers.values()] }
export function getCTVProvider(key: string){ return providers.get(key) ?? null }

export async function routeCTVCampaign(campaign: CTVCampaign){
  const configured = [...providers.values()].filter(p => p.isConfigured())
  if (!configured.length) return { provider:'none',status:'gated',reason:'No approved CTV provider is configured yet' } as CTVPlacement
  const quotes = await Promise.all(configured.map(p => p.quote(campaign)))
  return quotes.filter(q => q.status !== 'failed' && q.status !== 'gated').sort((a,b)=>(a.estimatedCpmMinor ?? Number.MAX_SAFE_INTEGER)-(b.estimatedCpmMinor ?? Number.MAX_SAFE_INTEGER))[0]
    ?? { provider:'none',status:'gated',reason:'No provider returned an eligible quote' }
}

export const vibeCTV = registerCTVProvider(new GatedProvider('vibe','Vibe CTV',['ctv','self-serve','geo-targeting','audience-targeting']))
export const tryammCTV = {
  registerCTVProvider,
  listCTVProviders,
  getCTVProvider,
  routeCTVCampaign,
}
