import {compileNearWestRoadMeshes} from '../data/streetVerseNearWestRoadNetwork'

export default function StreetVerseNearWestRoadPreview(){
 const roads=compileNearWestRoadMeshes()
 return <div aria-label="StreetVerse Near West road compiler" style={{display:'grid',gap:8}}>
  {roads.map(r=><div key={r.id} style={{padding:10,border:'1px solid #33475b',borderRadius:10,background:'#0b121a',color:'#d9e7f4'}}>
   <strong>{r.id}</strong><span style={{display:'block',fontSize:11,color:'#8fa5b9'}}>{Math.round(r.length)}m • road {r.width}m • sidewalks {r.sidewalkWidth}m/side</span>
  </div>)}
 </div>
}
