export type StreetVerseAdultSubstance='alcohol'|'cannabis'

export type StreetVerseImpairmentState={
  alcohol:number
  cannabis:number
  combined:number
  drivingBlocked:boolean
  updatedAt:number
}

const clamp=(n:number)=>Math.max(0,Math.min(1,n))
let installed=false

export function installStreetVerseAdultSubstanceRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true
  let alcohol=0,cannabis=0,last=Date.now()
  let timer:number|undefined

  const publish=()=>{
    const combined=clamp(alcohol*.75+cannabis*.55)
    const state:StreetVerseImpairmentState={
      alcohol,
      cannabis,
      combined,
      drivingBlocked:combined>=.18,
      updatedAt:Date.now(),
    }
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-impairment-state',{detail:state}))
    window.dispatchEvent(new CustomEvent('tryamm:character-body-effects',{detail:{
      characterId:'bj-stubbs',
      source:'adult-recreation-simulation',
      balance:clamp(1-combined*.45),
      reaction:clamp(1-combined*.35),
      coordination:clamp(1-combined*.42),
      gameplayOnly:true,
    }}))
  }

  const onConsume=(event:Event)=>{
    const detail=(event as CustomEvent<{substance?:StreetVerseAdultSubstance;amount?:number;ageVerified?:boolean}>).detail||{}
    if(detail.ageVerified!==true)return
    const amount=clamp(Number(detail.amount||.18))
    if(detail.substance==='alcohol')alcohol=clamp(alcohol+amount)
    else if(detail.substance==='cannabis')cannabis=clamp(cannabis+amount)
    else return
    last=Date.now()
    publish()
    window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{
      kind:'adult-recreation',
      substance:detail.substance,
      gameplayOnly:true,
      noRealWorldProcurement:true,
      source:'streetverse-adult-substance-runtime',
    }}))
  }

  const onClear=()=>{alcohol=0;cannabis=0;last=Date.now();publish()}
  addEventListener('tryamm:streetverse-adult-consume',onConsume)
  addEventListener('tryamm:streetverse-adult-recover',onClear)
  timer=window.setInterval(()=>{
    const now=Date.now()
    const elapsed=Math.max(0,now-last)/1000
    last=now
    alcohol=clamp(alcohol-elapsed*.0020)
    cannabis=clamp(cannabis-elapsed*.0016)
    publish()
  },1000)
  publish()

  return()=>{
    if(timer)clearInterval(timer)
    removeEventListener('tryamm:streetverse-adult-consume',onConsume)
    removeEventListener('tryamm:streetverse-adult-recover',onClear)
    installed=false
  }
}
