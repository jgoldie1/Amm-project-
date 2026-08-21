import { useEffect, useMemo, useState } from 'react'
import { ARCHIVE_TO_CREATOR_SEEDS, ARCHIVE_MISSION_PIPELINE, NEXT_GENERATION_LOOP } from '../game/archive/ArchiveToCreatorLegacyEngine'
import { LIFE_BIOGRAPHY, WORLD_CONTINUES_RULES } from '../game/world/WorldMemoryLifeBiography'
import { loadRejoinState, runStreetVerseLifeSmoke, saveArchiveProgress, saveBiography, saveCreatorWork, simulateReturn, type BiographyInput } from '../services/streetVerseLifeApi'
import { listGuestBiographyDrafts, queueGuestBiography, syncGuestBiographyDrafts } from '../services/streetVerseGuestBiography'

const CHARACTER_KEY='tryamm.streetverse.character.v1'
const CHARACTER_ID_KEY='tryamm.streetverse.character.v1.id'
function getCharacter(){try{return JSON.parse(localStorage.getItem(CHARACTER_KEY)||'{}') as {displayName?:string;homeRegion?:string;archetype?:string}}catch{return {}}}
function getCharacterId(){let id=localStorage.getItem(CHARACTER_ID_KEY);if(id)return id;const c=getCharacter(),base=(c.displayName||'traveler').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'traveler';id=`streetverse-${base}`;localStorage.setItem(CHARACTER_ID_KEY,id);return id}

