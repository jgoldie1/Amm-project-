import {useState} from 'react'
import './OmniBoxStoryStudio.css'
export type EpisodeBeat={id:string;title:string;purpose:string;dialogue:string;shots:string;audio:string;durationSeconds:number}
export type EpisodeDraft={title:string;series:string;genre:string;rightsNote:string;episodeNumber:number;scenes:EpisodeBeat[];updatedAt:string;renderStatus:'outline-only'}
export const OMNI_BOX_DRAFT_KEY='tryamm.omni-box.episode-outline.v1'
export const OMNI_BOX_HANDOFF_KEY='tryamm.omni-box.holo-drama-handoff.v1'
const TEMPLATE_BEATS:Array<Omit<EpisodeBeat,'id'>>=[
 {title:'Opening — Taylor Street',purpose:'Establish Chicago, show Circle Park and introduce the central problem.',dialogue:'NARRATOR: Every block tells a story. Tonight, a new choice changes the neighborhood.',shots:'Aerial Chicago establishment; Taylor Street; BJ arriving at the guarded entrance.',audio:'Original four-note motif and cleared city ambience.',durationSeconds:300},
 {title:'The Crew',purpose:'Introduce characters, motivations and neighborhood relationships.',dialogue:'BJ: We build together and help the businesses on this block.',shots:'Crew conversations; business exterior; community plaza.',audio:'Original dialogue, street ambience and music rights to be cleared.',durationSeconds:300},
 {title:'A Business Needs Help',purpose:'Introduce a merchant and the story mission.',dialogue:'MERCHANT: I have a great shop. BJ: Then we tell the story.',shots:'Storefront scene; product details; merchant and BJ conversation.',audio:'Licensed audio and permission-cleared location and product imagery.',durationSeconds:300},
 {title:'Hold the Block',purpose:'Introduce district objectives, neighborhood reputation and community missions.',dialogue:'CREW: The control point is ahead. BJ: Reputation comes from what we do.',shots:'District map reveal; checkpoint and crew planning.',audio:'Original mission sting, ambience and properly licensed SFX.',durationSeconds:300},
 {title:'The Turning Point',purpose:'Resolve the challenge and show a visible consequence.',dialogue:'BJ: We leave the neighborhood better than we found it.',shots:'Neighborhood activity; decision; visual change in district.',audio:'Ambient change and original underscore.',durationSeconds:300},
 {title:'Legacy — Next Episode',purpose:'Close the story and tease the next chapter.',dialogue:'NARRATOR: A better future starts here.',shots:'Golden-hour panorama; the crew; ENTER THE WORLD. LEAVE A LEGACY. end card.',audio:'Original end credit theme and properly licensed song.',durationSeconds:300}
]
function initialDraft():EpisodeDraft{return{title:'StreetVerse: Hold the Block',series:'StreetVerse Chicago Stories',genre:'Drama / interactive neighborhood',rightsNote:'Confirm performer releases, music rights, location permissions, branded imagery and credits.',episodeNumber:1,scenes:TEMPLATE_BEATS.map((s,i)=>({...s,id:'act-'+(i+1)})),updatedAt:new Date().toISOString(),renderStatus:'outline-only'}}
function readDraft():EpisodeDraft{try{const saved=localStorage.getItem(OMNI_BOX_DRAFT_KEY);if(!saved)return initialDraft();const data=JSON.parse(saved) as EpisodeDraft;if(data?.title&&Array.isArray(data.scenes)&&data.scenes.length===6)return data}catch{}return initialDraft()}
export default function OmniBoxStoryStudio(){
 const [draft,setDraft]=useState<EpisodeDraft>(readDraft)
 const [selected,setSelected]=useState(0)
 const [status,setStatus]=useState('Six five-minute story blocks prepared. This is a script and shot list, not a rendered movie.')
 const scene=draft.scenes[selected]
 const total=draft.scenes.reduce((n,s)=>n+Number(s.durationSeconds||0),0)
 function change<K extends keyof EpisodeDraft>(key:K,value:EpisodeDraft[K]){setDraft(x=>({...x,[key]:value}));setStatus('Unsaved editing changes.')}
 function changeScene<K extends keyof EpisodeBeat>(key:K,value:EpisodeBeat[K]){setDraft(x=>({...x,scenes:x.scenes.map((s,i)=>i===selected?{...s,[key]:value}:s)}));setStatus('Unsaved scene changes.')}
 function save():boolean{try{localStorage.setItem(OMNI_BOX_DRAFT_KEY,JSON.stringify({...draft,updatedAt:new Date().toISOString()}));setStatus('Saved in this browser; download a backup.');return true}catch{setStatus('Storage is unavailable. Download the production packet.');return false}}
 function exportFile(format:'json'|'txt'){
  const content=format==='json'?JSON.stringify({...draft,updatedAt:new Date().toISOString()},null,2):[
   'TRYAMM OMNI BOX · HOLO DRAMA PRODUCTION PACKET','OUTLINE ONLY — NOT RENDERED VIDEO',
   'Series: '+draft.series,'Episode: '+draft.episodeNumber,'Title: '+draft.title,'Genre: '+draft.genre,
   'Total planned duration: '+Math.floor(total/60)+'m '+(total%60)+'s',
   'Rights checklist: '+draft.rightsNote,'',
   ...draft.scenes.flatMap((s,i)=>['ACT '+(i+1)+' — '+s.title+' ('+Math.round(s.durationSeconds/60)+' min)','Purpose: '+s.purpose,'Dialogue: '+s.dialogue,'Camera/shot list: '+s.shots,'Audio rights: '+s.audio,''])
  ].join('\n')
  const url=URL.createObjectURL(new Blob([content],{type:format==='json'?'application/json':'text/plain;charset=utf-8'}))
  const a=document.createElement('a');a.href=url;a.download='streetverse-episode-'+draft.episodeNumber+'-production-packet.'+format;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1200)
  setStatus('Draft production packet downloaded. Footage still needs to be made and edited.')
 }
 function handoff(){try{localStorage.setItem(OMNI_BOX_HANDOFF_KEY,JSON.stringify({...draft,updatedAt:new Date().toISOString()}));save();window.location.href='/holo-drama?from=omni-box'}catch{setStatus('Could not hand off. Download your JSON packet as a backup.')}}
 return <main className="omni-story">
  <header className="omni-story-header"><div><p>TRYAMM · OMNI BOX</p><h1>Make a 30-minute Holo Drama episode</h1><p>Plan six five-minute acts and prepare the script, shots, dialogue and audio for production.</p></div><nav><a href="/holo-drama">HOLO DRAMA ↗</a><a href="/business-app.html">BUSINESS APP ↗</a><a href="/streetverse">STREETVERSE ↗</a></nav></header>
  <section className="omni-story-facts" aria-label="Episode plan progress"><div><strong>6</strong><span>planned acts</span></div><div><strong>{Math.floor(total/60)}:{String(total%60).padStart(2,'0')}</strong><span>target duration</span></div><div><strong>0</strong><span>minutes rendered</span></div></section>
  <section className="omni-story-work"><div className="omni-story-setup"><h2>Episode identity</h2>
    <label>Series title<input value={draft.series} onChange={e=>change('series',e.target.value.slice(0,90))}/></label><label>Episode title<input value={draft.title} onChange={e=>change('title',e.target.value.slice(0,110))}/></label><label>Genre<input value={draft.genre} onChange={e=>change('genre',e.target.value.slice(0,80))}/></label><label>Episode number<input type="number" min={1} max={999} value={draft.episodeNumber} onChange={e=>change('episodeNumber',Math.max(1,Math.min(999,Number(e.target.value)||1)))}/></label><label>Rights and performer release notes<textarea value={draft.rightsNote} onChange={e=>change('rightsNote',e.target.value.slice(0,1500))}/></label></div>
   <div className="omni-story-script"><h2>Scene-by-scene production plan</h2><p>Six acts × five minutes = a 30-minute outline. Editable story notes, not generated footage.</p><nav aria-label="Episode act selection">{draft.scenes.map((s,i)=><button type="button" aria-pressed={selected===i} key={s.id} onClick={()=>setSelected(i)}>{i+1}. {s.title}</button>)}</nav>
   <div className="omni-story-editor" key={scene.id}><p>ACT {selected+1} · {scene.durationSeconds/60} MINUTES</p><label>Scene title<input value={scene.title} onChange={e=>changeScene('title',e.target.value.slice(0,120))}/></label><label>Plot and objective<textarea rows={3} value={scene.purpose} onChange={e=>changeScene('purpose',e.target.value.slice(0,1600))}/></label><label>Script and dialogue<textarea rows={5} value={scene.dialogue} onChange={e=>changeScene('dialogue',e.target.value.slice(0,3800))}/></label><label>Camera and shot list<textarea rows={4} value={scene.shots} onChange={e=>changeScene('shots',e.target.value.slice(0,2000))}/></label><label>Music, voice and sound direction<textarea rows={3} value={scene.audio} onChange={e=>changeScene('audio',e.target.value.slice(0,1200))}/></label></div></div></section>
  <section className="omni-story-export"><h2>Production and release</h2><p>Prepare each act with licensed assets, film or render the footage, edit into one episode, add subtitles and verify distribution rights. Actual paid video publishing needs live media storage, checkout and verified creator ledger integration.</p><div><button onClick={save}>SAVE OUTLINE</button><button onClick={()=>exportFile('txt')}>DOWNLOAD SHOT LIST + SCRIPT</button><button onClick={()=>exportFile('json')}>EXPORT STRUCTURED EPISODE</button><button onClick={handoff}>SEND OUTLINE TO HOLO DRAMA →</button></div><p role="status">{status}</p><p className="omni-story-warning">This planner does not render video, publish a finished episode or collect payments. No footage is uploaded by Omni Box.</p></section>
 </main>
}
