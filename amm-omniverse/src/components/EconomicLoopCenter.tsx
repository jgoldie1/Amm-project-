type Props = { onClose: () => void }

type LaunchLane = {
  title: string
  status: 'BETA' | 'PLANNED'
  outcome: string
  items: string[]
}

const lanes: LaunchLane[] = [
  {
    title: 'Creator + Media Income',
    status: 'BETA',
    outcome: 'Turn creation, viewing, selling, services and sponsorship into connected earning paths.',
    items: ['Poyo AI Studio', 'Omni Reel short-form stories', 'Omni Box streaming', 'TryAMM LIVE', 'podcasts', 'music', 'green-screen studio', 'GIF/sticker/animation layers', 'creator subscriptions', 'ads + sponsorships'],
  },
  {
    title: 'Holo Credit + Rewards',
    status: 'PLANNED',
    outcome: 'Unify verified platform rewards, purchases and creator balances without presenting internal credits as bank deposits.',
    items: ['Holo Credit sandbox ledger', 'Get Paid to Play rewards', 'creator payable balance', 'sponsored missions', 'verified skill challenges', 'ad reward pools', 'marketplace settlement', 'Stripe-backed real-money checkout gates'],
  },
  {
    title: 'Omni Gigs + Jobs',
    status: 'PLANNED',
    outcome: 'Create a Fiverr-style service market tied directly to training, reputation and verified work.',
    items: ['freelance service listings', 'business job posts', 'AI skill matching', 'remote work', 'streamer jobs', 'production jobs', 'cybersecurity', 'real estate support', 'manufacturing', 'telecom', 'food + grocery operations', 'local dealer jobs'],
  },
  {
    title: 'All American Marketplace',
    status: 'BETA',
    outcome: 'Keep sellers, buyers, creators, services and local businesses inside one commerce loop.',
    items: ['seller storefronts', 'Black-owned business discovery', 'beauty + wig supply', 'grocery + organic food', 'publishing', 'OTT marketplace', 'product placement', 'holographic advertising', 'cross-border commerce'],
  },
  {
    title: 'All American University',
    status: 'BETA',
    outcome: 'Connect Pre-K through PhD, trades and certifications to real projects, portfolios and paid opportunities.',
    items: ['Pre-K–12', 'college', 'graduate learning', 'trade school', 'certifications', 'AI training', 'cybersecurity', 'real estate', 'media production', 'financial literacy', 'teacher + AI instruction', 'campus portals'],
  },
  {
    title: 'Faith + Language',
    status: 'PLANNED',
    outcome: 'Add structured faith education, community study and language learning as a distinct opt-in lane.',
    items: ['Pelo Hebrew learning', 'Faith Bible study experience', 'Sabbath + New Moon community tools', 'Servants of Christ network', 'discussion + teaching', 'accessible audio/text formats'],
  },
  {
    title: 'World + Business Loop',
    status: 'BETA',
    outcome: 'Make the living world a front door to jobs, learning, commerce, entertainment and reputation.',
    items: ['StreetVerse', 'My World', 'Kingdom', 'StarVerse', 'Holoverse', 'missions', 'XP + reputation', 'business ownership', 'travel between cities', 'reels from gameplay', 'local events', 'property + SpaceOS experiences'],
  },
  {
    title: 'Infrastructure + Expansion',
    status: 'PLANNED',
    outcome: 'Support the ecosystem with communications, energy, manufacturing and data infrastructure as separately validated programs.',
    items: ['Holo Fon', 'TryAMM Connect', 'Quantum Email', 'Wi-Fi / carrier integrations', 'data centers', 'foundry + manufacturing', '3D/12D printing concepts', 'OmniGrid research program', 'battery research program'],
  },
]

export default function EconomicLoopCenter({ onClose }: Props) {
  return (
    <div role="dialog" aria-label="TRYAMM Economic Loop" style={{position:'fixed',inset:0,zIndex:10030,background:'radial-gradient(circle at top,#10273a 0%,#050713 42%,#02030a 100%)',color:'#fff',overflowY:'auto'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 16px 60px'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'flex-start',marginBottom:18}}>
          <div>
            <div style={{fontSize:10,letterSpacing:4,color:'#72e6ff',fontWeight:900}}>TRYAMM LAUNCH SYSTEM</div>
            <h1 style={{margin:'8px 0 6px',fontSize:'clamp(28px,6vw,54px)',lineHeight:1}}>ONE ECONOMIC LOOP</h1>
            <div style={{maxWidth:800,color:'#aab7c8',lineHeight:1.6,fontSize:14}}>CREATE → LEARN → WORK → SELL → STREAM → PLAY → EARN → BUILD REPUTATION → HIRE → REINVEST → CREATE AGAIN</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close economic loop" style={{width:42,height:42,borderRadius:'50%',border:'1px solid #38526a',background:'#0a1220',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button>
        </div>

        <div style={{padding:14,border:'1px solid #2a5870',borderRadius:18,background:'#081321cc',marginBottom:16,fontSize:12,lineHeight:1.6,color:'#d7e7f2'}}>
          This center is the launch map for the connected TRYAMM economy. BETA means a user-facing product or supporting implementation exists in the repository. PLANNED means it belongs in the launch architecture but still requires production implementation, compliance, provider integration, funding, or validation before it can be called live.
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>
          {lanes.map(lane => (
            <section key={lane.title} style={{border:'1px solid #18364d',borderRadius:18,background:'#07101acc',padding:16,minHeight:250}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                <h2 style={{margin:0,fontSize:17}}>{lane.title}</h2>
                <span style={{fontSize:9,fontWeight:900,letterSpacing:1.5,color:lane.status==='BETA'?'#efc45c':'#86a0b7'}}>{lane.status}</span>
              </div>
              <p style={{fontSize:12,lineHeight:1.55,color:'#aebfd0'}}>{lane.outcome}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                {lane.items.map(item => <span key={item} style={{fontSize:10,padding:'6px 8px',borderRadius:999,background:'#0d1d2c',border:'1px solid #18364d',color:'#dbe9f5'}}>{item}</span>)}
              </div>
            </section>
          ))}
        </div>

        <div style={{marginTop:16,padding:16,borderRadius:18,border:'1px solid #244d39',background:'#07150fcc'}}>
          <div style={{fontWeight:950,fontSize:15,marginBottom:8,color:'#83f3af'}}>WHAT THIS DOES</div>
          <div style={{fontSize:12,lineHeight:1.7,color:'#c9e6d4'}}>It changes TRYAMM from a collection of separate features into a flywheel: entertainment brings attention; creators turn attention into content; the marketplace converts attention into commerce; education turns users into skilled workers; Omni Gigs and business jobs convert skills into income; reputation improves matching; StreetVerse and the living worlds make the same services discoverable through an immersive interface; and infrastructure programs create additional operating and employment lanes. The strongest launch advantage is the connection between those systems, not any one feature by itself.</div>
        </div>
      </div>
    </div>
  )
}
