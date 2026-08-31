import { STANDALONE_SITE_REGISTRY, type StandaloneSiteProfile } from '../data/standaloneSiteRegistry'
import UniversalLeadPanel from './UniversalLeadPanel'
import { getSiteConversion } from '../data/siteConversionRegistry'

export default function StandaloneProductSite({site}:{site:StandaloneSiteProfile}){
  const phone=site.phone||'PHONE NUMBER PENDING'
  const domain=site.domain||'DNS / DOMAIN PENDING'
  const conversion=getSiteConversion(site.slug)
  const primaryLabel=conversion?.primaryCta||'OPEN EXPERIENCE'
  const secondaryLabel=conversion?.secondaryCta||'BUILD WITH STUBBS AI'
  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at 20% 0,#12283a 0,#070b12 42%,#020306 100%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1100,margin:'0 auto',padding:'34px 18px 80px'}}>
      <nav style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><div style={{fontWeight:950,letterSpacing:2,color:'#4FE3FF'}}>POWERED BY STUBBS AI</div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><a href="/" style={pill}>TRYAMM HOME</a><a href="/business" style={pill}>BUSINESS NETWORK</a><a href="/streetverse" style={pill}>STREETVERSE</a></div></nav>
      <section style={{padding:'72px 0 34px'}}><div style={{fontSize:12,letterSpacing:3,color:'#E8B944',fontWeight:950}}>STANDALONE WEBSITE • DNS READY</div><h1 style={{fontSize:'clamp(42px,8vw,92px)',lineHeight:.94,margin:'12px 0 18px'}}>{site.name}</h1><h2 style={{fontSize:'clamp(20px,3vw,34px)',margin:0,color:'#b9d8ec'}}>{site.tagline}</h2><p style={{maxWidth:760,fontSize:18,lineHeight:1.65,color:'#9fb2c8'}}>{site.description}</p><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:24}}><a href={site.appPath} style={primaryBtn}>{primaryLabel}</a><a href={`tel:${site.phone||''}`} aria-disabled={!site.phone} style={{...secondaryBtn,opacity:site.phone?1:.65}}>{phone}</a></div></section>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginTop:20}}>{site.capabilities.map(item=><div key={item} style={{padding:18,borderRadius:16,border:'1px solid #24384b',background:'#07101acc',fontWeight:850}}>{item}</div>)}</section>
      <section style={{marginTop:28,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
        <article style={card}><div style={eyebrow}>01 • DISCOVER</div><h3>Understand the experience.</h3><p style={copy}>Each page explains the product in its own voice while staying connected to the larger TRYAMM network.</p></article>
        <article style={card}><div style={eyebrow}>02 • ACT</div><h3>Give every visitor a next move.</h3><p style={copy}>Enter, create, shop, book, call, sell or launch instead of landing on a dead-end information page.</p></article>
        <article style={card}><div style={eyebrow}>03 • CONNECT</div><h3>Move into the wider network.</h3><p style={copy}>Standalone brands feed StreetVerse, Marketplace, Holo Ads, creator tools, workforce and Stubbs AI without losing identity.</p></article>
      </section>
      <UniversalLeadPanel title={conversion?.leadTitle||`Ready to move with ${site.name}?`} copy={conversion?.leadCopy||'This page is built as a conversion surface, not just a brochure.'} actions={[{label:primaryLabel,href:site.appPath,primary:true},{label:secondaryLabel,href:'/'},{label:'EXPLORE STREETVERSE',href:'/streetverse'},{label:site.phone?'CALL NOW':'PHONE CONNECTION PENDING',href:site.phone?`tel:${site.phone}`:undefined}]}/>
      <section style={{marginTop:28,padding:20,borderRadius:18,border:'1px solid #E8B94455',background:'#140f08'}}><div style={{fontWeight:950,color:'#E8B944'}}>LAUNCH CONNECTION</div><p style={{color:'#c7bfae',lineHeight:1.6}}>Website code is prepared to operate as a standalone public site. To put a custom domain on it, supply the domain/DNS access and the business phone number. Domain ownership, DNS records and phone-provider verification still have to be completed with the actual providers.</p><div style={{fontSize:13,color:'#fff'}}>Domain: {domain} • Phone: {phone}</div></section>
      <section style={{marginTop:28}}><h3>Stubbs AI Network</h3><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{STANDALONE_SITE_REGISTRY.filter(x=>x.slug!==site.slug).map(x=><a key={x.slug} href={`/standalone/${x.slug}`} style={pill}>{x.name}</a>)}</div></section>
      <footer style={{marginTop:36,paddingTop:18,borderTop:'1px solid #24313a',color:'#738794',fontSize:11}}>Powered by TRYAMM • All American Marketplace • Stubbs AI • StreetVerse connected</footer>
    </div>
  </main>
}
const card:React.CSSProperties={padding:18,borderRadius:18,border:'1px solid #24384b',background:'#07101acc'}
const eyebrow:React.CSSProperties={fontSize:10,letterSpacing:2,color:'#E8B944',fontWeight:950}
const copy:React.CSSProperties={color:'#9fb2c8',lineHeight:1.6,fontSize:13}
const pill:React.CSSProperties={color:'#b9d8ec',textDecoration:'none',border:'1px solid #273847',borderRadius:999,padding:'8px 11px'}
const primaryBtn:React.CSSProperties={background:'#4FE3FF',color:'#041018',fontWeight:950,textDecoration:'none',padding:'13px 18px',borderRadius:12}
const secondaryBtn:React.CSSProperties={background:'#111a24',color:'#fff',fontWeight:900,textDecoration:'none',padding:'13px 18px',border:'1px solid #304254',borderRadius:12}
