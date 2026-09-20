import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error(`HOLO LIVE/PK CONTRACT FAIL: ${msg}`)}

const pkg=JSON.parse(read('package.json'))
const deps={...(pkg.dependencies||{}),...(pkg.devDependencies||{})}
for(const dep of ['livekit-client','livekit-server-sdk','@lottiefiles/dotlottie-react','lottie-web']){
  must(Boolean(deps[dep]),`missing dependency ${dep}`)
}

const live=read('src/services/live.ts')
must(live.includes("createLiveToken"),'LIVE client must request an authenticated token')
must(live.includes("import('livekit-client')"),'LIVE client must lazy-load livekit-client')
must(live.includes('room.connect(session.url, session.token)'),'LIVE client must connect with provider URL/token')
must(live.includes('setMicrophoneEnabled(true)')&&live.includes('setCameraEnabled(true)'),'host LIVE must enable microphone and camera')

const token=read('api/live/token.js')
must(token.includes('AccessToken'),'server must mint LiveKit access tokens')
must(token.includes('requireUser'),'LIVE token endpoint must require authentication')
must(token.includes("canPublish:role==='host'"),'viewer/host publish permissions must remain role-gated')

const center=read('src/components/LiveCenter.tsx')
must(center.includes('connectLiveRoom'),'LiveCenter must use the LiveKit service')
must(center.includes("tryamm:live-session"),'LiveCenter must emit LIVE lifecycle events')
must(center.includes('Holo Glow'),'LiveCenter must preserve the holographic visual filter')

const social=read('src/components/HoloSocialEngine.tsx')
must(social.includes("initialMode"),'Holo Social must support direct LIVE/PK launch mode')
must(social.includes("mode==='live'||mode==='pk'"),'Holo gifts must mount in LIVE and PK')
must(social.includes('LOTTIE / HOLO FX'),'Holo Social must expose Lottie/Holo effects handoff')

const clip=read('src/components/HoloClipStudio.tsx')
must(clip.includes('DotLottieReact'),'Holo Clip Studio must render dotLottie')
must(clip.includes('PK Victory'),'Holo Clip Studio must include a PK effect')
must(clip.includes('Gift Rain'),'Holo Clip Studio must include gift effects')

const overlay=read('src/components/HoloLivePkLottieOverlay.tsx')
must(overlay.includes('DotLottieReact'),'LIVE/PK overlay must use dotLottie')
for(const eventName of ['tryamm:live-session','tryamm:pk-start','tryamm:pk-end','tryamm:holo-gift']){
  must(overlay.includes(eventName),`Lottie overlay must react to ${eventName}`)
}

const carousel=read('src/components/HoloClipScreenLayer.tsx')
must(carousel.includes('Holographic carousel'),'carousel surface must exist')
must(carousel.includes('HOLOGRAPHIC_CAROUSEL_PANELS'),'carousel must use the canonical panel registry')

const launcher=read('src/components/HoloExperienceLauncher.tsx')
for(const required of ['HoloClipScreenLayer','HoloSocialEngine','HoloClipStudio','HoloLivePkLottieOverlay']){
  must(launcher.includes(required),`persistent launcher must mount ${required}`)
}
must(launcher.includes("panel==='LIVE'"),'carousel LIVE panel must route to LIVE')
must(launcher.includes("panel==='PK'"),'carousel PK panel must route to PK mode')

const main=read('src/main.tsx')
must(main.includes('HoloExperienceLauncher'),'app shell must globally mount HoloExperienceLauncher')

console.log('HOLO LIVE/PK CONTRACT PASS: carousel → LIVE/PK → LiveKit → Lottie/Holo FX integration is wired.')
