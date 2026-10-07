import {useEffect,useState} from 'react'

type Feed={
 npcId:string
 role:string
 focus:boolean
 action:string
 confidence:number
 distance:number
 navigation:string
 animation:string
 plan:string[]
 scores:Array<{action:string;score:number}>
 sense:{seeHero:boolean;hearHero:boolean;distance:number;health:number;stress:number;coverNearby:boolean;crowdDensity:number;weather:string;dayPhase:string;threatLevel:number}
 memory:{encounters:number;familiarity:number;trust:number;recent:string[]}
 reason:string
}

export default function StreetVerseCognitionFeed(){
 const [open,setOpen]=useState(false)
 const [feed,setFeed]=useState<Feed|null>(null)

 useEffect(()=>{
  const onToggle=()=>setOpen(value=>!value)
  const onFeed=(event:Event)=>{
   const next=(event as CustomEvent<Feed>).detail
   if(next?.focus)setFeed(next)
  }
  addEventListener('tryamm:npc-cognition-debug-toggle',onToggle)
  addEventListener('tryamm:npc-cognition-feed',onFeed)
  return()=>{
   removeEventListener('tryamm:npc-cognition-debug-toggle',onToggle)
   removeEventListener('tryamm:npc-cognition-feed',onFeed)
  }
 },[])

 if(!open)return null

 const top=feed?.scores?.slice(0,3)||[]
 return <aside aria-label="StreetVerse NPC cognition feed" style={{
  position:'fixed',
  left:'max(10px, env(safe-area-inset-left))',
  right:'max(10px, env(safe-area-inset-right))',
  top:'max(158px, calc(env(safe-area-inset-top) + 148px))',
  zIndex:44000,
  border:'1px solid #4fdff288',
  borderRadius:14,
  background:'rgba(4,10,16,.94)',
  boxShadow:'0 16px 42px #000b',
  color:'#eafcff',
  padding:10,
  fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace',
  pointerEvents:'auto',
 }}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
   <div style={{fontSize:10,fontWeight:900,letterSpacing:1.2,color:'#7be9ff'}}>COGNITION FEED • LIVE</div>
   <button aria-label="Close cognition feed" onClick={()=>setOpen(false)} style={{minWidth:36,minHeight:36,borderRadius:999,border:'1px solid #ffffff33',background:'#101923',color:'#fff',fontWeight:900}}>×</button>
  </div>

  {!feed?<div style={{padding:'10px 2px',fontSize:11,opacity:.8}}>Waiting for the nearest NPC cognition frame…</div>:<>
   <div style={{display:'flex',justifyContent:'space-between',gap:8,marginTop:3,fontSize:10}}>
    <strong>{feed.npcId}</strong>
    <span>{feed.role.toUpperCase()} • {feed.distance.toFixed(1)}m</span>
   </div>

   <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:4,marginTop:8}}>
    {[
     ['SENSE',feed.sense.seeHero?'SEE':feed.sense.hearHero?'HEAR':'SCAN'],
     ['MEMORY',String(feed.memory.encounters)],
     ['DECIDE',feed.action.toUpperCase()],
     ['PLAN',String(feed.plan.length)],
     ['ACT',feed.animation.toUpperCase()],
    ].map(([label,value])=><div key={label} style={{border:'1px solid #284454',borderRadius:8,padding:'6px 4px',textAlign:'center',minWidth:0}}>
     <div style={{fontSize:7,color:'#75dff2',letterSpacing:.8}}>{label}</div>
     <div style={{fontSize:8,fontWeight:900,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{value}</div>
    </div>)}
   </div>

   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8,fontSize:9}}>
    <div style={{border:'1px solid #203542',borderRadius:8,padding:7}}>
     <div>VISION <strong>{feed.sense.seeHero?'YES':'NO'}</strong></div>
     <div>HEARING <strong>{feed.sense.hearHero?'YES':'NO'}</strong></div>
     <div>THREAT <strong>{Math.round(feed.sense.threatLevel*100)}%</strong></div>
     <div>COVER <strong>{feed.sense.coverNearby?'NEAR':'NONE'}</strong></div>
    </div>
    <div style={{border:'1px solid #203542',borderRadius:8,padding:7}}>
     <div>FAMILIARITY <strong>{Math.round(feed.memory.familiarity*100)}%</strong></div>
     <div>TRUST <strong>{Math.round(feed.memory.trust*100)}%</strong></div>
     <div>CONFIDENCE <strong>{Math.round(feed.confidence*100)}%</strong></div>
     <div>NAV <strong>{feed.navigation}</strong></div>
    </div>
   </div>

   <div style={{marginTop:8,borderTop:'1px solid #1f3542',paddingTop:7,fontSize:9}}>
    <div style={{color:'#8df7b2',fontWeight:900}}>WHY</div>
    <div style={{marginTop:2,opacity:.88}}>{feed.reason}</div>
   </div>

   <div style={{marginTop:7,fontSize:9}}>
    <div style={{color:'#ffe27b',fontWeight:900}}>COUNTERFACTUAL TOP 3</div>
    <div style={{display:'flex',gap:5,marginTop:4,flexWrap:'wrap'}}>
     {top.map(item=><span key={item.action} style={{padding:'4px 6px',borderRadius:999,border:'1px solid #665d2f',background:'#19170c'}}>
      {item.action} {Math.round(item.score*100)}
     </span>)}
    </div>
   </div>

   <div style={{marginTop:7,fontSize:9}}>
    <div style={{color:'#d6a8ff',fontWeight:900}}>PLAN</div>
    <div style={{marginTop:3,opacity:.9}}>{feed.plan.join(' → ')}</div>
   </div>
  </>}
 </aside>
}
