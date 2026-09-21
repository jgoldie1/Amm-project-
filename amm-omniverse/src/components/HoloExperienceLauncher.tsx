import {useEffect,useState} from 'react'
import HoloClipScreenLayer from './HoloClipScreenLayer'
import HoloSocialEngine from './HoloSocialEngine'
import HoloClipStudio from './HoloClipStudio'
import HoloLivePkLottieOverlay from './HoloLivePkLottieOverlay'
import {TRYAMM_VERSE_DIRECTORY} from '../holo/holoClip2'

type SocialMode='feed'|'live'|'pk'|'world'

export default function HoloExperienceLauncher(){
  const [carouselOpen,setCarouselOpen]=useState(false)
  const [socialOpen,setSocialOpen]=useState(false)
  const [socialMode,setSocialMode]=useState<SocialMode>('feed')
  const [clipOpen,setClipOpen]=useState(false)

  useEffect(()=>{
    const openClip=()=>setClipOpen(true)
    const openSocial=(event:Event)=>{const d=(event as CustomEvent<{mode?:SocialMode}>).detail||{};setSocialMode(d.mode||'feed');setSocialOpen(true)}
    window.addEventListener('tryamm:holo-clip-open',openClip)
    window.addEventListener('tryamm:holo-social-open',openSocial)
    return()=>{window.removeEventListener('tryamm:holo-clip-open',openClip);window.removeEventListener('tryamm:holo-social-open',openSocial)}
  },[])

  const launch=(panel:string)=>{
    window.dispatchEvent(new CustomEvent('tryamm:holo-carousel-launch',{detail:{panel}}))
    if(panel==='LIVE'){window.location.href='/live';return}
    if(panel==='PK'){setSocialMode('pk');setSocialOpen(true);setCarouselOpen(false);return}
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
  </>
}
