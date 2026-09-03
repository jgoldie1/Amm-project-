import HoloFoodMerchantOnboarding from './HoloFoodMerchantOnboarding'

const pages:Record<string,{eyebrow:string;title:string;tagline:string;description:string;features:string[];actions:[string,string][];notice:string}>={
  '/spectra-entertainment':{
    eyebrow:'TRYAMM ENTERTAINMENT',title:'SPECTRA ENTERTAINMENT',tagline:'Film • music • creators • LIVE • Holo Drama • StarVerse',
    description:'The entertainment umbrella connecting production, talent, music, episodic video, LIVE, advertising, product placement and All American Network distribution.',
    features:['artist and creator development','film/video production','Holo Drama distribution','LIVE/PK premieres','StarVerse talent pipeline','brand sponsorship and product placement','All American Network publishing','Omni Cash creator earnings'],
    actions:[['ALL AMERICAN RECORDS','/all-american-records'],['SET APART','/set-apart'],['HOLO DRAMA','/holo-drama'],['HOLO MUSIC','/holo-music'],['TRYAMM LIVE','/live']],
    notice:'Rights, contracts, royalty splits and commercial releases must be verified before money becomes payable.'
  },
  '/all-american-records':{
    eyebrow:'SPECTRA ENTERTAINMENT',title:'ALL AMERICAN RECORDS',tagline:'Artist-owned music distribution inside TRYAMM',
    description:'Label and artist-services hub for releases, rights metadata, promotion, LIVE performances, Holo Music, short-form video, merchandise and verified royalty accounting.',
    features:['artist roster','release planning','rights and split metadata','Holo Music distribution','Reels and Holo Drama promotion','LIVE concerts','StreetVerse venues and radio','merch and marketplace','royalty ledger to Omni Cash'],
    actions:[['HOLO MUSIC','/holo-music'],['SPECTRA','/spectra-entertainment'],['SET APART','/set-apart'],['STARVERSE','/starverse'],['OMNI CASH','/omni-cash']],
    notice:'Music streaming and royalty payments remain rights- and provider-gated until catalog ownership/licensing and settlement feeds are verified.'
  },
  '/set-apart':{
    eyebrow:'ALL AMERICAN RECORDS',title:'SET APART',tagline:'Faith-forward music, artists and community programming',
    description:'A dedicated artist and media lane for faith-forward music, including Christian rap, performances, creator stories, LIVE shows and community programming.',
    features:['Christian rap lane','faith-forward artist profiles','music releases','LIVE performances','Holo Drama stories','Free TV and network programming','StarVerse showcases','merch and creator commerce'],
    actions:[['CHRISTIAN RAP','/christian-rap'],['ALL AMERICAN RECORDS','/all-american-records'],['SERVANTS OF CHRIST','/servants-of-christ'],['HOLO MUSIC','/holo-music'],['LIVE','/live']],
    notice:'Creators control their own artistic voice. Publishing and rights claims require verified ownership or permission.'
  },
  '/christian-rap':{
    eyebrow:'SET APART',title:'CHRISTIAN RAP',tagline:'Artist discovery • releases • cyphers • LIVE • creator earnings',
    description:'A creator lane for Christian rap artists to publish music and video, perform LIVE, enter showcases, build audiences and route verified earnings through TRYAMM.',
    features:['artist discovery','tracks and music videos','cyphers and showcases','LIVE/PK performances','Holo Drama stories','StarVerse auditions','fan gifts and subscriptions','verified creator ledger'],
    actions:[['SET APART','/set-apart'],['HOLO MUSIC','/holo-music'],['HOLO DRAMA','/holo-drama'],['STARVERSE','/starverse'],['OMNI CASH','/omni-cash']],
    notice:'Audience and youth-safety controls apply platform-wide; monetization is verified before payout.'
  },
  '/holo-food':{
    eyebrow:'TRYAMM LOCAL COMMERCE',title:'HOLO FOOD DELIVERY',tagline:'Restaurants • pickup • delivery • couriers • StreetVerse missions',
    description:'A food-ordering and local-delivery layer designed to compete on merchant economics, courier tools, accessibility, transparent fees and deep StreetVerse integration.',
    features:['restaurant discovery','pickup and delivery','transparent fee preview','merchant storefronts','courier dispatch','live order tracking','ETA milestones','courier status','proof-of-delivery photo','one-time delivery code','signature/contactless confirmation','merchant self-service onboarding','menu management','group/family orders','scheduled delivery','accessibility preferences','StreetVerse delivery missions','Omni Cash settlement bridge'],
    actions:[['SELL ON HOLO FOOD','/holo-food?mode=onboard'],['STREETVERSE','/streetverse'],['GLOBAL TRADE','/global-trade'],['OMNI CASH','/omni-cash'],['HOLO RIDE SHARE','/holo-ride-share'],['HOME','/']],
    notice:'Real restaurant availability, courier dispatch, GPS tracking and card capture remain provider/merchant gated until those live integrations are connected.'
  },
  '/holo-ride-share':{
    eyebrow:'TRYAMM MOBILITY',title:'HOLO RIDE SHARE',tagline:'Request • match • track • ride • safety • accessibility • StreetVerse',
    description:'A mobility layer for riders and drivers with transparent fare quotes, accessibility preferences, live trip milestones, safety check-ins and digital-twin connections to StreetVerse.',
    features:['ride requests','driver matching','fare preview','live trip tracking','driver arrival ETA','scheduled rides','accessibility ride preferences','trusted-contact/safety check-in hooks','driver earnings','business rides','StreetVerse mobility missions','Omni Cash settlement bridge'],
    actions:[['STREETVERSE','/streetverse'],['HOLO FOOD','/holo-food'],['OMNI CASH','/omni-cash'],['GUARDIAN CENTER','/guardian'],['HOME','/']],
    notice:'Real dispatch, GPS/maps, background checks, insurance, driver eligibility, emergency integrations and payment settlement remain gated until verified providers and legal requirements are satisfied.'
  },
  '/holo-music':{
    eyebrow:'SPECTRA + ALL AMERICAN RECORDS',title:'HOLO MUSIC',tagline:'Streaming • artists • radio • LIVE • StreetVerse • royalties',
    description:'Rights-aware music discovery and streaming across TRYAMM, with artist pages, playlists, radio, creator promotion, LIVE performance and StreetVerse playback.',
    features:['For You music discovery','artists and releases','playlists and radio','StreetVerse radio/venues','LIVE music','short-form promotion','rights metadata','creator royalty ledger','merch and ticket commerce'],
    actions:[['ALL AMERICAN RECORDS','/all-american-records'],['SET APART','/set-apart'],['SPECTRA','/spectra-entertainment'],['LIVE','/live'],['OMNI CASH','/omni-cash']],
    notice:'Commercial catalog playback requires verified sound-recording and publishing rights. Independent artists can be onboarded only for music they own or are authorized to distribute.'
  }
}

