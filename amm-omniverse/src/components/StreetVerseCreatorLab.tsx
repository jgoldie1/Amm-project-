import {useState} from 'react';
import {planCreatorJob,recommendProvider,validateCreatorAsset,type CreatorAsset,type CreatorAssetKind} from '../game/creator/StreetVerseCreatorPipeline';
export default function StreetVerseCreatorLab(){
 const [name,setName]=useState('BJ Stubbs walk animation');
 const [kind,setKind]=useState<CreatorAssetKind>('motion-video');
 const [rights,setRights]=useState(false);
 const [result,setResult]=useState('');
 const asset:CreatorAsset={id:'bj-demo-001',name,kind,license:rights?'owned':'unknown',status:rights?'approved':'pending'};
 const check=validateCreatorAsset(asset);
 return <main style={{maxWidth:720,margin:'auto',padding:24,fontFamily:'system-ui'}}><h1>StreetVerse Creator Pipeline Lab</h1>
 <p>Plan character motion, clothing and identity assets without uploading files or running paid AI.</p>
 <label htmlFor="asset-name">Asset name</label><input id="asset-name" value={name} onChange={e=>setName(e.target.value)} style={{display:'block',padding:12,width:'100%',boxSizing:'border-box'}}/>
 <label htmlFor="asset-type">Asset type</label><select id="asset-type" value={kind} onChange={e=>setKind(e.target.value as CreatorAssetKind)} style={{display:'block',padding:12,width:'100%'}}>
 {(['character-reference','motion-video','motion-glb','outfit-fbx','outfit-glb'] as CreatorAssetKind[]).map(v=><option key={v} value={v}>{v}</option>)}</select>
 <label style={{display:'block',marginTop:14}}><input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)}/> I own or have commercial permission for this asset</label>
 <p>Suggested workflow: {recommendProvider(kind)}</p>
 <button style={{padding:14,minHeight:48}} onClick={()=>setResult(JSON.stringify(planCreatorJob(asset),null,2))}>Validate and plan</button>
 <p role="status">{check.ok?'Ready for rig inspection':'Rights/approval required before processing'}</p><pre style={{whiteSpace:'pre-wrap'}}>{result}</pre>
 <p>No third-party services are connected. No assets are uploaded or published.</p></main>;
}
