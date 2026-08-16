export type AssetKind = 'model' | 'audio' | 'image' | 'cad' | 'document'

export type RecoveredAsset = {
  id: string
  kind: AssetKind
  label: string
  status: 'verified' | 'recovered' | 'pending-engine-test'
  envKey?: string
  fallback?: string
  metadata?: Record<string, string | number | boolean>
}

const env = (key?: string) => key ? (import.meta.env[key] as string | undefined) : undefined

export const recoveredAssets: RecoveredAsset[] = [
  { id: 'athlete', kind: 'model', label: 'Recovered Athlete', status: 'verified', envKey: 'VITE_ASSET_ATHLETE_GLB', metadata: { format: 'GLB2', skinned: true, animations: 9 } },
  { id: 'raptor', kind: 'model', label: 'Recovered Raptor', status: 'verified', envKey: 'VITE_ASSET_RAPTOR_GLB', metadata: { format: 'GLB2', skinned: true, animations: 3 } },
  { id: 'hunter', kind: 'model', label: 'Recovered Hunter', status: 'verified', envKey: 'VITE_ASSET_HUNTER_GLB', metadata: { format: 'GLB2' } },
  { id: 'falcon', kind: 'model', label: 'Recovered Falcon', status: 'verified', envKey: 'VITE_ASSET_FALCON_GLB', metadata: { format: 'GLB2' } },
  { id: 'bounce', kind: 'audio', label: 'Basketball Bounce', status: 'verified', envKey: 'VITE_ASSET_SFX_BOUNCE' },
  { id: 'swish', kind: 'audio', label: 'Basketball Swish', status: 'verified', envKey: 'VITE_ASSET_SFX_SWISH' },
  { id: 'rim', kind: 'audio', label: 'Basketball Rim', status: 'verified', envKey: 'VITE_ASSET_SFX_RIM' },
  { id: 'whistle', kind: 'audio', label: 'Sports Whistle', status: 'verified', envKey: 'VITE_ASSET_SFX_WHISTLE' },
  { id: 'crowd', kind: 'audio', label: 'Arena Crowd', status: 'verified', envKey: 'VITE_ASSET_SFX_CROWD' },
  { id: 'buzzer', kind: 'audio', label: 'Arena Buzzer', status: 'verified', envKey: 'VITE_ASSET_SFX_BUZZER' },
  { id: 'neon-court', kind: 'audio', label: 'Neon Court Loop', status: 'verified', envKey: 'VITE_ASSET_MUSIC_NEON_COURT' },
  { id: 'iron-ring', kind: 'audio', label: 'Iron Ring Loop', status: 'verified', envKey: 'VITE_ASSET_MUSIC_IRON_RING' },
  { id: 'vault-run', kind: 'audio', label: 'Vault Run Loop', status: 'verified', envKey: 'VITE_ASSET_MUSIC_VAULT_RUN' },
]

export function getRecoveredAsset(id: string) {
  const asset = recoveredAssets.find(a => a.id === id)
  if (!asset) return null
  const url = env(asset.envKey)
  return { ...asset, url: url || asset.fallback || null, configured: Boolean(url || asset.fallback) }
}

export function playRecoveredAudio(id: string, volume = 0.7) {
  const asset = getRecoveredAsset(id)
  if (!asset?.url || asset.kind !== 'audio') return false
  try {
    const audio = new Audio(asset.url)
    audio.volume = Math.max(0, Math.min(1, volume))
    void audio.play()
    return true
  } catch {
    return false
  }
}
