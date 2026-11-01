import {useEffect,useRef,useState} from 'react';
import {reviewScanQuality} from '../game/creator/StreetVerseScanQuality';
import {REQUIRED_VIEWS,OPTIONAL_VIEWS,captureChecklist,authorizeCharacterReconstruction,type CaptureView,type CaptureRecord} from '../game/creator/StreetVerseMultiViewScan';
const labels:Record<CaptureView,string>={'face-front':'Face — front','face-left':'Face — left profile','face-right':'Face — right profile','head-back':'Head — back','body-front':'Body — front','body-side':'Body — side','body-back':'Body — back'};
export default function StreetVerseFaceScanCapture(){
 const [captures,setCaptures]=useState<CaptureRecord[]>([]);
 const [ownerConfirmed,setOwnerConfirmed]=useState(false);
 const [processingApproved,setProcessingApproved]=useState(false);
 const [reviewReady,setReviewReady]=useState(false);
 const [qualityDetails,setQualityDetails]=useState<string[]>([]);
 const [status,setStatus]=useState('Choose photos or use your phone camera. Photos remain on this device.');
 const [previews,setPreviews]=useState<Record<string,string>>({});
 const urls=useRef<string[]>([]);
 useEffect(()=>()=>{urls.current.forEach(url=>URL.revokeObjectURL(url))},[]);
 const checklist=captureChecklist(captures);
 function select(view:CaptureView,file?:File){if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size<10000||file.size>12*1024*1024){setStatus('Use a JPG, PNG or WebP image between 10 KB and 12 MB.');return}
  const url=URL.createObjectURL(file);urls.current.push(url);
  setPreviews(old=>({...old,[view]:url}));
  setCaptures(old=>[...old.filter(c=>c.view!==view),{view,blob:file,capturedAt:new Date().toISOString()}]);
  setReviewReady(false);setQualityDetails([]);setStatus(labels[view]+' captured locally.');
 }
 return <section aria-label="StreetVerse personal likeness scan" style={{maxWidth:680,margin:'auto',padding:16}}>
 <h2>Scan yourself for your StreetVerse Digital Twin</h2>
 <p>Front, left side, right side and back of head. Full-body views are optional. Use your own images or images you are authorized to submit.</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
 {[...REQUIRED_VIEWS,...OPTIONAL_VIEWS].map(view=><label key={view} style={{padding:12,border:'1px solid #777',borderRadius:10,display:'grid',gap:8}}>
 <strong>{labels[view]}</strong>
 {previews[view]&&<img src={previews[view]} alt={labels[view]+' captured preview'} style={{maxWidth:'100%',maxHeight:160,objectFit:'contain'}}/>}
 <input aria-label={'Upload '+labels[view]} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e=>select(view,e.target.files?.[0])}/>
 </label>)}</div>
 <p>Required views: {checklist.complete?'Complete':checklist.missing.map(v=>labels[v]).join(', ')}</p>
 <label style={{display:'block',margin:'12px 0'}}><input type="checkbox" checked={ownerConfirmed} onChange={e=>setOwnerConfirmed(e.target.checked)}/> These images are of me, or I have permission from the person pictured.</label>
 <label style={{display:'block',margin:'12px 0'}}><input type="checkbox" checked={processingApproved} onChange={e=>setProcessingApproved(e.target.checked)}/> I consent to using these images to create a personal 3D avatar.</label>
 <button style={{minHeight:52,padding:12}} onClick={async()=>{try{authorizeCharacterReconstruction(captures,{ownerConfirmed,processingApproved,uploadApproved:false,voiceApproved:false});const quality=await reviewScanQuality(captures);setQualityDetails(quality.results.flatMap(r=>r.warnings.map(w=>labels[r.view]+': '+w)));setReviewReady(quality.ready);setStatus(quality.ready?'Scan quality checks passed. Photos remain on this device; reconstruction is not connected.':'Some images need replacement before continuing.')}catch(error){setReviewReady(false);setStatus(error instanceof Error?error.message:'Scan not ready')}}}>Review my scan</button>
 {reviewReady&&<div style={{padding:12,border:'1px solid #777',borderRadius:10}}><h3>Capture review complete</h3><p>Your photographs have not been uploaded or converted into a 3D model. You can continue to the separate character profile editor; your photos will not transfer to it.</p><a href="/streetverse/character-creator">Continue to character customization</a></div>}
 {qualityDetails.length>0&&<ul aria-label="Image quality warnings">{qualityDetails.map((detail,i)=><li key={i}>{detail}</li>)}</ul>}
 <p role="status">{status}</p>
 </section>;
}
