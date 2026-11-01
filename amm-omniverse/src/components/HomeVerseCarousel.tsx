import {useState} from 'react'

const destinations=[
 {title:'StreetVerse Chicago',subtitle:'Play the Circle Park world',href:'/streetverse?safe=1&place=circle-park',tag:'GAME'},
 {title:'All American Marketplace',subtitle:'Explore businesses and services',href:'/marketplace',tag:'MARKET'},
 {title:'TRYAMM LIVE',subtitle:'Creator broadcasting and discovery',href:'/',tag:'LIVE',action:'__showTryAMMLive'},
 {title:'Creator Studio',subtitle:'Reels, music and digital experiences',href:'/',tag:'CREATE',action:'__showMediaStudio'},
 {title:'Stubbs Mobility 360',subtitle:'Accessible living storefront preview',href:'/mobility360.html',tag:'PREVIEW'},
] as const

export default function HomeVerseCarousel(){
 const [index,setIndex]=useState(0)
 const selected=destinations[index]
 const move=(delta:number)=>setIndex(i=>(i+delta+destinations.length)%destinations.length)
 return <section aria-label="TRYAMM destination carousel" style={{marginTop:24,padding:20,border:'1px solid #34536a',borderRadius:24,background:'linear-gradient(135deg,#0c1a2c,#100e20)',color:'#fff'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><h2 style={{margin:0,fontSize:24}}>Explore TRYAMM</h2><span style={{fontSize:12,color:'#b9cadb'}}>{index+1} of {destinations.length}</span></div>
  <div aria-live="polite" style={{padding:'28px 6px',minHeight:145}}><div style={{fontSize:12,color:'#e8b944',fontWeight:800}}>{selected.tag}</div><h3 style={{fontSize:'clamp(23px,4vw,36px)',margin:'10px 0'}}>{selected.title}</h3><p style={{color:'#bed0dd'}}>{selected.subtitle}</p><a href={selected.href} onClick={e=>{if('action' in selected && selected.action){const open=(window as unknown as Record<string,unknown>)[selected.action];if(typeof open==='function'){e.preventDefault();(open as ()=>void)()}}}} style={{display:'inline-block',padding:'12px 18px',borderRadius:12,background:'#4fe3ff',color:'#061321',fontWeight:900,textDecoration:'none'}}>Open {selected.title}</a></div>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}><button type="button" aria-label="Previous destination" onClick={()=>move(-1)} style={{minWidth:48,minHeight:48,borderRadius:12,border:'1px solid #6d899d',background:'#10253b',color:'#fff',fontSize:24,cursor:'pointer'}}>‹</button><div role="group" aria-label="Choose destination" style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>{destinations.map((item,i)=><button type="button" key={item.title} aria-label={'Show '+item.title} aria-pressed={index===i} onClick={()=>setIndex(i)} style={{width:16,height:16,borderRadius:999,border:'1px solid #91a9c2',background:index===i?'#4fe3ff':'#233348',cursor:'pointer'}}/>)}</div><button type="button" aria-label="Next destination" onClick={()=>move(1)} style={{minWidth:48,minHeight:48,borderRadius:12,border:'1px solid #6d899d',background:'#10253b',color:'#fff',fontSize:24,cursor:'pointer'}}>›</button></div>
 </section>
}
