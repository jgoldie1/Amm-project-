import {readEdgeGridPreferences} from './TryammEdgeGridPreferences'

export type CreatorVerseBrandStatus='owned'|'licensed'|'pending'
export type CreatorVerseAudience='family'|'teen'|'adult-separated'
export type CreatorVerseScope='private'|'neighborhood'|'city'|'regional'|'global'
export type CreatorVerseBuildJob='world-state-sync'|'telemetry-aggregate'|'media-thumbnail'|'light-ai'|'asset-optimize'

export type CreatorVerseRoom={
  id:string
  slug:string
  displayName:string
  ownerLabel:string
  brandStatus:CreatorVerseBrandStatus
  logoUrl?:string
  theme:string
  regionLabel:string
  scope:CreatorVerseScope
  audience:CreatorVerseAudience
  sourceWorld:'streetverse'|'gameverse'|'holoverse'|'my-world'
  liveRoomId?:string
  modManifestId?:string
  maxParticipants:number
  published:boolean
  createdAt:string
  updatedAt:string
  crowdBuild:{
    enabled:boolean
    allowedJobs:CreatorVerseBuildJob[]
    serverVerificationRequired:true
    phonesHeavyBuildAllowed:false
  }
}

const KEY='tryamm.creatorverse.rooms.v1'
const MAX_ROOMS=50
const safeSlug=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)||'creator-verse'
const uid=()=>typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():Date.now().toString(36)
const read=():CreatorVerseRoom[]=>{try{const raw=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(raw)?raw.slice(0,MAX_ROOMS):[]}catch{return[]}}
const write=(rooms:CreatorVerseRoom[])=>{try{localStorage.setItem(KEY,JSON.stringify(rooms.slice(0,MAX_ROOMS)))}catch{}}
const emit=(rooms:CreatorVerseRoom[],reason:string)=>window.dispatchEvent(new CustomEvent('tryamm:creatorverse-state',{detail:{reason,rooms}}))

export function createCreatorVerseRoom(input:Partial<CreatorVerseRoom>&Pick<CreatorVerseRoom,'displayName'|'ownerLabel'|'theme'|'regionLabel'>):CreatorVerseRoom{
  const now=new Date().toISOString()
  return{
    id:input.id||'creatorverse-'+uid(),
    slug:input.slug||safeSlug(input.displayName),
    displayName:String(input.displayName||'CreatorVerse').slice(0,90),
    ownerLabel:String(input.ownerLabel||'Creator').slice(0,90),
    brandStatus:input.brandStatus||'pending',
    logoUrl:input.logoUrl,
    theme:String(input.theme||'Original creator world').slice(0,220),
    regionLabel:String(input.regionLabel||'Global').slice(0,120),
    scope:input.scope||'city',
    audience:input.audience||'family',
    sourceWorld:input.sourceWorld||'streetverse',
    liveRoomId:input.liveRoomId,
    modManifestId:input.modManifestId,
    maxParticipants:Math.max(10,Math.min(50000,Number(input.maxParticipants||5000))),
    published:Boolean(input.published),
    createdAt:input.createdAt||now,
    updatedAt:now,
    crowdBuild:{
      enabled:Boolean(input.crowdBuild?.enabled),
      allowedJobs:(input.crowdBuild?.allowedJobs?.length?input.crowdBuild.allowedJobs:['world-state-sync','telemetry-aggregate','media-thumbnail']).filter((x):x is CreatorVerseBuildJob=>['world-state-sync','telemetry-aggregate','media-thumbnail','light-ai','asset-optimize'].includes(x)),
      serverVerificationRequired:true,
      phonesHeavyBuildAllowed:false,
    },
  }
}

export const CREATORVERSE_POLICY={
  thirdPartyBrandingRequiresRights:true,
  celebrityLikenessRequiresAuthorization:true,
  originalBrandingAllowed:true,
  hiddenMining:false,
  crowdComputeOptIn:true,
  pocketHeavyBuild:false,
  authoritativeMoneyServerOnly:true,
  authoritativeWorldStateServerOnly:true,
  edgeResultsRequireVerification:true,
  creatorCanMonetize:['gifts','tickets','subscriptions','sponsors','commerce','world-pass','asset-sales','events'] as const,
} as const

