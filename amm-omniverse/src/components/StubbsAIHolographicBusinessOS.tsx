import {useMemo,useState} from 'react'
import {BUSINESS_IN_A_BOX_PRICING,priceFor} from '../data/ElSaturnLaunchPriceBook'
import {STUBBS_AI_BUSINESS_OS_CHANNELS,STUBBS_AI_BUSINESS_OS_MARKET_SEGMENTS,STUBBS_AI_BUSINESS_OS_SALES_MOTION} from '../data/StubbsAIBusinessOSGoToMarket'
import {BUSINESS_OS_CHECKOUT_MODE,BUSINESS_OS_CHECKOUT_NOTICE,checkoutOffer} from '../data/StubbsAIBusinessOSCheckout'
import {submitBusinessOSLead} from '../services/businessOSLeads'
import {BUSINESS_OS_FIRST_10_DEMO_SLOTS,BUSINESS_OS_FIRST_10_SCOREBOARD,BUSINESS_OS_LAUNCH_CONTENT,BUSINESS_OS_OUTREACH} from '../data/StubbsAIBusinessOSLaunchCampaign'

type View='command'|'sell'|'plans'|'launch'
type Division={id:string;icon:string;name:string;status:string;purpose:string;route:string;metric:string}

const DIVISIONS:Division[]=[
  {id:'founder',icon:'♛',name:'FOUNDER COMMAND',status:'HUMAN AUTHORITY',purpose:'Approvals, priorities, blockers and daily brief.',route:'/workstation',metric:'APPROVALS'},
  {id:'money',icon:'◈',name:'MONEY CENTER',status:'LEDGER FIRST',purpose:'Revenue, payouts, subscriptions, expenses and settlement truth.',route:'/omni-cash',metric:'CASH + LEDGER'},
  {id:'sales',icon:'↗',name:'SALES + MARKETING',status:'AI ASSISTED',purpose:'Offers, campaigns, leads, demos, follow-up and conversion tracking.',route:'/network',metric:'LEADS + SALES'},
  {id:'support',icon:'◎',name:'CUSTOMER SUPPORT',status:'ESCALATION READY',purpose:'Answer routine questions and escalate high-impact cases.',route:'/workstation',metric:'CASES'},
  {id:'ops',icon:'⚙',name:'OPERATIONS',status:'ORCHESTRATED',purpose:'Tasks, workforce, commerce, logistics and operating checklists.',route:'/global-trade',metric:'WORKFLOWS'},
  {id:'devops',icon:'⌘',name:'DEVOPS',status:'NO-REGRESSION',purpose:'CI, deployments, release truth, recovery and system health.',route:'/launch-lock',metric:'RELEASE'},
  {id:'holo',icon:'◇',name:'HOLO SHOWROOM',status:'SPATIAL READY',purpose:'3D product demos, branded showrooms, training and sales experiences.',route:'/holo-lab',metric:'DEMOS'},
  {id:'quant',icon:'∑',name:'QUANT LAB',status:'LIVE LOCKED',purpose:'Research, backtest and paper-trade workflows only until explicit activation and risk approval.',route:'/workstation',metric:'PAPER ONLY'},
]

