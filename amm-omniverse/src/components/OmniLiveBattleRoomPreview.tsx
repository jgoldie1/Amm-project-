import {useEffect,useRef,useState} from 'react'
import {fairBattleScore,creatorLevel,creatorUnlocks,type BattleScore} from '../data/OmniLiveBattleLeagueDesign'

const EMPTY=(id:string):BattleScore=>({creatorId:id,talentVotes:0,missionPoints:0,engagementPoints:0,paidGiftPoints:0})
const button:React.CSSProperties={minHeight:44,padding:'9px 13px',borderRadius:12,border:'1px solid #76e3ff77',background:'#11243d',color:'#fff',fontWeight:800,touchAction:'manipulation'}
export default function OmniLiveBattleRoomPreview(){
 const [left,setLeft]=useState<BattleScore>(()=>EMPTY('creator-one'))
 const [right,setRight]=useState<BattleScore>(()=>EMPTY('creator-two'))
 const [seconds,setSeconds]=useState(90)
 const [running,setRunning]=useState(false)
 const [volume,setVolume]=useState(true)
 const [status,setStatus]=useState('Preview only. No real stream, gifts or monetized voting.')
 const tick=useRef<number|null>(null)
 useEffect(()=>{
  if(!running)return
  tick.current=window.setInterval(()=>setSeconds(n=>Math.max(0,n-1)),1000)
  return()=>{if(tick.current!==null)window.clearInterval(tick.current);tick.current=null}
 },[running])
 useEffect(()=>{if(seconds===0)setRunning(false)},[seconds])
 const score=(side:'left'|'right',kind:'talentVotes'|'missionPoints')=>{
  if(running&&seconds>0)(side==='left'?setLeft:setRight)(v=>({...v,[kind]:v[kind]+1}))
 }
 const sound=(cue:string)=>{
  if(!volume)return
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-trade-sound-request',{detail:{cue}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-nature-sound-request',{detail:{cue}}))
  setStatus('Local sound requested: '+cue+'. Broadcasting audio requires a separate stream-mixer integration.')
 }
 const reset=()=>{setRunning(false);setSeconds(90);setLeft(EMPTY('creator-one'));setRight(EMPTY('creator-two'));setStatus('New local preview round ready.')}
 const totalLeft=fairBattleScore(left),totalRight=fairBattleScore(right)
 return <section aria-label="Omni LIVE battle room preview" data-no-realm-swipe="true" style={{color:'#fff',background:'#07121f',padding:16,borderRadius:18,border:'1px solid #67e8f966',fontFamily:'system-ui',maxWidth:720,margin:'auto'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><h2 style={{fontSize:20,margin:0}}>⚔️ OMNI LIVE · AI LEAGUE</h2><span style={{fontSize:12,color:'#ffcf8a'}}>LOCAL DEMO · NOT BROADCASTING</span></div>
  <div role="timer" aria-live="off" style={{textAlign:'center',fontSize:38,fontVariantNumeric:'tabular-nums',margin:'16px 0'}}>{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
   {([{score:left,name:'Creator One',side:'left'},{score:right,name:'Creator Two',side:'right'}] as const).map(entry=><article key={entry.side} style={{background:'#17283e',borderRadius:14,padding:12}}>
    <h3 style={{margin:'0 0 8px',fontSize:15}}>{entry.name}</h3>
    <strong style={{fontSize:26}}>{fairBattleScore(entry.score)} pts</strong>
    <p style={{fontSize:12}}>Votes: {entry.score.talentVotes} · Missions: {entry.score.missionPoints}</p>
    <div style={{display:'grid',gap:8}}><button style={button} disabled={!running||seconds===0} onClick={()=>score(entry.side,'talentVotes')}>+ Audience vote</button><button style={button} disabled={!running||seconds===0} onClick={()=>score(entry.side,'missionPoints')}>+ Demo mission</button></div>
   </article>)}
  </div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><button style={button} onClick={()=>setRunning(v=>!v)} disabled={seconds===0}>{running?'Pause':'Start / resume'}</button><button style={button} onClick={reset}>Reset</button><button style={button} onClick={()=>setVolume(v=>!v)}>{volume?'🔊 Sounds on':'🔇 Sounds off'}</button></div>
  <div aria-label="Local soundboard" style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>{[{cue:'job-complete',label:'🎉 Victory'},{cue:'switch-click',label:'🎛 Click'},{cue:'bird-chirp',label:'🐦 Chirp'}].map(a=><button key={a.cue} style={button} onClick={()=>sound(a.cue)}>{a.label}</button>)}</div>
  <div role="status" style={{fontSize:12,color:'#c8deec',marginTop:10}}>{status}</div>
  <p style={{fontSize:11,color:'#a4b8ca'}}>Score excludes gifts and payments. Audio preview needs an active gesture-unlocked StreetVerse sound runtime. No multiuser synchronization, stream recording, moderation or server-side award is connected.</p>
  <p style={{fontSize:11,color:'#a4b8ca'}}>Prototype progression: Level {creatorLevel(Math.max(totalLeft,totalRight))} · {creatorUnlocks(creatorLevel(Math.max(totalLeft,totalRight))).map(x=>x.name).join(' • ')}</p>
 </section>
}
