import React,{useMemo,useRef,useState} from 'react';

type ReachMode='touch'|'voice'|'one-hand'|'gaze'|'switch';
type StageProp={id:string;label:string;x:number;y:number;kind:'light'|'portal'|'gift'|'camera'};

export function StarVerseReachInStage(){
 const [mode,setMode]=useState<ReachMode>('touch');
 const [props,setProps]=useState<StageProp[]>([
  {id:'key-light',label:'Holo Light',x:22,y:26,kind:'light'},
  {id:'portal',label:'Verse Portal',x:73,y:28,kind:'portal'},
  {id:'gift',label:'Holo Gift',x:48,y:68,kind:'gift'},
  {id:'camera',label:'Director Camera',x:16,y:70,kind:'camera'},
 ]);
 const [selected,setSelected]=useState<string>('key-light');
 const [isLive,setIsLive]=useState(false),[isRecording,setIsRecording]=useState(false),[gifts,setGifts]=useState(0),[directorCue,setDirectorCue]=useState('Ready for your debut.');
 const [portalOpen,setPortalOpen]=useState(false),[take,setTake]=useState(1);
 const [xp,setXp]=useState(0),[reelDrafts,setReelDrafts]=useState(0),[publishState,setPublishState]=useState<'idle'|'draft'|'approved'>('idle');
 const [opportunity,setOpportunity]=useState<string|null>(null);
 const recordingStartedAt=useRef<number|null>(null);
 const selectedProp=useMemo(()=>props.find(p=>p.id===selected),[props,selected]);
 const direct=(cue:string)=>setDirectorCue(cue);
 const toggleRecord=()=>{setIsRecording(v=>{const next=!v;recordingStartedAt.current=next?Date.now():null;if(!next){setTake(t=>t+1);setReelDrafts(r=>r+1);setPublishState('draft');direct('Take captured — Reel Composer draft created. Review before publishing.')}return next})};
 const approveDraft=()=>{if(!reelDrafts)return;setPublishState('approved');setXp(x=>x+100);setOpportunity('StarVerse Debut Audition');direct('Reel approved. Talent Scout found an explainable audition match — creator opt-in required.');};
 const activate=()=>{
  if(selected==='gift'){setGifts(g=>g+1);direct('Gift received — acknowledge your audience.');}
  else if(selected==='portal'){setPortalOpen(v=>!v);direct(portalOpen?'Portal closing.':'Portal opening — prepare the transition.');}
  else if(selected==='camera')direct('Camera selected — frame the performer and hold for the take.');
  else direct('Lighting cue applied — performer is ready.');
 };
 const move=(dx:number,dy:number)=>setProps(ps=>ps.map(p=>p.id===selected?{...p,x:Math.max(4,Math.min(92,p.x+dx)),y:Math.max(8,Math.min(86,p.y+dy))}:p));
 return <section aria-label="StarVerse Reach-In Holo Stage" style={{position:'relative',minHeight:520,borderRadius:24,overflow:'hidden',background:'radial-gradient(circle at 50% 45%,#271c67 0,#090b22 46%,#02030a 100%)',color:'white'}}>
  <div style={{padding:18,display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
   <div><strong style={{fontSize:22}}>STARVERSE • REACH-IN STAGE</strong><div style={{opacity:.75}}>Anyone Can Be A Star • phone-first mixed reality preview</div></div>
   <select aria-label="Interaction mode" value={mode} onChange={e=>setMode(e.target.value as ReachMode)} style={{fontSize:16,padding:10,borderRadius:12}}><option>touch</option><option>voice</option><option>one-hand</option><option>gaze</option><option>switch</option></select>
  </div>
  <div style={{position:'absolute',inset:'96px 16px 94px',border:'1px solid #625cff',borderRadius:22,background:'linear-gradient(180deg,rgba(57,46,170,.22),rgba(4,5,20,.65))'}}>
   {[20,40,60,80].map(n=><div key={'v'+n} style={{position:'absolute',left:n+'%',top:0,bottom:0,borderLeft:'1px solid rgba(117,154,255,.18)'}}/> )}
   {[25,50,75].map(n=><div key={'h'+n} style={{position:'absolute',top:n+'%',left:0,right:0,borderTop:'1px solid rgba(117,154,255,.18)'}}/> )}
   <div style={{position:'absolute',left:'30%',right:'30%',bottom:18,height:76,borderRadius:'50%',background:'radial-gradient(ellipse,#6f4dff 0,rgba(111,77,255,.08) 68%)'}}/>
   <div aria-label="StarVerse performer" style={{position:'absolute',left:'50%',bottom:44,transform:'translateX(-50%)',textAlign:'center'}}>
    <div style={{width:42,height:42,borderRadius:'50%',margin:'auto',background:'#8f654c',border:'2px solid #d7b49d'}}/>
    <div style={{width:62,height:94,borderRadius:'28px 28px 18px 18px',background:'linear-gradient(#4d58b8,#241f67)',border:'1px solid #8aa7ff'}}/>
    <small>PERFORMER</small>
   </div>
   {portalOpen&&<div aria-label="Open Verse portal" style={{position:'absolute',right:'7%',top:'18%',width:88,height:150,borderRadius:'50%',border:'8px solid #67e5ff',boxShadow:'0 0 32px #764dff,inset 0 0 24px #67e5ff'}}/>}
   <div style={{position:'absolute',left:12,top:12,padding:'8px 10px',borderRadius:12,background:'rgba(0,0,0,.55)',fontSize:12}}>AI DIRECTOR: {directorCue}</div>
   <div style={{position:'absolute',right:12,top:12,padding:'8px 10px',borderRadius:12,background:isLive?'#8b1438':'rgba(0,0,0,.55)',fontSize:12}}>{isLive?'● LIVE':'OFF AIR'} · TAKE {take} · GIFTS {gifts} · XP {xp}</div>
   {props.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} aria-pressed={selected===p.id} style={{position:'absolute',left:p.x+'%',top:p.y+'%',transform:'translate(-50%,-50%)',minWidth:64,minHeight:54,borderRadius:16,border:selected===p.id?'3px solid white':'1px solid #70d7ff',background:selected===p.id?'#4b38b8':'rgba(11,18,45,.88)',color:'white',fontWeight:700}}>{p.kind==='light'?'✦':p.kind==='portal'?'◉':p.kind==='gift'?'◆':'▣'}<br/><small>{p.label}</small></button>)}
  </div>
  <div style={{position:'absolute',left:16,right:16,bottom:16,display:'grid',gridTemplateColumns:'1fr auto',gap:10,alignItems:'center'}}>
   <div><b>{selectedProp?.label}</b><div style={{opacity:.7,fontSize:13}}>Mode: {mode} • move an approved virtual stage object</div></div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,46px)',gap:6}}>
    <span/><button aria-label="Move up" onClick={()=>move(0,-5)}>↑</button><span/>
    <button aria-label="Move left" onClick={()=>move(-5,0)}>←</button><button aria-label="Activate selected prop" onClick={activate}>●</button><button aria-label="Move right" onClick={()=>move(5,0)}>→</button>
    <span/><button aria-label="Move down" onClick={()=>move(0,5)}>↓</button><span/>
   </div>
  </div>
  <div style={{position:'absolute',left:16,bottom:16,display:'flex',gap:6,flexWrap:'wrap'}}>
   <button onClick={()=>{setIsLive(v=>!v);direct(isLive?'Stream ended — review the take.':'You are live — greet the audience.')}}>{isLive?'END LIVE':'GO LIVE'}</button>
   <button onClick={toggleRecord}>{isRecording?'STOP REC':'RECORD'}</button>
   <button onClick={()=>{setGifts(g=>g+1);direct('Holo gift landed on stage.')}}>HOLO GIFT +1</button>
   <button onClick={()=>direct('AI Director: center performer, key light up, camera ready.')}>AI DIRECT</button>
   <button disabled={!reelDrafts||publishState==='approved'} onClick={approveDraft}>{publishState==='draft'?'REVIEW + APPROVE REEL':publishState==='approved'?'REEL APPROVED':'NO REEL YET'}</button>
   {opportunity&&<button onClick={()=>{setXp(x=>x+75);direct('Audition accepted. Added to Star Passport career path.');setOpportunity(null)}}>ACCEPT: {opportunity}</button>}
  </div>
 </section>
}
export default StarVerseReachInStage;
