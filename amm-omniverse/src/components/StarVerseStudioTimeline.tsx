import React,{useState} from 'react';
const seed=[
 {name:'PERFORMANCE VIDEO',clips:[{x:4,w:70}]},{name:'VOCAL',clips:[{x:8,w:22},{x:34,w:30}]},
 {name:'DRUMS',clips:[{x:3,w:14},{x:19,w:14},{x:35,w:14},{x:51,w:14},{x:67,w:14}]},
 {name:'MIDI / INSTRUMENT',clips:[{x:10,w:20},{x:39,w:24}]},{name:'HOLO LIGHTS',clips:[{x:5,w:8},{x:28,w:8},{x:55,w:8}]},
 {name:'VERSE EVENTS',clips:[{x:20,w:6},{x:62,w:7}]}
];
export default function StarVerseStudioTimeline(){
 const [playing,setPlaying]=useState(false),[ai,setAi]=useState('AI Studio ready. Edits are non-destructive and require creator approval.');
 const [command,setCommand]=useState(''),[proposal,setProposal]=useState<string|null>(null),[version,setVersion]=useState(1);
 const askEditor=()=>{const q=command.trim();if(!q)return;setProposal('AI proposal: '+q+' — preview only; source media remains unchanged.');setAi('Edit proposal ready. Compare it, then accept or reject.');};
 const accept=()=>{if(!proposal)return;setVersion(v=>v+1);setProposal(null);setCommand('');setAi('Accepted into a new version snapshot. Original media is preserved.');};
 return <section aria-label="StarVerse Studio Timeline" style={{padding:16,borderRadius:22,background:'#080b18',color:'white'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><div><b>STARVERSE 64-TRACK STUDIO</b><div style={{opacity:.7}}>Music + video + holographic stage automation</div></div><button onClick={()=>setPlaying(v=>!v)}>{playing?'PAUSE':'PLAY'}</button></header>
  <div style={{margin:'14px 0',padding:10,borderRadius:12,background:'#141a31'}}>BENNY / AI STUDIO: {ai}</div>
  {seed.map((t,i)=><div key={t.name} style={{display:'grid',gridTemplateColumns:'128px 1fr',gap:8,margin:'7px 0',alignItems:'center'}}><small>{t.name}</small><div style={{height:34,position:'relative',borderRadius:7,background:'#151a2b'}}>{t.clips.map((c,j)=><button key={j} aria-label={t.name+' clip'} style={{position:'absolute',left:c.x+'%',width:c.w+'%',top:5,bottom:5,borderRadius:6,border:'1px solid #8796ff',background:i%2?'#303a75':'#263a55'}}/>)}</div></div>)}
  <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:7,marginTop:14}}>
   <input aria-label="Ask AI Assistant Editor" value={command} onChange={e=>setCommand(e.target.value)} placeholder="Ask AI Editor: tighten chorus, clean vocal, find Reel moments…" style={{fontSize:16,padding:12,borderRadius:10}}/>
   <button onClick={askEditor}>ASK AI EDITOR</button>
  </div>
  {proposal&&<div style={{marginTop:8,padding:10,border:'1px solid #8796ff',borderRadius:10}}>{proposal}<div style={{display:'flex',gap:7,marginTop:8}}><button onClick={accept}>ACCEPT → VERSION {version+1}</button><button onClick={()=>{setProposal(null);setAi('Proposal rejected. Nothing changed.')}}>REJECT</button></div></div>}
  <small style={{display:'block',marginTop:8,opacity:.7}}>Current edit version: v{version} • source media preserved</small>
  <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:14}}>
   <button onClick={()=>setAi('Drafted an arrangement suggestion. Preview it before accepting.')}>AI ARRANGE</button>
   <button onClick={()=>setAi('Drafted drums/MIDI around the performance. Nothing overwritten.')}>BUILD BEAT</button>
   <button onClick={()=>setAi('Holo light cues drafted against timeline beats and performance markers.')}>SYNC HOLO STAGE</button>
   <button onClick={()=>setAi('Candidate Reel moments marked. Creator approval required before publishing.')}>FIND REEL MOMENTS</button>
  </div>
 </section>
}
