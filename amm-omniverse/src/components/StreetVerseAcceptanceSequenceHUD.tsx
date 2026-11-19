import {useEffect,useMemo,useState} from 'react'

type Cast='bj'|'jacobie'|'lateasia'
const ORDER:Cast[]=['bj','jacobie','lateasia']
const LABEL:Record<Cast,string>={bj:'BJ STUBBS',jacobie:'JACOBIE STUBBS',lateasia:'LATEASIA MONROE'}

function current():Cast{
 const p=new URLSearchParams(location.search),c=p.get('character')||''
 return c.startsWith('jacobie')?'jacobie':c.startsWith('lateasia')?'lateasia':'bj'
}
function urlFor(c:Cast,auto=false){
 const tail=auto?'&sequence=full&autorun=1':''
 if(c==='bj')return '/streetverse?core=1&bj=v15&accept=1'+tail
 if(c==='jacobie')return '/streetverse?core=1&character=jacobie&world=greenville&accept=1'+tail
 return '/streetverse?core=1&character=lateasia&accept=1'+tail
}

export default function StreetVerseAcceptanceSequenceHUD(){
 const active=useMemo(()=>current(),[])
 useEffect(()=>{
   const p=new URLSearchParams(location.search)
   if(active!=='bj'||p.get('sequence')!=='full'||p.get('fresh')!=='1')return
   try{
     sessionStorage.removeItem('tryamm.streetverse.acceptance-sequence.v1')
     sessionStorage.removeItem('tryamm.streetverse.three-cast-evidence.v1')
     sessionStorage.setItem('tryamm.streetverse.acceptance-run.v1',Date.now().toString())
   }catch{}
   const nextUrl=new URL(location.href)
   nextUrl.searchParams.delete('fresh')
   history.replaceState({},'',nextUrl.pathname+'?'+nextUrl.searchParams.toString())
 },[active])
 const [completed,setCompleted]=useState<Cast[]>(()=>{
   try{return JSON.parse(sessionStorage.getItem('tryamm.streetverse.acceptance-sequence.v1')||'[]')}catch{return[]}
 })
 const [loopDone,setLoopDone]=useState(false)
 useEffect(()=>{
   const onComplete=(e:Event)=>{
     const d=(e as CustomEvent<any>).detail||{}
     const expectedName=active==='bj'?'BJ Stubbs':active==='jacobie'?'Jacobie Stubbs':'LaTeasia Monroe'
     const exactSeven=Array.isArray(d.steps)&&d.steps.length===7&&d.steps.every((s:any)=>s?.done===true)
     if(d?.passed!==true||d.character!==expectedName||!exactSeven)return
     setLoopDone(true)
     setCompleted(prev=>{
       const next=prev.includes(active)?prev:[...prev,active]
       try{sessionStorage.setItem('tryamm.streetverse.acceptance-sequence.v1',JSON.stringify(next))}catch{}
       return next
     })
   }
   addEventListener('tryamm:streetverse-vertical-slice-complete',onComplete)
   return()=>removeEventListener('tryamm:streetverse-vertical-slice-complete',onComplete)
 },[active])
 const next=ORDER.find(x=>!completed.includes(x) && x!==active) || ORDER.find(x=>!completed.includes(x))
 const doneAll=ORDER.every(x=>completed.includes(x))
 useEffect(()=>{
   const p=new URLSearchParams(location.search)
   if(p.get('sequence')!=='full'||p.get('autorun')!=='1'||!loopDone||doneAll||!next)return
   const timer=window.setTimeout(()=>location.assign(urlFor(next,true)),900)
   return()=>window.clearTimeout(timer)
 },[loopDone,doneAll,next])
 return <aside style={{position:'fixed',left:'max(10px,env(safe-area-inset-left))',top:'calc(env(safe-area-inset-top) + 8px)',zIndex:54000,fontFamily:'system-ui,sans-serif'}}>
   <div style={{display:'grid',gap:6,padding:9,borderRadius:14,border:'1px solid #8ac6ff',background:'rgba(4,15,28,.95)',color:'#fff',minWidth:220}}>
    <strong>ACCEPTANCE SEQUENCE</strong>
    <span style={{fontSize:11}}>{ORDER.map(x=>completed.includes(x)?'✓ '+LABEL[x]:'○ '+LABEL[x]).join('  ')}</span>
    {!doneAll&&loopDone&&next&&<a href={urlFor(next,new URLSearchParams(location.search).get('autorun')==='1')} style={{minHeight:44,display:'grid',placeItems:'center',borderRadius:10,background:'#214c76',color:'#fff',textDecoration:'none',fontWeight:900}}>{new URLSearchParams(location.search).get('autorun')==='1'?'AUTO CONTINUING • ':'NEXT • '}{LABEL[next]}</a>}
    {doneAll&&<strong style={{color:'#b8ffd0'}}>✓ ALL THREE CHARACTER LOOPS COMPLETE</strong>}
    <button type="button" onClick={()=>{try{sessionStorage.removeItem('tryamm.streetverse.acceptance-sequence.v1');sessionStorage.removeItem('tryamm.streetverse.three-cast-evidence.v1')}catch{};setCompleted([]);setLoopDone(false)}} style={{minHeight:38,borderRadius:9,border:'1px solid #5d6f83',background:'#172333',color:'#fff',fontWeight:800}}>RESET ACCEPTANCE SESSION</button>
   </div>
 </aside>
}
