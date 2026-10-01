import { useMemo, useState } from 'react'
import {
  TAYLOR_STREET_CORRIDOR,
  type StreetVerseBusinessLot,
  type StreetVerseVec3,
} from '../data/streetVerseCartesianNeighborhood'

type Props = {
  onClose: () => void
  onTravel?: (position: StreetVerseVec3) => void
}

export default function StreetVerseTaylorBlockExplorer({onClose,onTravel}:Props){
  const block=TAYLOR_STREET_CORRIDOR.blocks[0]
  const businesses=useMemo(()=>block.businesses,[block])
  const [inside,setInside]=useState<StreetVerseBusinessLot|null>(null)

  const enter=(business:StreetVerseBusinessLot)=>{
    setInside(business)
    onTravel?.(business.entrance.interiorSpawn)
  }
  const exit=()=>{
    if(inside) onTravel?.(inside.entrance.exitReturn)
    setInside(null)
  }

  if(inside){
    return <section aria-label={inside.displayName+' interior'} style={{position:'fixed',inset:0,zIndex:11800,background:'linear-gradient(#17191e,#090a0d)',color:'#fff',padding:20,overflowY:'auto'}}>
      <button onClick={exit} style={buttonStyle}>← EXIT TO TAYLOR STREET</button>
      <div style={{maxWidth:720,margin:'36px auto',border:'1px solid #48505c',borderRadius:22,padding:24,background:'#12151a'}}>
        <div style={{fontSize:11,letterSpacing:2,color:'#7de8ff'}}>STREETVERSE INTERIOR • {inside.entrance.interiorId}</div>
        <h2>{inside.displayName}</h2>
        <p style={{color:'#b9c1cc'}}>This is the first enterable-business shell. Commerce, NPC, mission and inventory panels attach here without changing the street coordinates.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
          <button style={tileStyle}>TALK / NPC</button><button style={tileStyle}>SHOP</button>
          <button style={tileStyle}>MISSION</button><button style={tileStyle}>DELIVERY</button>
        </div>
      </div>
    </section>
  }

  return <section aria-label="Taylor Street Cartesian block explorer" style={{position:'fixed',inset:0,zIndex:11700,background:'#071019',color:'#fff',padding:16,overflowY:'auto'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
      <div><div style={{fontSize:10,color:'#61e6ff',letterSpacing:2}}>STREETVERSE CHICAGO • CARTESIAN GRID</div><h2 style={{margin:'4px 0'}}>Taylor Street — Block 00</h2></div>
      <button onClick={onClose} aria-label="Close Taylor Street" style={buttonStyle}>×</button>
    </header>
    <div style={{maxWidth:820,margin:'22px auto'}}>
      <div style={{position:'relative',height:360,border:'2px solid #405164',borderRadius:20,overflow:'hidden',background:'linear-gradient(180deg,#283b4d 0 38%,#4b4b4b 38% 62%,#777 62% 68%,#30363b 68%)'}}>
        <div style={{position:'absolute',left:0,right:0,top:'48%',height:4,background:'#e5c95a'}} />
        <div style={{position:'absolute',left:12,top:12,fontSize:11}}>BLOCK {block.grid.column},{block.grid.row} • {block.sizeMeters.width}m × {block.sizeMeters.depth}m</div>
        {businesses.map((business,i)=><button key={business.id} onClick={()=>enter(business)} style={{position:'absolute',left:`${18+i*38}%`,bottom:22,width:'34%',minHeight:112,border:'2px solid #70eaff',borderRadius:12,background:'#121820',color:'#fff',padding:12,textAlign:'left',cursor:'pointer'}}>
          <strong>{business.displayName}</strong><span style={{display:'block',fontSize:10,color:'#a8b7c7',marginTop:5}}>{business.category} • {business.streetAddressLabel}</span><span style={{display:'block',marginTop:15,fontWeight:900,color:'#70eaff'}}>ENTER →</span>
        </button>)}
      </div>
      <div style={{marginTop:12,fontSize:12,color:'#9fb0c1'}}>Street position is preserved across ENTER/EXIT. This block is the reusable template for corners, stores, apartments, restaurants and player businesses.</div>
    </div>
  </section>
}
const buttonStyle={border:'1px solid #52687c',borderRadius:12,background:'#101923',color:'#fff',padding:'10px 14px',fontWeight:900,cursor:'pointer'} as const
const tileStyle={...buttonStyle,minHeight:70} as const
