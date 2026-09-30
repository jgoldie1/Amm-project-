import {STREETVERSE_LIVE_RP,requestLiveAudienceAction} from '../data/streetVerseLiveRp'
import {requestDiscordShare} from '../data/streetVerseDiscordCommunity'
export default function StreetVerseLiveRpPanel({onClose}:{onClose:()=>void}){
 return <section aria-label="StreetVerse LIVE RP" style={{position:'absolute',inset:12,zIndex:45,overflow:'auto',padding:14,borderRadius:16,background:'#07121bf2',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← GAME</button>
  <h2>STREETVERSE LIVE RP</h2><strong>CIRCLE PARK • GLOBAL</strong>
  <p style={{fontSize:12}}>Audience plays with the RP: PK score, mission votes, boosts, supply drops and Reel moments.</p>
  {STREETVERSE_LIVE_RP.audienceActions.map(a=><button key={a.id} onClick={()=>requestLiveAudienceAction(a.event,{world:'circle-park'})} style={{display:'block',width:'100%',minHeight:48,marginTop:7,borderRadius:12,fontWeight:900,textAlign:'left'}}>{a.id.toUpperCase()} • {a.effect}</button>)}
  <button onClick={()=>requestDiscordShare('live-rp',{world:'circle-park'})} style={{display:'block',width:'100%',minHeight:48,marginTop:10,borderRadius:12,fontWeight:950}}>ANNOUNCE LIVE / PK TO DISCORD</button>
  <small style={{display:'block',marginTop:12}}>Broadcast-safe default: weapon interaction and hit FX disabled for platform-safe mode.</small>
 </section>
}
