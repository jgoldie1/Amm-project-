import { useState } from 'react'
import { FLORIDA_PLAYABLE_WORLDS } from '../game/world/FloridaPlayableWorlds'
import { STREETVERSE_GLOBAL_DIASPORA } from '../game/world/StreetVerseGlobalDiaspora'
import { CHICAGO_LAKEFRONT_ZONES, LAKEFRONT_SUMMER_EVENTS } from '../game/world/ChicagoLakefrontSeason'
import { STREETVERSE_MEDIA_CHANNELS, MEDIA_GAMEPLAY_LOOP } from '../game/media/AllAmericanNetworkIntegration'
import { UNIVERSAL_LIFE_PATH, LIFE_PATH_GAME_ADAPTERS } from '../game/life/UniversalLifePath'
import { CHICAGO_SPORTSVERSE_DISTRICTS, SPORTSVERSE_BEACH_EVENTS, SPORTS_EVENT_ECONOMY } from '../game/sports/ChicagoSportsVerseDistricts'
import { WORLD_MEMORY_CONSEQUENCES } from '../game/world/StreetVerseWorldMemory'

const tabs = ['life','sports','memory','florida','diaspora','lakefront','media'] as const
type Tab = typeof tabs[number]

export default function StreetVerseExpansionHub() {
  const [open,setOpen]=useState(false)
  const [tab,setTab]=useState<Tab>('life')
  return <>
    <button onClick={()=>setOpen(true)} aria-label="Open StreetVerse expansion hub" style={{position:'fixed',right:12,bottom:126,zIndex:8999,border:'1px solid #e8b94488',borderRadius:999,background:'linear-gradient(135deg,#201407,#121526)',color:'#fff',padding:'10px 14px',fontSize:10,fontWeight:900}}>🌍 STREETVERSE EXPANSION</button>
    {open && <div role="dialog" aria-modal="true" aria-label="StreetVerse Expansion Hub" style={{position:'fixed',inset:0,zIndex:10200,overflowY:'auto',background:'rgba(2,3,10,.97)',color:'#fff',padding:16}}>
      <div style={{maxWidth:1180,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
          <div><div style={{fontSize:10,letterSpacing:3,color:'#e8b944'}}>LIVING WORLD EXPANSION</div><h1>StreetVerse: Building a Life</h1></div>
          <button onClick={()=>setOpen(false)} aria-label="Close StreetVerse expansion hub">×</button>
        </header>
        <nav style={{display:'flex',gap:8,flexWrap:'wrap',margin:'14px 0'}}>{tabs.map(item=><button key={item} onClick={()=>setTab(item)}>{item.toUpperCase()}</button>)}</nav>

        {tab==='life' && <section><h2>Universal life path</h2><p>The same claimed character can carry progression across connected games.</p><div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{UNIVERSAL_LIFE_PATH.map(stage=><span key={stage} style={chip}>{stage}</span>)}</div><h3>Connected games</h3><div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{LIFE_PATH_GAME_ADAPTERS.map(game=><span key={game} style={chip}>{game}</span>)}</div></section>}
        {tab==='sports' && <section><h2>Chicago SportsVerse</h2><p>Major stadium and arena districts become event economies with jobs, traffic, transit, vendors, media missions and persistent memories. Team/player/league commercial assets remain rights-gated.</p><div style={grid}>{CHICAGO_SPORTSVERSE_DISTRICTS.map(venue=><article key={venue.id} style={card}><h3>{venue.referenceName}</h3><p>{venue.districtRole}</p><strong>Jobs</strong><p>{venue.jobs.join(' • ')}</p><strong>Missions</strong><p>{venue.missions.join(' • ')}</p></article>)}</div><h3>Beach sports</h3><ul>{SPORTSVERSE_BEACH_EVENTS.map(x=><li key={x}>{x}</li>)}</ul><h3>Event economy</h3><ol>{SPORTS_EVENT_ECONOMY.map(x=><li key={x}>{x}</li>)}</ol></section>}
        {tab==='memory' && <section><h2>World Memory — the city remembers your life</h2><p>Your character history is designed to persist across relationships, school, work, businesses, neighborhoods, sports, media, travel and legacy.</p><ul>{WORLD_MEMORY_CONSEQUENCES.map(x=><li key={x}>{x}</li>)}</ul><p><strong>Return-to-city effect:</strong> NPC dialogue, opportunities and neighborhood reactions can change based on what your character did before leaving.</p></section>}
        {tab==='florida' && <section><h2>Playable Florida network</h2><div style={grid}>{FLORIDA_PLAYABLE_WORLDS.map(world=><article key={world.id} style={card}><h3>{world.name}</h3><p>{world.identity}</p><strong>Jobs</strong><p>{world.jobs.join(' • ')}</p><strong>Stories</strong><p>{world.stories.join(' • ')}</p></article>)}</div></section>}
        {tab==='diaspora' && <section><h2>Africa, Haiti & diaspora worlds</h2><div style={grid}>{STREETVERSE_GLOBAL_DIASPORA.map(world=><article key={world.id} style={card}><h3>{world.name}</h3><p>{world.hubs.join(' • ')}</p><strong>Industries</strong><p>{world.industries.join(' • ')}</p><strong>Mission seeds</strong><p>{world.missionSeeds.join(' • ')}</p></article>)}</div></section>}
        {tab==='lakefront' && <section><h2>Chicago Lakefront Summer</h2><p>Lake Shore Drive, beaches, harbors, festivals, traffic, jobs, nightlife and seasonal world events operate as one signature district.</p><div style={grid}>{CHICAGO_LAKEFRONT_ZONES.map(zone=><article key={zone.id} style={card}><h3>{zone.name}</h3><p>{zone.activities.join(' • ')}</p><strong>Jobs</strong><p>{zone.jobs.join(' • ')}</p><strong>Secrets</strong><p>{zone.secrets.join(' • ')}</p></article>)}</div><h3>Summer events</h3><ul>{LAKEFRONT_SUMMER_EVENTS.map(x=><li key={x}>{x}</li>)}</ul></section>}
        {tab==='media' && <section><h2>All American Network + streaming</h2><div style={grid}>{STREETVERSE_MEDIA_CHANNELS.map(channel=><article key={channel.id} style={card}><h3>{channel.name}</h3><p>{channel.categories.join(' • ')}</p><p>LIVE {channel.supportsLive?'YES':'NO'} • REPLAY {channel.supportsReplay?'YES':'NO'} • CREATOR REVENUE {channel.supportsCreatorRevenue?'ELIGIBLE':'NO'}</p></article>)}</div><h3>Gameplay loop</h3><ol>{MEDIA_GAMEPLAY_LOOP.map(x=><li key={x}>{x}</li>)}</ol></section>}
      </div>
    </div>}
  </>
}

const chip={border:'1px solid #48566a',borderRadius:999,padding:'6px 9px',fontSize:10} as const
const card={border:'1px solid #27364a',borderRadius:14,padding:12,background:'#09111c'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10} as const
