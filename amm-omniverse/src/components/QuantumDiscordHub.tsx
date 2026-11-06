import {useState} from 'react'
import HoloGPTCommunityGuide from './HoloGPTCommunityGuide'
/** Public invite only. Never put bot tokens, OAuth client secrets or webhook URLs in browser code. */
const OWNER_PROVIDED_INVITE='https://discord.gg/KZvPA9dnythat'
const configured=String(import.meta.env.VITE_QUANTUM_DISCORD_INVITE||OWNER_PROVIDED_INVITE).trim()
export function safeDiscordInvite(value:string):string|null{
 try{
  const url=new URL(value)
  if(url.protocol!=='https:'||url.username||url.password||url.port)return null
  const host=url.hostname.toLowerCase()
  if(host==='discord.gg'&&/^\/[A-Za-z0-9-]{2,64}\/?$/.test(url.pathname))return 'https://discord.gg/'+url.pathname.split('/')[1]
  if((host==='discord.com'||host==='discordapp.com')&&/^\/invite\/[A-Za-z0-9-]{2,64}\/?$/.test(url.pathname))return 'https://discord.com'+url.pathname
  return null
 }catch{return null}
}
const invite=safeDiscordInvite(configured)
const hologptInvite=safeDiscordInvite('https://discord.gg/CMW8M9YTV')
const channels=[
 ['#welcome-rules','Onboarding, community rules, accessibility and safety'],
 ['#streetverse-playtests','Chromebook/mobile QA, bug reports and release notes'],
 ['#bj-stubbs-characters','BJ, Marcus, family characters, animation and GLB feedback'],
 ['#sculptify-businessverse','Sculptify kitchen, nightlife, missions and business pilots'],
 ['#aniyah-cross-borders','Photography missions and financial literacy; no payment details'],
 ['#quantum-lab','Quantum Omniverse ideas, engineering experiments and research'],
 ['#hologpt-help','Human-reviewed help requests and future bot assistance'],
 ['#creator-studio','Reels, radio, live shows, music and collaborations'],
 ['#staff-review','Private moderation and whitelist review; staff-only permissions']
]
export default function QuantumDiscordHub({onClose}:{onClose:()=>void}){
 const [tab,setTab]=useState<'channels'|'safety'>('channels')
 return <section role="dialog" aria-modal="true" aria-label="Quantum Discord community" style={{position:'fixed',inset:0,zIndex:19500,background:'#0b1022',color:'white',padding:20,overflow:'auto'}}>
 <div style={{maxWidth:760,margin:'auto'}}>
 <button onClick={onClose} style={button}>Return to StreetVerse</button>
 <h2>Quantum Discord · StreetVerse Community</h2>
 <p>Connect players, creators, testers and businesses across StreetVerse, HoloGPT and the Quantum Omniverse. Discord channels listed below are a proposed structure, not automatically created server channels. Both invite URLs were supplied by the owner, but their validity, exact server identities and membership have not been verified. An invitation does not provide administrator access.</p>
 {hologptInvite&&<a href={hologptInvite} target="_blank" rel="noopener noreferrer" style={{...button,display:'inline-block',marginRight:8}}>Quantum HoloGPT community invite (unverified)</a>}
 {invite?<a href={invite} target="_blank" rel="noopener noreferrer" style={{...button,display:'inline-block'}}>Original Quantum Discord invite (unverified)</a>:<p role="status">Discord connection pending: the server owner must supply a public invitation URL and configure VITE_QUANTUM_DISCORD_INVITE at deployment.</p>}
 <div style={{display:'flex',gap:8,marginTop:18}}><button style={button} onClick={()=>setTab('channels')} aria-pressed={tab==='channels'}>Channel Plan</button><button style={button} onClick={()=>setTab('safety')} aria-pressed={tab==='safety'}>Security & Integration</button></div>
 {tab==='channels'?<ul>{channels.map(([name,description])=><li key={name} style={{margin:'12px 0'}}><strong>{name}</strong> — {description}</li>)}</ul>:<div><h3>Required before live integration</h3><p>Use a Discord application with minimal bot permissions and server-side OAuth authorization. Verify signed interaction requests; store tokens only in server secrets; rate-limit commands; require moderator approval for whitelist access; provide audit logs, reporting and account unlinking. Never trust a Discord role or client-side claim alone for game rewards or payments.</p><p>Optional future features: /help, /report-bug, /mission-status, /event-schedule and opt-in announcements. No bot, live chat synchronization, OAuth login or automatic channel creation is active in this version.</p></div>}
 <HoloGPTCommunityGuide/>
 </div></section>
}
const button:React.CSSProperties={background:'#31477c',color:'#fff',border:'1px solid #6b84b9',borderRadius:9,padding:12,minHeight:44,cursor:'pointer'}
