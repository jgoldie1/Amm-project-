import {useState} from 'react'

const BUILDINGS=[
 {left:2,width:12,height:44,label:'WACKER SOUTH',tone:'#263847'},
 {left:12,width:10,height:58,label:'TRYAMM TOWER',tone:'#1d2b38'},
 {left:21,width:12,height:49,label:'CREATOR HOUSE',tone:'#3b3038'},
 {left:31,width:11,height:66,label:'OMNI CENTER',tone:'#263633'},
 {left:40,width:14,height:54,label:'64 TRACK',tone:'#2e3447'},
 {left:52,width:11,height:72,label:'STUBBS AI',tone:'#1e303b'},
 {left:62,width:13,height:50,label:'MARKETPLACE',tone:'#3a312a'},
 {left:73,width:10,height:61,label:'HOLO LIVE',tone:'#243849'},
 {left:82,width:15,height:46,label:'CHICAGO COMMONS',tone:'#30333b'},
] as const

const CARS=[
 {left:'27%',top:'69%',scale:.72,tone:'#ef5b4f'},
 {left:'57%',top:'63%',scale:.9,tone:'#e5c747'},
 {left:'68%',top:'77%',scale:1.05,tone:'#36a9e8'},
] as const

const PEOPLE=[
 {left:'12%',top:'62%',tone:'#ff7ce8'},
 {left:'18%',top:'69%',tone:'#7fe8c7'},
 {left:'77%',top:'61%',tone:'#ffd166'},
 {left:'85%',top:'72%',tone:'#66d9ff'},
] as const

const TREES=['7%','16%','80%','91%'] as const

