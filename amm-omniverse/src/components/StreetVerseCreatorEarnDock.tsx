import {lazy,Suspense,useEffect,useMemo,useState} from 'react'
import {getAuthenticatedUserId,getSupabaseClient} from '../services/supabaseClient'

const HoloGiftEngine=lazy(()=>import('./HoloGiftEngine'))

type Mode='menu'|'omnibox'|'gifts'|'earnings'
type OmniBoxRow={
 id:string
 box_key:string
 name:string
 description:string
 box_type:string
 rarity:string
 contents:unknown
 contents_disclosed:boolean
 deterministic:boolean
 earnable:boolean
 purchasable:boolean
 guardian_approval_required:boolean
 minimum_age_lane:string
 price_cents:number|null
 creator_share_bps:number
}
type ProviderState={configured?:boolean;readyForPublic?:boolean;liveGenerationReady?:boolean;missing?:string[]}

const money=(cents:number|null)=>cents==null?'EARNED ONLY':`$${(cents/100).toFixed(2)}`
const percent=(bps:number)=>`${(bps/100).toFixed(bps%100?2:0)}%`

function readableContents(value:unknown){
 const rows=Array.isArray(value)?value:[]
 if(!rows.length)return 'Contents disclosed at grant/purchase.'
 return rows.map((row:any)=>{
  const type=String(row?.type||'item').replace(/_/g,' ')
  const amount=row?.amount!=null?` × ${row.amount}`:''
  const key=row?.gift_key||row?.key||''
  return `${type}${amount}${key?` • ${key}`:''}`
 }).join(' • ')
}

