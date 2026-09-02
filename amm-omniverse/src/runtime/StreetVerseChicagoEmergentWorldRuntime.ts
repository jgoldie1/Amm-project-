import { installStreetVerseCityEnginePhysicalBridgeRuntime } from './StreetVerseCityEnginePhysicalBridgeRuntime'
import { installStreetVerseChicagoBattleCreatorRuntime } from './StreetVerseChicagoBattleCreatorRuntime'
import { installStreetVerseChicagoJusticeMissionsRuntime } from './StreetVerseChicagoJusticeMissionsRuntime'
import { installStreetVerseManhuntDirectorRuntime } from './StreetVerseManhuntDirectorRuntime'
import { installStreetVerseTemporalConsequencesRuntime } from './StreetVerseTemporalConsequencesRuntime'

let installed=false
const KEY='tryamm.streetverse.chicago-emergent.v1'
type WorldState={heat:number;reputation:number;secrets:number;weather:string;districtMood:string;lastChoice?:string}
const clamp=(n:number)=>Math.max(0,Math.min(100,n))
function read():WorldState{try{return {...{heat:0,reputation:10,secrets:0,weather:'clear',districtMood:'neutral'},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {heat:0,reputation:10,secrets:0,weather:'clear',districtMood:'neutral'}}}
function save(s:WorldState){try{localStorage.setItem(KEY,JSON.stringify({...s,updatedAt:new Date().toISOString()}))}catch{}}
function emit(name:string,detail:any){window.dispatchEvent(new CustomEvent(name,{detail}))}
export function installStreetVerseChicagoEmergentWorldRuntime(){if(installed||typeof window==='undefined')return;installed=true;
installStreetVerseCityEnginePhysicalBridgeRuntime();
installStreetVerseChicagoBattleCreatorRuntime();
installStreetVerseChicagoJusticeMissionsRuntime();
installStreetVerseManhuntDirectorRuntime();
installStreetVerseTemporalConsequencesRuntime();
let state=read();
window.addEventListener('tryamm:mission-completed',(e:any)=>{const d=e.detail||{};state.reputation=clamp(state.reputation+(d.source==='chicago-underground'?4:2));save(state);emit('tryamm:chicago-world-state',{...state,reason:'mission-completed'})});
window.addEventListener('tryamm:easter-egg-found',()=>{state.secrets+=1;save(state);if(state.secrets===3)emit('tryamm:secret-chain-unlocked',{id:'three-keys',title:'The Three Keys',reward:'hidden Chicago archive room'});if(state.secrets===7)emit('tryamm:secret-chain-unlocked',{id:'deep-city',title:'Deep City',reward:'underground fast-travel node'})});
window.addEventListener('tryamm:streetverse-choice',(e:any)=>{const d=e.detail||{};state.lastChoice=String(d.choice||'unknown');state.reputation=clamp(state.reputation+Number(d.reputationDelta||0));state.heat=clamp(state.heat+Number(d.heatDelta||0));save(state);emit('tryamm:chicago-world-state',{...state,reason:'choice'})});
window.addEventListener('tryamm:streetverse-weather',(e:any)=>{state.weather=String(e.detail?.weather||'clear');save(state);emit('tryamm:seasonal-world-react',{weather:state.weather,effects:state.weather.includes('snow')?['slick roads','winter crowds','warming missions','transit delays']:state.weather.includes('storm')?['lake closure','rescue missions','traffic slowdown']:['normal city activity']})});
window.addEventListener('tryamm:district-enter',(e:any)=>{const district=String(e.detail?.district||'Chicago');state.districtMood=state.reputation>70?'welcoming':state.heat>60?'alert':'neutral';save(state);emit('tryamm:district-react',{district,mood:state.districtMood,reputation:state.reputation,heat:state.heat})});
emit('tryamm:chicago-emergent-ready',{systems:['physical CityEngine mission zones','StreetVerse-original battle + creator','justice missions','manhunt director','temporal consequences','persistent choices','district reputation','secret chains','weather reactions','dynamic encounters','hidden fast travel'],state})}
