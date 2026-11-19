import {useMemo,useState} from 'react'

type Mode='PLAY'|'CREATE'|'LIVE'|'EARN'|'LEARN'|'DISCOVER'|'MY WORLD'
const modes:Record<Mode,{tagline:string;items:Array<[string,string,string]>}>={
 PLAY:{tagline:'Enter StreetVerse, GameVerse and the living worlds.',items:[
  ['PLAY AS BJ','Real BJ V15 • Chicago StreetVerse','/streetverse?core=1&bj=v15'],
  ['PLAY AS JACOBIE','12-motion rig • Greenville birthday/CampusVerse path','/streetverse?core=1&character=jacobie&world=greenville'],
  ['PLAY AS LATEASIA','Recovered LaTeasia Monroe rig • StreetVerse','/streetverse?core=1&character=lateasia'],
  ['GAMEVERSE','Arcade • sports • racing • challenges','/gameverse'],
  ['FAITHVERSE','Faith, culture and community worlds','/faithverse'],
  ['GLOBALVERSE','Cities, trade and Cross Borders','/global-trade'],
 ]},
 CREATE:{tagline:'Make music, movies, games, avatars and HoloReels.',items:[
  ['OMNIBOX','Movie • TV • story production','/omni-box'],
  ['HOLO MUSIC','Artists • releases • performances','/holo-music'],
  ['ANIYAH STUDIO','64-track recording and creator studio','/aniyah-studio'],
  ['HOLO LAB','3D • holograms • digital twins • AR/VR','/holo-lab'],
 ]},
 LIVE:{tagline:'Broadcast the world instead of leaving it.',items:[
  ['TRYAMM LIVE','Live studio and CrossVerse broadcast','/live'],
  ['ISAIAH AI TV','Who Wants to Be a Star • AI TV','/isaiah-ai-tv'],
  ['ALL AMERICAN NETWORK','TV • radio • creator channels','/network'],
  ['HOLOREEL','Capture, watch and re-enter worlds','/streetverse?core=1&reel=1'],
 ]},
 EARN:{tagline:'Businesses, creators and services earn from one economy.',items:[
  ['MARKETPLACE','Digital • physical • services','/marketplace'],
  ['BUSINESS OS','Storefront • AI agents • analytics','/business-os'],
  ['OMNI WORKSTATION','Owner control and operations','/workstation'],
  ['OMNI CASH','Payments and settlement surfaces','/omni-cash'],
 ]},
 LEARN:{tagline:'All American University from K-12 through careers.',items:[
  ['ALL AMERICAN UNIVERSITY','K-12 • trade school • college','/all-american-university'],
  ['CAMPUSVERSE','Student RP and university worlds','/streetverse?core=1&world=campus'],
  ['HOLO LAB','Science • design • engineering','/holo-lab'],
  ['ACCESSIBILITY','One-hand • voice • captions • mobility','/accessibility'],
 ]},
 DISCOVER:{tagline:'Search the Viral World: people, products, shows and places.',items:[
  ['HOLO SEARCH','People • worlds • businesses • services','/?open=hologpt'],
  ['CHICAGO 77','Explore the Chicago holographic atlas','/chicago77'],
  ['GLOBAL TRADE','Cross Borders • world commerce','/global-trade'],
  ['FREE TV','Shows • creators • live channels','/free-tv'],
 ]},
 'MY WORLD':{tagline:'Your character, businesses, vaults and reputation.',items:[
  ['MY WORLD','Identity • inventory • properties • businesses','/my-world'],
  ['HOLO WORKSTATION','Founder and power-user dashboard','/workstation'],
  ['GUARDIAN','Safety • moderation • controls','/guardian'],
  ['PRIVACY','Permissions • account • deletion','/account-deletion'],
 ]},
}

const shell:React.CSSProperties={minHeight:'100dvh',background:'radial-gradient(circle at 50% 18%,#15255f 0,#071020 38%,#02050b 75%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',padding:'max(18px,env(safe-area-inset-top)) 14px calc(28px + env(safe-area-inset-bottom))'}
const button:React.CSSProperties={minHeight:54,borderRadius:14,border:'1px solid #546a9b',background:'#0a1730',color:'#fff',fontWeight:950,fontSize:13,padding:'10px 12px',touchAction:'manipulation'}

