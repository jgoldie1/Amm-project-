import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error(`STREETVERSE HOLO LIVE/PK CONTRACT FAIL: ${msg}`)}

const shell=read('src/components/StreetVerseMobileGameShell.tsx')
must(shell.includes('tryamm:streetverse-holo-livepk'),'StreetVerse mobile shell must emit the in-world LIVE/PK launch event')
must(shell.includes('HOLO LIVE'),'StreetVerse must expose a Holo LIVE control')
must(shell.includes('PK BATTLE'),'StreetVerse must expose a PK control')
must(shell.includes('preserveWorld:true'),'StreetVerse LIVE/PK handoff must preserve the world session')

const launcher=read('src/components/HoloExperienceLauncher.tsx')
must(launcher.includes('tryamm:streetverse-holo-livepk'),'global Holo launcher must listen for StreetVerse LIVE/PK')
must(launcher.includes('SocialAgeSafetyGate'),'LIVE/PK must pass through the audience safety gate')
must(launcher.includes('liveCenterOpen'),'LIVE/PK must open the LiveKit center as an overlay')
must(launcher.includes('initialMode={liveCenterMode}'),'overlay must distinguish LIVE from PK')
must(!launcher.includes("if(panel==='LIVE'){window.location.href='/live'"),'carousel LIVE must not navigate away from the current world')

const center=read('src/components/LiveCenter.tsx')
must(center.includes("initialMode?: 'live'|'pk'"),'LiveCenter must support PK mode')
must(center.includes('navigator.mediaDevices?.getUserMedia'),'host path must preflight camera and microphone')
must(center.includes("video:true,audio:true"),'host media preflight must request camera and microphone')
must(center.includes("tryamm:pk-start"),'PK camera session must emit PK start')
must(center.includes("tryamm:pk-end"),'PK camera session must emit PK end')
must(center.includes('HoloGiftEngine'),'adult LIVE/PK camera stage must expose Holo gift/effect hooks')
must(center.includes("connected&&!youthViewerOnly"),'paid/social gift controls must remain hidden in youth viewer mode')

const live=read('src/services/live.ts')
must(live.includes('setMicrophoneEnabled(true)'),'LiveKit host must enable microphone')
must(live.includes('setCameraEnabled(true)'),'LiveKit host must enable camera')
must(live.includes('adaptiveStream: true')&&live.includes('dynacast: true'),'LiveKit room must keep adaptive mobile streaming')

console.log('STREETVERSE HOLO LIVE/PK CONTRACT PASS: in-world launch → age safety → LiveKit camera/mic → PK events → Holo FX while StreetVerse remains mounted.')
