import {useState} from 'react'
type Showcase={id:string;name:string;kind:string;headline:string;value:string;status:string;href?:string;anchor?:string;accent:string}
const showcases:Showcase[]=[
 {id:'website',name:'TRYAMM WEBSITE STUDIO',kind:'BUSINESS',headline:'Launch your business presence',value:'Website Preview inquiry · from $499',status:'SERVICE INQUIRY',anchor:'start-with-tryamm',accent:'#e8b944'},
 {id:'aniyah',name:'ANIYAH 64-TRACK STUDIO',kind:'CREATOR',headline:'Turn your voice into a finished track',value:'Rap vocal editing inquiry · $35 starter service',status:'SERVICE INQUIRY',anchor:'tryamm-media-studios',accent:'#a98aff'},
 {id:'network',name:'ALL AMERICAN NETWORK',kind:'MEDIA',headline:'Stories, shows and creator distribution',value:'TV and partner showcase',status:'BETA',anchor:'tryamm-media-studios',accent:'#58c7fe'},
 {id:'isaiah',name:'ISAIAH AI TV',kind:'TALENT',headline:'Who wants to be a star?',value:'Auditions and talent-show concept',status:'BETA',anchor:'tryamm-media-studios',accent:'#ff9cb4'},
 {id:'streetverse',name:'STREETVERSE CHICAGO',kind:'WORLD',headline:'Enter the living Chicago RP RPG',value:'Circle Park → Village → West Side',status:'GAME PREVIEW',href:'/streetverse',accent:'#73e2b1'},
 {id:'partners',name:'BUSINESS PARTNERS',kind:'SPONSORS',headline:'Help launch the next generation',value:'Sponsorship and partnership proposals',status:'INQUIRY',anchor:'sponsors-and-funding',accent:'#e8b944'},
]
const featuredBusinesses=[
 {name:'TRYAMM Website Studio',category:'Digital business services',description:'Starter websites, business pages, QR codes and creator promotions.',anchor:'start-with-tryamm',status:'Service inquiry'},
 {name:'Aniyah 64-Track Studio',category:'Music and audio services',description:'Rap vocal editing and creator-studio inquiries.',anchor:'tryamm-media-studios',status:'Service inquiry'},
 {name:'All American Network',category:'Media and creator network',description:'Explore programming and potential media partnerships.',anchor:'tryamm-media-studios',status:'Beta preview'},
] as const
const button:React.CSSProperties={minHeight:48,borderRadius:12,border:'1px solid #82a9c4',background:'#142b43',color:'#fff',padding:'9px 16px',fontWeight:800,cursor:'pointer'}
export default function TryAMMShowcaseCarousel(){
 const [index,setIndex]=useState(0)
 const [showBusiness,setShowBusiness]=useState(true)
 const item=showcases[index]
 const day=Math.floor(Date.UTC(new Date().getUTCFullYear(),new Date().getUTCMonth(),new Date().getUTCDate())/86400000)
 const featured=featuredBusinesses[((day%featuredBusinesses.length)+featuredBusinesses.length)%featuredBusinesses.length]
 const go=(delta:number)=>setIndex(i=>(i+delta+showcases.length)%showcases.length)
 const visit=(target:Showcase)=>{if(target.href){window.location.assign(target.href)}else if(target.anchor){document.getElementById(target.anchor)?.scrollIntoView({behavior:'smooth',block:'start'})}}
 return <section id="tryamm-showcase" aria-label="TRYAMM business and omniverse showcase" data-no-realm-swipe="true" style={{marginTop:26,color:'#fff'}}>
  <div style={{display:'flex',alignItems:'end',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:13}}><div><div style={{fontSize:11,color:'#91dff2',letterSpacing:2,fontWeight:900}}>FEATURED DESTINATIONS</div><h2 style={{fontSize:'clamp(24px,4vw,34px)',margin:'6px 0'}}>Explore what TRYAMM is building</h2></div><span style={{fontSize:12,color:'#b2c6d5'}}>Swipe or use arrows · {index+1} / {showcases.length}</span></div>
  <div onTouchStart={e=>{e.currentTarget.dataset.touchX=String(e.touches[0]?.clientX??0)}} onTouchEnd={e=>{const start=Number(e.currentTarget.dataset.touchX);const end=e.changedTouches[0]?.clientX??start;if(Math.abs(end-start)>65)go(end<start?1:-1)}} style={{border:'1px solid '+item.accent,borderRadius:23,background:'radial-gradient(circle at 82% 18%,'+item.accent+'33,transparent 43%),linear-gradient(145deg,#112338,#070b17)',padding:'clamp(18px,4vw,34px)',minHeight:260,display:'flex',flexDirection:'column',justifyContent:'space-between',gap:20,boxSizing:'border-box'}}>
   <div><div style={{fontSize:11,color:item.accent,fontWeight:900,letterSpacing:1.5}}>{item.kind} · {item.status}</div><h3 style={{fontSize:'clamp(27px,5vw,43px)',maxWidth:670,lineHeight:1.08,margin:'12px 0'}}>{item.headline}</h3><div style={{fontSize:15,fontWeight:750}}>{item.name}</div><p style={{fontSize:14,color:'#c4d4e2'}}>{item.value}</p></div>
   <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center'}}><button style={{...button,background:item.accent,color:'#081522',borderColor:item.accent}} onClick={()=>visit(item)}>Explore {item.kind.toLowerCase()}</button><button style={button} aria-label="Previous featured experience" onClick={()=>go(-1)}>← Previous</button><button style={button} aria-label="Next featured experience" onClick={()=>go(1)}>Next →</button></div>
  </div>
  <div aria-label="Choose a showcase slide" style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:12}}>{showcases.map((s,i)=><button key={s.id} onClick={()=>setIndex(i)} aria-label={'Show '+s.name} aria-current={index===i?'true':undefined} style={{width:Math.max(32,100/showcases.length)+'%',maxWidth:86,minHeight:30,borderRadius:9,background:index===i?s.accent:'#1a3044',border:'1px solid #60829a',cursor:'pointer'}}/>)}</div>
  <div style={{marginTop:17,border:'1px solid #98753d',borderRadius:19,background:'#17170e',padding:18}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}><div style={{fontSize:11,color:'#f6cf6f',fontWeight:900,letterSpacing:1.5}}>BUSINESS OF THE DAY</div><button style={{...button,minHeight:40}} onClick={()=>setShowBusiness(v=>!v)} aria-expanded={showBusiness}>{showBusiness?'Hide':'Show'} business</button></div>
   {showBusiness&&<div><h3 style={{fontSize:22,margin:'8px 0'}}>{featured.name}</h3><div style={{fontSize:12,color:'#f6cf6f'}}>{featured.category} · {featured.status}</div><p style={{fontSize:14,color:'#d5d1c0',lineHeight:1.6}}>{featured.description}</p><button style={{...button,borderColor:'#e8b944'}} onClick={()=>document.getElementById(featured.anchor)?.scrollIntoView({behavior:'smooth',block:'start'})}>Explore today's business →</button><p style={{fontSize:11,color:'#a7a89d',marginBottom:0}}>Daily featured TRYAMM business experience. Listings are not endorsements or proof of completed services.</p></div>}
  </div>
 </section>
}
