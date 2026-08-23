import { useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'

const cyan='#4FE3FF'
const gold='#E8B944'

function callGlobal(name:string,...args:any[]){
  const fn=(window as any)[name]
  if(typeof fn==='function') fn(...args)
}

export default function RevenueLandingCTAs(){
  const screen=useGameStore(s=>s.screen)
  const setScreen=useGameStore(s=>s.setScreen)
  const [open,setOpen]=useState(false)
  if(screen!=='intro')return null

  const actions=[
    {icon:'🎮',title:'Play StreetVerse',copy:'Enter the playable city loop, complete missions, save progress and turn moments into clips.',cta:'PLAY NOW',run:()=>callGlobal('__showPlayableBeta')},
    {icon:'🎬',title:'Create Reels + Omni Box',copy:'Capture gameplay, compose a reel, use green screen and queue content for TRYAMM publishing.',cta:'CREATE CONTENT',run:()=>callGlobal('__showMediaStudio')},
    {icon:'⌛',title:'Time Machine + SpaceVerse',copy:'Explore TRYAMM digital simulations, Moon/Mars/Saturn worlds and interactive mission controls.',cta:'ENTER SPACEVERSE',run:()=>{window.location.href='/spaceverse.html'}},
    {icon:'●',title:'Go LIVE + Earn',copy:'Build an audience with LIVE, gifts, tickets, creator tools and verified ledger-backed earnings.',cta:'OPEN LIVE',run:()=>callGlobal('__showTryAMMLive')},
    {icon:'🛍️',title:'Shop + Sell',copy:'Discover marketplace products, creator offers, services and future live-commerce drops.',cta:'OPEN MARKETPLACE',run:()=>setScreen('marketplace')},
    {icon:'🎵',title:'Music + Creator Studio',copy:'Release music, build fan experiences and connect songs to worlds, reels and LIVE moments.',cta:'OPEN MUSIC',run:()=>setScreen('music')},
    {icon:'🎓',title:'Academy + Workforce',copy:'Learn, train, build creator/business skills and connect approved workforce workflows.',cta:'OPEN WORKFORCE',run:()=>callGlobal('__showMiddleverseWorkstation')},
    {icon:'✦',title:'Holo Credits',copy:'Buy closed-loop credits for gifts, boosts, unlocks, creator tools, ads and premium experiences.',cta:'GET HOLO CREDITS',run:()=>callGlobal('__showPricing')},
  ]

  const revenue=[
    ['1','USER BUYS HOLO CREDITS','Stripe-verified purchase funds the closed-loop credit balance.'],
    ['2','USER SPENDS INSIDE TRYAMM','Credits power gifts, boosts, unlocks, ads, game items and premium creator experiences.'],
    ['3','PLATFORM RECORDS THE EVENT','Every paid action gets an auditable transaction/reference instead of trusting the browser.'],
    ['4','CREATOR SHARE IS CALCULATED','Eligible creator revenue becomes an earning only after the underlying transaction is verified.'],
    ['5','TRYAMM KEEPS ITS PLATFORM SHARE','The configured platform fee funds operations, infrastructure, moderation and growth.'],
    ['6','CREATOR PAYOUT STAYS GATED','External cash payout remains separate until identity, provider onboarding and payout checks pass.'],
  ]

  if(!open)return <div style={{position:'fixed',left:12,right:12,bottom:12,zIndex:8500,maxWidth:1180,margin:'0 auto',border:'1px solid #31516a',borderRadius:18,padding:12,background:'linear-gradient(135deg,#07131eee,#0e0b14ee)',boxShadow:'0 16px 60px #000b',backdropFilter:'blur(14px)',display:'flex',gap:10,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
    <div><div style={{fontSize:9,color:cyan,fontWeight:950,letterSpacing:2}}>TRYAMM START HERE</div><div style={{fontSize:14,fontWeight:950,color:'#fff',marginTop:3}}>Play • Create • Publish • Sell • Earn • Holo Credits</div></div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={()=>callGlobal('__showPlayableBeta')} style={dockButton}>🎮 PLAY</button><button onClick={()=>callGlobal('__showMediaStudio')} style={dockButton}>🎬 CREATE</button><button onClick={()=>callGlobal('__showPricing')} style={{...dockButton,borderColor:`${gold}99`,color:'#ffe49b'}}>✦ HOLO CREDITS</button><button onClick={()=>setOpen(true)} style={{...dockButton,background:'#123044',color:cyan}}>EXPLORE EVERYTHING ↑</button></div>
  </div>

  return <section aria-labelledby="tryamm-start-here" style={{position:'fixed',inset:0,zIndex:8499,overflowY:'auto',background:'#02050ef7',color:'#fff',fontFamily:'Inter,ui-sans-serif,system-ui,sans-serif'}}>
    <div style={{maxWidth:1180,margin:'0 auto',padding:'24px 16px 100px'}}>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}><button onClick={()=>setOpen(false)} aria-label="Close start here panel" style={{width:42,height:42,borderRadius:'50%',border:'1px solid #385069',background:'#0b1420',color:'#fff',fontSize:20,cursor:'pointer'}}>×</button></div>
      <div style={{border:'1px solid #24435a',borderRadius:28,padding:'clamp(20px,4vw,34px)',background:'linear-gradient(145deg,#081521,#080910)',boxShadow:'0 28px 80px #0007'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:16,flexWrap:'wrap'}}>
          <div><div style={{fontSize:10,color:cyan,fontWeight:950,letterSpacing:3}}>START HERE</div><h2 id="tryamm-start-here" style={{fontSize:'clamp(30px,5vw,54px)',margin:'6px 0 8px'}}>Play. Create. Publish. Sell. Earn.</h2><p style={{maxWidth:780,margin:0,color:'#a9b9c9',fontSize:14,lineHeight:1.6}}>Every major TRYAMM lane has a direct next action so a new visitor can understand the platform and start immediately.</p></div>
          <button type="button" onClick={()=>callGlobal('__showPricing')} style={{border:0,borderRadius:14,padding:'14px 19px',background:`linear-gradient(135deg,${gold},#ffdb75)`,color:'#171006',fontWeight:1000,cursor:'pointer'}}>✦ GET HOLO CREDITS</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:20}}>
          {actions.map(a=><button key={a.title} type="button" onClick={a.run} style={{textAlign:'left',minHeight:180,padding:17,border:'1px solid #1d3346',borderRadius:18,background:'linear-gradient(160deg,#0a1420,#070910)',color:'#fff',cursor:'pointer'}}>
            <div style={{fontSize:29}}>{a.icon}</div><div style={{fontSize:17,fontWeight:950,marginTop:12}}>{a.title}</div><div style={{fontSize:11,color:'#94a8bc',lineHeight:1.55,marginTop:7}}>{a.copy}</div><div style={{fontSize:9,color:cyan,fontWeight:950,letterSpacing:1,marginTop:13}}>{a.cta} →</div>
          </button>)}
        </div>
      </div>

      <div style={{marginTop:14,border:`1px solid ${gold}55`,borderRadius:24,padding:'clamp(18px,3vw,28px)',background:'linear-gradient(145deg,#151006,#08090d)'}}>
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,.8fr) minmax(0,1.2fr)',gap:20}} className="holo-credit-grid">
          <div><div style={{fontSize:10,color:gold,fontWeight:950,letterSpacing:3}}>HOLO CREDITS ECONOMY</div><h2 style={{fontSize:32,margin:'7px 0 10px'}}>One credit system across the experience.</h2><p style={{fontSize:13,color:'#b6ad9c',lineHeight:1.65}}>Holo Credits are designed as closed-loop TRYAMM platform credits for digital consumption. They are not cash, a bank deposit, cryptocurrency, an investment, or a promise of redemption at a fixed dollar value.</p><button type="button" onClick={()=>callGlobal('__showPricing')} style={{marginTop:8,border:`1px solid ${gold}`,borderRadius:13,padding:'12px 16px',background:'#211807',color:'#ffe39a',fontWeight:950,cursor:'pointer'}}>BUY / VIEW HOLO CREDIT PACKS</button></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:9}}>
            {revenue.map(([n,title,copy])=><article key={n} style={{border:'1px solid #322a1b',borderRadius:15,padding:13,background:'#0b0b0c'}}><div style={{color:gold,fontSize:10,fontWeight:950}}>0{n}</div><div style={{fontSize:11,fontWeight:950,marginTop:6}}>{title}</div><div style={{fontSize:10,color:'#908b80',lineHeight:1.5,marginTop:5}}>{copy}</div></article>)}
          </div>
        </div>
        <div style={{marginTop:15,padding:12,border:'1px solid #2d2a23',borderRadius:13,color:'#817c72',fontSize:10,lineHeight:1.6}}>Revenue rule: purchased credits and creator earnings remain separate accounting concepts. A creator does not receive withdrawable cash merely because a viewer has an on-screen credit balance; payable earnings require a verified eligible transaction and the payout layer remains gated until provider onboarding is complete.</div>
      </div>
    </div>
    <style>{`@media(max-width:780px){.holo-credit-grid{grid-template-columns:1fr!important}}`}</style>
  </section>
}

const dockButton:React.CSSProperties={border:'1px solid #35506a',borderRadius:11,padding:'9px 11px',background:'#0c1723',color:'#fff',fontSize:9,fontWeight:950,cursor:'pointer'}
