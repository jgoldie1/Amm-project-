import {useState} from 'react'
import {TAMPA_BEAUTY_DISTRICTS} from './StreetVerseTampaBeautyDistricts'

export type TampaDestination='riverwalk'|'beauty-house'|'residential'|'entertainment'|'home-001'|'lateasia-mansion'|'bj-chicago-mansion'|'greenville-frat-mansion'
export const TAMPA_DESTINATIONS:Record<TampaDestination,{name:string;x:number;z:number}>={
 riverwalk:{name:'Riverwalk',x:-772,z:780},
 'beauty-house':{name:'LaTeasia Beauty House',x:-705,z:791},
 residential:{name:'Residential Village',x:-710,z:830},
 entertainment:{name:'Entertainment Pier',x:-760,z:830},
 'home-001':{name:'Residence 001',x:-719,z:812},
 'lateasia-mansion':{name:'LaTeasia Tampa Mansion',x:-723,z:864},
 'bj-chicago-mansion':{name:'BJ Stubbs Chicago Gold Coast Mansion',x:950,z:-821},
 'greenville-frat-mansion':{name:'Greenville University Fraternity Mansion',x:310,z:-390}
}
export function StreetVerseTampaTravelDock({onTravel}:{onTravel:(id:TampaDestination)=>void}){
 const [destination,setDestination]=useState<TampaDestination>('beauty-house')
 const [message,setMessage]=useState('Choose a Tampa destination, then travel.')
 return <section aria-label="Tampa district travel" style={{position:'absolute',right:12,bottom:105,zIndex:35,width:'min(270px,58vw)',padding:10,background:'rgba(17,23,39,.94)',border:'1px solid #f4b9d6',borderRadius:12,color:'white'}}>
  <strong>🌴 TAMPA • DISTRICT TRAVEL</strong>
  <label htmlFor="tampa-destination" style={{display:'block',fontSize:13,marginTop:8}}>Destination</label>
  <select id="tampa-destination" value={destination} onChange={e=>setDestination(e.target.value as TampaDestination)} style={{width:'100%',minHeight:48,fontSize:16,borderRadius:8}}>
   {TAMPA_BEAUTY_DISTRICTS.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
   <option value="home-001">Residence 001 • front door</option>
   <option value="lateasia-mansion">LaTeasia • Tampa Mansion</option>
   <option value="bj-chicago-mansion">BJ Stubbs • Chicago Gold Coast Mansion</option>
   <option value="greenville-frat-mansion">Greenville University • Fraternity Mansion</option>
  </select>
  <button type="button" onClick={()=>{onTravel(destination);setMessage('Arrived: '+TAMPA_DESTINATIONS[destination].name)}} style={{width:'100%',minHeight:52,marginTop:8,borderRadius:9,fontWeight:800,fontSize:16}}>TRAVEL TO DISTRICT</button>
  <div role="status" aria-live="polite" style={{fontSize:12,marginTop:8}}>{message}</div>
 </section>
}
