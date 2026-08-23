const cyan='#4FE3FF'
const gold='#E8B944'

type WorldStatus='PLAYABLE CORE'|'PROTOTYPE'|'PLANNED'

type World={name:string;slug:string;icon:string;genre:string;summary:string;status:WorldStatus}

function openGlobal(name:string){
  const fn=(window as any)[name]
  if(typeof fn==='function') fn()
}

function openGameVerse(world?:string){
  const fn=(window as any).__showGameVerse
  if(typeof fn==='function') fn(world)
  else window.dispatchEvent(new CustomEvent('tryamm:gameverse-open',{detail:{world}}))
}

export default function LivingWorldsUniverse({onSports,onCity,onMusic}:{onSports:()=>void;onCity:()=>void;onMusic:()=>void}){
  void onSports; void onCity
  const worlds:World[]=[
    {name:'Gridiron X',slug:'gridiron-x',icon:'🏈',genre:'Football',summary:'Team football, career progression, leagues and Living Worlds events.',status:'PROTOTYPE'},
    {name:'Court Kings',slug:'court-kings',icon:'🏀',genre:'Basketball',summary:'Street and arena basketball with crews, seasons and creator events.',status:'PROTOTYPE'},
    {name:'Diamond Legends',slug:'diamond-legends',icon:'⚾',genre:'Baseball',summary:'Baseball progression, teams, tournaments and persistent player identity.',status:'PLANNED'},
    {name:'Ice Storm',slug:'ice-storm',icon:'🏒',genre:'Hockey',summary:'Fast team hockey with leagues, rivalries and arena presentation.',status:'PLANNED'},
    {name:'World Pitch',slug:'world-pitch',icon:'⚽',genre:'Global Football',summary:'Clubs, international competition, street play and world tournaments.',status:'PLANNED'},
    {name:'Fight Night Holo',slug:'fight-night-holo',icon:'🥊',genre:'Boxing + Combat',summary:'Boxing and combat events with holographic presentation and explainable officiating.',status:'PROTOTYPE'},
    {name:'StreetVerse',slug:'streetverse',icon:'🌆',genre:'Open World',summary:'Living-city action, businesses, missions, reputation and social multiplayer foundation.',status:'PROTOTYPE'},
    {name:'Battlefront Zero',slug:'battlefront-zero',icon:'🎯',genre:'Tactical Action',summary:'Original tactical action world with squads, objectives and cross-world progression.',status:'PLANNED'},
    {name:'Yogihoo Arena',slug:'yogihoo-arena',icon:'✨',genre:'Creature Arena',summary:'Original collectible-creature adventure and arena competition world.',status:'PLANNED'},
    {name:'Volcano Racers',slug:'volcano-racers',icon:'🏎️',genre:'Racing',summary:'Cars, bikes and future vehicle racing across reactive Living Worlds tracks.',status:'PLANNED'},
    {name:'Kingdom Builders',slug:'kingdom-builders',icon:'🏰',genre:'Build + Strategy',summary:'Build, govern and evolve persistent kingdoms with economy and community systems.',status:'PLANNED'},
  ]

  const immersive=[
    {icon:'📱',title:'AR PORTALS',copy:'Use the phone camera to open world portals, place objects and connect real places to TRYAMM.',status:'PROTOTYPE',action:()=>openGlobal('__showImmersiveWorlds')},
    {icon:'🥽',title:'VR WORLDS',copy:'Immersive world spaces, concerts, social rooms and game experiences designed to extend the same Passport.',status:'PROTOTYPE',action:()=>openGlobal('__showImmersiveWorlds')},
    {icon:'🪄',title:'MIXED REALITY',copy:'Blend digital characters, objects, interfaces and gameplay into the physical room.',status:'PROTOTYPE',action:()=>openGlobal('__showImmersiveWorlds')},
    {icon:'🎵',title:'MUSIC & CULTURE',copy:'Artist worlds, recording, listening rooms, concerts, battles, merchandise and interactive fan spaces.',status:'PROTOTYPE',action:onMusic},
    {icon:'🎨',title:'CREATOR WORLDS',copy:'Creator-owned spaces for shows, stores, communities, games, events and collaborations.',status:'PLANNED',action:()=>openGlobal('__showHoloverse')},
    {icon:'🌐',title:'HOLOVERSE',copy:'Holographic navigation and cross-world presentation layer connected through Middleverse.',status:'PROTOTYPE',action:()=>openGlobal('__showHoloverse')},
  ]

  const badge=(status:string)=>({
    borderRadius:999,padding:'3px 7px',fontSize:7,fontWeight:900,letterSpacing:.7,
    border:`1px solid ${status==='PROTOTYPE'?gold:status==='PLAYABLE CORE'?'#65efa3':'#596174'}`,
    color:status==='PROTOTYPE'?'#ffe08a':status==='PLAYABLE CORE'?'#8fffc1':'#a5afbd',
    background:status==='PROTOTYPE'?'#2a210b':status==='PLAYABLE CORE'?'#092319':'#111522'
  } as const)

  return <section aria-labelledby="living-worlds-universe" style={{marginTop:38}}>
    <div style={{display:'flex',gap:16,alignItems:'end',justifyContent:'space-between',flexWrap:'wrap',marginBottom:15}}>
      <div>
        <div style={{color:cyan,fontSize:10,fontWeight:950,letterSpacing:3}}>GAMEVERSE • LIVING WORLDS</div>
        <h2 id="living-worlds-universe" style={{margin:'6px 0 4px',fontSize:'clamp(28px,5vw,44px)'}}>11 Core Game Worlds. One Passport.</h2>
        <div style={{color:'#91a4ba',fontSize:12,maxWidth:760,lineHeight:1.6}}>Every world opens through the GameVerse Nexus and is designed to share identity, progression and future cross-world systems while remaining an original TRYAMM experience. Prototype and planned labels show current readiness.</div>
      </div>
      <button onClick={()=>openGameVerse()} style={{border:`1px solid ${cyan}77`,background:'#071722',color:cyan,borderRadius:12,padding:'11px 15px',fontWeight:900,cursor:'pointer'}}>OPEN GAMEVERSE NEXUS →</button>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
      {worlds.map((world,index)=><button key={world.name} onClick={()=>openGameVerse(world.slug)} style={{minHeight:156,textAlign:'left',padding:16,border:'1px solid #1a2b3e',borderRadius:18,background:'linear-gradient(155deg,#0b121f,#06080e)',color:'#fff',cursor:'pointer'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><span style={{fontSize:24}}>{world.icon}</span><span style={badge(world.status)}>{world.status}</span></div>
        <div style={{color:'#71869f',fontSize:8,fontWeight:900,letterSpacing:1.4,marginTop:14}}>WORLD {String(index+1).padStart(2,'0')} • {world.genre.toUpperCase()}</div>
        <div style={{fontSize:17,fontWeight:950,marginTop:5}}>{world.name}</div>
        <div style={{fontSize:11,color:'#98a8ba',lineHeight:1.45,marginTop:7}}>{world.summary}</div>
        <div style={{fontSize:9,color:cyan,fontWeight:900,marginTop:12}}>OPEN IN GAMEVERSE →</div>
      </button>)}
    </div>

    <div style={{marginTop:28,display:'flex',alignItems:'end',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
      <div><div style={{color:gold,fontSize:10,fontWeight:950,letterSpacing:3}}>BEYOND THE 11</div><h3 style={{margin:'5px 0 0',fontSize:26}}>AR • VR • Mixed Reality • Music • Creator Worlds</h3></div>
      <div style={{fontSize:10,color:'#738198'}}>Same TRYAMM identity • cross-world architecture • device-aware experiences</div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:12}}>
      {immersive.map(item=><button key={item.title} onClick={item.action} style={{textAlign:'left',padding:16,minHeight:148,border:'1px solid #243044',borderRadius:18,background:'linear-gradient(145deg,#10101c,#080911)',color:'#fff',cursor:'pointer'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:25}}>{item.icon}</span><span style={badge(item.status)}>{item.status}</span></div>
        <div style={{fontSize:15,fontWeight:950,marginTop:13,color:item.title==='MUSIC & CULTURE'?gold:cyan}}>{item.title}</div>
        <div style={{fontSize:11,color:'#9ba9ba',lineHeight:1.5,marginTop:7}}>{item.copy}</div>
        <div style={{fontSize:9,color:'#7dcfff',fontWeight:900,marginTop:12}}>OPEN EXPERIENCE →</div>
      </button>)}
    </div>
  </section>
}