export default function StubbsAIHolographicBusinessOS(){
  const [view,setView]=useState<View>('command')
  const [selected,setSelected]=useState(DIVISIONS[0].id)
  const [notice,setNotice]=useState('')
  const [leadName,setLeadName]=useState('')
  const [leadEmail,setLeadEmail]=useState('')
  const [leadBusiness,setLeadBusiness]=useState('')
  const [leadPlan,setLeadPlan]=useState('pro')
  const [leadNotes,setLeadNotes]=useState('')
  const [leadBusy,setLeadBusy]=useState(false)
  const active=useMemo(()=>DIVISIONS.find(d=>d.id===selected)??DIVISIONS[0],[selected])
  const aiBusiness=priceFor('ai-business-os')
  const holoServices=priceFor('holo-services')

  const nav=(path:string)=>{window.location.href=path}
  const requestDemo=(plan:string)=>{
    setLeadPlan(plan)
    setView('sell')
    window.dispatchEvent(new CustomEvent('tryamm:business-os-lead-intent',{detail:{source:'stubbs-ai-business-os',plan,at:new Date().toISOString()}}))
    setNotice('DEMO REQUEST READY • Add your contact information below and submit it to the private sales queue.')
    window.setTimeout(()=>document.getElementById('business-os-lead-form')?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }
  const submitLead=async(event:React.FormEvent)=>{
    event.preventDefault()
    if(leadBusy)return
    setLeadBusy(true)
    try{
      const leadId=await submitBusinessOSLead({name:leadName,email:leadEmail,businessName:leadBusiness,plan:leadPlan,notes:leadNotes,source:'stubbs-ai-business-os'})
      setNotice(`DEMO REQUEST RECEIVED • Lead ${leadId.slice(0,8)} • We can now work this from the private Business OS sales queue.`)
      setLeadNotes('')
    }catch(error){
      setNotice(`LEAD SUBMISSION NEEDS ATTENTION • ${error instanceof Error?error.message:String(error)}`)
    }finally{setLeadBusy(false)}
  }
  const openCheckout=(offerKey:string)=>{
    const offer=checkoutOffer(offerKey)
    if(!offer){setNotice('Checkout is not configured for this offer yet.');return}
    window.dispatchEvent(new CustomEvent('tryamm:business-os-checkout-intent',{detail:{offerId:offer.id,live:offer.live,mode:BUSINESS_OS_CHECKOUT_MODE}}))
    if(!offer.live)setNotice(BUSINESS_OS_CHECKOUT_NOTICE)
    window.open(offer.url,'_blank','noopener,noreferrer')
  }
  const requestSpatial=()=>{
    window.dispatchEvent(new CustomEvent('tryamm:business-os-xr-request',{detail:{source:'stubbs-ai-business-os',mode:'spatial-command-room-v1'}}))
    setNotice('SPATIAL MODE REQUESTED • Web holographic view is active; headset-native mode remains device/platform dependent.')
  }

  return <div role="main" aria-label="Stubbs AI Holographic Business OS" style={shell}>
    <header style={header}>
      <div>
        <div style={eyebrow}>STUBBS AI • TRYAMM • HOLOGRAPHIC BUSINESS OPERATING SYSTEM</div>
        <h1 style={{margin:'6px 0 4px',fontSize:'clamp(28px,7vw,54px)'}}>FOUNDER COMMAND ROOM</h1>
        <div style={sub}>One command center for money, sales, support, operations, DevOps, Holo services and controlled AI work.</div>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button style={button} onClick={()=>nav('/')}>HOME</button>
        <button style={button} onClick={requestSpatial}>HOLO / XR</button>
      </div>
    </header>

    <nav aria-label="Business OS views" style={tabs}>
      {(['command','sell','plans','launch'] as View[]).map(v=><button key={v} onClick={()=>setView(v)} style={{...button,background:view===v?'#0d5664':'#071827'}}>{v.toUpperCase()}</button>)}
    </nav>

    {notice&&<div role="status" aria-live="polite" style={noticeStyle}>{notice}</div>}

    {view==='command'&&<>
      <section aria-label="Holographic company map" data-spatial-mode="holographic-command-room-v1" style={holoStage}>
        <div aria-hidden="true" style={coreOrb}><span style={{fontSize:10,letterSpacing:2}}>STUBBS AI</span><strong style={{fontSize:18}}>CORE</strong></div>
        <div style={towerGrid}>{DIVISIONS.map((division,index)=>{
          const chosen=division.id===active.id
          return <button key={division.id} onClick={()=>setSelected(division.id)} aria-pressed={chosen} style={{...tower,borderColor:chosen?'#70efff':'#2c5267',transform:`translateY(${chosen?-10:0}px)`,minHeight:138}}>
            <span style={{fontSize:24}}>{division.icon}</span>
            <strong style={{fontSize:11}}>{division.name}</strong>
            <span style={{fontSize:8,color:division.status==='LIVE LOCKED'?'#ffd166':'#7ef6c5'}}>{division.status}</span>
            <span style={{height:Math.max(26,48+(index%4)*18),width:'64%',border:'1px solid #59e7ff66',borderBottom:'3px solid #59e7ff',background:'linear-gradient(#5ceaff11,#5ceaff33)',boxShadow:'0 0 22px #29d9ff33'}}/>
          </button>
        })}</div>
      </section>
      <section style={panel}>
        <div style={eyebrow}>ACTIVE DIVISION • {active.metric}</div>
        <h2 style={{margin:'7px 0'}}>{active.icon} {active.name}</h2>
        <p style={copy}>{active.purpose}</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button style={button} onClick={()=>nav(active.route)}>OPEN DIVISION</button><button style={button} onClick={()=>requestDemo(active.id)}>USE IN DEMO</button></div>
      </section>
      <section style={{...panel,borderColor:'#f0c94c55'}}>
        <b style={{color:'#f0c94c'}}>FOUNDER SAFETY RULE</b>
        <p style={copy}>AI can prepare recommendations and routine work. Payments, legal commitments, production infrastructure changes and live investment execution remain human-approved or provider-authorized. QUANT LAB stays PAPER / LIVE LOCKED by default.</p>
      </section>
    </>}

    {view==='sell'&&<section style={panel}>
      <div style={eyebrow}>HOW WE SELL IT</div>
      <h2>Sell the operating result, then demonstrate the hologram.</h2>
      <p style={copy}>Core promise: “Run more of your business from one AI command center.” The holographic room is the memorable demo and spatial interface—not the only value proposition.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10,marginTop:14}}>
        {STUBBS_AI_BUSINESS_OS_SALES_MOTION.map((step,index)=><article key={step.stage} style={salesCard}><div style={{fontSize:9,color:'#69eaff'}}>STEP {String(index+1).padStart(2,'0')}</div><h3 style={{margin:'5px 0'}}>{step.stage}</h3><div style={copy}>{step.goal}</div></article>)}
      </div>
      <h3 style={{marginTop:18}}>Best first customer segments</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
        {STUBBS_AI_BUSINESS_OS_MARKET_SEGMENTS.map(segment=><article key={segment.id} style={salesCard}><b>{segment.label}</b><p style={copy}>{segment.pain}</p><div style={{fontSize:10,color:'#69eaff'}}>DEMO: {segment.demo}</div><div style={{fontSize:9,color:'#7ef6c5',marginTop:7}}>START: {segment.primaryOffer.toUpperCase()}</div></article>)}
      </div>
      <h3 style={{marginTop:18}}>Marketing channels</h3>
      <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{STUBBS_AI_BUSINESS_OS_CHANNELS.map(channel=><span key={channel} style={{padding:'7px 9px',border:'1px solid #28536a',borderRadius:999,fontSize:10,color:'#b8d4df'}}>{channel}</span>)}</div>
      <form id="business-os-lead-form" onSubmit={submitLead} style={{...salesCard,marginTop:16,display:'grid',gap:10}} aria-label="Request a Stubbs AI Business OS demo">
        <div style={eyebrow}>PRIVATE SALES QUEUE</div>
        <h3 style={{margin:0}}>Request a Business OS demo</h3>
        <div style={copy}>Tell us who you are and what kind of business you run. Public users can submit this form, but they cannot read the lead database.</div>
        <input required maxLength={120} value={leadName} onChange={e=>setLeadName(e.target.value)} aria-label="Your name" placeholder="Your name" style={input}/>
        <input required type="email" maxLength={254} value={leadEmail} onChange={e=>setLeadEmail(e.target.value)} aria-label="Business email" placeholder="Business email" style={input}/>
        <input maxLength={160} value={leadBusiness} onChange={e=>setLeadBusiness(e.target.value)} aria-label="Business name" placeholder="Business name" style={input}/>
        <select value={leadPlan} onChange={e=>setLeadPlan(e.target.value)} aria-label="Interested plan" style={input}>
          <option value="starter">Starter Site</option><option value="pro">Business-in-a-Box Pro</option><option value="commerce">Commerce + Growth</option><option value="managed">Managed Business</option><option value="ai-business-os">AI Business OS</option><option value="holo-services">Holo Services</option><option value="founder-demo">Founder Command demo</option>
        </select>
        <textarea maxLength={1500} value={leadNotes} onChange={e=>setLeadNotes(e.target.value)} aria-label="Business needs" placeholder="What do you want the AI Business OS to help with?" rows={4} style={{...input,paddingTop:11}}/>
        <button disabled={leadBusy} style={button} type="submit">{leadBusy?'SUBMITTING…':'REQUEST DEMO'}</button>
      </form>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><button style={button} onClick={()=>requestDemo('founder-demo')}>REQUEST DEMO</button><button style={button} onClick={()=>nav('/business')}>BUSINESS DIRECTORY</button><button style={button} onClick={()=>nav('/network')}>CONTENT + BROADCAST</button></div>
    </section>}

    {view==='launch'&&<section style={panel}>
      <div style={eyebrow}>FIRST 10 CUSTOMER LAUNCH</div>
      <h2>Founder demo campaign</h2>
      <p style={copy}>Operating targets—not guarantees: {BUSINESS_OS_FIRST_10_SCOREBOARD.targetDemoInvitations} invitations → {BUSINESS_OS_FIRST_10_SCOREBOARD.targetBookedDemos} demos → {BUSINESS_OS_FIRST_10_SCOREBOARD.targetQualifiedProposals} proposals → {BUSINESS_OS_FIRST_10_SCOREBOARD.targetPaidSetupStarts} paid setup starts.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
        {BUSINESS_OS_FIRST_10_DEMO_SLOTS.map(slot=><article key={slot.slot} style={salesCard}>
          <div style={{fontSize:9,color:'#69eaff'}}>DEMO SLOT {String(slot.slot).padStart(2,'0')}</div>
          <h3 style={{margin:'6px 0'}}>{slot.segment}</h3>
          <div style={copy}><b>{slot.offer}</b></div>
          <p style={copy}>{slot.demoHook}</p>
          <div style={{fontSize:9,color:'#7ef6c5'}}>CLOSE GOAL: {slot.closeGoal}</div>
          <button style={{...button,marginTop:10}} onClick={()=>requestDemo('founder-demo')}>BOOK / CAPTURE LEAD</button>
        </article>)}
      </div>
      <h3 style={{marginTop:18}}>Reel hooks</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
        {Object.entries(BUSINESS_OS_LAUNCH_CONTENT).map(([key,reel])=><article key={key} style={salesCard}>
          <div style={{fontSize:9,color:'#69eaff'}}>{key.toUpperCase()}</div>
          <b>{reel.hook}</b>
          <p style={copy}>{reel.body}</p>
          <div style={{fontSize:10,color:'#ffd59a'}}>{reel.cta}</div>
        </article>)}
      </div>
      <h3 style={{marginTop:18}}>Founder outreach</h3>
      <div style={salesCard}>
        <p style={copy}><b>DIRECT:</b> {BUSINESS_OS_OUTREACH.directMessage}</p>
        <p style={copy}><b>FOLLOW-UP 1:</b> {BUSINESS_OS_OUTREACH.followUp1}</p>
        <p style={copy}><b>FOLLOW-UP 2:</b> {BUSINESS_OS_OUTREACH.followUp2}</p>
      </div>
    </section>}

    {view==='plans'&&<section style={panel}>
      <div style={eyebrow}>CURRENT TRYAMM / EL SATURN LAUNCH PRICE BOOK</div>
      <h2>Recurring subscription + setup + optional managed service</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
        {Object.entries(BUSINESS_IN_A_BOX_PRICING).map(([key,p])=><article key={key} style={salesCard}>
          <div style={{fontSize:9,color:'#69eaff'}}>{key.toUpperCase()}</div><h3>{p.name}</h3>
          <div style={{fontSize:28,fontWeight:950}}>${p.monthlyLeaseUsd}<span style={{fontSize:11,color:'#789'}}> / MO</span></div>
          <div style={copy}>Setup: ${p.setupUsd}</div>
          {'buyoutUsd' in p&&typeof p.buyoutUsd==='number'&&<div style={copy}>Buyout: ${p.buyoutUsd}</div>}
          <div style={{...copy,marginTop:8}}>{p.includes.join(' • ')}</div>
          <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:12}}><button style={button} onClick={()=>requestDemo(key)}>BOOK DEMO</button><button style={button} onClick={()=>openCheckout(key)}>{BUSINESS_OS_CHECKOUT_MODE==='sandbox'?'TEST CHECKOUT':'BUY NOW'}</button></div>
        </article>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10,marginTop:12}}>
        <article style={salesCard}><b>AI BUSINESS OS</b><div style={copy}>${aiBusiness?.monthlyLeaseUsd??49}/mo • setup ${aiBusiness?.setupUsd??199} • managed from ${aiBusiness?.managedServiceUsd??299}/mo</div><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}><button style={button} onClick={()=>requestDemo('ai-business-os')}>BOOK DEMO</button><button style={button} onClick={()=>openCheckout('ai-business-os')}>{BUSINESS_OS_CHECKOUT_MODE==='sandbox'?'TEST CHECKOUT':'BUY NOW'}</button></div></article>
        <article style={salesCard}><b>HOLO SERVICES ADD-ON</b><div style={copy}>${holoServices?.monthlyLeaseUsd??39}/mo • setup ${holoServices?.setupUsd??149} • higher-volume provider usage separate</div><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}><button style={button} onClick={()=>requestDemo('holo-services')}>BOOK DEMO</button><button style={button} onClick={()=>openCheckout('holo-services')}>{BUSINESS_OS_CHECKOUT_MODE==='sandbox'?'TEST CHECKOUT':'BUY NOW'}</button></div></article>
      </div>
      {BUSINESS_OS_CHECKOUT_MODE==='sandbox'&&<div role="status" aria-live="polite" style={{...noticeStyle,margin:'12px 0 0'}}>{BUSINESS_OS_CHECKOUT_NOTICE}</div>}
      <p style={{...copy,color:'#ffd59a'}}>No guaranteed revenue. Taxes, domains, ad spend, shipping, processor/provider fees and regulated services remain separate unless explicitly included in checkout/contract terms.</p>
    </section>}

    <footer style={{...panel,marginTop:12}}>
      <b>V1 SELLING POSITION:</b><span style={copy}> AI Business OS + Holographic Founder Command + Business-in-a-Box onboarding. Start with owner-operated businesses that have repetitive admin, sales, support or commerce work. Prove time saved and revenue workflow visibility before adding deeper automation.</span>
    </footer>
  </div>
}

