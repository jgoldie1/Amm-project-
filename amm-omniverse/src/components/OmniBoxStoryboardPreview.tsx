import {useEffect,useState} from 'react'
import type {EpisodeBeat} from './OmniBoxStoryStudio'
import './OmniBoxStoryboardPreview.css'
export default function OmniBoxStoryboardPreview({scenes,selected,onSelect}:{scenes:EpisodeBeat[];selected:number;onSelect:(index:number)=>void}){
 const [playing,setPlaying]=useState(false)
 useEffect(()=>{if(!playing||scenes.length<2)return;const ticker=window.setInterval(()=>onSelect((selected+1)%scenes.length),4200);return()=>window.clearInterval(ticker)},[playing,selected,onSelect,scenes.length])
 const scene=scenes[selected]
 if(!scene)return null
 const designs=['street','crew','shop','territory','turn','legacy']
 const theme=designs[selected%designs.length]
 return <section className="omni-board-preview" aria-label="Omni Box interactive episode storyboard preview">
  <div className="omni-board-bar"><div><p className="omni-board-kicker">OMNI BOX · HOLO DRAMA</p><h2>Preview your episode scenes</h2></div><span className="omni-board-truth">ANIMATED STORYBOARD · NOT RENDERED FILM</span></div>
  <div className={'omni-board-stage omni-board-'+theme} role="group" aria-label={'Preview scene '+(selected+1)+': '+scene.title}>
   <svg className="omni-board-scene" viewBox="0 0 960 470" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sky-omni" x1="0" y1="0" x2="0" y2="1"><stop stopColor={selected>=4?'#9b587a':'#193755'}/><stop offset="1" stopColor={selected>=4?'#edaa70':'#376d7e'}/></linearGradient></defs>
    <rect width="960" height="470" fill="url(#sky-omni)"/>
    <circle cx="778" cy="105" r="54" fill="#fff3c7" opacity=".64"/>
    <path d="M0 290V130H120V229H153V85H306V235H350V151H458V280H495V121H641V265H690V185H803V280H830V164H960V470H0Z" fill="#1b2e36"/>
    <g stroke="#88b2cb" strokeWidth="2" opacity=".34" fill="#b8dcda"><rect x="186" y="111" width="24" height="32"/><rect x="236" y="111" width="24" height="32"/><rect x="518" y="156" width="28" height="32"/><rect x="587" y="156" width="28" height="32"/><rect x="860" y="189" width="25" height="30"/><rect x="911" y="189" width="25" height="30"/></g>
    <path d="M0 290H960V470H0Z" fill="#353e45"/>
    <path d="M80 470L465 290H520L904 470Z" fill="#5b6269"/>
    <path d="M481 315L486 358M482 384L483 418M485 443L487 460" stroke="#ead3a0" strokeWidth="5" strokeDasharray="18 13"/>
    <g className="omni-board-tree" fill="#315e53"><rect x="90" y="223" width="10" height="91" fill="#72583e"/><circle cx="95" cy="224" r="53"/><rect x="840" y="240" width="9" height="79" fill="#72583e"/><circle cx="845" cy="234" r="49"/></g>
    {theme==='shop'?<g className="omni-board-special"><rect x="155" y="200" width="146" height="102" fill="#b99a6c"/><path d="M155 200l20-28h106l20 28" fill="#e3c1a0"/><text x="228" y="231" textAnchor="middle" fill="#19353a" fontSize="20" fontWeight="700">LOCAL SHOP</text></g>:null}
    {theme==='territory'?<g className="omni-board-special"><ellipse cx="484" cy="376" rx="106" ry="28" fill="none" stroke="#baffbd" strokeWidth="9" strokeDasharray="16 10"/><path d="M487 325v-85" stroke="#baffbd" strokeWidth="6"/><circle cx="487" cy="234" r="24" fill="#baffbd"/></g>:null}
    <g className="omni-board-actor" transform="translate(365 265)"><circle cx="0" cy="0" r="24" fill="#704a34"/><path d="M-30 30q30-12 60 0l18 83h-95Z" fill="#121b2d"/><path d="M-23 115v62m45-62v62" stroke="#151b29" strokeWidth="20" strokeLinecap="round"/></g>
    <g className="omni-board-actor-side" transform="translate(605 273)"><circle cx="0" cy="0" r="21" fill="#987052"/><path d="M-25 30q25-12 50 0l15 76h-78Z" fill="#77684c"/><path d="M-18 109v57m37-57v57" stroke="#1c2330" strokeWidth="17" strokeLinecap="round"/></g>
   </svg>
   <div className="omni-board-top"><span>STREETVERSE CHICAGO STORIES</span><span>EPISODE 01 · ACT {selected+1} / {scenes.length}</span></div>
   <div className="omni-board-lower"><span className="omni-board-shot">{scene.shots.slice(0,145)}</span><h3>{scene.title}</h3><p>{scene.dialogue}</p></div>
  </div>
  <div className="omni-board-controls"><button type="button" onClick={()=>onSelect((selected-1+scenes.length)%scenes.length)}>← Previous scene</button><button type="button" aria-pressed={playing} onClick={()=>setPlaying(v=>!v)}>{playing?'Pause storyboard':'▶ Play storyboard'}</button><button type="button" onClick={()=>onSelect((selected+1)%scenes.length)}>Next scene →</button></div>
  <p className="omni-board-explainer" role="status">Scene {selected+1} of {scenes.length} · {scene.durationSeconds/60} minutes planned. This is an original animated concept preview of your screenplay. Actual actors, 3D rigging, voices, rendering, editing and distribution still require production.</p>
 </section>
}
