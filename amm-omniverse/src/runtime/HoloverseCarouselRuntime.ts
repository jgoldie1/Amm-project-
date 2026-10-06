import {TRYAMM_VERSE_DIRECTORY} from '../holo/holoClip2'

export type HoloDestinationStatus='LIVE'|'BUILDING'|'PLANNED'
export type HoloDestination={
  id:string
  canonicalId:string
  label:string
  route:string
  enabled:boolean
  status:HoloDestinationStatus
  purpose:string
  requiresAuth?:boolean
}

export const HOLOVERSE_DESTINATIONS:HoloDestination[]=TRYAMM_VERSE_DIRECTORY.map(verse=>({
  id:verse.id.toLowerCase().replaceAll('_','-'),
  canonicalId:verse.id,
  label:verse.label,
  route:verse.route,
  enabled:true,
  status:verse.status,
  purpose:verse.purpose,
}))

export function carouselDestination(id:string){
  const key=String(id||'').toLowerCase().replaceAll('_','-')
  return HOLOVERSE_DESTINATIONS.find(x=>x.enabled&&(x.id===key||x.canonicalId.toLowerCase()===String(id||'').toLowerCase()))||null
}

export function activateHoloDestination(id:string){
  const d=carouselDestination(id)
  if(!d)throw new Error('holo-destination-unavailable')
  if(typeof window==='undefined')return d
  const transit=new CustomEvent('tryamm:holo-verse-transit-request',{cancelable:true,detail:{...d,source:'holoverse-carousel',flyIn:true}})
  window.dispatchEvent(transit)
  if(!transit.defaultPrevented){
    window.dispatchEvent(new CustomEvent('tryamm:navigate',{detail:{route:d.route,source:'holoverse-carousel'}}))
    const navigate=(window as typeof window&{__tryammNavigate?:(route:string)=>void}).__tryammNavigate
    if(typeof navigate==='function')navigate(d.route)
    else if(window.location.pathname!==d.route)window.location.href=d.route
  }
  return d
}

export const HOLO_CAROUSEL_RUNTIME={
  swipe:true,
  keyboard:true,
  oneHand:true,
  wrapAround:true,
  realRoutesOnly:true,
  noDeadCards:true,
  activeCardCentered:true,
  canonicalVerseDirectory:true,
  holographicFlyIn:true,
  verseCount:HOLOVERSE_DESTINATIONS.length,
} as const
