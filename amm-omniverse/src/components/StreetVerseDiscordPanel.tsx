import {STREETVERSE_DISCORD,requestDiscordConnect,requestDiscordRoleSync} from '../data/streetVerseDiscordCommunity'
export default function StreetVerseDiscordPanel({onClose}:{onClose:()=>void}){
 return <section aria-label="StreetVerse Discord community" style={{position:'absolute',inset:12,zIndex:47,overflow:'auto',padding:14,borderRadius:16,background:'#07121bf2',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← GAME</button>
  <h2>STREETVERSE GLOBAL • DISCORD</h2>
  <p>Connect the game community to LIVE RP, Creator Pass, PK, missions, Reels and CampusVerse.</p>
  <button onClick={requestDiscordConnect} style={{width:'100%',minHeight:50,borderRadius:12,fontWeight:950}}>CONNECT DISCORD</button>
  <button onClick={requestDiscordRoleSync} style={{width:'100%',minHeight:48,marginTop:8,borderRadius:12,fontWeight:950}}>SYNC MY STREETVERSE ROLES</button>
  <h3>COMMUNITY ROOMS</h3>
  {STREETVERSE_DISCORD.channels.map(c=><div key={c.id} style={{padding:'7px 0',borderTop:'1px solid #ffffff22'}}><strong>{c.label}</strong><small style={{display:'block'}}>{c.purpose}</small></div>)}
  <h3>LINKED PLAYER ROLES</h3>
  {STREETVERSE_DISCORD.roles.map(r=><div key={r.id} style={{padding:'5px 0'}}><strong>{r.label}</strong><small style={{display:'block'}}>{r.source}</small></div>)}
  <small style={{display:'block',marginTop:10}}>Discord account linking and role changes must be confirmed by the server. Bot secrets never belong in the game client.</small>
 </section>
}
