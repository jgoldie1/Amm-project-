import {useState} from 'react'
import {newSpadesPractice,autoPlayToHuman,playCard,legal,practiceReceipt,type Practice,type Card} from '../runtime/GameVerseSpadesTrick.mjs'
import {loadGameVersePractice,saveGameVersePractice} from '../services/gameversePracticeCloud'
const key='tryamm.gameverse.spades.practice.v1'
const btn:React.CSSProperties={minHeight:48,padding:'8px 12px',background:'#133b50',border:'1px solid #59d0ef',borderRadius:10,color:'white',fontWeight:800,touchAction:'manipulation'}
const load=()=>{try{const x=JSON.parse(localStorage.getItem(key)||'null');if(x&&x.schema==='tryamm.gameverse.spades-practice.v1'&&Array.isArray(x.hands)&&x.hands.length===4&&x.cashValue===0)return x as Practice}catch{}return newSpadesPractice(42)}
export default function GameVerseSpadesPractice({onClose}:{onClose:()=>void}){
 const [game,setGame]=useState<Practice>(load),[message,setMessage]=useState('Pick a card to play. Three automated opponents follow suit.')
 const [revision,setRevision]=useState(0)
 const save=(next:Practice)=>{setGame(next);try{localStorage.setItem(key,JSON.stringify(next))}catch{setMessage('Storage unavailable; in-session play still works.')}}
 const play=(c:Card)=>{const x=playCard(game,0,c);if(!x.ok){setMessage(x.error||'Illegal card');return}const next=autoPlayToHuman(x.state);save(next);setMessage(next.finished?'13 tricks finished — practice complete. No rewards or money.':'Trick '+(next.completed+1)+' of 13. Play another card.')}
 const cloudLoad=async()=>{try{const receipt=await loadGameVersePractice<Practice>('spades-practice');if(!receipt){setMessage('No cloud snapshot yet. Save one after signing in.');return}setRevision(receipt.revision);save(receipt.state);setMessage('Cloud practice restored from authenticated account.')}catch(e){setMessage(String(e instanceof Error?e.message:e))}}
 const cloudSave=async()=>{try{const nextRevision=await saveGameVersePractice('spades-practice',game,revision);setRevision(nextRevision);setMessage('Cloud practice snapshot saved, revision '+nextRevision+'. No ranked result or credit awarded.')}catch(e){setMessage(String(e instanceof Error?e.message:e))}}
 const download=()=>{const body=JSON.stringify(practiceReceipt(game),null,2),blob=new Blob([body],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='gameverse-spades-practice-receipt.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 const available=legal(game.hands[0],game.plays[0]?.card.suit,game.spadesBroken)
 return <section role="dialog" aria-modal="true" aria-label="GameVerse Spades practice" style={{position:'fixed',inset:0,zIndex:19000,overflowY:'auto',background:'#061826',color:'#fff',padding:16,fontFamily:'system-ui'}}>
 <div style={{maxWidth:820,margin:'auto',display:'grid',gap:14}}>
 <header style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><strong>♠ GAMEVERSE SPADES • PRACTICE</strong><p style={{fontSize:12}}>One human seat + three bots. Follow suit. No bidding, cash, purchases, rankings or online opponents yet.</p></div><button style={btn} onClick={onClose}>CLOSE</button></header>
 <div role="status" aria-live="polite">{message}</div>
 <div>Tricks completed: {game.completed}/13 | Your team (seats 0+2): {game.tricks[0]+game.tricks[2]} | Opponents: {game.tricks[1]+game.tricks[3]}</div>
 <div>Lead: {game.plays[0]?.card.suit||'Choose any legal first card'} | Spades broken: {game.spadesBroken?'Yes':'No'}</div>
 <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
 {game.hands[0].map((c,i)=>{const allowed=game.turn===0&&!game.finished&&available.some(a=>a.suit===c.suit&&a.rank===c.rank);return <button key={c.suit+c.rank+i} disabled={!allowed} onClick={()=>play(c)} style={{...btn,minWidth:64,opacity:allowed?1:.35}}>{c.rank}{ {S:'♠',H:'♥',C:'♣',D:'♦'}[c.suit]}</button>})}
 </div>
 <div style={{display:'flex',flexWrap:'wrap',gap:8}}><button style={btn} onClick={()=>{save(autoPlayToHuman(newSpadesPractice(42)));setMessage('New free-play game.')}}>ONE PUSH • NEW GAME</button><button style={btn} onClick={()=>{save(load());setMessage('Reloaded local save, if available.')}}>RELOAD</button><button style={btn} onClick={download}>EXPORT JSON RECEIPT</button><button style={btn} onClick={cloudSave}>CLOUD SAVE (LOGIN)</button><button style={btn} onClick={cloudLoad}>CLOUD RESTORE</button></div>
 <small>No Crown Chips or Holo Credits are issued. This is the first local practice engine, not finished four-player multiplayer Spades.</small>
 </div></section>
}
