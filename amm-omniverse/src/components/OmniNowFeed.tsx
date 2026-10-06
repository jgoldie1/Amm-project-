import {useEffect,useMemo,useRef,useState} from 'react'
import {getAccessToken,getSupabaseClient} from '../services/supabaseClient'

type FeedTab='for-you'|'live'|'following'|'world'
type ReelItem={kind:'reel';id:string;slug:string;caption:string;playbackUrl:string;title:string;deliveredAt:string;monetizationStatus:string}
type LiveItem={kind:'live';id:string;title:string;roomName:string;connected:boolean;participants?:number}
type FeedItem=ReelItem|LiveItem
type LiveStatus={configured:boolean;readyForPublic?:boolean;missing?:string[];capabilities?:Record<string,unknown>}

export default function OmniNowFeed(){
 const [items,setItems]=useState<FeedItem[]>([])
 const [tab,setTab]=useState<FeedTab>('for-you')
 const [status,setStatus]=useState('Loading your delivered TRYAMM Reels…')
 const [live,setLive]=useState<LiveStatus|null>(null)
 const [liked,setLiked]=useState<Record<string,boolean>>({})
 const [active,setActive]=useState(0)
 const containerRef=useRef<HTMLDivElement|null>(null)

 useEffect(()=>{let alive=true;(async()=>{
  try{
   const token=await getAccessToken()
   const sb=getSupabaseClient()
   if(!sb||!token){if(alive)setStatus('Sign in to load your delivered Reels.');return}
   const {data,error}=await sb.from('media_publications').select('id,media_id,public_slug,caption,destination,status,moderation_status,monetization_status,delivered_at').eq('status','delivered').in('moderation_status',['approved','restored']).order('delivered_at',{ascending:false}).limit(20)
   if(error)throw error
   const rows=await Promise.all((data||[]).map(async(row:any)=>{try{
    const res=await fetch('/api/media/publication?id='+encodeURIComponent(row.id),{headers:{Authorization:'Bearer '+token}})
    const body=await res.json().catch(()=>null)
    if(!res.ok||!body?.media?.playbackUrl)return null
    return {kind:'reel',id:String(row.id),slug:String(row.public_slug),caption:String(row.caption||''),playbackUrl:String(body.media.playbackUrl),title:String(body.media.title||'TRYAMM Reel'),deliveredAt:String(row.delivered_at||''),monetizationStatus:String(row.monetization_status||'gated')} as ReelItem
   }catch{return null}}))
   const reels=rows.filter(Boolean) as ReelItem[]
   if(alive){setItems(reels);setStatus(reels.length?reels.length+' delivered Reel'+(reels.length===1?'':'s')+' ready.':'No delivered Reels yet. Record or publish one from StreetVerse.')}
  }catch(error){if(alive)setStatus(error instanceof Error?error.message:'Could not load Reels.')}
 })();return()=>{alive=false}},[])

 useEffect(()=>{let alive=true;fetch('/api/live/status',{cache:'no-store'}).then(r=>r.json()).then(body=>{if(alive)setLive(body)}).catch(()=>{if(alive)setLive({configured:false})});return()=>{alive=false}},[])

 useEffect(()=>{
  const onLive=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};const roomName=String(d.roomName||d.room||'tryamm-live');setItems(prev=>[{kind:'live',id:'live:'+roomName,title:String(d.title||'TRYAMM LIVE'),roomName,connected:Boolean(d.connected),participants:Number(d.participants||0)},...prev.filter(x=>x.id!=='live:'+roomName)])}
  addEventListener('tryamm:live-session',onLive)
  return()=>removeEventListener('tryamm:live-session',onLive)
 },[])

 useEffect(()=>{const root=containerRef.current;if(!root)return;const sections=[...root.querySelectorAll<HTMLElement>('[data-now-item]')];const io=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&e.intersectionRatio>.6){const idx=Number((e.target as HTMLElement).dataset.index||0);setActive(idx);sections.forEach((node,i)=>{const video=node.querySelector('video');if(video)i===idx?video.play().catch(()=>{}):video.pause()})}}},{root,threshold:[.6]});sections.forEach(s=>io.observe(s));return()=>io.disconnect()},[items,tab])

 const visible=useMemo(()=>items.filter(item=>{if(tab==='live')return item.kind==='live';if(tab==='world')return true;if(tab==='following')return item.kind==='reel';return true}),[items,tab])
 const share=async(item:FeedItem)=>{const url=item.kind==='reel'?new URL('/reels/'+encodeURIComponent(item.slug),location.origin).toString():new URL('/live',location.origin).toString();try{if(navigator.share)await navigator.share({title:item.kind==='reel'?item.title:item.title,url});else{await navigator.clipboard.writeText(url);setStatus('Link copied.')}}catch(e){if((e as DOMException)?.name!=='AbortError')setStatus('Could not share.')}}
 const remix=(item:ReelItem)=>{try{localStorage.setItem('tryamm.reel.remix-source',JSON.stringify({id:item.id,slug:item.slug,playbackUrl:item.playbackUrl,title:item.title,caption:item.caption,mode:'remix'}))}catch{};dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'omni-now',mode:'remix',sourceReelId:item.id,sourceSlug:item.slug}}));location.href='/streetverse?open=reel'}
 const goLiveFrom=(item:FeedItem)=>{try{localStorage.setItem('tryamm.live.source-content',JSON.stringify(item))}catch{};location.href='/live'}
 const enterWorld=(item:FeedItem)=>{try{localStorage.setItem('tryamm.streetverse.entry-context',JSON.stringify({source:'omni-now',contentId:item.id,kind:item.kind}))}catch{};location.href='/streetverse'}
 const shop=(item:FeedItem)=>{dispatchEvent(new CustomEvent('tryamm:live-shopping-product-browser-open',{detail:{source:'omni-now',contentId:item.id}}));location.href='/commerce'}

 return <main style={shell}>
  <header style={topbar}><button onClick={()=>history.length>1?history.back():location.assign('/')} style={iconBtn}>‹</button><div style={tabs}>{(['for-you','live','following','world'] as FeedTab[]).map(t=><button key={t} onClick={()=>setTab(t)} style={{...tabBtn,opacity:tab===t?1:.55,borderBottom:tab===t?'2px solid #fff':'2px solid transparent'}}>{t==='for-you'?'FOR YOU':t.toUpperCase()}</button>)}</div><button onClick={()=>location.href='/live'} style={liveBtn}>LIVE</button></header>
  <div ref={containerRef} style={scroller}>
   {visible.length===0&&<section style={{...card,display:'grid',placeItems:'center',textAlign:'center',padding:24}}><div><div style={{fontSize:62}}>✦</div><h2>{tab==='live'?(live?.configured?'No active LIVE rooms yet.':'LIVE engine ready for credentials.'):'Your NOW feed is empty.'}</h2><p style={{opacity:.72,maxWidth:360}}>{tab==='live'&&!live?.configured?'Add LiveKit production credentials, then real host/viewer rooms can appear here.':'Publish a Reel or go LIVE and it will enter the NOW feed.'}</p><button onClick={()=>location.href=tab==='live'?'/live':'/streetverse'} style={primary}>{tab==='live'?'OPEN LIVE':'CREATE IN STREETVERSE'}</button></div></section>}
   {visible.map((item,index)=><section key={item.id} data-now-item data-index={index} style={card}>
    {item.kind==='reel'?<video src={item.playbackUrl} playsInline loop muted={index!==active} controls={false} preload={Math.abs(index-active)<=1?'metadata':'none'} style={media}/>:<div style={{...media,display:'grid',placeItems:'center',background:'radial-gradient(circle,#173e55,#060814 58%,#020205)'}}><div style={{textAlign:'center'}}><div style={{fontSize:72}}>🔴</div><h2>{item.title}</h2><p>{item.connected?'LIVE NOW':'LIVE ROOM'}</p><p style={{opacity:.65}}>{item.roomName}</p></div></div>}
    <div style={gradient}/>
    <div style={caption}><div style={{fontWeight:1000,fontSize:16}}>{item.kind==='reel'?item.title:item.title}</div><div style={{fontSize:13,marginTop:5,maxWidth:'78vw'}}>{item.kind==='reel'?item.caption:'Join the room, request a guest seat, send a Holo gift, or start a PK when provider connectivity is live.'}</div>{item.kind==='reel'&&<div style={{fontSize:10,opacity:.7,marginTop:6}}>REEL • {item.monetizationStatus.toUpperCase()}</div>}</div>
    <nav aria-label="NOW actions" style={rail}>
      <button onClick={()=>setLiked(v=>({...v,[item.id]:!v[item.id]}))} style={railBtn}>{liked[item.id]?'❤️':'♡'}<small>LIKE</small></button>
      <button onClick={()=>dispatchEvent(new CustomEvent('tryamm:now-comment-open',{detail:{contentId:item.id}}))} style={railBtn}>💬<small>CHAT</small></button>
      {item.kind==='reel'&&<button onClick={()=>remix(item)} style={railBtn}>⧉<small>REMIX</small></button>}
      <button onClick={()=>share(item)} style={railBtn}>↗<small>SHARE</small></button>
      <button onClick={()=>goLiveFrom(item)} style={railBtn}>🔴<small>LIVE</small></button>
      <button onClick={()=>shop(item)} style={railBtn}>🛍<small>SHOP</small></button>
      <button onClick={()=>enterWorld(item)} style={railBtn}>🌐<small>WORLD</small></button>
    </nav>
   </section>)}
  </div>
  <div style={statusBar}>{status}{live&&!live.configured?' • LIVE provider credentials still required.':''}</div>
 </main>
}

