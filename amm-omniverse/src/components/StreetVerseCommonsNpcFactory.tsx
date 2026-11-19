import {useEffect,useState,type CSSProperties} from 'react'

type Role='shopkeeper'|'tour-guide'|'student-mentor'|'faithverse-guide'
type Rating='everyone'|'teen'|'adult'
type Character={id:string;displayName:string;role:Role;rating:Rating;purpose:string;approvedAt:string;source:'ai-commons-playground';fictional:true;autonomousTransactions:false;healthRecordsAllowed:false}
const KEY='tryamm:streetverse:commons-approved-npcs:v1'
const ROLE:Record<Role,{label:string;line:string}> ={
 'shopkeeper':{label:'StreetVerse Shopkeeper',line:'Welcome to this fictional store. I can explain the neighborhood and offer a pretend shopping roleplay. Real payments are disabled.'},
 'tour-guide':{label:'CrossVerse Tour Guide',line:'Welcome to CrossVerse. I can introduce the next game checkpoint, FaithVerse reading, and city landmarks.'},
 'student-mentor':{label:'All American University Mentor',line:'Welcome to the study center. Choose a class or a fictional career mission. I cannot grade real schoolwork or certify qualifications.'},
 'faithverse-guide':{label:'FaithVerse Scripture Guide',line:'Choose a cited Bible passage or an educational roleplay scene. AI-generated dialogue is not a recorded conversation with Yeshua.'}
}
const CONTROL:CSSProperties={minHeight:56,padding:'10px 14px',border:'1px solid #8ab4c4',borderRadius:13,background:'#19364b',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer'}
function read():Character[]{try{const raw=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(raw)?raw.filter(v=>v&&v.fictional===true&&v.autonomousTransactions===false&&typeof v.id==='string').slice(-24):[]}catch{return[]}}
export default function StreetVerseCommonsNpcFactory(){
 const [open,setOpen]=useState(false)
 const [name,setName]=useState('My CrossVerse Guide')
 const [role,setRole]=useState<Role>('tour-guide')
 const [rating,setRating]=useState<Rating>('everyone')
 const [purpose,setPurpose]=useState('Welcome players, guide missions, and provide clearly fictional roleplay.')
 const [approved,setApproved]=useState(false)
 const [saved,setSaved]=useState<Character[]>(read)
 const [selected,setSelected]=useState('')
 const [notice,setNotice]=useState('Create a local AI Commons character profile. Actual HoloGPT reasoning and server-powered NPC dialogue are not activated here.')
 useEffect(()=>{const show=()=>setOpen(true);window.addEventListener('tryamm:streetverse-open-npc-factory',show);return()=>window.removeEventListener('tryamm:streetverse-open-npc-factory',show)},[])
 const create=()=>{
  const trimmed=name.trim().replace(/[<>]/g,'').slice(0,52)
  if(!approved||trimmed.length<3||purpose.trim().length<8){setNotice('Enter a valid name, specific role and purpose, then approve the character safety boundaries.');return}
  const character:Character={id:'npc_'+crypto.randomUUID(),displayName:trimmed,role,rating,purpose:purpose.trim().slice(0,260),approvedAt:new Date().toISOString(),source:'ai-commons-playground',fictional:true,autonomousTransactions:false,healthRecordsAllowed:false}
  const next=[...saved,character].slice(-24)
  setSaved(next);setSelected(character.id)
  try{localStorage.setItem(KEY,JSON.stringify(next));setNotice('Fictional NPC profile saved locally. Not yet published or synchronized to another player.')}catch{setNotice('Browser storage unavailable. Profile was not saved.')}
  window.dispatchEvent(new CustomEvent('tryamm:ai-commons-npc-approved-locally',{detail:{id:character.id,role:character.role,rating:character.rating,serverVerified:false}}))
 }
 const chosen=saved.find(x=>x.id===selected)
 const exportProfile=()=>{
  if(!chosen)return
  const output={schema:'tryamm.commons.npc.v1',profile:chosen,permissions:{publicWorldSpawn:false,realPayments:false,medicalAdvice:false,unsupervisedMinorChat:false,voiceConsentRequired:true},reviewStatus:'local-owner-draft',liveLLMConnected:false}
  const blob=new Blob([JSON.stringify(output,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a')
  a.href=url;a.download='TRYAMM_Commons_NPC_'+chosen.role+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),700)
 }
 const preview=()=>{if(!chosen)return;setNotice('NPC '+chosen.displayName+' (scripted local dialogue): '+ROLE[chosen.role].line)}
 if(!open)return null
 return <section role="dialog" aria-modal="true" aria-label="AI Commons character factory" style={{position:'fixed',inset:0,zIndex:2147483600,overflowY:'auto',background:'#061626',color:'#fff',padding:'max(15px,env(safe-area-inset-top)) 15px 35px'}}>
  <main style={{maxWidth:680,margin:'0 auto',display:'grid',gap:12}}>
   <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div><p style={{fontSize:12,color:'#bce7eb'}}>AI PLAYGROUND + COMMONS → CROSSVERSE</p><h2 style={{fontSize:25,margin:0}}>AI Character Factory</h2></div><button style={CONTROL} onClick={()=>setOpen(false)}>Close</button></header>
   <p style={{lineHeight:1.65,margin:0}}>Approved AI character concepts can become scripted NPCs for StreetVerse, CampusVerse and FaithVerse. This is a local character test, not live autonomous AI, shared online multiplayer, or an independent human identity.</p>
   <label htmlFor="commons-npc-name">Character name</label><input id="commons-npc-name" value={name} onChange={e=>setName(e.target.value.slice(0,52))} style={CONTROL}/>
   <label htmlFor="commons-npc-role">Game role</label><select id="commons-npc-role" value={role} onChange={e=>setRole(e.target.value as Role)} style={CONTROL}>{(Object.keys(ROLE) as Role[]).map(k=><option key={k} value={k}>{ROLE[k].label}</option>)}</select>
   <label htmlFor="commons-npc-rating">Age-rating boundary</label><select id="commons-npc-rating" value={rating} onChange={e=>setRating(e.target.value as Rating)} style={CONTROL}><option value="everyone">Everyone (moderated)</option><option value="teen">Teen (12+ with safeguards)</option><option value="adult">Adult only</option></select>
   <label htmlFor="commons-npc-purpose">Purpose and scope</label><textarea id="commons-npc-purpose" value={purpose} onChange={e=>setPurpose(e.target.value.slice(0,260))} rows={3} style={{...CONTROL,fontWeight:400}}/>
   <label style={{display:'flex',alignItems:'start',gap:10,fontSize:14,lineHeight:1.6}}><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)} style={{width:22,height:22,flexShrink:0}}/>I approve this fictional NPC concept for a local preview only. Real-world actions, regulated advice, private records, unmoderated minor conversations and payments remain prohibited.</label>
   <button style={CONTROL} disabled={!approved} onClick={create}>SAVE APPROVED LOCAL NPC</button>
   {saved.length>0&&<><label htmlFor="commons-npc-choose">Saved local character prototypes</label><select id="commons-npc-choose" value={selected} onChange={e=>setSelected(e.target.value)} style={CONTROL}><option value="">Select NPC</option>{saved.map(x=><option key={x.id} value={x.id}>{x.displayName} · {ROLE[x.role].label}</option>)}</select><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}><button style={CONTROL} onClick={preview} disabled={!chosen}>TALK TO NPC · PREVIEW</button><button style={CONTROL} onClick={exportProfile} disabled={!chosen}>EXPORT NPC PROFILE</button></div></>}
   <p role="status" aria-live="polite" style={{padding:12,borderRadius:12,background:'#163648',lineHeight:1.6}}>{notice}</p>
   <p style={{fontSize:12,color:'#c1d5d9',lineHeight:1.6}}>Production graduation requires content moderation, age-policy checks, role authorization, server-signed spawn and persistence, speech permissions, bounded AI tools, rate limits, NPC animation, and real Chromebook/iPhone tests. No actual agent deployed by this preview.</p>
  </main>
 </section>
}
