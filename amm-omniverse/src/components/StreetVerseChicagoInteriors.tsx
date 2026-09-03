import {useEffect,useMemo,useState} from 'react'

type Store={id:string;label:string;district:string;counter:string}
const stores:Record<string,Store>={
 'loop-courier':{id:'loop-courier',label:'Loop Courier Hub',district:'THE LOOP',counter:'Courier Dispatch'},
 'riverwalk-creator':{id:'riverwalk-creator',label:'Riverwalk Creator Studio',district:'CHICAGO RIVER',counter:'Creator Desk'},
 'millennium-event':{id:'millennium-event',label:'Millennium Event Pavilion',district:'LAKEFRONT',counter:'Event Check-In'},
 'south-market':{id:'south-market',label:'79th Street Market',district:'SOUTH SIDE',counter:'Market Counter'},
 'west-maker':{id:'west-maker',label:'Madison Maker Hub',district:'WEST SIDE',counter:'Maker Desk'},
 'north-night':{id:'north-night',label:'North Side Creator Venue',district:'NORTH SIDE',counter:'Venue Host'},
}
export default function StreetVerseChicagoInteriors(){
 const [near,setNear]=useState<Store|null>(null),[inside,setInside]=useState<Store|null>(null),[status,setStatus]=useState('')
 useEffect(()=>{const onNear=(e:Event)=>{const d=(e as CustomEvent).detail||{};const s=stores[String(d.id||'')];if(s)setNear(s)};const onLeave=()=>{if(!inside)setNear(null)};window.addEventListener('tryamm:chicago-storefront-near',onNear);window.addEventListener('tryamm:chicago-storefront-leave',onLeave);return()=>{window.removeEventListener('tryamm:chicago-storefront-near',onNear);window.removeEventListener('tryamm:chicago-storefront-leave',onLeave)}},[inside])
 const store=inside||near
 const enter=()=>{if(!near)return;setInside(near);setStatus('');window.dispatchEvent(new CustomEvent('tryamm:chicago-interior-enter',{detail:{id:near.id,label:near.label,district:near.district}}))}
 const exit=()=>{if(!inside)return;window.dispatchEvent(new CustomEvent('tryamm:chicago-interior-exit',{detail:{id:inside.id,label:inside.label}}));setInside(null);setStatus('')}
 const interact=()=>{if(!inside)return;setStatus('INTERACTION COMPLETE');window.dispatchEvent(new CustomEvent('tryamm:chicago-business-counter-interact',{detail:{id:inside.id,label:inside.label,counter:inside.counter}}));window.dispatchEvent(new CustomEvent('tryamm:chicago-activity-step',{detail:{activityId:inside.id,step:'counter-interaction',label:inside.counter}}))}
 const bg=useMemo(()=>inside?'radial-gradient(circle at 50% 25%,rgba(46,74,96,.97),rgba(6,11,18,.99) 62%)':'transparent',[inside])
 if(!store)return null
 if(!inside)return <div style={{position:'fixed',left:'50%',bottom:88,transform:'translateX(-50%)',zIndex:17020,padding:'10px 12px',borderRadius:12,background:'rgba(5,12,20,.9)',border:'1px solid #5fc4ff88',color:'#fff',fontFamily:'system-ui',minWidth:240,textAlign:'center'}}><strong>{store.label}</strong><div style={{fontSize:12,opacity:.75}}>{store.district}</div><button onClick={enter} style={{marginTop:8,padding:'8px 14px',fontWeight:900,borderRadius:8,border:0}}>ENTER</button></div>
 return <div style={{position:'fixed',inset:0,zIndex:17030,background:bg,color:'#fff',fontFamily:'system-ui',display:'grid',placeItems:'center'}}><div style={{width:'min(92vw,720px)',minHeight:380,padding:24,borderRadius:22,border:'1px solid #71c7ff66',background:'linear-gradient(180deg,rgba(17,28,40,.96),rgba(7,12,18,.98))',boxShadow:'0 30px 90px rgba(0,0,0,.55)'}}><div style={{display:'flex',justifyContent:'space-between',gap:16}}><div><div style={{fontSize:13,opacity:.68}}>CHICAGO BUSINESS INTERIOR</div><h2 style={{margin:'4px 0'}}>{inside.label}</h2><div style={{opacity:.72}}>{inside.district}</div></div><button onClick={exit} style={{alignSelf:'start',padding:'8px 12px',borderRadius:8,border:0,fontWeight:900}}>EXIT</button></div><div style={{marginTop:34,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}><div style={{padding:18,borderRadius:14,background:'rgba(255,255,255,.06)'}}><strong>{inside.counter}</strong><p style={{fontSize:13,opacity:.76}}>Talk to the business NPC/counter to advance the active Chicago mission step.</p><button onClick={interact} style={{padding:'10px 14px',borderRadius:8,border:0,fontWeight:900}}>INTERACT</button></div><div style={{padding:18,borderRadius:14,background:'rgba(255,255,255,.06)'}}><strong>PICKUP / DROP-OFF</strong><p style={{fontSize:13,opacity:.76}}>Mission cargo, creator check-in, market jobs and business handoffs use this interaction point.</p><div style={{fontWeight:900,marginTop:18}}>{status||'READY'}</div></div></div></div></div>
}
