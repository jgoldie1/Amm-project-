import {useEffect,useMemo,useRef,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'

type PublicReelPayload={publication:{public_slug:string;caption?:string;destination:string;delivered_at?:string};media:{id:string;title?:string;mediaType?:string};share:{slug:string;path:string}}

export default function PublicReelPage({slug}:{slug:string}){
  const [data,setData]=useState<PublicReelPayload|null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(true)
  const videoRef=useRef<HTMLVideoElement|null>(null)
  const [pipStatus,setPipStatus]=useState('')
  const [lagMode,setLagMode]=useState('adaptive')
  const shareUrl=useMemo(()=>data?new URL(data.share.path,window.location.origin).toString():'',[data])
  useEffect(()=>{let alive=true;(async()=>{try{
    const token=await getAccessToken();if(!token)throw new Error('Sign in to open this TRYAMM Reel.')
    const response=await fetch(`/api/media/publication?slug=${encodeURIComponent(slug)}`,{headers:{Authorization:`Bearer ${token}`}})
    const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body?.error||'Reel unavailable')
    if(alive)setData(body)
  }catch(e){if(alive)setError(e instanceof Error?e.message:'Reel unavailable')}finally{if(alive)setBusy(false)}})();return()=>{alive=false}},[slug])
  const enterPiP=async()=>{const video=videoRef.current;if(!video)return;try{const pipVideo=video as HTMLVideoElement & {requestPictureInPicture?:()=>Promise<unknown>};if(document.pictureInPictureElement){await document.exitPictureInPicture();setPipStatus('Picture in Picture closed.');return}if(pipVideo.requestPictureInPicture){await pipVideo.requestPictureInPicture();setPipStatus('Picture in Picture active.');return}setPipStatus('Use the iPhone video player Picture in Picture control when playback is available.')}catch{setPipStatus('Picture in Picture is not available for this video.') }}
  useEffect(()=>{const apply=(event:Event)=>{const detail=(event as CustomEvent).detail||{};if(detail.enabled)setLagMode(String(detail.mode||'adaptive'))};window.addEventListener('tryamm:quantum-lag-buster',apply);return()=>window.removeEventListener('tryamm:quantum-lag-buster',apply)},[])
  const share=async()=>{if(!shareUrl)return;try{
    if(navigator.share){await navigator.share({title:data?.media.title||'TRYAMM Reel',text:data?.publication.caption||'Watch this TRYAMM Reel',url:shareUrl});return}
    await navigator.clipboard.writeText(shareUrl);alert('Reel link copied.')
  }catch(e){if((e as DOMException)?.name!=='AbortError')setError('Could not share this Reel.')}
  }
  return <main style={{minHeight:'100dvh',background:'#05050a',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'max(18px,env(safe-area-inset-top)) 16px max(24px,env(safe-area-inset-bottom))'}}>
    <div style={{maxWidth:520,margin:'0 auto'}}>
      <button onClick={()=>history.length>1?history.back():location.assign('/streetverse')} style={{minHeight:48,borderRadius:999,padding:'0 18px',fontWeight:900}}>← BACK</button>
      <h1 style={{fontSize:24}}>TRYAMM REEL</h1>
      {busy&&<p role="status">Opening delivered Reel…</p>}
      {error&&<p role="alert">{error}</p>}
      {data&&<section aria-label="Delivered TRYAMM Reel">
        <div style={{aspectRatio:'9 / 16',border:'1px solid #ffffff33',borderRadius:24,display:'grid',placeItems:'center',background:'#111',padding:20,textAlign:'center'}}>
          <video ref={videoRef} controls playsInline preload="metadata" aria-label={data.media.title||'TRYAMM Reel'} style={{display:'none',width:'100%',height:'100%',objectFit:'contain'}} />
          <div><strong>{data.media.title||'Published Reel'}</strong><p>{data.publication.caption||'Delivered to TRYAMM.'}</p><small>Media {data.media.id}</small><p style={{opacity:.7}}>Playback activates when the verified media URL is connected.</p></div>
        </div>
        <button onClick={enterPiP} style={{width:'100%',minHeight:56,borderRadius:16,fontWeight:950,fontSize:17,marginTop:10}}>PICTURE IN PICTURE</button>
        {pipStatus&&<p role="status">{pipStatus}</p>}
        <p role="status">✓ DELIVERED · {data.publication.destination}</p>
        <p style={{opacity:.72}}>⚡ Quantum Lag Buster: {lagMode.toUpperCase()} · Reel playback will use adaptive preload/buffering policy when the verified media URL is connected.</p>
        <button onClick={share} style={{width:'100%',minHeight:56,borderRadius:16,fontWeight:950,fontSize:17}}>SHARE REEL</button>
        <p style={{overflowWrap:'anywhere',opacity:.72}}>{shareUrl}</p>
      </section>}
    </div>
  </main>
}
