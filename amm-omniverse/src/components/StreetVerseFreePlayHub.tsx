import React,{useState} from 'react'
import {StreetVerseCreatorStudio} from './StreetVerseCreatorStudio'
type Props={onClose:()=>void}
const modes=[
 {name:'StreetVerse Chicago',description:'Free-to-enter Chicago roleplay missions',href:'/streetverse',state:'Playable route — actual 3D readiness must be verified'},
 {name:'CampusVerse',description:'Campus roleplay expansion',href:'/streetverse',state:'Planned crossover; no standalone launch claimed'},
 {name:'Creator Studio',description:'Design and submit a jacket with large one-handed controls',href:'',state:'Local demonstration; no public sales'},
]
export default function StreetVerseFreePlayHub({onClose}:Props){
 const [studio,setStudio]=useState(false)
 return <div role="dialog" aria-modal="true" aria-label="TRYAMM free play hub" style={{position:'fixed',inset:0,zIndex:12050,overflowY:'auto',background:'#080d1b',color:'#fff',padding:20}}>
  <div style={{maxWidth:780,margin:'0 auto'}}>
   <button type="button" onClick={onClose} style={{minHeight:48,padding:'8px 18px'}}>Close free play hub</button>
   <h1>TRYAMM FREE PLAY</h1>
   <p>Play the available StreetVerse experience without buying a game pass. Fictional mission credits cannot be cashed out or converted to real money.</p>
   <p role="note">Internal hash-chain receipts are experimental audit records, not a public blockchain, financial settlement system or substitute for an independent security audit.</p>
   <div style={{display:'grid',gap:14}}>
    {modes.map(mode=><section key={mode.name} style={{border:'1px solid #3b506c',borderRadius:12,padding:16}}>
      <h2>{mode.name}</h2><p>{mode.description}</p><small>{mode.state}</small>
      {mode.name==='Creator Studio'
       ?<button type="button" onClick={()=>setStudio(v=>!v)} style={{display:'block',minHeight:48,marginTop:12,padding:'8px 16px'}}>{studio?'Hide Creator Studio':'Open Creator Studio'}</button>
       :<a href={mode.href} style={{display:'inline-block',padding:14,marginTop:12,color:'#8be9ff'}}>Open available StreetVerse route</a>}
    </section>)}
   </div>
   {studio&&<div style={{marginTop:18}}><StreetVerseCreatorStudio/></div>}
   <p>Game-engine compatibility is a staged integration plan: browser Three.js first; Godot, Unity, Unreal, WebXR and multiplayer require separate builds, licenses and acceptance tests.</p>
  </div>
 </div>
}
