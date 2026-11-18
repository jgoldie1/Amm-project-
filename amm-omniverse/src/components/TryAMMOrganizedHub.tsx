import { useState } from 'react'

type LaneId = 'commons'|'showcase'|'academy'|'care'
type ActionId = 'ai'|'streetverse'|'showcase'|'soul'|'tv'|'live'|'music'|'aau'|'simulator'|'care'|'compliance'
type Card = { name:string; detail:string; action:ActionId; label:string }
const GROUPS: {id:LaneId; title:string; subtitle:string; cards:Card[]}[] = [
  {id:'commons',title:'AI Commons + Living Worlds',subtitle:'One accessible front door to approved AI services, worlds and business tools',cards:[
    {name:'AI Commons',detail:'Guided JARVIS / HoloGPT connection and checkpoint report',action:'ai',label:'Integration preview'},
    {name:'StreetVerse',detail:'Existing Chicago gameplay and business roleplay; missions require device testing',action:'streetverse',label:'Playable beta'}
  ]},
  {id:'showcase',title:'All American Showcase + Soul Ascension',subtitle:'Music, dance, talent, awards, performances, and rights-managed creator production',cards:[
    {name:'All American Showcase',detail:'Launch the existing Star Studio talent and production tools',action:'showcase',label:'Studio tools'},
    {name:'Soul Ascension',detail:'Original next-generation soul, dance-line and cultural performance program; not affiliated with Soul Train',action:'soul',label:'Program planning'},
    {name:'All American Network TV',detail:'Existing Isaiah AI TV and showcase publishing pathways',action:'tv',label:'TV studio'},
    {name:'LIVE Production',detail:'Existing LIVE controls; simultaneous broadcasting remains unverified',action:'live',label:'Live preview'}
  ]},
  {id:'academy',title:'All American University + Financial Academy',subtitle:'Education, supervised creative work and financial simulation kept separate from real funds',cards:[
    {name:'All American University',detail:'Existing schooling and workforce pathways',action:'aau',label:'Academy'},
    {name:'Financial Academy',detail:'Kevon Forex, World Markets, Jacobie DRIP and V92 finance education belong in a paper-trading-only lane. An executable verified simulator route has not been established here.',action:'simulator',label:'Education only'},
    {name:'Music & Creator Learning',detail:'Existing production, music and creator tools',action:'music',label:'Creator tools'}
  ]},
  {id:'care',title:'OmniCare360 + Compliance',subtitle:'Care access and accessibility separate from gaming, trading and marketing data',cards:[
    {name:'OmniCare360',detail:'Nonclinical preview only. No bookings, PHI intake or clinical video enabled.',action:'care',label:'Not clinical'},
    {name:'AI Law + Compliance',detail:'Privacy/security evidence matrix and independent signoffs; release blocked',action:'compliance',label:'Not certified'}
  ]}
]

export default function TryAMMOrganizedHub({onAction}:{onAction:(action:ActionId)=>void}){
  const [active,setActive]=useState<LaneId>('commons')
  const section=GROUPS.find(item=>item.id===active)||GROUPS[0]
  return <section aria-label="TRYAMM organized services" style={{marginTop:18,border:'1px solid #36516a',borderRadius:22,padding:'clamp(12px,3vw,22px)',background:'#071321'}}>
    <div style={{fontWeight:900,letterSpacing:2,color:'#8ce4ff',fontSize:12}}>TRYAMM SUPER APP · ORGANIZED SERVICES</div>
    <h2 style={{fontSize:'clamp(19px,3vw,28px)',margin:'8px 0 12px'}}>One platform. Four clear destinations.</h2>
    <nav aria-label="Choose TRYAMM department" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8}}>
      {GROUPS.map(group=><button key={group.id} type="button" aria-pressed={group.id===active} onClick={()=>setActive(group.id)} style={{minHeight:58,textAlign:'left',background:group.id===active?'#194967':'#142333',border:group.id===active?'2px solid #8ce4ff':'1px solid #48647b',borderRadius:14,padding:12,color:'#fff',fontWeight:800,fontSize:14,cursor:'pointer'}}>{group.title}</button>)}
    </nav>
    <h3 style={{fontSize:21,margin:'20px 0 6px'}}>{section.title}</h3>
    <p style={{color:'#c8d7e5',fontSize:14,lineHeight:1.6,margin:'0 0 16px'}}>{section.subtitle}</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(215px,1fr))',gap:10}}>
      {section.cards.map(card=><button key={card.name} type="button" onClick={()=>onAction(card.action)} style={{background:'#10283a',border:'1px solid #496b82',borderRadius:16,padding:16,color:'#fff',textAlign:'left',cursor:'pointer',minHeight:132,display:'flex',flexDirection:'column',gap:10}}>
        <strong style={{fontSize:17}}>{card.name}</strong><span style={{color:'#d0dce6',fontSize:13,lineHeight:1.5}}>{card.detail}</span><span style={{color:'#9deeff',fontSize:11,fontWeight:800,marginTop:'auto'}}>{card.label} · Open</span>
      </button>)}
    </div>
    <p style={{color:'#b9c6d7',fontSize:12,lineHeight:1.6,margin:'14px 0 0'}}>Health records are not shared with AI Commons, creator marketing, finance simulations or game events. This navigation does not certify regulated services or imply affiliation with existing entertainment trademarks.</p>
  </section>
}