export default function TryammHoloVerseHome(){
 const [mode,setMode]=useState<Mode>('PLAY')
 const [age,setAge]=useState<'K-12'|'TEEN'|'ADULT'>('ADULT')
 const current=useMemo(()=>modes[mode],[mode])
 return <main data-tryamm-holoverse-home="level-200k-v1" style={shell}>
  <section style={{maxWidth:1060,margin:'0 auto',display:'grid',gap:16}}>
   <header style={{display:'grid',gap:7,textAlign:'center'}}>
    <div style={{fontSize:11,fontWeight:950,letterSpacing:2,color:'#9bb7ff'}}>TRYAMM • HOLOVERSE</div>
    <h1 style={{margin:0,fontSize:'clamp(28px,8vw,54px)',lineHeight:1}}>ONE WORLD</h1>
    <p style={{margin:0,color:'#c6d4ff',fontWeight:800}}>Play • Create • Learn • Earn • Live • Global</p>
   </header>

   <nav aria-label="TRYAMM primary actions" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8}}>
    {(Object.keys(modes) as Mode[]).map(key=><button key={key} type="button" aria-pressed={mode===key} onClick={()=>setMode(key)}
     style={{...button,background:mode===key?'linear-gradient(135deg,#263ca0,#7028a5)':'#0a1730',borderColor:mode===key?'#d4c1ff':'#465676'}}>{key}</button>)}
   </nav>

   <section aria-label="Age access mode" style={{display:'grid',gap:8,padding:12,border:'1px solid #33496c',borderRadius:16,background:'#07101bd9'}}>
    <div style={{display:'flex',gap:8,justifyContent:'space-between',alignItems:'center',flexWrap:'wrap'}}>
     <strong>ACCESS MODE</strong><span style={{fontSize:12,color:'#aebbd0'}}>Separate chat • commerce • content • discovery permissions</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
     {(['K-12','TEEN','ADULT'] as const).map(key=><button key={key} type="button" onClick={()=>setAge(key)} aria-pressed={age===key}
      style={{...button,minHeight:48,background:age===key?'#153f6d':'#0b1625'}}>{key}</button>)}
    </div>
   </section>

   <section style={{display:'grid',gap:10}}>
    <div>
     <h2 style={{margin:'0 0 4px',fontSize:24}}>{mode}</h2>
     <p style={{margin:0,color:'#aebbd0'}}>{current.tagline}</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
     {current.items.map(([title,desc,href])=><a key={title} href={href}
      style={{display:'grid',gap:6,minHeight:108,padding:15,borderRadius:16,border:'1px solid #394e77',background:'linear-gradient(180deg,#101c34,#07101e)',color:'#fff',textDecoration:'none'}}>
       <strong style={{fontSize:17}}>{title}</strong><span style={{color:'#aebbd0',fontSize:13,lineHeight:1.35}}>{desc}</span><span style={{fontSize:12,fontWeight:950,color:'#9ec8ff'}}>OPEN →</span>
      </a>)}
    </div>
   </section>

   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
    <article style={{padding:14,borderRadius:16,border:'1px solid #394e77',background:'#07101bd9'}}>
     <strong>HOLO VAULTS</strong>
     <p style={{margin:'7px 0 0',color:'#aebbd0',fontSize:13}}>Game • Creator • Business • Education • Health • Financial • Identity permissions stay separated.</p>
    </article>
    <article style={{padding:14,borderRadius:16,border:'1px solid #394e77',background:'#07101bd9'}}>
     <strong>TRUST & SAFETY</strong>
     <p style={{margin:'7px 0 0',color:'#aebbd0',fontSize:13}}>Report • block • mute • appeals • age controls • rights passports • fraud review.</p>
    </article>
    <article style={{padding:14,borderRadius:16,border:'1px solid #394e77',background:'#07101bd9'}}>
     <strong>LIGHTWEIGHT BOOT</strong>
     <p style={{margin:'7px 0 0',color:'#aebbd0',fontSize:13}}>The home does not boot the 3D map, physics, health, marketplace, movies or broadcast engines until opened.</p>
    </article>
   </section>

   <section aria-label="StreetVerse acceptance launcher" style={{display:'grid',gap:10,padding:12,border:'1px solid #8d6c2f',borderRadius:16,background:'#171105cc'}}>
    <strong style={{fontSize:18}}>ONE-PUSH DEVICE ACCEPTANCE</strong>
    <span style={{fontSize:12,color:'#d6c9a4'}}>Run the same 7-step loop for each playable character. Session evidence carries across character switches.</span>
    <a href="/streetverse?core=1&bj=v15&accept=1&sequence=full" onClick={()=>{try{sessionStorage.removeItem('tryamm.streetverse.acceptance-sequence.v1');sessionStorage.removeItem('tryamm.streetverse.three-cast-evidence.v1')}catch{}}} style={{...button,minHeight:64,display:'grid',placeItems:'center',textDecoration:'none',fontSize:17,background:'linear-gradient(135deg,#5e4010,#7b2d6b)',borderColor:'#ffe29a'}}>▶ START FULL TEST • BJ → JACOBIE → LATEASIA</a>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>
     <a href="/streetverse?core=1&bj=v15&accept=1" style={{...button,display:'grid',placeItems:'center',textDecoration:'none',background:'#1d3557'}}>TEST BJ</a>
     <a href="/streetverse?core=1&character=jacobie&world=greenville&accept=1" style={{...button,display:'grid',placeItems:'center',textDecoration:'none',background:'#4b2d5f'}}>TEST JACOBIE</a>
     <a href="/streetverse?core=1&character=lateasia&accept=1" style={{...button,display:'grid',placeItems:'center',textDecoration:'none',background:'#5a2548'}}>TEST LATEASIA</a>
    </div>
   </section>

   <a href="/streetverse?core=1&bj=v15" style={{...button,minHeight:66,display:'grid',placeItems:'center',textDecoration:'none',fontSize:18,background:'linear-gradient(135deg,#174d8d,#652a9a)',borderColor:'#d9cfff'}}>▶ ENTER STREETVERSE CORE</a>
  </section>
 </main>
}