export default function StreetVerseCreatorEarnDock(){
 const [open,setOpen]=useState(false)
 const [mode,setMode]=useState<Mode>('menu')
 const [boxes,setBoxes]=useState<OmniBoxRow[]>([])
 const [myBoxes,setMyBoxes]=useState(0)
 const [loadingBoxes,setLoadingBoxes]=useState(false)
 const [boxMessage,setBoxMessage]=useState('OmniBox is deterministic and disclosed. No paid randomized loot boxes.')
 const [live,setLive]=useState<ProviderState|null>(null)
 const [poyo,setPoyo]=useState<ProviderState|null>(null)

 const creatorBox=useMemo(()=>boxes.find(box=>box.box_key==='creator-omni-box')||null,[boxes])

 useEffect(()=>{
  if(!open||mode!=='omnibox'||boxes.length||loadingBoxes)return
  let cancelled=false
  ;(async()=>{
   setLoadingBoxes(true)
   try{
    const sb=getSupabaseClient()
    if(!sb)throw new Error('Creator data connection is not configured on this device.')
    const {data,error}=await sb.from('omni_box_catalog').select('id,box_key,name,description,box_type,rarity,contents,contents_disclosed,deterministic,earnable,purchasable,guardian_approval_required,minimum_age_lane,price_cents,creator_share_bps').eq('enabled',true).order('price_cents',{ascending:true,nullsFirst:true})
    if(error)throw error
    if(!cancelled)setBoxes((data||[]) as OmniBoxRow[])
    const uid=await getAuthenticatedUserId()
    if(uid){
      const {count}=await sb.from('omni_player_boxes').select('id',{count:'exact',head:true}).eq('user_id',uid)
      if(!cancelled)setMyBoxes(Number(count||0))
    }
   }catch(error){
    if(!cancelled)setBoxMessage(error instanceof Error?error.message:'OmniBox catalog could not load.')
   }finally{if(!cancelled)setLoadingBoxes(false)}
  })()
  return()=>{cancelled=true}
 },[open,mode,boxes.length,loadingBoxes])

 useEffect(()=>{
  if(!open||mode!=='earnings')return
  let cancelled=false
  Promise.all([
   fetch('/api/live/status').then(r=>r.json()).catch(()=>({configured:false})),
   fetch('/api/poyo/health').then(r=>r.json()).catch(()=>({configured:false})),
  ]).then(([liveState,poyoState])=>{if(!cancelled){setLive(liveState);setPoyo(poyoState)}})
  return()=>{cancelled=true}
 },[open,mode])

 const openReel=()=>{
  setOpen(false);setMode('menu')
  window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{
   source:'streetverse-create-earn-dock',
   destinations:['reel','creator-profile','omnibox'],
   suggestedCaption:'Created in StreetVerse • Publish to Reels + Creator Profile + OmniBox • #TRYAMM #StreetVerse',
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'StreetVerse Reel Studio opened.'}}))
 }

 const close=()=>{setOpen(false);setMode('menu')}

 return <>
  <button
   data-streetverse-create-earn="true"
   aria-label="Open StreetVerse creator and earnings tools"
   onClick={()=>{setOpen(true);setMode('menu')}}
   style={{position:'fixed',right:'max(10px,env(safe-area-inset-right))',bottom:'calc(env(safe-area-inset-bottom) + 192px)',zIndex:43100,minHeight:44,minWidth:112,padding:'0 12px',borderRadius:999,border:'2px solid #8effb7',background:'linear-gradient(135deg,#082a1d,#072333)',color:'#fff',font:'950 11px system-ui',letterSpacing:.4,boxShadow:'0 0 22px #45ef9b44,0 8px 24px #0009',touchAction:'manipulation'}}
  >＋ CREATE $</button>

  {open&&<div role="dialog" aria-modal="true" aria-label="StreetVerse Create and Earn" style={{position:'fixed',inset:0,zIndex:49000,background:'#02050ab8',display:'flex',alignItems:'flex-end',justifyContent:'center',fontFamily:'system-ui',color:'#fff'}}>
   <section style={{width:'min(720px,100%)',maxHeight:'78vh',overflowY:'auto',borderRadius:'22px 22px 0 0',border:'1px solid #4fe3ff77',borderBottom:0,background:'linear-gradient(180deg,#071a25f7,#03070dfc)',boxShadow:'0 -20px 55px #000c',padding:'14px 14px calc(env(safe-area-inset-bottom) + 16px)'}}>
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,position:'sticky',top:0,zIndex:2,background:'#071a25f2',paddingBottom:10}}>
     <div><div style={{fontSize:10,color:'#8effb7',fontWeight:950,letterSpacing:2}}>STREETVERSE CREATOR ECONOMY</div><b style={{fontSize:20}}>CREATE • PUBLISH • EARN</b></div>
     <button onClick={close} aria-label="Close Create and Earn" style={closeBtn}>×</button>
    </header>

    {mode==='menu'&&<>
     <div style={{fontSize:12,color:'#bad0dc',lineHeight:1.5,marginBottom:10}}>One creator dock replaces extra floating buttons. Your media, OmniBox, holographic gifts and revenue gates stay together.</div>
     <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}>
      <button onClick={openReel} style={tile}><span style={icon}>🎥</span><b>REEL STUDIO</b><small>Record • upload • publish to Reels, Profile + OmniBox</small></button>
      <button onClick={()=>setMode('omnibox')} style={tile}><span style={icon}>📦</span><b>OMNIBOX</b><small>Earned rewards • creator bundles • disclosed contents</small></button>
      <button onClick={()=>setMode('gifts')} style={tile}><span style={icon}>✨</span><b>HOLO GIFTS</b><small>Owned Lottie kit • screen / AR / VR effects</small></button>
      <button onClick={()=>setMode('earnings')} style={tile}><span style={icon}>💰</span><b>REVENUE STATUS</b><small>See what is live, sandboxed or provider-gated</small></button>
     </div>
     <div style={{marginTop:12,padding:10,borderRadius:12,border:'1px solid #ffd65a55',background:'#241b063f',fontSize:10,lineHeight:1.5,color:'#ffe6a3'}}>Verified cash remains server-authoritative. This creator dock never invents a balance, bypasses payment verification, or turns a visual gift into withdrawable cash.</div>
    </>}

    {mode==='omnibox'&&<>
     <button onClick={()=>setMode('menu')} style={backBtn}>← CREATOR MENU</button>
     <div style={{margin:'10px 0',fontSize:12,color:'#b9cbd5'}}>{boxMessage} {myBoxes>0?`My boxes: ${myBoxes}.`:''}</div>
     {loadingBoxes&&<div role="status" style={{padding:14}}>Loading OmniBox catalog…</div>}
     <div style={{display:'grid',gap:9}}>
      {boxes.map(box=><article key={box.id} style={{padding:12,borderRadius:14,border:'1px solid #31566b',background:'#06111b'}}>
       <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'flex-start'}}><div><b>{box.name}</b><div style={{fontSize:9,color:'#59e7ff',fontWeight:900,marginTop:3}}>{box.rarity.toUpperCase()} • {box.box_type.toUpperCase()}</div></div><div style={{fontWeight:950,color:box.price_cents==null?'#8effb7':'#ffd65a'}}>{money(box.price_cents)}</div></div>
       <div style={{fontSize:11,color:'#b8c8d3',marginTop:7,lineHeight:1.45}}>{box.description}</div>
       <div style={{fontSize:10,color:'#d9f7ff',marginTop:7}}><b>CONTENTS:</b> {readableContents(box.contents)}</div>
       <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:9,fontSize:8,fontWeight:900}}>
        <span style={tag}>{box.deterministic?'DETERMINISTIC':'REVIEW'}</span><span style={tag}>{box.contents_disclosed?'DISCLOSED':'HIDDEN'}</span><span style={tag}>{box.earnable?'EARNABLE':'PURCHASE ONLY'}</span>{box.guardian_approval_required&&<span style={tag}>GUARDIAN GATE</span>}
       </div>
       {box.creator_share_bps>0&&<div style={{fontSize:10,color:'#8effb7',marginTop:8}}>Creator-share design: <b>{percent(box.creator_share_bps)}</b> after verified payment/settlement rules.</div>}
       {box.purchasable&&<button disabled style={{...disabledBtn,marginTop:10,width:'100%'}}>CHECKOUT PREPARED • LIVE STRIPE ACTIVATION REQUIRED</button>}
      </article>)}
     </div>
     {creatorBox&&<div style={{marginTop:10,fontSize:10,color:'#9fb4c0'}}>Creator OmniBox currently carries a {percent(creatorBox.creator_share_bps)} creator-share rule in the catalog. Real payout does not activate until the verified Stripe/token-wallet settlement path is live.</div>}
    </>}

    {mode==='gifts'&&<>
     <button onClick={()=>setMode('menu')} style={backBtn}>← CREATOR MENU</button>
     <div style={{marginTop:10}}><Suspense fallback={<div style={{padding:16}}>Loading Holo Gift Studio…</div>}><HoloGiftEngine/></Suspense></div>
    </>}

    {mode==='earnings'&&<>
     <button onClick={()=>setMode('menu')} style={backBtn}>← CREATOR MENU</button>
     <div style={{display:'grid',gap:9,marginTop:10}}>
      <StatusRow label="Reels + OmniBox delivery" state="READY" detail="Upload, moderation/rights gate, trusted delivery records and OmniBox destination are wired." good/>
      <StatusRow label="Owned holographic gift kit" state="READY" detail="Inline TRYAMM Lottie effects with deterministic fallback; no remote sample dependency." good/>
      <StatusRow label="OmniBox production catalog" state="READY" detail="Welcome, Academy, Creator and Member boxes are live in the production database." good/>
      <StatusRow label="Creator OmniBox share rule" state="70% DESIGN" detail="Catalog rule exists; payout stays held until verified payment and wallet settlement are activated."/>
      <StatusRow label="LIVE broadcasting" state={live?.configured?'PROVIDER READY':'CREDENTIALS REQUIRED'} detail={live?.configured?'Provider configured; device verification remains.':`Missing: ${(live?.missing||['LIVEKIT_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET']).join(' • ')}`} good={Boolean(live?.configured)}/>
      <StatusRow label="Poyo generation" state={poyo?.liveGenerationReady||poyo?.configured?'PROVIDER READY':'POYO_API_KEY REQUIRED'} detail="Studio integration is built; live provider generation remains server-key gated." good={Boolean(poyo?.liveGenerationReady||poyo?.configured)}/>
      <StatusRow label="Real cash / creator payouts" state="FAIL-CLOSED" detail="No browser-minted balances. Next authority path is verified Stripe payment → entitlement/token wallet → gift spend → creator settlement/reversal."/>
     </div>
    </>}
   </section>
  </div>}
 </>
}

