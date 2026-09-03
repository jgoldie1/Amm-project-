import { useEffect,useMemo,useState } from 'react'
type Target={checkpoint:number;total:number;label:string;x:number;z:number}
type Pos={x:number;z:number}
export default function StreetVerseRaceNavigator(){
 const [target,setTarget]=useState<Target|null>(null),[pos,setPos]=useState<Pos|null>(null)
 useEffect(()=>{const onTarget=(e:Event)=>setTarget((e as CustomEvent<Target>).detail||null);const clear=()=>setTarget(null);const onPos=(e:Event)=>setPos((e as CustomEvent<Pos>).detail||null);addEventListener('tryamm:streetverse-race-target',onTarget);addEventListener('tryamm:streetverse-race-target-clear',clear);addEventListener('tryamm:streetverse-player-position',onPos);return()=>{removeEventListener('tryamm:streetverse-race-target',onTarget);removeEventListener('tryamm:streetverse-race-target-clear',clear);removeEventListener('tryamm:streetverse-player-position',onPos)}},[])
 const nav=useMemo(()=>{if(!target||!pos)return null;const dx=target.x-pos.x,dz=target.z-pos.z;return{distance:Math.hypot(dx,dz),angle:Math.atan2(dx,-dz)*180/Math.PI}},[target,pos])
 if(!target)return null
 return <div style={{position:'fixed',right:18,top:'36%',zIndex:16999,display:'grid',placeItems:'center',pointerEvents:'none',fontFamily:'system-ui',color:'#fff'}}>
   <div style={{width:78,height:78,borderRadius:'50%',border:'3px solid #ffd86c',background:'#07111ddd',display:'grid',placeItems:'center',boxShadow:'0 0 30px #ffd86c66'}}>
    <div style={{fontSize:34,transform:`rotate(${nav?.angle||0}deg)`,transition:'transform .12s linear'}}>▲</div>
   </div>
   <div style={{marginTop:7,padding:'6px 9px',borderRadius:999,background:'#07111ddd',border:'1px solid #ffd86c88',fontSize:10,fontWeight:950,textAlign:'center'}}>CP {target.checkpoint+1}/{target.total} • {target.label}<br/>{nav?`${nav.distance.toFixed(0)}m`:''}</div>
 </div>
}