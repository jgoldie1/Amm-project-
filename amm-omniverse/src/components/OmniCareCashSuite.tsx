const products=[
  {path:'/omnicare-360',name:'OmniCare 360',eyebrow:'CARE',description:'Accessibility-first care navigation, appointment coordination, benefits guidance and provider discovery across TRYAMM.',status:'Provider integrations required for live care actions.',features:['Accessible care navigation','Appointment and care coordination','Benefits and provider discovery','Caregiver-friendly workflows']},
  {path:'/omnicare-rx',name:'OmniCare Prescription Discount',eyebrow:'RX SAVINGS',description:'Prescription savings and pharmacy price-comparison gateway designed to connect verified discount-card and pharmacy-pricing partners.',status:'Discount pricing and pharmacy transactions remain partner-gated until verified feeds are connected.',features:['Prescription savings search','Pharmacy price comparison','Discount-card partner bridge','Accessible medication lookup']},
  {path:'/omni-cash',name:'Omni Cash',eyebrow:'WALLET',description:'TRYAMM wallet and money hub for balances, payouts, creator earnings and provider-connected payment rails.',status:'Real balances, deposits, withdrawals and money movement require verified financial/payment providers.',features:['Wallet overview','Creator and mission earnings','Payout routing','Domestic and global rail bridge']},
  {path:'/aniyah-pay',name:'Aniyah Cross-Border Payments',eyebrow:'GLOBAL PAY',description:'Cross-border payment experience connecting TRYAMM commerce to compliant global and African payment rails.',status:'Transfers are disabled until provider credentials, KYC/AML, settlement and country rules are verified.',features:['Cross-border send/receive','FX and fee preview','Recipient and payout routing','Africa payment rail orchestration']},
]

const africaRails=['Flutterwave','Paystack','Monnify','Moniepoint','Remita','Squad (GTCO)','OPay','Paga','Cellulant / Tingg','Fincra','Kora','SeerBit','M-Pesa']

export default function OmniCareCashSuite(){
  const current=window.location.pathname.replace(/\/$/,'')||'/'
  const active=products.find(p=>p.path===current)||products[0]
  return <main style={{minHeight:'100vh',background:'linear-gradient(180deg,#07111f,#05070c 48%,#050505)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'28px 18px 110px'}}>
    <div style={{maxWidth:1100,margin:'0 auto'}}>
      <a href='/' style={{color:'#b7c9e8',textDecoration:'none',fontWeight:800}}>← TRYAMM HOME</a>
      <div style={{marginTop:22,padding:'26px 22px',border:'1px solid #31445f',borderRadius:24,background:'#0b1421d9',boxShadow:'0 18px 60px #0008'}}>
        <div style={{fontSize:12,fontWeight:950,letterSpacing:2,color:'#86d7ff'}}>OMNI CARE + CASH SUITE</div>
        <h1 style={{fontSize:'clamp(32px,7vw,68px)',lineHeight:1,margin:'10px 0 12px'}}>Care, savings and global money movement in one hub.</h1>
        <p style={{maxWidth:800,color:'#cbd6e5',fontSize:17,lineHeight:1.55}}>This restores the OmniCare 360, prescription-discount, Omni Cash and Aniyah cross-border product family as visible TRYAMM destinations. Regulated healthcare and financial actions stay fail-closed until verified providers are connected.</p>
      </div>

      <nav aria-label='Care and cash products' style={{display:'flex',gap:9,flexWrap:'wrap',margin:'18px 0'}}>{products.map(p=><a key={p.path} href={p.path} aria-current={p.path===active.path?'page':undefined} style={{padding:'10px 13px',borderRadius:999,border:`1px solid ${p.path===active.path?'#78ddff':'#334255'}`,background:p.path===active.path?'#103149':'#0b1018',color:'#fff',textDecoration:'none',fontWeight:900,fontSize:12}}>{p.name}</a>)}</nav>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>
        <article style={{gridColumn:'1/-1',padding:22,border:'1px solid #38516d',borderRadius:22,background:'#0c1623'}}>
          <div style={{fontSize:12,fontWeight:950,letterSpacing:1.6,color:'#85e6b9'}}>{active.eyebrow}</div>
          <h2 style={{fontSize:34,margin:'7px 0'}}>{active.name}</h2>
          <p style={{color:'#d1dae7',lineHeight:1.55}}>{active.description}</p>
          <div role='status' style={{marginTop:15,padding:12,borderRadius:14,background:'#171b21',border:'1px solid #765f2f',color:'#ffe3a0',fontWeight:800}}>{active.status}</div>
        </article>
        {active.features.map(feature=><article key={feature} style={{padding:18,border:'1px solid #28394d',borderRadius:18,background:'#08111c'}}><strong>{feature}</strong><p style={{color:'#aebed2',fontSize:14}}>Product surface restored. Live provider-backed execution is enabled only after verification.</p></article>)}
      </section>

      {active.path==='/aniyah-pay'&&<section style={{marginTop:20,padding:22,border:'1px solid #315d4c',borderRadius:22,background:'#081813'}}>
        <div style={{fontSize:12,fontWeight:950,letterSpacing:1.6,color:'#7df0bb'}}>AFRICA PAYMENT RAILS</div>
        <h2 style={{margin:'8px 0'}}>Recovered rail registry</h2>
        <p style={{color:'#bdd4c9'}}>These are the African payment providers you specified for the orchestration layer. Listing them here does not claim active API credentials or live settlement.</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>{africaRails.map(rail=><span key={rail} style={{padding:'9px 11px',borderRadius:999,background:'#0d261d',border:'1px solid #2f6c52',fontWeight:850,fontSize:12}}>{rail}</span>)}</div>
      </section>}
    </div>
  </main>
}
