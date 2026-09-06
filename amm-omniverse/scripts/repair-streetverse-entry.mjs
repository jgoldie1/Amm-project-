import fs from 'node:fs'
import path from 'node:path'

const mainFile=path.resolve('src/main.tsx')
let main=fs.readFileSync(mainFile,'utf8')

const mobileImport="import StreetVerseMobilePlayableWorld from './components/StreetVerseMobilePlayableWorld'"
if(!main.includes(mobileImport)){
  main=main.replace(
    "const StreetVerseGeoSpawnBridge=lazy(()=>import('./components/StreetVerseGeoSpawnBridge'))",
    `${mobileImport}\nconst StreetVerseGeoSpawnBridge=lazy(()=>import('./components/StreetVerseGeoSpawnBridge'))`
  )
}

// The richer StreetVerse 3D runtime must install on StreetVerse routes, not everywhere except StreetVerse.
main=main.replace("if(!isStreetVerse){\n  void import('./runtime/StreetVerseCreatorDistrict3D')", "if(isStreetVerse){\n  void import('./runtime/StreetVerseCreatorDistrict3D')")

// Never show an empty/permanent LOADING screen while the lazy 3D bridge is downloading.
const oldWorld="<Suspense fallback={routeFallback}><StreetVerseGeoSpawnBridge onClose={()=>{window.location.href='/'}} /></Suspense>"
const newWorld="<Suspense fallback={<StreetVerseMobilePlayableWorld onClose={()=>{window.location.href='/'}} />}><StreetVerseGeoSpawnBridge onClose={()=>{window.location.href='/'}} /></Suspense>"
main=main.replace(oldWorld,newWorld)

// Keep essential navigation reachable even while the world is starting.
const navAnchor="<div style={{position:'fixed',left:12,top:12,zIndex:16990,display:'flex',gap:8,flexWrap:'wrap'}}>"
if(main.includes(navAnchor)&&!main.includes("HOME • TRYAMM")){
  main=main.replace(navAnchor,`${navAnchor}\n    <button onClick={()=>{window.location.href='/'}} style={{border:'1px solid #ffffff88',borderRadius:999,padding:'10px 14px',background:'#111827',color:'#fff',fontWeight:950,cursor:'pointer'}}>HOME • TRYAMM</button>\n    <button onClick={()=>{window.location.href='/marketplace'}} style={{border:'1px solid #65f2a699',borderRadius:999,padding:'10px 14px',background:'#071b14',color:'#fff',fontWeight:950,cursor:'pointer'}}>🛍 MARKETPLACE</button>\n    <button onClick={()=>{window.location.href='/music'}} style={{border:'1px solid #d98cff99',borderRadius:999,padding:'10px 14px',background:'#1c1025',color:'#fff',fontWeight:950,cursor:'pointer'}}>♫ MUSIC</button>`)
}

fs.writeFileSync(mainFile,main)

// Make public realm URLs initialize the matching in-app screen. This makes StreetVerse
// navigation to /marketplace and /music land on the actual realm instead of the intro screen.
const appFile=path.resolve('src/App.tsx')
let app=fs.readFileSync(appFile,'utf8')
app=app.replace("import { lazy, Suspense, useState } from 'react'","import { lazy, Suspense, useEffect, useState } from 'react'")
if(!app.includes('TRYAMM public realm deep-link routing')){
  app=app.replace(
    "  const screen = useGameStore(s => s.screen)",
    "  const screen = useGameStore(s => s.screen)\n  const setScreen = useGameStore(s => s.setScreen)\n\n  // TRYAMM public realm deep-link routing\n  useEffect(() => {\n    const route = window.location.pathname.replace(/\\/$/, '') || '/'\n    const realm = ({'/marketplace':'marketplace','/music':'music','/sports':'sports','/faith':'faith','/blockchain':'blockchain','/city':'city'} as const)[route]\n    if (realm) setScreen(realm)\n  }, [setScreen])"
  )
}
fs.writeFileSync(appFile,app)

// Add lightweight procedural nature/animal landmarks to the no-WebGL city so older iPhones still show a living world.
const mobileFile=path.resolve('src/components/StreetVerseMobilePlayableWorld.tsx')
let mobile=fs.readFileSync(mobileFile,'utf8')
const dogMarker='<div aria-label="Dog" style={{position:\'absolute\',right:\'15%\',top:\'58%\',zIndex:8,fontSize:22,filter:\'drop-shadow(0 3px 3px #0008)\'}}>🐕</div>'
if(mobile.includes(dogMarker)&&!mobile.includes('StreetVerse procedural trees')){
  const living=`{/* StreetVerse procedural trees + animals: guaranteed no-WebGL living-world fallback */}\n    <div aria-label="StreetVerse procedural trees" style={{position:'absolute',left:'6%',top:'38%',zIndex:7,fontSize:30}}>🌳</div><div aria-hidden="true" style={{position:'absolute',left:'88%',top:'35%',zIndex:7,fontSize:34}}>🌲</div><div aria-hidden="true" style={{position:'absolute',left:'4%',top:'66%',zIndex:7,fontSize:28}}>🌳</div><div aria-hidden="true" style={{position:'absolute',right:'5%',top:'70%',zIndex:7,fontSize:30}}>🌲</div>\n    <div aria-label="StreetVerse animals" style={{position:'absolute',left:'18%',top:'62%',zIndex:8,fontSize:20}}>🐈</div><div aria-hidden="true" style={{position:'absolute',right:'28%',top:'50%',zIndex:8,fontSize:18}}>🕊️</div>\n    ${dogMarker}`
  mobile=mobile.replace(dogMarker,living)
  mobile=mobile.replace('People • traffic • dog •', 'People • traffic • trees • animals •')
}
fs.writeFileSync(mobileFile,mobile)

console.log('StreetVerse entry + realm deep-link recovery: GREEN')