const shell:React.CSSProperties={minHeight:'100vh',boxSizing:'border-box',padding:'18px 14px 60px',background:'radial-gradient(circle at 50% 6%,#11384b 0,#071320 34%,#02050b 72%)',color:'#fff',fontFamily:'system-ui,sans-serif'}
const header:React.CSSProperties={maxWidth:1180,margin:'0 auto',display:'flex',justifyContent:'space-between',gap:14,alignItems:'flex-start',flexWrap:'wrap'}
const eyebrow:React.CSSProperties={fontSize:9,letterSpacing:2.5,color:'#69eaff',fontWeight:950}
const sub:React.CSSProperties={fontSize:12,color:'#9bb0bd',maxWidth:760,lineHeight:1.55}
const tabs:React.CSSProperties={maxWidth:1180,margin:'14px auto 0',display:'flex',gap:8,flexWrap:'wrap'}
const button:React.CSSProperties={minHeight:44,border:'1px solid #58e7ff77',borderRadius:11,background:'#071827',color:'#fff',fontWeight:900,padding:'0 13px',cursor:'pointer'}
const noticeStyle:React.CSSProperties={maxWidth:1180,margin:'12px auto 0',padding:11,borderRadius:12,border:'1px solid #f0c94c66',background:'#2b2408',color:'#ffe99b',fontSize:11}
const holoStage:React.CSSProperties={maxWidth:1180,margin:'14px auto 0',padding:'26px 12px 20px',border:'1px solid #3ee7ff55',borderRadius:22,background:'linear-gradient(180deg,#0a2334cc,#030912f5)',boxShadow:'inset 0 0 60px #14dfff12,0 0 50px #00d9ff0e',perspective:900,position:'relative',overflow:'hidden'}
const coreOrb:React.CSSProperties={width:116,height:116,margin:'0 auto 18px',borderRadius:'50%',display:'grid',placeItems:'center',alignContent:'center',gap:2,border:'1px solid #7aeeff',background:'radial-gradient(circle,#eaffff 0,#3cf1ff33 26%,#0a516c44 58%,transparent 72%)',boxShadow:'0 0 44px #48edff88,inset 0 0 25px #fff5'}
const towerGrid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(132px,1fr))',gap:10,alignItems:'end'}
const tower:React.CSSProperties={border:'1px solid',borderRadius:14,background:'linear-gradient(180deg,#0c2231,#06111c)',color:'#fff',padding:'10px 7px',display:'grid',gap:6,justifyItems:'center',alignContent:'end',cursor:'pointer',transition:'transform .18s ease,border-color .18s ease'}
const panel:React.CSSProperties={maxWidth:1150,margin:'12px auto 0',padding:15,border:'1px solid #27495d',borderRadius:17,background:'#07111ddd'}
const copy:React.CSSProperties={fontSize:11,color:'#aabdc9',lineHeight:1.65}
const salesCard:React.CSSProperties={padding:13,border:'1px solid #2a5267',borderRadius:14,background:'#081925'}

const input:React.CSSProperties={minHeight:44,border:'1px solid #31566c',borderRadius:10,background:'#06121c',color:'#fff',padding:'0 11px',fontSize:14,boxSizing:'border-box',width:'100%'}