const trackingMilestones={
  '/holo-food':['ORDER PLACED','MERCHANT ACCEPTED','PREPARING','COURIER ASSIGNED','PICKED UP','EN ROUTE','DELIVERY VERIFICATION','DELIVERED'],
  '/holo-ride-share':['RIDE REQUESTED','DRIVER MATCHED','DRIVER ARRIVING','PICKUP CHECK-IN','IN RIDE','DESTINATION NEAR','COMPLETED']
} as const

export default function HoloDeliveryRideEntertainmentHub(){
  const path=window.location.pathname
  const params=new URLSearchParams(window.location.search)
  if(path==='/holo-food'&&params.get('mode')==='onboard')return <HoloFoodMerchantOnboarding />
  const page=pages[path]||pages['/spectra-entertainment']
  const milestones=trackingMilestones[path as keyof typeof trackingMilestones]
  return <main style={{minHeight:'100vh',padding:'28px 18px 110px',background:'radial-gradient(circle at top,#12253b,#080b12 45%,#050505)',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
    <div style={{maxWidth:1120,margin:'0 auto'}}>
      <div style={{fontSize:12,fontWeight:950,letterSpacing:2,color:'#79e6ff'}}>{page.eyebrow}</div>
      <h1 style={{fontSize:'clamp(36px,7vw,76px)',lineHeight:.95,margin:'8px 0 12px'}}>{page.title}</h1>
      <h2 style={{fontSize:'clamp(18px,3vw,30px)',margin:'0 0 12px',color:'#d9eef8'}}>{page.tagline}</h2>
      <p style={{maxWidth:850,fontSize:18,lineHeight:1.55,color:'#bed0da'}}>{page.description}</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'18px 0'}}>{page.actions.map(([label,href])=><a key={href} href={href} style={button}>{label}</a>)}</div>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12,marginTop:18}}>{page.features.map(feature=><article key={feature} style={card}><strong>{feature.toUpperCase()}</strong></article>)}</section>
      {milestones&&<section style={{...card,marginTop:18}}><div style={{fontSize:12,fontWeight:950,letterSpacing:1.5,color:'#7fe8c7'}}>TRACKING TIMELINE</div><h2 style={{margin:'7px 0 12px'}}>One status stream from request to completion</h2><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{milestones.map((step,i)=><span key={step} style={{...button,background:i===0?'#153526':'#101d27',borderColor:i===0?'#59d9a5':'#46677c'}}>{i+1}. {step}</span>)}</div><p style={{color:'#bed0da',lineHeight:1.5}}>TRYAMM stores status/ETA events for the signed-in account. Provider GPS coordinates are only shown after a verified dispatch/maps provider supplies them; simulated StreetVerse movement is labeled simulation and never presented as a real courier or driver location.</p></section>}
      {path==='/holo-food'&&<section style={{...card,marginTop:18}}><div style={{fontSize:12,fontWeight:950,letterSpacing:1.5,color:'#ffd77a'}}>DELIVERY VERIFICATION</div><h2 style={{margin:'7px 0 12px'}}>Choose the proof required before completion</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}><article style={subcard}><strong>📷 PHOTO PROOF</strong><p style={muted}>Courier takes a doorstep/hand-off photo and attaches it to the order record.</p><input type='file' accept='image/*' capture='environment' aria-label='Take delivery proof photo' style={input}/></article><article style={subcard}><strong>🔢 ONE-TIME CODE</strong><p style={muted}>Customer receives a short code. Courier enters it before the order can be marked delivered.</p><input inputMode='numeric' maxLength={8} placeholder='ENTER DELIVERY CODE' aria-label='Delivery verification code' style={input}/></article><article style={subcard}><strong>✍️ SIGNATURE / CONTACTLESS</strong><p style={muted}>Use signature, customer confirmation, or a contactless drop-off acknowledgment when appropriate.</p><button type='button' style={actionButton}>CONFIRM HANDOFF</button></article></div><p style={{...muted,marginTop:12}}>The backend stores verification method, status, optional photo path, code hash/expiry and verification timestamp. The code itself should be generated and validated server-side; it is not stored in plain text.</p></section>}
      <section style={{...card,marginTop:18,borderColor:'#8c742f',background:'#1a160a'}}><strong>PRODUCTION GATE</strong><p style={{marginBottom:0,color:'#ffe6a8',lineHeight:1.5}}>{page.notice}</p></section>
      {(path==='/holo-food'||path==='/holo-ride-share')&&<section style={{...card,marginTop:14}}><h2>STREETVERSE CONNECTION</h2><p style={{color:'#bed0da',lineHeight:1.5}}>Orders and rides use the same TRYAMM account and can become StreetVerse jobs/missions. Real-world fulfillment remains separate from simulation until a verified merchant/driver/provider accepts the job.</p></section>}
    </div>
  </main>
}

const card={padding:18,border:'1px solid #334a5a',borderRadius:18,background:'#0d141cee'} as const
const subcard={padding:14,border:'1px solid #3b5260',borderRadius:14,background:'#0b1118'} as const
const muted={color:'#bed0da',lineHeight:1.5} as const
const input={width:'100%',boxSizing:'border-box',marginTop:8,padding:'11px 12px',border:'1px solid #46677c',borderRadius:10,background:'#070b10',color:'#fff'} as const
const button={display:'inline-block',padding:'10px 13px',border:'1px solid #46677c',borderRadius:999,background:'#101d27',color:'#fff',fontWeight:900,textDecoration:'none'} as const
const actionButton={...button,cursor:'pointer'} as const
