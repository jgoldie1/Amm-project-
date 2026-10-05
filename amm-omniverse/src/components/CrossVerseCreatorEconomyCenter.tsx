import HoloCreditChannelShop from './HoloCreditChannelShop'
import CreatorCreditMarketplace from './CreatorCreditMarketplace'
import {CROSSVERSE_LIVE_PK_RULES} from '../game/holographic/CrossVerseLivePK'
import {SPONSORSHIP_DISCLOSURE_REQUIRED,CLIENT_REPORTED_EVENTS_ARE_PAYABLE} from '../runtime/CrossVerseCommercialEarningsRuntime'

export default function CrossVerseCreatorEconomyCenter({onClose}:{onClose:()=>void}){
 return <div role='dialog' aria-modal='true' aria-label='CrossVerse Creator Economy' style={{position:'fixed',inset:0,zIndex:13600,background:'radial-gradient(circle at 50% 0,#16244a,#050711 62%)',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}>
  <div style={{maxWidth:1100,margin:'0 auto',padding:'18px 14px 90px'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'start'}}><div><div style={{fontSize:9,letterSpacing:2.4,color:'#79ecff',fontWeight:950}}>TRYAMM • CROSSVERSE</div><h1 style={{fontSize:'clamp(38px,7vw,72px)',lineHeight:.9,margin:'8px 0'}}>Creator Economy</h1><p style={{maxWidth:780,color:'#aebdca',lineHeight:1.55,fontSize:11}}>One place for cross-verse credit utilities, creator-made digital goods, PK/LIVE engagement and verified commercial earning paths.</p></div><button onClick={onClose} style={close}>×</button></header>

   <section style={{marginTop:14}}><HoloCreditChannelShop channel='CROSSVERSE' title='CrossVerse Credit Utilities'/></section>
   <section style={{marginTop:12}}><CreatorCreditMarketplace/></section>

   <section style={{...panel,marginTop:12}}><div style={eyebrow}>PK / LIVE MONEY BOUNDARY</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:7,marginTop:8}}>
    <Rule label='GIFTS DO NOT CHANGE RANKED OUTCOME' ok={CROSSVERSE_LIVE_PK_RULES.giftsCannotDirectlyChangeRankedOutcome}/>
    <Rule label='RANKED SCORE REQUIRES SERVER AUTHORITY' ok={CROSSVERSE_LIVE_PK_RULES.rankedScoreRequiresServerAuthority}/>
    <Rule label='VALUABLE REWARDS REQUIRE SERVER VALIDATION' ok={CROSSVERSE_LIVE_PK_RULES.valuableRewardsRequireServerValidation}/>
    <Rule label='REPLAY CAN FEED REEL COMPOSER' ok={CROSSVERSE_LIVE_PK_RULES.replayCanFeedReelComposer}/>
   </div></section>

   <section style={{...panel,marginTop:12}}><div style={eyebrow}>COMMERCIAL / SPONSORSHIP EARNINGS</div><p style={copy}>CrossVerse already supports sponsorship placements such as wardrobe, vehicles, held products, business locations, missions, LIVE overlays, Reels and CTV/FAST/OTT spots. They become real creator earnings only after consent, attribution and server verification.</p><div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={pill}>DISCLOSURE REQUIRED: {SPONSORSHIP_DISCLOSURE_REQUIRED?'YES':'NO'}</span><span style={pill}>CLIENT-REPORTED EVENT PAYABLE: {CLIENT_REPORTED_EVENTS_ARE_PAYABLE?'YES':'NO'}</span></div></section>

   <section style={{...panel,marginTop:12}}><div style={eyebrow}>HOW THE MONEY STACKS</div><p style={copy}><b>Holo Credits</b> drive earned engagement. <b>Play Credits</b> buy closed-loop utilities. <b>Creator Credit Market</b> can convert only reconciled purchased-credit value into creator settlement eligibility. <b>Verified gifts/tips/tickets/subscriptions/sponsors/product sales</b> stay on the real-money ledger. CrossVerse carries the creator state and entitlements between connected worlds.</p></section>
  </div>
 </div>
}
function Rule({label,ok}:{label:string;ok:boolean}){return <div style={{padding:10,borderRadius:11,border:'1px solid #31455b',background:'#081321',fontSize:9,fontWeight:900,color:ok?'#9effb9':'#ffb0b0'}}>{ok?'✓':'○'} {label}</div>}
const panel:React.CSSProperties={padding:14,borderRadius:16,border:'1px solid #2e435a',background:'#08111c'}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:1.6,color:'#86edff',fontWeight:950}
const copy:React.CSSProperties={fontSize:10,color:'#a9b8c6',lineHeight:1.6}
const pill:React.CSSProperties={padding:'5px 8px',borderRadius:999,border:'1px solid #34536b',background:'#071622',fontSize:8,color:'#d5e6f2'}
const close:React.CSSProperties={width:44,height:44,borderRadius:'50%',border:'1px solid #3f5872',background:'#08111d',color:'#fff',fontSize:24}