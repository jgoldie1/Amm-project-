import React,{useMemo,useState} from 'react';

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
 const selectedProp=useMemo(()=>props.find(p=>p.id===selected),[props,selected]);
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
   {props.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} aria-pressed={selected===p.id} style={{position:'absolute',left:p.x+'%',top:p.y+'%',transform:'translate(-50%,-50%)',minWidth:64,minHeight:54,borderRadius:16,border:selected===p.id?'3px solid white':'1px solid #70d7ff',background:selected===p.id?'#4b38b8':'rgba(11,18,45,.88)',color:'white',fontWeight:700}}>{p.kind==='light'?'✦':p.kind==='portal'?'◉':p.kind==='gift'?'◆':'▣'}<br/><small>{p.label}</small></button>)}
  </div>
  <div style={{position:'absolute',left:16,right:16,bottom:16,display:'grid',gridTemplateColumns:'1fr auto',gap:10,alignItems:'center'}}>
   <div><b>{selectedProp?.label}</b><div style={{opacity:.7,fontSize:13}}>Mode: {mode} • move an approved virtual stage object</div></div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,46px)',gap:6}}>
    <span/><button aria-label="Move up" onClick={()=>move(0,-5)}>↑</button><span/>
    <button aria-label="Move left" onClick={()=>move(-5,0)}>←</button><button aria-label="Activate selected prop" onClick={()=>{}}>●</button><button aria-label="Move right" onClick={()=>move(5,0)}>→</button>
    <span/><button aria-label="Move down" onClick={()=>move(0,5)}>↓</button><span/>
   </div>
  </div>
 </section>
}
export default StarVerseReachInStage;