export function installCreatorVerseRoomRuntime(){
  if(typeof window==='undefined')return()=>{}
  let rooms=read()

  const saveRoom=(room:CreatorVerseRoom,reason:string)=>{
    rooms=[room,...rooms.filter(x=>x.id!==room.id)].slice(0,MAX_ROOMS)
    write(rooms);emit(rooms,reason);return room
  }

  const publish=(id:string)=>{
    const current=rooms.find(x=>x.id===id)
    if(!current)throw new Error('creatorverse-room-not-found')
    if(!['owned','licensed'].includes(current.brandStatus))throw new Error('creatorverse-brand-rights-required')
    return saveRoom({...current,published:true,updatedAt:new Date().toISOString()},'publish')
  }

  const enter=(id:string)=>{
    const room=rooms.find(x=>x.id===id)
    if(!room||!room.published)throw new Error('creatorverse-room-not-published')
    window.dispatchEvent(new CustomEvent('tryamm:creatorverse-enter',{detail:{roomId:room.id,slug:room.slug,regionLabel:room.regionLabel,theme:room.theme,source:'creatorverse'}}))
    window.dispatchEvent(new CustomEvent('tryamm:holo-verse-transit-request',{cancelable:true,detail:{id:room.slug,canonicalId:room.id,label:room.displayName,route:'/streetverse?creatorVerse='+encodeURIComponent(room.slug),status:'LIVE',purpose:room.theme,source:'creatorverse',flyIn:true}}))
    return room
  }

  const goLive=(id:string)=>{
    const room=rooms.find(x=>x.id===id)
    if(!room||!room.published)throw new Error('creatorverse-room-not-published')
    const liveRoomId=room.liveRoomId||'live-'+room.slug+'-'+Date.now().toString(36)
    const next=saveRoom({...room,liveRoomId,updatedAt:new Date().toISOString()},'live')
    window.dispatchEvent(new CustomEvent('tryamm:live-session',{detail:{roomId:liveRoomId,title:room.displayName+' LIVE',source:'creatorverse',live:true,creatorVerseId:room.id,creatorVerseSlug:room.slug,maxParticipants:room.maxParticipants,regionLabel:room.regionLabel}}))
    return next
  }

  const crowdBuild=(id:string)=>{
    const room=rooms.find(x=>x.id===id)
    if(!room)throw new Error('creatorverse-room-not-found')
    if(!room.crowdBuild.enabled)throw new Error('creatorverse-crowd-build-disabled')
    const prefs=readEdgeGridPreferences()
    const plan={
      roomId:room.id,
      roomSlug:room.slug,
      regionLabel:room.regionLabel,
      theme:room.theme,
      allowedJobs:room.crowdBuild.allowedJobs,
      viewerPaidGridOptInRequired:true,
      defaultViewerOptIn:prefs.paidGridOptIn,
      chargingOnlyDefault:prefs.chargingOnlyForPaidWork,
      wifiOnlyDefault:prefs.wifiOnlyForPaidWork,
      heavyWorkTargets:['workstation','business','cafe','cloud'],
      pocketWorkTargets:['world-state-sync','telemetry-aggregate','media-thumbnail','light-ai'],
      serverVerificationRequired:true,
      moneyServerAuthoritative:true,
      notes:[
        'phones contribute only bounded safe jobs after explicit opt-in',
        'heavy asset/world generation stays on stronger managed nodes',
        'results are validated before entering the canonical world',
        'no hidden mining and no background work while the app is hidden',
      ],
    }
    window.dispatchEvent(new CustomEvent('tryamm:creatorverse-crowd-build-plan',{detail:plan}))
    window.dispatchEvent(new CustomEvent('tryamm:omnibox-save-request',{detail:{origin:'creatorverse',contentId:room.id,kind:'crowd-build-plan',payload:plan}}))
    return plan
  }

  const onCreate=(event:Event)=>{
    const d=(event as CustomEvent<Partial<CreatorVerseRoom>&Pick<CreatorVerseRoom,'displayName'|'ownerLabel'|'theme'|'regionLabel'>>).detail
    if(!d?.displayName||!d?.ownerLabel)return
    saveRoom(createCreatorVerseRoom(d),'create')
  }
  const onPublish=(event:Event)=>{const id=String((event as CustomEvent<{id?:string}>).detail?.id||'');if(id)try{publish(id)}catch(error){window.dispatchEvent(new CustomEvent('tryamm:creatorverse-error',{detail:{id,message:String((error as Error).message)}}))}}
  const onEnter=(event:Event)=>{const id=String((event as CustomEvent<{id?:string}>).detail?.id||'');if(id)try{enter(id)}catch(error){window.dispatchEvent(new CustomEvent('tryamm:creatorverse-error',{detail:{id,message:String((error as Error).message)}}))}}
  const onLive=(event:Event)=>{const id=String((event as CustomEvent<{id?:string}>).detail?.id||'');if(id)try{goLive(id)}catch(error){window.dispatchEvent(new CustomEvent('tryamm:creatorverse-error',{detail:{id,message:String((error as Error).message)}}))}}
  const onCrowd=(event:Event)=>{const id=String((event as CustomEvent<{id?:string}>).detail?.id||'');if(id)try{crowdBuild(id)}catch(error){window.dispatchEvent(new CustomEvent('tryamm:creatorverse-error',{detail:{id,message:String((error as Error).message)}}))}}
  const onRequest=()=>emit(rooms,'request')

  addEventListener('tryamm:creatorverse-create',onCreate)
  addEventListener('tryamm:creatorverse-publish',onPublish)
  addEventListener('tryamm:creatorverse-enter-request',onEnter)
  addEventListener('tryamm:creatorverse-go-live',onLive)
  addEventListener('tryamm:creatorverse-crowd-build-request',onCrowd)
  addEventListener('tryamm:creatorverse-request-state',onRequest)

  emit(rooms,'startup')
  window.dispatchEvent(new CustomEvent('tryamm:creatorverse-ready',{detail:{version:'1.0.0',creatorOwnedWorlds:true,liveFlyIn:true,modPassReady:true,crowdBuild:true,edgeGrid:true,policy:CREATORVERSE_POLICY}}))

  return()=>{
    removeEventListener('tryamm:creatorverse-create',onCreate)
    removeEventListener('tryamm:creatorverse-publish',onPublish)
    removeEventListener('tryamm:creatorverse-enter-request',onEnter)
    removeEventListener('tryamm:creatorverse-go-live',onLive)
    removeEventListener('tryamm:creatorverse-crowd-build-request',onCrowd)
    removeEventListener('tryamm:creatorverse-request-state',onRequest)
  }
}
