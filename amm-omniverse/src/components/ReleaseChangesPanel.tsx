import { useState } from 'react'

const CHANGES=[
  ['🎮','StreetVerse playable entry','Play the public StreetVerse beta from the app or /play.'],
  ['🪪','Unified Passport','One signed-in identity now anchors world, XP, checkpoint, accessibility and creator state.'],
  ['🏁','StreetVerse missions + XP','Mission runs persist to durable state and server-verified completion can issue XP/Holo Credits.'],
  ['💰','Get Paid to Play ledger','Reward claims are evidence-gated and idempotent; cash-capable rewards remain payout-gated.'],
  ['🎬','Reel Composer','Screen capture and uploads feed the creator composer.'],
  ['🟩','Green screen + stickers','Chroma-key preview, replacement backgrounds and animated sticker layers are available in the composer.'],
  ['☁️','Production creator storage','MP4, WebM, GIF and supported images now use private per-user Supabase creator-media storage.'],
  ['📦','Omni Box publishing','Stored media is server-verified and queued as durable destination jobs instead of local-only drafts.'],
  ['AI','HoloGPT provider orchestration','Vercel AI Gateway/OIDC is preferred, with OpenAI, Gemini, Claude, DeepSeek and AMM backend fallbacks.'],
  ['🛡','Jacobie Vision','Cybersecurity, defensive training and real-estate/house-flipping workflows are mounted as a first-class launcher.'],
  ['💳','Stripe verification + creator ledger','Paid Checkout sessions are server-verified before creator earnings are credited.'],
  ['🎓','Greenville University Class of 2031','Signed-in students, family and friends can submit moderated welcome messages.'],
] as const

export default function ReleaseChangesPanel(){
  const [open,setOpen]=useState(false)
  if(!open)return <button type="button" onClick={()=>setOpen(true)} aria-label="Open TRYAMM latest changes" style={{position:'fixed',left:12,bottom:170,zIndex:8992,border:'1px solid #4fe3ff77',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#071a25,#171124)',color:'#4FE3FF',fontSize:10,fontWeight:950,letterSpacing:1,cursor:'pointer'}}>✨ WHAT'S NEW</button>

  const run=(name:'play'|'media'|'campus'|'hologpt'|'jacobie')=>{
    if(name==='play'){(window as any).__showPlayableBeta?.();return}
    if(name==='media'){window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse'}}));return}
    if(name==='campus'){document.querySelector<HTMLButtonElement>('[aria-label="Open Greenville University Class of 2031 welcome board"]')?.click();return}
    if(name==='hologpt'){window.dispatchEvent(new CustomEvent('tryamm:hologpt-open',{detail:{source:'release-nexus'}}));return}
    if(name==='jacobie'){window.dispatchEvent(new CustomEvent('tryamm:jacobie-vision-open',{detail:{source:'release-nexus'}}))}
  }

  return <div role="dialog" aria-label="TRYAMM latest release changes" style={{position:'fixed',inset:0,zIndex:15120,background:'#02050bf5',color:'#fff',overflow:'auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:920,margin:'0 auto',padding:'22px 14px 80px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'flex-start',marginBottom:16}}><div><div style={{fontSize:10,fontWeight:950,letterSpacing:3,color:'#4FE3FF'}}>TRYAMM RELEASE NEXUS</div><h1 style={{margin:'6px 0'}}>What changed in the current build</h1><p style={{margin:0,color:'#9fb2c8',fontSize:12}}>Use this panel to see the systems that were added or upgraded and jump directly into the experiences.</p></div><button onClick={()=>setOpen(false)} aria-label="Close latest changes" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #3d536c',background:'#0c1520',color:'#fff',fontSize:22}}>×</button></header>
      <div style={{display:'flex',gap:9,flexWrap:'wrap',marginBottom:15}}><button onClick={()=>run('play')} style={primary}>🎮 PLAY STREETVERSE</button><button onClick={()=>run('media')} style={secondary}>🎬 CREATE CONTENT</button><button onClick={()=>run('hologpt')} style={secondary}>AI HOLOGPT</button><button onClick={()=>run('jacobie')} style={secondary}>🛡 JACOBIE VISION</button><button onClick={()=>run('campus')} style={secondary}>🎓 CLASS OF 2031</button></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10}}>{CHANGES.map(([icon,title,body])=><article key={title} style={{padding:14,border:'1px solid #294058',borderRadius:16,background:'#08111c'}}><div style={{fontSize:23}}>{icon}</div><strong style={{display:'block',marginTop:8}}>{title}</strong><div style={{fontSize:11,color:'#9fb2c8',lineHeight:1.6,marginTop:6}}>{body}</div></article>)}</div>
      <div style={{marginTop:14,padding:12,border:'1px solid #3b3652',borderRadius:13,background:'#100d19',fontSize:10,color:'#c5c8d7',lineHeight:1.6}}>A feature shown here as implemented still requires its normal real-world dependencies where applicable—for example, a signed-in account for cloud publishing, an actual paid Stripe Checkout for payment verification, and a production model provider for generative HoloGPT responses.</div>
    </div>
  </div>
}

const primary:React.CSSProperties={border:0,borderRadius:12,padding:'12px 14px',background:'linear-gradient(135deg,#4FE3FF,#7398ff)',color:'#04111a',fontWeight:950}
const secondary:React.CSSProperties={border:'1px solid #3b536b',borderRadius:12,padding:'11px 13px',background:'#101a25',color:'#fff',fontWeight:900,fontSize:11}
