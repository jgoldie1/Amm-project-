import {useMemo,useState} from 'react'
import {STREETVERSE_GAMES,STREETVERSE_PLAYABLE_CAST,type StreetVerseGameId} from '../gameplay/streetVersePlayableCast'
import {STREETVERSE_INVENTORY_SURFACES} from '../gameplay/streetVerseInventory'
import HoloClipScreenLayer from './HoloClipScreenLayer'

export default function StreetVersePlayableLaunch({onClose,onEnterCity}:{onClose:()=>void;onEnterCity:()=>void}){
 const [characterId,setCharacterId]=useState(STREETVERSE_PLAYABLE_CAST[0].id)
 const character=useMemo(()=>STREETVERSE_PLAYABLE_CAST.find(c=>c.id===characterId)!,[characterId])
 const [gameId,setGameId]=useState<StreetVerseGameId>(character.starterGame)
 const [holo,setHolo]=useState(false)
 const selectCharacter=(id:string)=>{const c=STREETVERSE_PLAYABLE_CAST.find(x=>x.id===id);if(c){setCharacterId(id);setGameId(c.starterGame)}}
 return <div role="dialog" aria-label="StreetVerse playable launch" style={{position:'fixed',inset:0,zIndex:15000,background:'#03070d',color:'#fff',overflowY:'auto'}}>
  <div style={{maxWidth:1100,margin:'0 auto',padding:18}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12}}><div><small style={{letterSpacing:3,color:'#64e9ff'}}>STREETVERSE PLAYABLE RECOVERY</small><h1>Choose your character. Enter the city.</h1></div><button onClick={onClose}>Close</button></header>
   <h2>Characters</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:9}}>{STREETVERSE_PLAYABLE_CAST.map(c=><button key={c.id} onClick={()=>selectCharacter(c.id)} aria-pressed={c.id===characterId} style={{padding:14,borderRadius:16,border:c.id===characterId?'1px solid #64e9ff':'1px solid #263647',background:c.id===characterId?'#0d2631':'#091019',color:'#fff',textAlign:'left'}}><strong>{c.name}</strong><div>{c.origin||'StreetVerse'} · {c.role}</div>{c.storyRole&&<small>{c.storyRole}</small>}</button>)}</div>
   <h2>Mission / Game</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:9}}>{STREETVERSE_GAMES.map(g=><button key={g.id} onClick={()=>setGameId(g.id)} aria-pressed={g.id===gameId} style={{padding:14,borderRadius:16,border:g.id===gameId?'1px solid #e8b944':'1px solid #263647',background:'#091019',color:'#fff',textAlign:'left'}}><strong>{g.name}</strong><p>{g.objective}</p><small>+{g.rewardXp} XP</small></button>)}</div>
   <h2>Persistent Inventory</h2><div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{STREETVERSE_INVENTORY_SURFACES.map(s=><span key={s} style={{border:'1px solid #2a4155',borderRadius:999,padding:'7px 10px',fontSize:11}}>{s.replaceAll('_',' ')}</span>)}</div>
   <div style={{marginTop:24,padding:16,border:'1px solid #263647',borderRadius:18}}><b>Ready:</b> {character.name} → {STREETVERSE_GAMES.find(g=>g.id===gameId)?.name} → Chicago Living City → XP/checkpoint/inventory. Economic rewards remain server verified.</div>
   <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:18}}><button onClick={onEnterCity} style={{padding:'13px 18px',fontWeight:900}}>ENTER STREETVERSE →</button><button onClick={()=>setHolo(true)} style={{padding:'13px 18px'}}>OPEN HOLO CLIP 2.0</button></div>
  </div>
  <HoloClipScreenLayer open={holo} onClose={()=>setHolo(false)} onLaunch={panel=>window.dispatchEvent(new CustomEvent('tryamm:holo-panel',{detail:{panel,characterId,gameId}}))}/>
 </div>
}
