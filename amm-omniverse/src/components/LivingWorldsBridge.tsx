import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import { getAuthenticatedUserId, isSupabaseConfigured } from '../services/supabaseClient'
import HoloGPTAssistant from './HoloGPTAssistant'
import HoloDirectLaunchBridge from './HoloDirectLaunchBridge'
import HoloMusicStreaming from './HoloMusicStreaming'
import CommandNexusControlPlane from './CommandNexusControlPlane'
import XRCommandGateway from './XRCommandGateway'
import HoloLabGateway from './HoloLabGateway'
import BookClubCenter from './BookClubCenter'
import RouteCoordinator from '../navigation/RouteCoordinator'
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
  const [showNexusV2,setShowNexusV2]=useState(false)
  const [showHoloMusic,setShowHoloMusic]=useState(false)
  const [showXR,setShowXR]=useState(false)
  const [showHoloLab,setShowHoloLab]=useState(false)
  const [showBookClub,setShowBookClub]=useState(false)
  const signedIn = screen !== 'intro' && screen !== 'login'

  useEffect(()=>{
    const openNexus=()=>setShowNexusV2(true)
    const openMusic=()=>setShowHoloMusic(true)
    const openXR=()=>setShowXR(true)
    const openLab=()=>setShowHoloLab(true)
    const openBookClub=()=>setShowBookClub(true)
    ;(window as any).__showCommandNexusV2=openNexus
    ;(window as any).__showHoloMusic=openMusic
    ;(window as any).__showXR=openXR
    ;(window as any).__showHoloLab=openLab
    ;(window as any).__showBookClub=openBookClub
    window.addEventListener('tryamm:open-command-nexus-v2',openNexus)
    window.addEventListener('tryamm:open-holo-music',openMusic)
    window.addEventListener('tryamm:open-xr',openXR)
    window.addEventListener('tryamm:open-holo-lab',openLab)
    window.addEventListener('tryamm:open-book-club',openBookClub)
    return()=>{
      window.removeEventListener('tryamm:open-command-nexus-v2',openNexus)
      window.removeEventListener('tryamm:open-holo-music',openMusic)
      window.removeEventListener('tryamm:open-xr',openXR)
      window.removeEventListener('tryamm:open-holo-lab',openLab)
      window.removeEventListener('tryamm:open-book-club',openBookClub)
      if((window as any).__showCommandNexusV2===openNexus)delete (window as any).__showCommandNexusV2
      if((window as any).__showHoloMusic===openMusic)delete (window as any).__showHoloMusic
      if((window as any).__showXR===openXR)delete (window as any).__showXR
      if((window as any).__showHoloLab===openLab)delete (window as any).__showHoloLab
      if((window as any).__showBookClub===openBookClub)delete (window as any).__showBookClub
    }
  },[])

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

  return <>
    <RouteCoordinator />
    <HoloGPTAssistant />
    <HoloDirectLaunchBridge />
    {signedIn&&<button aria-label="Open AR VR Mixed Reality" onClick={()=>setShowXR(true)} style={{position:'fixed',left:12,bottom:18,zIndex:10031,border:'1px solid #a36cff99',borderRadius:999,padding:'12px 15px',background:'linear-gradient(135deg,#17102b,#071d2a)',color:'#d6b7ff',fontFamily:'monospace',fontWeight:950,fontSize:11,cursor:'pointer',boxShadow:'0 0 24px #a36cff22'}}>XR · AR/VR</button>}
    {showNexusV2&&<CommandNexusControlPlane onClose={()=>setShowNexusV2(false)}/>} 
    {showHoloMusic&&<HoloMusicStreaming onClose={()=>setShowHoloMusic(false)}/>} 
    {showXR&&<XRCommandGateway onClose={()=>setShowXR(false)}/>} 
    {showHoloLab&&<HoloLabGateway onClose={()=>setShowHoloLab(false)}/>} 
    {showBookClub&&<BookClubCenter onClose={()=>setShowBookClub(false)}/>} 
  </>
}