const shell:React.CSSProperties={position:'fixed',inset:0,zIndex:18000,background:'#000',color:'#fff',fontFamily:'system-ui,sans-serif',overflow:'hidden'}
const topbar:React.CSSProperties={position:'absolute',top:0,left:0,right:0,zIndex:5,display:'grid',gridTemplateColumns:'48px 1fr 58px',alignItems:'center',padding:'max(8px,env(safe-area-inset-top)) 8px 8px',background:'linear-gradient(#000b,transparent)'}
const tabs:React.CSSProperties={display:'flex',justifyContent:'center',gap:12,overflowX:'auto'}
const tabBtn:React.CSSProperties={minHeight:36,padding:'0 2px',background:'transparent',border:'none',color:'#fff',fontSize:11,fontWeight:950,whiteSpace:'nowrap'}
const iconBtn:React.CSSProperties={width:40,height:40,borderRadius:'50%',border:'1px solid #ffffff33',background:'#0007',color:'#fff',fontSize:28}
const liveBtn:React.CSSProperties={minHeight:38,borderRadius:999,border:'1px solid #ff4366',background:'#45101a',color:'#fff',fontSize:10,fontWeight:1000}
const scroller:React.CSSProperties={height:'100dvh',overflowY:'auto',scrollSnapType:'y mandatory',WebkitOverflowScrolling:'touch'}
const card:React.CSSProperties={position:'relative',height:'100dvh',scrollSnapAlign:'start',overflow:'hidden',background:'#050505'}
const media:React.CSSProperties={width:'100%',height:'100%',objectFit:'cover',background:'#111'}
const gradient:React.CSSProperties={position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 52%,rgba(0,0,0,.82) 100%)',pointerEvents:'none'}
const caption:React.CSSProperties={position:'absolute',left:14,right:82,bottom:'calc(env(safe-area-inset-bottom,0px) + 76px)',zIndex:2,textShadow:'0 2px 8px #000'}
const rail:React.CSSProperties={position:'absolute',right:8,bottom:'calc(env(safe-area-inset-bottom,0px) + 68px)',zIndex:3,display:'grid',gap:9}
const railBtn:React.CSSProperties={width:56,minHeight:48,border:'none',borderRadius:16,background:'#05070baa',color:'#fff',fontSize:24,display:'grid',placeItems:'center',boxShadow:'0 4px 18px #0008'}
const statusBar:React.CSSProperties={position:'absolute',left:8,right:8,bottom:'max(4px,env(safe-area-inset-bottom))',zIndex:5,padding:'5px 8px',borderRadius:9,background:'#0009',fontSize:8,color:'#b9c8d1',textAlign:'center',pointerEvents:'none'}
const primary:React.CSSProperties={minHeight:48,padding:'0 16px',borderRadius:14,border:'1px solid #67e8f9',background:'#0d2937',color:'#fff',fontWeight:950}