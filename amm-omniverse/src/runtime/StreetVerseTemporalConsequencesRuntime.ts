let installed=false
const KEY='tryamm.streetverse.temporal-consequences.v1'
type TemporalState={artifacts:string[];presentChanges:string[];chronoKeys:number;futureUnlocked:boolean}
function read():TemporalState{try{return {...{artifacts:[],presentChanges:[],chronoKeys:0,futureUnlocked:false},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {artifacts:[],presentChanges:[],chronoKeys:0,futureUnlocked:false}}}
function save(s:TemporalState){try{localStorage.setItem(KEY,JSON.stringify({...s,updatedAt:new Date().toISOString()}))}catch{}}
function emit(name:string,detail:any){window.dispatchEvent(new CustomEvent(name,{detail}))}
const unique=(a:string[])=>[...new Set(a)]
const effects:Record<string,{artifact:string;change:string;unlock?:string}>={
 'tunnel-1906':{artifact:'1906 freight key',change:'Old freight markings now glow near the secret tunnel junction.',unlock:'freight-archive-door'},
 'loop-1893':{artifact:'1893 archive echo',change:'A historical hologram can now appear at a downtown discovery point.',unlock:'white-city-echo'},
 'river-reversal':{artifact:'waterway blueprint',change:'River engineering clues now appear in the underground pump chamber.',unlock:'pump-room-cipher'},
 'jazz-1920s':{artifact:'1920s music cipher',change:'A hidden music phrase can unlock a South Side archive room.',unlock:'jazz-archive'},
 'blues-1950s':{artifact:'blues reel',change:'A vintage recording clue now appears in a present-day creator studio.',unlock:'blues-vault'},
 'house-1980s':{artifact:'house frequency code',change:'A hidden After Dark entrance can react to the recovered frequency.',unlock:'warehouse-echo-club'},
 'flood-1992-time':{artifact:'1992 flood archive case',change:'High-water marks and a previously sealed simulated passage become discoverable.',unlock:'flood-memory-door'},
 'future-2046':{artifact:'future blueprint',change:'A speculative future overlay becomes available at selected Chicago viewpoints.',unlock:'future-echo-mode'},
 'time-heist':{artifact:'Chicago Chronokey',change:'The deepest StreetVerse Chicago archive can now be unlocked.',unlock:'chrono-archive'}
}
export function installStreetVerseTemporalConsequencesRuntime(){if(installed||typeof window==='undefined')return;installed=true;let state=read();window.addEventListener('tryamm:mission-completed',(e:any)=>{const d=e.detail||{};if(d.source!=='chicago-time-machine')return;const fx=effects[String(d.missionId||'')];if(!fx)return;state.artifacts=unique([...state.artifacts,fx.artifact]);state.presentChanges=unique([...state.presentChanges,fx.change]);state.chronoKeys=state.artifacts.length;state.futureUnlocked=state.chronoKeys>=7;save(state);emit('tryamm:temporal-present-change',{missionId:d.missionId,...fx,state});if(fx.unlock)emit('tryamm:secret-unlock',{id:fx.unlock,source:'time-machine'});if(state.futureUnlocked)emit('tryamm:future-chicago-unlocked',{reason:'temporal-artifact-threshold',artifacts:state.artifacts})});window.addEventListener('tryamm:time-machine-enter',(e:any)=>emit('tryamm:temporal-echo-transition',{era:e.detail?.era,title:e.detail?.title,mode:'simulation',preservePlayerPosition:true}));emit('tryamm:temporal-consequences-ready',{state,effects:Object.keys(effects).length})}
