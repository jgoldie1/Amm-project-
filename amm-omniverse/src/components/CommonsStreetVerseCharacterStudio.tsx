import {useState,type CSSProperties} from 'react'
type World='streetverse'|'campusverse'|'faithverse'|'showcase'
type Role='shopkeeper'|'guide'|'dispatcher'|'teacher'|'performer'|'student'|'historical-narrator'
type Character={id:string;name:string;world:World;role:Role;bio:string;isAI:true;approvedForProduction:false;assetRigVerified:false;networkSpawnVerified:false}
const KEY='tryamm:commons:ai-character-drafts:v1'
const WORLDS:World[]=['streetverse','campusverse','faithverse','showcase']
const ROLES:Role[]=['shopkeeper','guide','dispatcher','teacher','performer','student','historical-narrator']
const btn:CSSProperties={minHeight:56,padding:'12px 14px',borderRadius:12,background:'#183c51',border:'1px solid #a9cade',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer'}
function readDrafts():Character[]{try{const d=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(d)?d.filter(x=>x&&typeof x.name==='string'&&x.isAI===true&&x.approvedForProduction===false).slice(0,25):[]}catch{return[]}}
export default function CommonsStreetVerseCharacterStudio({onOpenStreetVerse}:{onOpenStreetVerse:()=>void}){
 const [drafts,setDrafts]=useState<Character[]>(readDrafts)
 const [name,setName]=useState('MiddleVerse Guide')
 const [world,setWorld]=useState<World>('streetverse')
 const [role,setRole]=useState<Role>('guide')
 const [bio,setBio]=useState('A clearly labeled fictional AI guide offering beginner mission directions.')
 const [notice,setNotice]=useState('Draft AI characters can be reviewed here. Live NPC spawning and multiplayer synchronization are not enabled.')
 const create=()=>{
  const safeName=name.trim()
  if(safeName.length<2||safeName.length>40||/[<>]/.test(safeName)||bio.length>400||/\b(prescribe|diagnose|real money|bank account|medical record|guaranteed returns)\b/i.test(bio)){setNotice('Character rejected: name or description needs review.');return}
  const character:Character={id:'draft_'+Date.now().toString(36),name:safeName,world,role,bio:bio.trim(),isAI:true,approvedForProduction:false,assetRigVerified:false,networkSpawnVerified:false}
  const next=[...drafts,character].slice(-25)
  setDrafts(next);try{localStorage.setItem(KEY,JSON.stringify(next));setNotice('AI character design saved locally for owner review. No network NPC was spawned.')}catch{setNotice('Local storage unavailable. Export your designs.')}
 }
 const exportRoster=()=>{
  const data={schema:'tryamm.commons.ai-character-drafts.v1',source:'AI Playground / Commons',approval:'owner-review-required',characters:drafts,networkSpawnVerified:false,assetRigVerified:false,serverPersistenceVerified:false,permissions:['fictional-greet','study-guide','approved-mission-hints'],blocked:['payments','medical-data','player-inventory','real-person-impersonation','unmoderated-publishing']}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='TRYAMM_Commons_StreetVerse_AI_Character_Drafts.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)
 }
 return <section aria-label="Commons AI character to StreetVerse authoring" style={{border:'1px solid #7c9cb3',background:'#0c2639',padding:16,borderRadius:16,display:'grid',gap:11}}>
  <h2 style={{fontSize:22,margin:0}}>AI Playground → StreetVerse Character Studio</h2>
  <p style={{lineHeight:1.6,margin:0}}>Create fictional NPC designs with explicit AI disclosure and human approval. This does not clone real people, give agents real-world authority, or spawn characters until a network-authorized, moderated game integration is verified.</p>
  <label htmlFor="commons-character-name">Character name</label><input id="commons-character-name" value={name} maxLength={40} onChange={e=>setName(e.target.value)} style={{...btn,fontWeight:400}}/>
  <label htmlFor="commons-character-world">World</label><select id="commons-character-world" value={world} onChange={e=>setWorld(e.target.value as World)} style={btn}>{WORLDS.map(w=><option key={w}>{w}</option>)}</select>
  <label htmlFor="commons-character-role">Character job</label><select id="commons-character-role" value={role} onChange={e=>setRole(e.target.value as Role)} style={btn}>{ROLES.map(w=><option key={w}>{w}</option>)}</select>
  <label htmlFor="commons-character-bio">Allowed fictional dialogue and mission role</label><textarea id="commons-character-bio" value={bio} maxLength={400} rows={3} onChange={e=>setBio(e.target.value)} style={{...btn,fontWeight:400,resize:'vertical',fontFamily:'inherit'}}/>
  <button style={{...btn,background:'#285a47'}} onClick={create}>SAVE AI CHARACTER DRAFT</button>
  <p role="status" aria-live="polite" style={{fontSize:13,lineHeight:1.5}}>{notice}</p>
  <h3 style={{fontSize:18,margin:0}}>Draft roster — {drafts.length} (not deployed)</h3>
  {drafts.map(c=><div key={c.id} style={{border:'1px solid #56758b',padding:10,borderRadius:10}}><strong>{c.name} · AI character</strong><p style={{margin:'4px 0',fontSize:13}}>{c.world} / {c.role} — Requires GLB rig, dialogue review, accessibility, consent, moderation and network sync before production.</p></div>)}
  <button style={btn} onClick={exportRoster}>EXPORT CHARACTERS & APPROVAL GATES</button>
  <button style={btn} onClick={onOpenStreetVerse}>OPEN EXISTING STREETVERSE (NO AUTO SPAWN)</button>
 </section>
}
