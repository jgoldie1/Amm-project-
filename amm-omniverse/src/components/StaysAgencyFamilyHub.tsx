import { useState } from 'react'
import {
  STAYS_AGENCY_FAMILY_CONNECTIONS,
  TRYAMM_CREATOR_AGENCIES,
  TRYAMM_FAMILY_STREAMING,
  TRYAMM_STAYS,
} from '../foundation/staysAgencyFamilyFoundation'

type HubTab='stays'|'agency'|'family'|'passport'
type Props={onClose:()=>void;initialTab?:HubTab}

const SET_APART_PASSPORT_CATEGORIES=[
  'Sabbath',
  'New Moon',
  'Covenant',
  'Ministry service',
  'Education',
  'Legacy',
  'Community record',
  'Charity / service',
] as const

const SET_APART_PASSPORT_STATUS=[
  ['NETWORK','tryamm-set-apart-kingdom-chain-v1'],
  ['CLIENT WRITE AUTHORITY','NONE'],
  ['ANCHOR AUTHORITY','TRUSTED SERVER ONLY'],
  ['RAW CHAIN ACCESS','RLS PROTECTED'],
] as const

const tabCopy={
  stays:{label:'TRYAMM STAYS',icon:'🏠',status:'BETA',title:'Stay, host and tour inside the TRYAMM world',body:TRYAMM_STAYS.positioning},
  agency:{label:'CREATOR AGENCIES',icon:'🎙',status:'BETA',title:'Build creator teams without surrendering creator control',body:'Manage permissioned rosters, LIVE schedules, PK teams, campaigns, coaching and contract evidence.'},
  family:{label:'FAMILY GROUPS',icon:'👨‍👩‍👧‍👦',status:'BETA',title:'One household, separate profiles and safer shared streaming',body:'Shared viewing and creator tools with guardian approval, privacy and age-appropriate participation controls.'},
  passport:{label:'SET APART PASSPORT',icon:'✦',status:'PROTECTED',title:'A protected Layer 3 community passport',body:'A voluntary, read-only TRYAMM faith/community view for Set Apart attestations. It does not create government identity, citizenship, tax status, civil jurisdiction or legal sovereignty.'},
} as const

