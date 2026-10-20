import {CONE_AERIAL_STOPS,coneGridPercent,type ConeZoom} from '../runtime/StreetVerseQuantumConeAerialV1'
type Props={open:boolean;zoom:ConeZoom;status:string;onZoom:(v:ConeZoom)=>void;onReturn:()=>void;onFly:(id:string)=>void;onScan:()=>void;onCinema:()=>void;onGlobal:()=>void}
export default function StreetVerseQuantumConeAerialHUD({open,zoom,status,onZoom,onReturn,onFly,onScan,onCinema,onGlobal}:Props){
 if(!open)return null
 return <div data-streetverse-quantum-cone-open="true" aria-label="StreetVerse Quantum Cone aerial view" style={{position:'fixed',inset:0,zIndex:52000,pointerEvents:'none',color:'#fff',fontFamily:'system-ui'}}>
  <header style={{position:'absolute',left:12,right:12,top:'max(9px,env(safe-area-inset-top))',display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',pointerEvents:'auto'}}>
   <div style={{padding:'10px 12px',borderRadius:12,background:'#0c1726eb',border:'1px solid #91f2ff'}}>
    <strong style={{display:'block',fontSize:12}}>◉ QUANTUM CONE LENS</strong><small style={{display:'block',fontSize:9,color:'#a4e8ff'}}>SKY VIEW • CHICAGO GAME WORLD</small>
   </div>
   <button data-cone-return-to-bj="true" aria-label="Return to BJ at street level" onClick={onReturn} style={{minHeight:48,minWidth:89,borderRadius:13,border:'2px solid #87ffbc',background:'#0a3126',color:'#fff',fontWeight:900,touchAction:'manipulation'}}>↙ BJ</button>
  </header>
  <section style={{position:'absolute',bottom:'max(9px,env(safe-area-inset-bottom))',left:10,right:10,maxHeight:'min(52vh,465px)',overflowY:'auto',background:'#051621ee',border:'1px solid #90e6ff',borderRadius:16,padding:10,pointerEvents:'auto'}}>
   <button data-cone-open-global="true" onClick={onGlobal} aria-label="Zoom out to StreetVerse Global globe" style={{width:'100%',minHeight:48,marginBottom:8,borderRadius:10,border:'1px solid #ffdf96',background:'#364128',color:'#fff',fontWeight:900}}>🌍 PLANET • STREETVERSE GLOBAL</button>
   <div style={{display:'flex',gap:6,marginBottom:8}}>
    {(['city','district','block'] as ConeZoom[]).map(v=><button key={v} data-cone-zoom={v} onClick={()=>onZoom(v)} aria-label={'Set lens zoom to '+v} style={{flex:1,minHeight:46,borderRadius:10,border:'1px solid '+(zoom===v?'#87ffc5':'#7bbccf'),background:zoom===v?'#184d35':'#1b3746',color:'#fff',fontSize:11,fontWeight:900}}>{v==='city'?'🌐 CITY':v==='district'?'🏙 DISTRICT':'⌖ BLOCK'}</button>)}
   </div>
   <div role="img" aria-label="Game-local overhead map showing Circle Park, Fillmore, Taylor Street, Little Italy and Arrigo Park" style={{position:'relative',height:130,background:'#1b3540',borderRadius:12,overflow:'hidden',marginBottom:8,border:'1px solid #507382'}}>
    {[20,40,60,80].map(a=><span key={'h'+a} style={{position:'absolute',top:a+'%',left:0,right:0,height:2,background:'#aac6cf48'}}/>)}
    {[20,40,60,80].map(a=><span key={'v'+a} style={{position:'absolute',left:a+'%',top:0,bottom:0,width:2,background:'#aac6cf48'}}/>)}
    <small style={{position:'absolute',top:4,left:6,color:'#ddefff',fontSize:9}}>N ↑ • local game grid</small>
    {CONE_AERIAL_STOPS.map(s=>{const p=coneGridPercent(s.x,s.z);return <span key={s.id} title={s.label} style={{position:'absolute',left:p.left+'%',top:p.top+'%',width:9,height:9,borderRadius:'50%',transform:'translate(-50%,-50%)',background:'#80ffbd',boxShadow:'0 0 0 2px #09222a'}}/>})}
   </div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:6}}>
    {CONE_AERIAL_STOPS.map(s=><button key={s.id} data-cone-destination={s.id} onClick={()=>onFly(s.id)} aria-label={'Fly in to '+s.label} style={{minHeight:48,borderRadius:10,background:'#123443',border:'1px solid #599bad',color:'#fff',padding:7,textAlign:'left',fontSize:10,fontWeight:800,touchAction:'manipulation'}}>↘ {s.label}</button>)}
   </div>
   <div style={{display:'flex',gap:6,marginTop:8}}>
    <button onClick={onScan} data-cone-holo-scan="true" style={{flex:1,minHeight:44,borderRadius:10,background:'#263f55',border:'1px solid #85e6ff',color:'#fff',fontWeight:800}}>◉ HOLO SCAN</button>
    <button onClick={onCinema} data-cone-cinema="true" style={{flex:1,minHeight:44,borderRadius:10,background:'#34324c',border:'1px solid #d7b8ff',color:'#fff',fontWeight:800}}>🎬 HOLO CINEMA</button>
   </div>
   <p role="status" aria-live="polite" style={{fontSize:11,color:'#b2eaff',margin:'8px 1px 0'}}>{status}</p>
   <small style={{fontSize:9,color:'#a9bcc7'}}>3D in-game flight, not a live satellite map. Approximate buildings and park. No real guard-security routes or special cone hardware required.</small>
  </section>
 </div>
}
