export const CIRCLE_PARK_PUBLIC_SAFETY_LADDER = [
  {id:'community-safety',label:'Circle Park Community Safety',kind:'fictional'},
  {id:'licensed-security',label:'Security Career Training',kind:'career-education'},
  {id:'public-safety',label:'Police / Sheriff Public-Service Simulation',kind:'civic-education'},
  {id:'federal-investigations',label:'Federal Investigations Simulation',kind:'civic-education'},
  {id:'intelligence',label:'Intelligence Analysis Simulation',kind:'civic-education'},
  {id:'mib',label:'MIB Space Investigation',kind:'fictional'},
  {id:'007',label:'007-Style Spy Adventure',kind:'fictional'},
] as const

const SAFETY_DOCTRINE = [
  'de-escalation',
  'rescue-and-protection',
  'lawful-reporting',
  'evidence-preservation',
  'privacy',
  'accessibility',
  'no-vigilantism',
  'no-real-world-authority',
  'no-partisan-persuasion',
] as const

let installed=false
export function installCircleParkPublicSafetyBridgeRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  const publish=()=>window.dispatchEvent(new CustomEvent('tryamm:circle-park-public-safety',{detail:{
    schema:'tryamm.circle-park.public-safety.v1',
    ladder:CIRCLE_PARK_PUBLIC_SAFETY_LADDER,
    doctrine:SAFETY_DOCTRINE,
    weaponsPolicy:'fictional-gameplay-only-no-real-world-commerce',
    note:'Real agencies are represented only as clearly labeled educational simulations; fictional MIB/spy lanes grant no real authority.',
  }}))
  queueMicrotask(publish)
  window.addEventListener('tryamm:circle-park-public-safety-request',publish)
  window.addEventListener('tryamm:streetverse-chicago-unlocked',()=>window.dispatchEvent(new CustomEvent('tryamm:public-service-request')))
}
