import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error(`GOOGLE PLAY 12+ RELEASE CONTRACT FAIL: ${msg}`)}

const config=JSON.parse(read('config/google-play-12plus-release.json'))
must(config.targetSdk===36,'candidate must target API 36')
must(config.packageId==='online.tryamm.app','canonical package ID must be online.tryamm.app')
must(config.minimumAudienceAge===12,'candidate audience floor must be 12')
must(String(config.ratingAuthority).includes('IARC'),'content rating must remain IARC/Play Console controlled')
must(String(config.ratingRule).includes('Do not hardcode'),'must not falsely promise a store rating before review')
must(String(config.socialSafety.age12).includes('viewer-only'),'12-year-old LIVE/PK lane must be viewer-only until adult-managed controls are verified')

const capTs=read('capacitor.config.ts')
const capJson=JSON.parse(read('capacitor.config.json'))
must(capTs.includes("appId: 'online.tryamm.app'"),'TypeScript Capacitor config package ID mismatch')
must(capTs.includes("appName: 'TRYAMM'"),'TypeScript Capacitor app name mismatch')
must(capJson.appId==='online.tryamm.app','JSON Capacitor config package ID mismatch')
must(capJson.appName==='TRYAMM','JSON Capacitor app name mismatch')

const workflow=read('../.github/workflows/tryamm-android-candidate.yml')
must(workflow.includes('branches: [main]'),'Android candidate must build current main')
must(workflow.includes("node-version: '24'"),'Android candidate must use Node 24')
must(workflow.includes("platforms;android-36"),'Android candidate must install Android 16/API 36')
must(workflow.includes('prepare-android-release.mjs'),'Android candidate must prepare native media permissions')

const androidPrep=read('scripts/prepare-android-release.mjs')
must(androidPrep.includes('android.permission.CAMERA'),'Android candidate must declare CAMERA')
must(androidPrep.includes('android.permission.RECORD_AUDIO'),'Android candidate must declare RECORD_AUDIO')

const gate=read('src/components/SocialAgeSafetyGate.tsx')
must(gate.includes('type="date"'),'mixed-audience social entry must use a neutral date-of-birth screen')
must(gate.includes("retained:'age-band-only'"),'birth date must not be retained by this gate')
must(gate.includes("band==='age-12'"),'age 12 must have an explicit protected lane')
must(gate.includes('YOUTH VIEWER MODE'),'age 12 must default to protected viewer mode')
must(gate.includes('Camera, microphone'),'youth viewer mode must disclose disabled capture capabilities')

const safety=read('src/components/SafetyActionSheet.tsx')
must(safety.includes('Report / Flag Misconduct'),'UGC surface must support reporting')
must(safety.includes('Block User'),'UGC surface must support blocking')
must(safety.includes('Mute User'),'UGC surface must support muting')

console.log('GOOGLE PLAY 12+ RELEASE CONTRACT PASS: API36 + package identity + IARC truth + youth social safety + UGC controls + Android camera/mic manifest preparation.')