export default function StaysAgencyFamilyHub({onClose,initialTab='stays'}:Props){
  const [tab,setTab]=useState<HubTab>(initialTab)
  const current=tabCopy[tab]

  const openSystem=(key:string)=>{
    onClose()
    const launcher=(window as unknown as Record<string,unknown>)[key]
    if(typeof launcher==='function')launcher()
  }

  return <div role="dialog" aria-modal="true" aria-label="TRYAMM Stays, Creator Agencies, Family Groups and Set Apart Passport" style={{position:'fixed',inset:0,zIndex:10030,overflowY:'auto',background:'linear-gradient(145deg,#020713,#080815 58%,#120914)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1060,margin:'0 auto',padding:'20px 16px 48px'}}>
      <header style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:14,marginBottom:18}}>
        <div><div style={{fontSize:10,letterSpacing:3,color:'#66e6ff',fontWeight:900}}>TRYAMM CONNECTED LIFE</div><h1 style={{fontSize:'clamp(24px,5vw,42px)',lineHeight:1.05,margin:'8px 0'}}>Stays · Agencies · Family · Set Apart</h1><p style={{maxWidth:760,color:'#aab6c7',lineHeight:1.6,margin:0}}>Hospitality, creator management, household streaming and voluntary community attestations share TRYAMM identity, accessibility and safety boundaries while real bookings, money and regulated authority remain server/provider authoritative.</p></div>
        <button type="button" aria-label="Close Stays, Agencies, Family and Set Apart hub" onClick={onClose} style={{flex:'0 0 auto',width:42,height:42,borderRadius:'50%',border:'1px solid #334052',background:'#0d1420',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button>
      </header>

      <nav aria-label="Hub sections" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8,marginBottom:16}}>
        {(Object.keys(tabCopy) as HubTab[]).map(key=><button key={key} type="button" aria-pressed={tab===key} onClick={()=>setTab(key)} style={{minHeight:74,padding:10,borderRadius:16,border:tab===key?'1px solid #66e6ff':'1px solid #263143',background:tab===key?'#10212d':'#090e17',color:'#fff',cursor:'pointer',textAlign:'left'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><span style={{fontSize:20}}>{tabCopy[key].icon}</span><span style={{fontSize:8,color:tabCopy[key].status==='PROTECTED'?'#78ffb4':'#e9bf55',fontWeight:900}}>{tabCopy[key].status}</span></div><div style={{fontSize:10,fontWeight:950,marginTop:8}}>{tabCopy[key].label}</div></button>)}
      </nav>

      <section style={{border:'1px solid #26384a',borderRadius:22,background:'#080d16',padding:'clamp(16px,4vw,28px)'}}>
        <div style={{fontSize:10,color:'#66e6ff',letterSpacing:2,fontWeight:900}}>{current.label}</div>
        <h2 style={{fontSize:'clamp(22px,4vw,34px)',margin:'8px 0 10px'}}>{current.title}</h2>
        <p style={{color:'#aeb8c8',lineHeight:1.65,margin:'0 0 20px'}}>{current.body}</p>

        {tab==='stays'&&<>
          <FeatureGrid items={TRYAMM_STAYS.surfaces}/>
          <Boundary title="Booking authority">{TRYAMM_STAYS.authorityBoundary}</Boundary>
          <Boundary title="Provider boundary">{TRYAMM_STAYS.integrationBoundary}</Boundary>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:18}}><Action label="Open PropertyVerse" onClick={()=>openSystem('__showPropertyVerse')}/><Action label="Open TRYAMM LIVE" onClick={()=>openSystem('__showTryAMMLive')}/></div>
        </>}

        {tab==='agency'&&<>
          <FeatureGrid items={TRYAMM_CREATOR_AGENCIES.surfaces}/>
          <Boundary title="Creator earnings protection">{TRYAMM_CREATOR_AGENCIES.earningsRule}</Boundary>
          <Boundary title="Youth participation">{TRYAMM_CREATOR_AGENCIES.minorRule}</Boundary>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:18}}><Action label="Open TRYAMM LIVE" onClick={()=>openSystem('__showTryAMMLive')}/><Action label="Creator Commerce connection" onClick={()=>openSystem('__showEconomicLoop')}/></div>
        </>}

        {tab==='family'&&<>
          <FeatureGrid items={TRYAMM_FAMILY_STREAMING.surfaces}/>
          <Boundary title="Privacy defaults">{TRYAMM_FAMILY_STREAMING.privacy.join(' · ')}</Boundary>
          <Boundary title="Family safety">{TRYAMM_FAMILY_STREAMING.safety.join(' · ')}</Boundary>
          <Boundary title="Accessibility">{TRYAMM_FAMILY_STREAMING.accessibility.join(' · ')}</Boundary>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:18}}><Action label="Open Set Apart Passport" onClick={()=>setTab('passport')}/><Action label="Open TRYAMM LIVE" onClick={()=>openSystem('__showTryAMMLive')}/><Action label="Open Family Legacy" onClick={()=>openSystem('__showFamilyLegacy')}/></div>
        </>}

        {tab==='passport'&&<>
          <div aria-label="Set Apart Passport status" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8,marginBottom:18}}>{SET_APART_PASSPORT_STATUS.map(([label,value])=><div key={label} style={{border:'1px solid #24412f',borderRadius:13,padding:12,background:'#08120e'}}><div style={{fontSize:8,letterSpacing:1.4,color:'#78ffb4',fontWeight:900}}>{label}</div><div style={{fontSize:11,color:'#edf8f0',lineHeight:1.5,marginTop:5,wordBreak:'break-word'}}>{value}</div></div>)}</div>
          <FeatureGrid items={SET_APART_PASSPORT_CATEGORIES}/>
          <Boundary title="Read-only boundary">The browser has no direct write authority. Layer 3 anchoring stays trusted-server-only and RLS protected.</Boundary>
          <Boundary title="Evidence projection">User-authorized receipts should appear only through an authenticated server projection; raw chain rows and service credentials remain hidden from the browser.</Boundary>
          <Boundary title="Community credential">This Set Apart Passport is a voluntary faith/community record. It is not a government passport, citizenship or nationality record, tax status, civil jurisdiction, legal sovereignty, regulated license, payment authority, or title to real-world property.</Boundary>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:18}}><Action label="Back to Family Groups" onClick={()=>setTab('family')}/><Action label="Open Family Legacy" onClick={()=>openSystem('__showFamilyLegacy')}/></div>
        </>}
      </section>

      <section aria-label="Connected systems" style={{marginTop:16,border:'1px solid #1d2938',borderRadius:18,padding:16,background:'#070b12'}}>
        <div style={{fontSize:10,color:'#e9bf55',letterSpacing:2,fontWeight:900,marginBottom:10}}>CONNECTED SYSTEMS</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>{Object.entries(STAYS_AGENCY_FAMILY_CONNECTIONS).map(([name,items])=><div key={name} style={{border:'1px solid #1b2737',borderRadius:14,padding:12}}><strong style={{textTransform:'uppercase',fontSize:11}}>{name}</strong><div style={{fontSize:11,color:'#93a3b8',lineHeight:1.6,marginTop:6}}>{items.join(' → ')}</div></div>)}</div>
      </section>
    </div>
  </div>
}

function FeatureGrid({items}:{items:readonly string[]}){
  return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8,marginBottom:18}}>{items.map(item=><div key={item} style={{minHeight:52,border:'1px solid #1c2a3b',borderRadius:12,padding:10,background:'#0b111c',fontSize:11,lineHeight:1.4,color:'#dce6f4'}}>{item}</div>)}</div>
}

function Boundary({title,children}:{title:string,children:string}){
  return <div style={{borderLeft:'3px solid #e9bf55',background:'#111017',padding:'11px 13px',marginTop:9,borderRadius:'0 10px 10px 0'}}><div style={{fontSize:9,letterSpacing:1.5,color:'#e9bf55',fontWeight:900,textTransform:'uppercase'}}>{title}</div><div style={{fontSize:11,lineHeight:1.55,color:'#bdc6d4',marginTop:4}}>{children}</div></div>
}

function Action({label,onClick}:{label:string,onClick:()=>void}){
  return <button type="button" onClick={onClick} style={{border:'1px solid #4bcce7',borderRadius:999,padding:'10px 14px',background:'#0e2530',color:'#eafdff',fontWeight:850,fontSize:11,cursor:'pointer'}}>{label}</button>
}