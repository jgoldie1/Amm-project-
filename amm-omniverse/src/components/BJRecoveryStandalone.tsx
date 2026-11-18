import {useEffect,useState} from 'react'
import {importStreetVerseCharacterFiles,readLocalCastAsset} from '../runtime/StreetVerseCharacterLocalRecovery'

export default function BJRecoveryStandalone(){
  const [status,setStatus]=useState('Choose the corrected BJ V15 GLB below.')
  const [ready,setReady]=useState(false)
  const [busy,setBusy]=useState(false)

  useEffect(()=>{void readLocalCastAsset('bj-stubbs').then(asset=>{
    if(asset){setReady(true);setStatus('BJ V15 is already saved on this device. You can open StreetVerse Core now.')}
  }).catch(()=>{})},[])

  const onFile=async(files:FileList|null)=>{
    if(!files?.length)return
    setBusy(true);setStatus('Saving BJ V15 to this device…')
    try{
      const results=await importStreetVerseCharacterFiles(files)
      const bj=results.find(x=>x.id==='bj-stubbs'&&x.stored)
      if(!bj)throw new Error('That file was not recognized as the BJ V15 recovery GLB.')
      setReady(true)
      setStatus('BJ V15 SAVED ON THIS DEVICE. Press OPEN STREETVERSE CORE.')
    }catch(error){
      setReady(false);setStatus('UPLOAD FAILED • '+String(error))
    }finally{setBusy(false)}
  }

  return <main style={{minHeight:'100dvh',background:'#06111b',color:'#fff',fontFamily:'system-ui',padding:'max(20px,env(safe-area-inset-top)) 16px 32px',display:'grid',placeItems:'start center'}}>
    <section style={{width:'min(100%,520px)',background:'#0a1d2b',border:'2px solid #76f0bd',borderRadius:18,padding:18,boxShadow:'0 10px 34px #0008'}}>
      <h1 style={{margin:'0 0 8px',fontSize:26}}>Restore Real BJ V15</h1>
      <p style={{margin:'0 0 16px',fontSize:16,lineHeight:1.4}}>This page only saves the real BJ model to your device. It does not load the full StreetVerse world while you upload.</p>
      <label style={{display:'block',fontWeight:900,fontSize:17,marginBottom:10}}>
        1. CHOOSE BJ V15 GLB
        <input type="file" accept=".glb,model/gltf-binary,.zip,application/zip" disabled={busy}
          onChange={e=>{void onFile(e.target.files);e.target.value=''}}
          style={{display:'block',width:'100%',minHeight:58,marginTop:10,fontSize:16,background:'#fff',color:'#111',borderRadius:10,padding:8}}/>
      </label>
      <div role="status" aria-live="polite" style={{margin:'14px 0',padding:12,borderRadius:10,background:ready?'#113d2d':'#182936',fontWeight:900,fontSize:15}}>
        {busy?'SAVING…':status}
      </div>
      <button type="button" disabled={!ready||busy}
        onClick={()=>{window.location.href='/streetverse?core=1&bj=v15'}}
        style={{width:'100%',minHeight:64,borderRadius:14,border:'2px solid #d9fff0',background:ready?'#166946':'#46525a',color:'#fff',font:'950 18px system-ui',touchAction:'manipulation'}}>
        {ready?'2. OPEN STREETVERSE CORE':'2. UPLOAD BJ FIRST'}
      </button>
      <p style={{margin:'14px 0 0',fontSize:13,opacity:.8}}>If StreetVerse still crashes after BJ is saved, the problem is the 3D game boot—not the upload control.</p>
    </section>
  </main>
}