export default function StreetVerseLoopAlphaQualityPreview(){
 const [night,setNight]=useState(false)
 const sky=night?'linear-gradient(#071326 0%,#11294b 58%,#5d4160 100%)':'linear-gradient(#4d91bd 0%,#91c8e5 58%,#f0b678 100%)'
 const road=night?'#161b22':'#242a31'
 const water=night?'linear-gradient(90deg,#0a2644,#194f72,#0a2848)':'linear-gradient(90deg,#397e9e,#62b8cf,#4389aa)'

 return <section aria-label="StreetVerse Chicago Alpha Quality Preview" style={{marginBottom:14,borderRadius:18,overflow:'hidden',border:'1px solid #5e87a1',background:'#030914',boxShadow:'0 18px 55px #0008'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,padding:'10px 12px',background:'#050a12'}}>
   <div><b style={{letterSpacing:.7}}>ALPHA QUALITY SLICE • LOOP #32</b><div style={{fontSize:10,color:'#9fc7dd',marginTop:2}}>Lighting • skyline • river • CTA • traffic • pedestrians • trees</div></div>
   <button onClick={()=>setNight(v=>!v)} aria-label={night?'Switch Loop quality preview to daytime':'Switch Loop quality preview to nighttime'} style={{minHeight:44,borderRadius:12,border:'1px solid #7be9ff99',background:'#0b1924',color:'#fff',fontWeight:900,padding:'0 12px',whiteSpace:'nowrap'}}>{night?'DAY':'NIGHT'}</button>
  </div>
  <div style={{position:'relative',height:'clamp(300px,54vw,430px)',overflow:'hidden',background:sky}}>
   <div aria-hidden="true" style={{position:'absolute',right:'8%',top:'8%',width:44,height:44,borderRadius:'50%',background:night?'#d9e7ff':'#ffe4a0',boxShadow:night?'0 0 42px #b8d0ff99':'0 0 52px #ffe4a0bb'}}/>
   <div aria-hidden="true" style={{position:'absolute',left:0,right:0,top:'8%',height:'46%'}}>
    {BUILDINGS.map((b,i)=><div key={b.label} style={{position:'absolute',left:`${b.left}%`,bottom:0,width:`${b.width}%`,height:`${b.height}%`,minHeight:100,background:`linear-gradient(90deg,${b.tone},#111a22)`,border:'1px solid #0b1118',boxShadow:'0 12px 35px #0007'}}>
      <div style={{position:'absolute',left:5,right:5,top:8,fontSize:7,fontWeight:900,textAlign:'center',color:'#dff8ff',textShadow:'0 1px 4px #000'}}>{b.label}</div>
      <div style={{position:'absolute',inset:'26px 7px 8px',opacity:night?.95:.62,background:night?'repeating-linear-gradient(90deg,#ffd46c 0 4px,transparent 4px 12px),repeating-linear-gradient(0deg,#79cfff88 0 4px,transparent 4px 13px)':'repeating-linear-gradient(90deg,#aee7ff 0 4px,transparent 4px 12px),repeating-linear-gradient(0deg,#d5ecff55 0 4px,transparent 4px 13px)'}}/>
      {i===5&&<div style={{position:'absolute',left:'50%',top:-20,width:3,height:23,transform:'translateX(-50%)',background:'#a9d7e8'}}/>}
     </div>)}
   </div>

   <div aria-hidden="true" style={{position:'absolute',left:0,right:0,top:'47%',height:'11%',background:water,borderTop:'2px solid #d9f4ff66',borderBottom:'2px solid #06131e99'}}>
    <div style={{position:'absolute',left:0,right:0,top:'48%',height:1,background:'#d8fbff99'}}/>
   </div>

   <div aria-hidden="true" style={{position:'absolute',left:0,right:0,top:'53%',height:24}}>
    <div style={{position:'absolute',left:0,right:0,top:8,height:5,background:'#20242b',boxShadow:'0 4px 6px #0009'}}/>
    <div style={{position:'absolute',left:'17%',top:0,width:'28%',height:20,borderRadius:4,background:'#8b1f2d',border:'2px solid #d9d9df',boxShadow:'0 4px 8px #0008'}}>
     <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:3,padding:'4px 6px'}}>{Array.from({length:5}).map((_,i)=><span key={i} style={{height:7,background:'#bfe8ff',borderRadius:1}}/>)}</div>
    </div>
    {[12,31,51,71,90].map(x=><div key={x} style={{position:'absolute',left:`${x}%`,top:11,width:4,height:36,background:'#30353c'}}/>)}
   </div>

   <div aria-hidden="true" style={{position:'absolute',left:'-8%',right:'-8%',top:'59%',bottom:'-12%',background:road,clipPath:'polygon(27% 0,73% 0,100% 100%,0 100%)',boxShadow:'inset 0 0 0 2px #4a515a'}}>
    <div style={{position:'absolute',left:'49.4%',top:0,bottom:0,width:'1.2%',background:'repeating-linear-gradient(180deg,#f8e26a 0 24px,transparent 24px 48px)'}}/>
    <div style={{position:'absolute',left:'34%',top:0,bottom:0,width:2,background:'#d9d9d944'}}/>
    <div style={{position:'absolute',right:'34%',top:0,bottom:0,width:2,background:'#d9d9d944'}}/>
   </div>

   {TREES.map((left,i)=><div key={left} aria-hidden="true" style={{position:'absolute',left,top:i%2?'62%':'59%',zIndex:6,width:28,height:62}}>
    <div style={{position:'absolute',left:12,top:28,width:5,height:34,background:'#543923'}}/>
    <div style={{position:'absolute',left:0,top:0,width:28,height:34,borderRadius:'50%',background:night?'#173d2b':'#2f7e48',boxShadow:'0 4px 10px #0005'}}/>
   </div>)}

   {PEOPLE.map((p,i)=><div key={i} aria-hidden="true" style={{position:'absolute',left:p.left,top:p.top,zIndex:8,width:15,height:35}}>
    <div style={{width:11,height:11,borderRadius:'50%',background:i%2?'#6f442f':'#b57651',margin:'0 auto'}}/>
    <div style={{width:14,height:17,borderRadius:'5px 5px 2px 2px',background:p.tone,margin:'1px auto'}}/>
    <div style={{width:3,height:8,background:'#111',display:'inline-block',marginLeft:3}}/><div style={{width:3,height:8,background:'#111',display:'inline-block',marginLeft:3}}/>
   </div>)}

   {CARS.map((c,i)=><div key={i} aria-hidden="true" style={{position:'absolute',left:c.left,top:c.top,zIndex:9,width:28,height:46,borderRadius:8,background:c.tone,border:'2px solid #e9f7ff',boxShadow:'0 8px 16px #0008',transform:`translate(-50%,-50%) scale(${c.scale})`}}>
    <div style={{margin:'5px 4px',height:10,borderRadius:3,background:'#bde8ff'}}/>
   </div>)}

   <div style={{position:'absolute',left:10,right:10,bottom:10,zIndex:14,display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:10}}>
    <div style={{padding:'7px 9px',borderRadius:10,background:'#020711dd',border:'1px solid #6ba1be',fontSize:10,lineHeight:1.35}}><b style={{color:'#8effb7'}}>QUALITY TARGET</b><br/>Dense Chicago atmosphere without sacrificing iPhone-safe performance.</div>
    <div style={{padding:'7px 9px',borderRadius:10,background:'#020711dd',border:'1px solid #ffd65a88',fontSize:10,textAlign:'right'}}><b>ALPHA VISUAL</b><br/>Not final AAA art</div>
   </div>
  </div>
 </section>
}
