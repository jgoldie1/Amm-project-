import { useEffect, useRef } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import { getAuthenticatedUserId, isSupabaseConfigured } from '../services/supabaseClient'
import StreetVerseLifePathLauncher from './StreetVerseLifePathLauncher'
import StreetVerseLegacyMemoryHub from './StreetVerseLegacyMemoryHub'
import StreetVerseBiographyProofHub from './StreetVerseBiographyProofHub'
import StreetVerseMissionDirectorHub from './StreetVerseMissionDirectorHub'
import {
  enterWorld,
  getActiveWorldSession,
  getOrCreateWorldProfile,
  listWorlds,
  saveWorldSessionState,
  type WorldRecord,
  type WorldSession,
} from '../services/livingWorlds'

function screenForWorld(world: WorldRecord): string | undefined {
  const value = world.metadata?.screen
  return typeof value === 'string' ? value : undefined
}

export default function LivingWorldsBridge() {
  const screen = useGameStore(s => s.screen)
  const player = useGameStore(s => s.player)
  const sessionRef = useRef<WorldSession | null>(null)
  const worldsRef = useRef<WorldRecord[]>([])
  const readyRef = useRef(false)
  const signedIn = screen !== 'intro' && screen !== 'login'

  useEffect(() => {
    if (!signedIn) {
      readyRef.current = false
      sessionRef.current = null
      return
    }

    let cancelled = false
    async function bootstrap() {
      if (!isSupabaseConfigured()) return
      const userId = await getAuthenticatedUserId()
      if (!userId) return
      try {
        await getOrCreateWorldProfile({
          avatar_name: player.name || 'Traveler',
          level: player.level,
          xp: player.xp,
          reputation: player.rep,
          skills: { faith: player.faith },
        })
        const [worlds, active] = await Promise.all([listWorlds(), getActiveWorldSession()])
        if (cancelled) return
        worldsRef.current = worlds
        sessionRef.current = active
        readyRef.current = true

        const persistedScreen = active?.state?.screen
        const valid = ['city','sports','marketplace','music','faith','blockchain']
        if (typeof persistedScreen === 'string' && valid.includes(persistedScreen) && persistedScreen !== useGameStore.getState().screen) {
          useGameStore.getState().setScreen(persistedScreen as any)
        }
      } catch (error) {
        console.warn('[LivingWorlds] bootstrap skipped:', error)
      }
    }
    bootstrap()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn])

  useEffect(() => {
    if (!signedIn || !readyRef.current) return
    let cancelled = false

    async function persistScreen() {
      try {
        const worlds = worldsRef.current
        const target = worlds.find(w => screenForWorld(w) === screen) || worlds.find(w => w.slug === 'my-world')
        if (!target || cancelled) return

        const state = {
          screen,
          player: {
            level: player.level,
            xp: player.xp,
            reputation: player.rep,
            faith: player.faith,
            activeVehicle: player.activeVehicle,
          },
          savedAt: new Date().toISOString(),
        }

        if (sessionRef.current?.world_id === target.id) {
          await saveWorldSessionState(sessionRef.current.id, state)
        } else {
          sessionRef.current = await enterWorld(target, state)
        }
      } catch (error) {
        console.warn('[LivingWorlds] persistence skipped:', error)
      }
    }

    persistScreen()
    return () => { cancelled = true }
  }, [signedIn, screen, player.level, player.xp, player.rep, player.faith, player.activeVehicle])

  return signedIn ? <><StreetVerseLifePathLauncher /><StreetVerseLegacyMemoryHub /><StreetVerseBiographyProofHub /><StreetVerseMissionDirectorHub /></> : null
}
