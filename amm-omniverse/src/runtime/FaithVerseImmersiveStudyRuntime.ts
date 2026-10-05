export type FaithVerseImmersiveStudySession={
 id:string;title:string;section:string;sourceLabelsRequired:true;
 scriptureTextPolicy:'source-only-no-generation';
 reconstructionPolicy:'clearly-labeled-educational-simulation';
 requestedAt:string;featuredBook?:'esther'|'rest-of-esther'|'jubilees';
 surfaces:readonly ['screen-3d','hologpt','holo-lab','faith-chrono','webxr-if-supported']
}

const KEY='tryamm.faithverse.immersive-study.v1'
let installed=false
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))
function featured(title:string):FaithVerseImmersiveStudySession['featuredBook']|undefined{
 const q=title.toLowerCase();if(q.includes('jubilee'))return'jubilees';if(q.includes('rest')&&q.includes('esther'))return'rest-of-esther';if(q.includes('esther'))return'esther'
}
function compile(detail:any):FaithVerseImmersiveStudySession{
 const title=String(detail?.title||'FaithVerse Study').slice(0,180)
 const section=String(detail?.section||'source-labeled study').slice(0,180)
 return{id:'faith-'+Date.now().toString(36),title,section,sourceLabelsRequired:true,scriptureTextPolicy:'source-only-no-generation',reconstructionPolicy:'clearly-labeled-educational-simulation',requestedAt:new Date().toISOString(),featuredBook:featured(title),surfaces:['screen-3d','hologpt','holo-lab','faith-chrono','webxr-if-supported']}
}
export function readFaithVerseImmersiveStudySession():FaithVerseImmersiveStudySession|null{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
export function installFaithVerseImmersiveStudyRuntime(){
 if(installed||typeof window==='undefined')return()=>{};installed=true
 const onRequest=(event:Event)=>{
  const session=compile((event as CustomEvent<any>).detail||{})
  try{localStorage.setItem(KEY,JSON.stringify(session))}catch{}
  document.documentElement.dataset.faithverseImmersiveStudy=session.id
  emit('tryamm:faithverse-immersive-study-session',session)
  const fabric=(window as any).__TRYAMM_OPERATING_FABRIC__
  if(typeof fabric?.route==='function'){
   fabric.route({id:'faith-stubbs-'+session.id,domain:'media',action:'faithverse-study-orchestration',priority:'routine',payload:session,requiresHumanApproval:false})
   fabric.route({id:'faith-lyons-'+session.id,domain:'technology',action:'faithverse-spatial-runtime',priority:'routine',payload:session,requiresHumanApproval:false})
  }
  emit('tryamm:faithverse-ai-fabric-state',{sessionId:session.id,agents:['stubbs-ai','hologpt','lyons-tech'],holoLab:true,webxr:'capability-gated'})
  emit('tryamm:faithverse-living-world-open',{session})
  emit('tryamm:hologpt-study-context',{prompt:'Create a source-labeled immersive study plan for '+session.title+' ('+session.section+'). Never generate missing scripture as source text. Separate scripture, edition/canon metadata, lexical data, commentary, reconstruction and AI explanation.',source:'faithverse-immersive-study-runtime'})
 }
 window.addEventListener('tryamm:faithverse-immersive-study-request',onRequest as EventListener)
 return()=>{window.removeEventListener('tryamm:faithverse-immersive-study-request',onRequest as EventListener);installed=false}
}