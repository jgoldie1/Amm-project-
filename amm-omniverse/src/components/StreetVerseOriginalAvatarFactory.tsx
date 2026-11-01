import {useState} from 'react';
import AvatarCreator from './AvatarCreator';
import {AVATAR_CAPTURE_GUIDANCE,AVATAR_MULTI_VIEW_PIPELINE} from '../runtime/AvatarMultiViewMeshPipeline';
import {BIOMETRIC_AVATAR_PRIVACY_POLICY} from '../runtime/BiometricAvatarPrivacyRuntime';

// Reuse the original shipped avatar creator, face fitting and privacy gate.
// This is a separate test route and never replaces the canonical StreetVerse scene.
export default function StreetVerseOriginalAvatarFactory(){
 const [finished,setFinished]=useState(false);
 return <main style={{minHeight:'100vh',background:'#020212',color:'#fff',fontFamily:'system-ui'}}>
 <header style={{padding:'12px 16px',display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
 <a href="/streetverse" style={{color:'#9feaff'}}>Back to StreetVerse</a>
 <strong>StreetVerse Original Character Factory</strong>
 <span>Local-first avatar fitting</span>
 </header>
 <p style={{padding:'0 16px'}}>Uses the existing AvatarCreator, AvatarSystem, biometric consent and multi-view pipeline. {AVATAR_CAPTURE_GUIDANCE.note}</p>
 <p style={{padding:'0 16px',fontSize:13}}>Privacy: {BIOMETRIC_AVATAR_PRIVACY_POLICY.defaultProcessing}. The pipeline defines {AVATAR_MULTI_VIEW_PIPELINE.length} stages; completion of every stage has not been verified.</p>
 {finished?<section style={{padding:20}}><h2>Character selection completed</h2><p>Return to StreetVerse to inspect your player. A photo-perfect 3D reconstruction is not guaranteed by this workflow.</p><a href="/streetverse">Enter StreetVerse</a><button style={{marginLeft:12}} onClick={()=>setFinished(false)}>Edit character</button></section>:<div style={{height:'min(80vh,900px)',minHeight:560}}><AvatarCreator onDone={()=>setFinished(true)}/></div>}
 </main>;
}
