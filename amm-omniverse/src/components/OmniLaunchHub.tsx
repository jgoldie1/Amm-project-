import { useMemo } from 'react'
import { useGameStore, type Screen } from '../game/state/useGameStore'

type Props = {
  onClose: () => void
  onOpenHoloverse: () => void
  onOpenStudio: () => void
  onOpenPricing: () => void
}

type LaunchItem = {
  id: string
  title: string
  subtitle: string
  icon: string
  status: 'LIVE' | 'BETA' | 'RECOVERING'
  screen?: Screen
  action?: 'holoverse' | 'studio' | 'pricing'
}

export default function OmniLaunchHub({ onClose, onOpenHoloverse, onOpenStudio, onOpenPricing }: Props) {
  const setScreen = useGameStore(s => s.setScreen)
  const player = useGameStore(s => s.player)

  const items = useMemo<LaunchItem[]>(() => [
    { id:'living-worlds', title:'Living Worlds', subtitle:'3D city, missions, vehicles and persistent world foundation', icon:'🏙️', status:'LIVE', screen:'city' },
    { id:'gameverse', title:'GameVerse', subtitle:'Sports, tactical, card battle, racing and connected games', icon:'🎮', status:'LIVE', screen:'sports' },
    { id:'marketplace', title:'Marketplace', subtitle:'Products, creator stores, live-shopping and commerce entry', icon:'🛒', status:'LIVE', screen:'marketplace' },
    { id:'music', title:'HoloMusic + Studio', subtitle:'Music streaming, creator tools and Aniyah studio foundation', icon:'🎵', status:'LIVE', action:'studio' },
    { id:'holoverse', title:'Holoverse', subtitle:'HoloGPT, spatial services, HoloSearch and immersive navigation', icon:'🌀', status:'LIVE', action:'holoverse' },
    { id:'faith', title:'Faith Realm', subtitle:'Community, faith programming and protected creator experiences', icon:'🕊️', status:'LIVE', screen:'faith' },
    { id:'omnicash', title:'OmniCash / Wallet', subtitle:'Payment, ledger and creator-economy integration path', icon:'💳', status:'BETA', screen:'blockchain' },
    { id:'ott', title:'OTT + Isaiah AI TV', subtitle:'Movies, shows, FAST/AVOD, live events, podcasts and game broadcasts', icon:'📺', status:'RECOVERING' },
    { id:'live', title:'TryAMM LIVE', subtitle:'Livestreams, PK, panels, Showcase, Debate Arena and podcasts', icon:'🔴', status:'BETA' },
    { id:'starverse', title:'StarVerse', subtitle:'Anyone Can Be a Star, judges, auditions and fan voting', icon:'⭐', status:'RECOVERING' },
    { id:'volcano', title:'Volcano', subtitle:'Game/creator launcher, casting, controller and Omni Box device layer', icon:'🌋', status:'BETA' },
    { id:'care', title:'OmniCare360 + Work', subtitle:'AI-assisted support, remote jobs, creator and business services', icon:'🎧', status:'RECOVERING' },
  ], [])

  const launch = (item: LaunchItem) => {
    if (item.screen) {
      setScreen(item.screen)
      onClose()
      return
    }
    if (item.action === 'holoverse') return onOpenHoloverse()
    if (item.action === 'studio') return onOpenStudio()
    if (item.action === 'pricing') return onOpenPricing()
  }

  const statusColor = (status: LaunchItem['status']) => status === 'LIVE' ? '#00ff9d' : status === 'BETA' ? '#ffd166' : '#8aa4ff'

  return (
    <div style={{ width:'100%', height:'100%', overflowY:'auto', color:'#f6fbff', fontFamily:'monospace', background:'radial-gradient(circle at 50% -20%,#11335c 0%,#060817 34%,#020212 72%)' }}>
      <header style={{ position:'sticky', top:0, zIndex:2, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, background:'rgba(2,2,18,.94)', borderBottom:'1px solid rgba(79,227,255,.18)', backdropFilter:'blur(12px)' }}>
        <div>
          <div style={{ color:'#4fe3ff', fontWeight:900, letterSpacing:3, fontSize:16 }}>OMNI LAUNCH HUB</div>
          <div style={{ color:'#6f8097', fontSize:10, marginTop:3 }}>WATCH · PLAY · CREATE · SHOP · LEARN · WORK · BUILD</div>
        </div>
        <button onClick={onClose} style={{ border:'1px solid #30435c', background:'#09111f', color:'#a9bed3', borderRadius:8, padding:'8px 11px', cursor:'pointer', fontFamily:'monospace' }}>CLOSE ✕</button>
      </header>

      <main style={{ maxWidth:1080, margin:'0 auto', padding:'20px 16px 80px' }}>
        <section style={{ border:'1px solid rgba(232,185,68,.32)', borderRadius:18, padding:18, background:'linear-gradient(135deg,rgba(232,185,68,.10),rgba(79,227,255,.06))', marginBottom:18 }}>
          <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', display:'grid', placeItems:'center', fontSize:34, border:'1px solid #e8b944', boxShadow:'0 0 28px rgba(232,185,68,.2)' }}>🦁</div>
            <div style={{ flex:'1 1 260px' }}>
              <div style={{ color:'#e8b944', fontWeight:900, fontSize:21 }}>AMM Omniverse Command Entry</div>
              <div style={{ color:'#9eb0c2', fontSize:12, lineHeight:1.5, marginTop:5 }}>Welcome {player.name || 'Creator'}. One identity, one launcher, shared access across the worlds, media, commerce, games, studio and holographic services.</div>
            </div>
            <button onClick={onOpenPricing} style={{ background:'linear-gradient(135deg,#e8b944,#ffd970)', color:'#171208', border:0, borderRadius:10, padding:'11px 16px', fontFamily:'monospace', fontWeight:900, cursor:'pointer' }}>MEMBERSHIP / PRICING</button>
          </div>
        </section>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))', gap:12 }}>
          {items.map(item => (
            <button key={item.id} onClick={() => launch(item)} style={{ textAlign:'left', minHeight:154, padding:15, borderRadius:15, border:'1px solid rgba(79,227,255,.15)', background:'linear-gradient(180deg,rgba(12,20,36,.96),rgba(5,8,20,.96))', color:'#fff', cursor:item.status === 'RECOVERING' && !item.screen && !item.action ? 'default' : 'pointer', fontFamily:'monospace', boxShadow:'0 10px 30px rgba(0,0,0,.18)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                <span style={{ fontSize:29 }}>{item.icon}</span>
                <span style={{ fontSize:9, color:statusColor(item.status), border:`1px solid ${statusColor(item.status)}55`, borderRadius:999, padding:'4px 7px', letterSpacing:1 }}>{item.status}</span>
              </div>
              <div style={{ color:'#f7fbff', fontSize:14, fontWeight:900, marginTop:12 }}>{item.title}</div>
              <div style={{ color:'#71869d', fontSize:10, lineHeight:1.5, marginTop:6 }}>{item.subtitle}</div>
            </button>
          ))}
        </div>

        <section style={{ marginTop:18, border:'1px solid rgba(79,227,255,.16)', borderRadius:15, padding:15, background:'rgba(6,11,24,.8)' }}>
          <div style={{ color:'#4fe3ff', fontWeight:900, letterSpacing:2, fontSize:12 }}>REVENUE-FIRST LAUNCH ORDER</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:10 }}>
            {['Memberships','Marketplace','LIVE + Gifts','Music + Video','OTT + PPV','Ads + Sponsorship','GameVerse','Creator/Business Services'].map((label,i) => (
              <span key={label} style={{ border:'1px solid #233d58', borderRadius:999, padding:'6px 9px', color:'#adc1d4', fontSize:10 }}>{i+1}. {label}</span>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