export default function StreetVerseBiographyProofHub(){
 const [open,setOpen]=useState(false),[status,setStatus]=useState('READY'),[log,setLog]=useState<string[]>([]),[rejoin,setRejoin]=useState<any>(null),[pending,setPending]=useState(()=>listGuestBiographyDrafts().length)
 useEffect(()=>{const show=()=>{setPending(listGuestBiographyDrafts().length);setOpen(true)};window.addEventListener('tryamm:streetverse-biography-open',show);return()=>window.removeEventListener('tryamm:streetverse-biography-open',show)},[])
 const character=useMemo(()=>getCharacter(),[open]),characterId=useMemo(()=>getCharacterId(),[open])
 const push=(message:string)=>setLog(old=>[`${new Date().toLocaleTimeString()} — ${message}`,...old].slice(0,30))
 const run=async(label:string,fn:()=>Promise<any>)=>{setStatus('RUNNING');try{const result=await fn();setStatus('GREEN');push(`${label}: GREEN`);return result}catch(error){setStatus('FAILED');push(`${label}: ${error instanceof Error?error.message:'failed'}`);throw error}}
 const chapter=LIFE_BIOGRAPHY.find(x=>x.id==='chicago')!
 const archiveMission=ARCHIVE_TO_CREATOR_SEEDS[0]
 const biographyInput=():BiographyInput=>({characterId,chapter:'chicago',regionId:(character.homeRegion||'Chicago').toLowerCase().replace(/\s+/g,'-'),legacyScore:10,state:{displayName:character.displayName||'Traveler',archetype:character.archetype||'custom',completed:['childhood','school','family-1'],active:['chicago'],persistentEffects:chapter.persistentEffects,savedAt:new Date().toISOString()}})
 const saveCurrent=async()=>{setStatus('RUNNING');const input=biographyInput();try{const result=await saveBiography(input);setStatus('GREEN');push('BIOGRAPHY SAVE: GREEN');return result}catch(error){if(error instanceof Error&&/Authentication required/i.test(error.message)){queueGuestBiography(input);setPending(listGuestBiographyDrafts().length);setStatus('LOCAL DRAFT');push('BIOGRAPHY SAVE: queued locally until sign-in');return {ok:true,localDraft:true}}setStatus('FAILED');push(`BIOGRAPHY SAVE: ${error instanceof Error?error.message:'failed'}`);throw error}}
 const syncDrafts=async()=>{setStatus('RUNNING');const result=await syncGuestBiographyDrafts();setPending(result.remaining);if(result.ok){setStatus('GREEN');push(`GUEST DRAFT SYNC: ${result.synced} synced, ${result.remaining} remaining`)}else{setStatus('SIGN IN REQUIRED');push('GUEST DRAFT SYNC: sign in required')}return result}
 const returnToWorld=()=>run('WORLD RETURN',()=>simulateReturn({characterId,regionId:(character.homeRegion||'Chicago').toLowerCase().replace(/\s+/g,'-')}))
 const solveArchive=()=>run('ARCHIVE MISSION',()=>saveArchiveProgress({characterId,missionId:archiveMission.id,status:'solved',sourceUrl:archiveMission.sourceUrl,evidenceClass:archiveMission.evidenceClass,resultSummary:'Player researched the source and completed the rights-safe historical question.'}))
 const createWork=()=>run('CREATOR WORK',()=>saveCreatorWork({characterId,title:'StreetVerse Archive Response',workType:'interactive-art',rightsStatus:'original-claimed',sourceMissionId:archiveMission.id,provenance:{sourceUrl:archiveMission.sourceUrl,sourceMission:archiveMission.id,originalWork:true,createdAt:new Date().toISOString()},collaboratorSplits:[]}))
 const load=async()=>{const result=await run('REJOIN',()=>loadRejoinState(characterId));setRejoin(result);return result}
 const fullProof=async()=>{setStatus('RUNNING');try{await runStreetVerseLifeSmoke();push('PUBLIC API SMOKE: GREEN');const saved:any=await saveCurrent();if(saved?.localDraft)throw new Error('Sign in required to continue server proof; biography draft preserved locally');await returnToWorld();await solveArchive();await createWork();const result=await loadRejoinState(characterId);setRejoin(result);setStatus('GREEN');push('END-TO-END AUTHENTICATED PROOF: GREEN')}catch(error){setStatus('FAILED');push(`FULL PROOF STOPPED: ${error instanceof Error?error.message:'failed'}`)}}
 if(!open)return null
 return <div role="dialog" aria-modal="true" aria-label="StreetVerse World Memory Proof" style={{position:'fixed',inset:0,zIndex:12130,overflowY:'auto',background:'radial-gradient(circle at top,#102c2c,#04070b 58%,#020204)',color:'#fff',padding:16}}><div style={{maxWidth:1100,margin:'0 auto'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:'#78ffb4',letterSpacing:3,fontWeight:900}}>STREETVERSE • AUTHENTICATED LIFE PROOF</div><h1>Your Save File Becomes Your Biography</h1><p style={muted}>Character: <b>{character.displayName||'Traveler'}</b> • ID: {characterId}</p></div><button onClick={()=>setOpen(false)} aria-label="Close" style={close}>×</button></header>
  <section style={panel}><h2>Proof chain</h2><div style={chips}>{['ENTER','LOCAL DRAFT IF NEEDED','SIGN IN + SYNC','SAVE BIOGRAPHY','LEAVE','WORLD CONTINUES','RETURN','ARCHIVE MISSION','CREATE ORIGINAL WORK','REJOIN','WORLD REMEMBERS'].map(x=><span style={chip} key={x}>{x}</span>)}</div><p><strong>STATUS:</strong> {status}</p><p style={muted}>Pending local biography drafts: <b>{pending}</b>. Guest progress stays on-device and is never written anonymously to the database.</p><div style={grid}><button onClick={fullProof} style={action}>RUN FULL AUTHENTICATED PROOF</button><button onClick={syncDrafts} style={action}>SYNC LOCAL DRAFTS AFTER SIGN-IN</button></div></section>
  <section style={panel}><h2>Individual gates</h2><div style={grid}><button style={action} onClick={()=>run('API SMOKE',runStreetVerseLifeSmoke)}>1. API SMOKE</button><button style={action} onClick={saveCurrent}>2. SAVE / QUEUE BIOGRAPHY</button><button style={action} onClick={returnToWorld}>3. RETURN / ADVANCE WORLD</button><button style={action} onClick={solveArchive}>4. SOLVE ARCHIVE MISSION</button><button style={action} onClick={createWork}>5. CREATE + PROVENANCE</button><button style={action} onClick={load}>6. REJOIN / RESTORE</button></div></section>
  <section style={panel}><h2>World continues</h2><ul>{WORLD_CONTINUES_RULES.map(x=><li key={x}>{x}</li>)}</ul></section>
  <section style={panel}><h2>Archive → creator mission</h2><h3>{archiveMission.historicalQuestion}</h3><p style={muted}>{archiveMission.reconstruction}</p><ol>{ARCHIVE_MISSION_PIPELINE.map(x=><li key={x}>{x}</li>)}</ol></section>
  <section style={panel}><h2>Next generation</h2><div style={chips}>{NEXT_GENERATION_LOOP.map(x=><span style={chip} key={x}>{x}</span>)}</div></section>
  <section style={panel}><h2>Last restored state</h2>{rejoin?<><p>Biography: {rejoin.biography?.chapter||'none'} • Legacy score: {rejoin.biography?.legacy_score??0}</p><p>World changes: {rejoin.changes?.length||0} • Archive missions: {rejoin.missions?.length||0} • Creator works: {rejoin.works?.length||0}</p></>:<p style={muted}>Run REJOIN after authenticated persistence to prove another session can restore the biography.</p>}</section>
  <section style={panel}><h2>Proof log</h2>{log.length?log.map(x=><div key={x} style={logLine}>{x}</div>):<p style={muted}>No gates run yet.</p>}</section>
 </div></div>
}
const panel={border:'1px solid #23423c',borderRadius:18,padding:16,margin:'14px 0',background:'#07110f'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:10} as const
const chips={display:'flex',gap:7,flexWrap:'wrap'} as const
const chip={border:'1px solid #365f55',borderRadius:999,padding:'6px 9px',fontSize:10,background:'#0a1b17'} as const
const action={minHeight:46,borderRadius:10,border:'1px solid #78ffb4',background:'#0d2b20',color:'#fff',padding:'0 14px',fontWeight:900,cursor:'pointer'} as const
const close={width:44,height:44,borderRadius:'50%',border:'1px solid #46566a',background:'#0d1420',color:'#fff',fontSize:22} as const
const muted={color:'#aab8c8',lineHeight:1.6} as const
const logLine={fontFamily:'monospace',fontSize:11,padding:'6px 0',borderBottom:'1px solid #183029'} as const