import { useGameStore } from '../state/useGameStore'

export type CompletionState = 'complete' | 'coded' | 'integrated' | 'tested' | 'gated' | 'external_blocker'

export type CompletionGate = {
  id: string
  label: string
  state: CompletionState
  evidence?: string[]
  blocker?: string
}

export type CloudSaveSnapshot = {
  version: 1
  player: ReturnType<typeof useGameStore.getState>['player']
  missions: ReturnType<typeof useGameStore.getState>['missions']
  vehicles: ReturnType<typeof useGameStore.getState>['vehicles']
  savedAt: string
}

export interface CloudSaveProvider {
  providerId: string
  authenticated: boolean
  load(slot: string): Promise<CloudSaveSnapshot | null>
  save(slot: string, snapshot: CloudSaveSnapshot): Promise<void>
}

export interface MultiplayerProvider {
  providerId: string
  connected: boolean
  connect(input: { playerId: string; worldId: string }): Promise<void>
  disconnect(): Promise<void>
  sendPlayerState(input: { x: number; y: number; heading?: number; updatedAt: string }): Promise<void>
  subscribePlayerState(listener: (message: { playerId: string; x: number; y: number; heading?: number; updatedAt: string }) => void): () => void
}

const LOCAL_SAVE_KEY = 'tryamm.game-state.v2'
let installed = false

function snapshot(): CloudSaveSnapshot {
  const state = useGameStore.getState()
  return {
    version: 1,
    player: state.player,
    missions: state.missions,
    vehicles: state.vehicles,
    savedAt: new Date().toISOString(),
  }
}

export function installGameStatePersistence() {
  if (installed || typeof window === 'undefined') return
  installed = true

  try {
    const raw = window.localStorage.getItem(LOCAL_SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CloudSaveSnapshot
      if (parsed?.version === 1) {
        useGameStore.setState({
          player: parsed.player,
          missions: parsed.missions,
          vehicles: parsed.vehicles,
        })
      }
    }
  } catch {
    // Corrupt or unavailable browser storage must not prevent game startup.
  }

  useGameStore.subscribe((state) => {
    try {
      window.localStorage.setItem(
        LOCAL_SAVE_KEY,
        JSON.stringify({
          version: 1,
          player: state.player,
          missions: state.missions,
          vehicles: state.vehicles,
          savedAt: new Date().toISOString(),
        } satisfies CloudSaveSnapshot),
      )
    } catch {
      // Persistence is best-effort in browser beta; production cloud save is authoritative.
    }
  })
}

export function exportGameSnapshot() {
  return snapshot()
}

export async function syncGameToCloud(provider: CloudSaveProvider, slot = 'primary') {
  if (!provider.authenticated) throw new Error('Cloud save requires authenticated provider session.')
  await provider.save(slot, snapshot())
}

export async function hydrateGameFromCloud(provider: CloudSaveProvider, slot = 'primary') {
  if (!provider.authenticated) throw new Error('Cloud save requires authenticated provider session.')
  const remote = await provider.load(slot)
  if (!remote) return false
  useGameStore.setState({ player: remote.player, missions: remote.missions, vehicles: remote.vehicles })
  return true
}

export function buildGameCompletionMatrix(input: {
  cloudSaveConfigured?: boolean
  multiplayerConfigured?: boolean
  nativeClientBuilt?: boolean
  appStorePackagesBuilt?: boolean
  productionVoiceConfigured?: boolean
  realMoneyEnabled?: boolean
} = {}): CompletionGate[] {
  return [
    { id: 'browser-play', label: 'Browser playable game', state: 'integrated', evidence: ['movement', 'touch controls', 'mission progression', 'rewards'] },
    { id: 'local-save', label: 'Persistent browser game state', state: 'complete', evidence: ['player', 'missions', 'vehicles'] },
    { id: 'cloud-save', label: 'Authenticated cloud save', state: input.cloudSaveConfigured ? 'integrated' : 'gated', blocker: input.cloudSaveConfigured ? undefined : 'Requires authenticated cloud provider/database configuration.' },
    { id: 'multiplayer', label: 'Authoritative online multiplayer', state: input.multiplayerConfigured ? 'integrated' : 'gated', blocker: input.multiplayerConfigured ? undefined : 'Requires deployed authoritative realtime server/provider.' },
    { id: 'native-client', label: 'Native 3D client', state: input.nativeClientBuilt ? 'tested' : 'external_blocker', blocker: input.nativeClientBuilt ? undefined : 'Requires installed Godot/Unity/Unreal toolchain and native build/test environment.' },
    { id: 'mobile-packages', label: 'Android/iPhone production packages', state: input.appStorePackagesBuilt ? 'tested' : 'external_blocker', blocker: input.appStorePackagesBuilt ? undefined : 'Requires native signing, Apple/Google developer credentials, device testing and store packaging.' },
    { id: 'voice', label: 'Production voice chat', state: input.productionVoiceConfigured ? 'integrated' : 'gated', blocker: input.productionVoiceConfigured ? undefined : 'Requires production realtime voice provider configuration and moderation.' },
    { id: 'real-money', label: 'Real-money game economy', state: input.realMoneyEnabled ? 'tested' : 'gated', blocker: input.realMoneyEnabled ? undefined : 'Must remain off until legal/payment/provider approvals and geographic controls are complete.' },
  ]
}

export function completionPercent(gates: CompletionGate[]) {
  const weights: Record<CompletionState, number> = {
    complete: 1,
    tested: 1,
    integrated: 0.9,
    coded: 0.7,
    gated: 0.35,
    external_blocker: 0.2,
  }
  return Math.round((gates.reduce((sum, gate) => sum + weights[gate.state], 0) / Math.max(1, gates.length)) * 100)
}