function StatusRow({label,state,detail,good=false}:{label:string;state:string;detail:string;good?:boolean}){
 return <div style={{padding:11,borderRadius:13,border:'1px solid #2d485a',background:'#06111b'}}><div style={{display:'flex',gap:8,justifyContent:'space-between',alignItems:'center'}}><b style={{fontSize:12}}>{label}</b><span style={{fontSize:9,fontWeight:950,color:good?'#8effb7':'#ffd65a'}}>{state}</span></div><div style={{fontSize:10,color:'#aebfca',lineHeight:1.45,marginTop:5}}>{detail}</div></div>
}

const tile:React.CSSProperties={minHeight:118,padding:12,borderRadius:15,border:'1px solid #31566b',background:'#07131f',color:'#fff',display:'grid',alignContent:'center',gap:5,textAlign:'left',fontWeight:900,touchAction:'manipulation'}
const icon:React.CSSProperties={fontSize:25}
const closeBtn:React.CSSProperties={width:44,height:44,borderRadius:14,border:'1px solid #ffffff55',background:'#101820',color:'#fff',fontSize:24,fontWeight:900}
const backBtn:React.CSSProperties={minHeight:42,borderRadius:11,border:'1px solid #59e7ff66',background:'#07131f',color:'#fff',fontWeight:900,padding:'0 11px'}
const tag:React.CSSProperties={padding:'4px 7px',borderRadius:999,border:'1px solid #4fe3ff55',color:'#bff7ff'}
const disabledBtn:React.CSSProperties={minHeight:42,borderRadius:11,border:'1px solid #ffd65a44',background:'#211a09',color:'#cbbd8a',fontWeight:900,opacity:.78}
