import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error(`GOOGLE PLAY RELEASE CONTRACT FAIL: ${msg}`)}

const config=JSON.parse(read('config/google-play-birthday-release.json'))
must(config.targetSdk===36,'candidate must target API 36')
must(config.packageId==='online.tryamm.app','canonical package ID must be online.tryamm.app')
must(config.requestedMinimumAudienceAge===12,'original requested minimum age must remain documented')
must(config.playConsoleBirthdayAlpha.practicalMinimumAge===13,'birthday Play target must reflect Play age-group boundaries')
must(config.playConsoleBirthdayAlpha.targetAgeGroups.join(',')==='13-15,16-17,18+','birthday Play target groups must exclude the child 9-12 bucket')
must(String(config.playConsoleBirthdayAlpha.reason).includes('no exact age-12-only'),'release config must document why an exact 12+ target is not representable')
must(String(config.ratingAuthority).includes('IARC'),'content rating must remain IARC/Play Console controlled')
must(String(config.ratingRule).includes('Do not hardcode'),'must not falsely promise a regional store rating before review')
must(config.androidSigning.requiredForPlayUpload===true,'signed AAB must remain required for Play upload')

const privacy=read('public/privacy.html')
const terms=read('public/terms.html')
for(const [label,page] of [['privacy',privacy],['terms',terms]]){
  must(page.includes('13–15')&&page.includes('16–17')&&page.includes('18+'),`${label} page must match the birthday Play target groups`)
  must(page.includes('does not provide an exact age-12-only target bucket'),`${label} page must explain the age-12 Play targeting limitation`)
  must(!page.includes('Android candidate is designed for an intended audience beginning at age 12'),`${label} page must not advertise the Play candidate as 12+`)
  must(!page.includes('current Android candidate is intended to begin at age 12'),`${label} page must not advertise the Play candidate as 12+`)
}

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
must(workflow.includes('ANDROID_KEYSTORE_BASE64'),'workflow must support Play upload-key signing')
must(workflow.includes('jarsigner -verify'),'signed AAB must be verified before release')

const androidPrep=read('scripts/prepare-android-release.mjs')
must(androidPrep.includes('android.permission.CAMERA'),'Android candidate must declare CAMERA')
must(androidPrep.includes('android.permission.RECORD_AUDIO'),'Android candidate must declare RECORD_AUDIO')

const safety=read('src/components/SafetyActionSheet.tsx')
must(safety.includes('Report / Flag Misconduct'),'UGC surface must support reporting')
must(safety.includes('Block User'),'UGC surface must support blocking')
must(safety.includes('Mute User'),'UGC surface must support muting')

const deletion=read('tests/account-deletion-release-contract.mjs')
must(deletion.includes('ACCOUNT DELETION RELEASE CONTRACT PASS'),'account deletion must remain release-certified')

console.log('GOOGLE PLAY RELEASE CONTRACT PASS: API36 + accurate 13+ birthday audience groups + IARC truth + UGC safety + account deletion + upload-key signing support.')
