import {lazy,Suspense,useEffect,useState} from 'react'
import HoloClipScreenLayer from './HoloClipScreenLayer'
import HoloSocialEngine from './HoloSocialEngine'
import HoloClipStudio from './HoloClipStudio'
import HoloLivePkLottieOverlay from './HoloLivePkLottieOverlay'
import {TRYAMM_VERSE_DIRECTORY} from '../holo/holoClip2'
import SocialAgeSafetyGate,{type SocialIntent,type SocialSafetyDecision} from './SocialAgeSafetyGate'

const LiveCenter=lazy(()=>import('./LiveCenter'))

type SocialMode='feed'|'live'|'pk'|'world'

export default function HoloExperienceLauncher(){
  const [carouselOpen,setCarouselOpen]=useState(false)
  const [socialOpen,setSocialOpen]=useState(false)
  const [socialMode,setSocialMode]=useState<SocialMode>('feed')
  const [clipOpen,setClipOpen]=useState(false)
  const [safetyIntent,setSafetyIntent]=useState<SocialIntent|null>(null)
  const [liveCenterOpen,setLiveCenterOpen]=useState(false)
  const [liveCenterMode,setLiveCenterMode]=useState<SocialIntent>('live')
  const [youthViewerOnly,setYouthViewerOnly]=useState(false)

  const requestLivePk=(mode:SocialIntent,source='holo')=>{
    setLiveCenterMode(mode)
    setSafetyIntent(mode)
    window.dispatchEvent(new CustomEvent('tryamm:holo-livepk-requested',{detail:{mode,source}}))
  }

  const allowLivePk=(decision:SocialSafetyDecision)=>{
    setYouthViewerOnly(decision.youthViewerOnly)
    setSafetyIntent(null)
    setCarouselOpen(false)
    setSocialOpen(false)
    setLiveCenterOpen(true)
  }

  useEffect(()=>{
    const openClip=()=>setClipOpen(true)
    const openCarousel=()=>setCarouselOpen(true)
    const openSocial=(event:Event)=>{const d=(event as CustomEvent<{mode?:SocialMode;source?:string}>).detail||{};const mode=d.mode||'feed';if(mode==='live'||mode==='pk'){requestLivePk(mode,d.source||'holo-social-event');return}setSocialMode(mode);setSocialOpen(true)}
    const openStreetVerseLivePk=(event:Event)=>{const d=(event as CustomEvent<{mode?:SocialIntent}>).detail||{};requestLivePk(d.mode==='pk'?'pk':'live','streetverse')}
    window.addEventListener('tryamm:holo-clip-open',openClip)
    window.addEventListener('tryamm:holo-carousel-open',openCarousel)
    window.addEventListener('tryamm:holo-social-open',openSocial)
    window.addEventListener('tryamm:streetverse-holo-livepk',openStreetVerseLivePk)
    return()=>{window.removeEventListener('tryamm:holo-clip-open',openClip);window.removeEventListener('tryamm:holo-carousel-open',openCarousel);window.removeEventListener('tryamm:holo-social-open',openSocial);window.removeEventListener('tryamm:streetverse-holo-livepk',openStreetVerseLivePk)}
  },[])

  const launch=(panel:string)=>{
    window.dispatchEvent(new CustomEvent('tryamm:holo-carousel-launch',{detail:{panel}}))
    if(panel==='LIVE'){requestLivePk('live','holo-carousel');return}
    if(panel==='PK'){requestLivePk('pk','holo-carousel');return}
    if(panel==='REELS'){window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'holo-carousel'}}));setCarouselOpen(false);return}
    if(panel==='STREETVERSE_WORLD'){window.location.href='/streetverse';return}
    if(panel==='FAITHVERSE'){window.location.href='/faithverse';return}
    if(panel==='TIME_MACHINE'){window.location.href='/time-machine';return}
    if(panel==='VERSE_DIRECTORY'){window.dispatchEvent(new CustomEvent('tryamm:verse-directory-open',{detail:{verses:TRYAMM_VERSE_DIRECTORY,source:'holo-carousel'}}));setSocialMode('world');setSocialOpen(true);setCarouselOpen(false);return}
    if(panel==='CREATOR_COMMERCE'){window.dispatchEvent(new CustomEvent('tryamm:creator-commerce-open',{detail:{source:'holo-carousel'}}));setCarouselOpen(false);return}
    if(panel==='BENNY_HOLOGPT'){window.dispatchEvent(new CustomEvent('tryamm:hologpt-open',{detail:{source:'holo-carousel'}}));setCarouselOpen(false);return}
    if(panel==='MISSIONS'){window.location.href='/streetverse';return}
    if(panel==='RELEASE_CENTER'){window.dispatchEvent(new CustomEvent('tryamm:release-center-open',{detail:{source:'holo-carousel'}}));setCarouselOpen(false);return}
    setSocialMode(panel==='WORLD_DATA'?'world':'feed')
    setSocialOpen(true)
    setCarouselOpen(false)
  }

  return <>
    <HoloLivePkLottieOverlay />
    <button onClick={()=>setCarouselOpen(true)} aria-label="Open TRYAMM holographic carousel" style={{position:'fixed',right:12,bottom:12,zIndex:21990,minWidth:58,minHeight:58,borderRadius:18,border:'1px solid #4fe3ffaa',background:'radial-gradient(circle at 40% 30%,#17485f,#07131e 62%,#02060b)',color:'#fff',fontWeight:950,boxShadow:'0 0 26px #4fe3ff44,0 12px 30px #0009',padding:'8px 12px',cursor:'pointer'}}>
      <span aria-hidden="true" style={{display:'block',fontSize:20}}>✦</span><span style={{fontSize:9,letterSpacing:1.4}}>HOLO</span>
    </button>
    <HoloClipScreenLayer open={carouselOpen} onClose={()=>setCarouselOpen(false)} onLaunch={launch}/>
    {socialOpen&&<HoloSocialEngine key={socialMode} initialMode={socialMode} onClose={()=>setSocialOpen(false)}/>}
    {clipOpen&&<HoloClipStudio onClose={()=>setClipOpen(false)}/>}
    <SocialAgeSafetyGate open={Boolean(safetyIntent)} intent={safetyIntent||'live'} onAllow={allowLivePk} onClose={()=>setSafetyIntent(null)}/>
    {liveCenterOpen&&<Suspense fallback={null}><LiveCenter initialMode={liveCenterMode} initialRole={youthViewerOnly?'viewer':'host'} youthViewerOnly={youthViewerOnly} onClose={()=>setLiveCenterOpen(false)}/></Suspense>}
  </>
}
