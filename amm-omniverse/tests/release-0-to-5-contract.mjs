import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error(`RELEASE 0-5 CONTRACT FAIL: ${msg}`)}

const plan=JSON.parse(read('config/release-0-to-5.json'))
must(plan.schema==='tryamm.release-0-to-5.v1','release plan schema mismatch')
must(Array.isArray(plan.stages)&&plan.stages.length===6,'release plan must define stages 0 through 5')
must(plan.stages.map(x=>x.stage).join(',')==='0,1,2,3,4,5','release stages must be exactly 0,1,2,3,4,5')
must(plan.packageName==='online.tryamm.app','release plan package must be online.tryamm.app')
must(plan.targetSdk===36,'release plan must target API 36')
must(String(plan.graphicsReleaseRule.lowTierMobile).includes('shadows disabled'),'release plan must preserve no-expensive-phone-shadows rule')
must(plan.productionRequirements.includes('iPhone device certificate artifact for exact SHA'),'production must require exact-SHA iPhone proof')
must(plan.productionRequirements.includes('Android device certificate artifact for exact SHA'),'production must require exact-SHA Android proof')

const workflow=read('../.github/workflows/tryamm-release-0-to-5.yml')
for(const stage of ['stage_0_freeze','stage_1_certify','stage_2_package','stage_3_store_gate','stage_4_publish','stage_5_proof']){
  must(workflow.includes(stage+':'),`workflow missing ${stage}`)
}
must(workflow.includes("test \"\${{ github.ref }}\" = \"refs/heads/main\""),'release controller must only dispatch from main')
must(workflow.includes('renderer.shadowMap.enabled=false'),'release freeze must preserve mobile shadows-off baseline')
must(workflow.includes('TRYAMM_VERSION_CODE'),'release controller must inject a unique Android versionCode')
must(workflow.includes('2100000000'),'release controller must enforce Google Play versionCode ceiling')
must(workflow.includes('platforms;android-36'),'release controller must install API 36')
must(workflow.includes('android.permission.CAMERA'),'release controller must verify Android CAMERA permission')
must(workflow.includes('android.permission.RECORD_AUDIO'),'release controller must verify Android RECORD_AUDIO permission')
must(workflow.includes('ANDROID_KEYSTORE_BASE64'),'release controller must require Android signing credentials')
must(workflow.includes('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'),'release controller must require Google Play service-account credentials')
must(workflow.includes('r0adkll/upload-google-play@v1.1.5'),'release controller must pin the current Google Play upload action')
must(workflow.includes('releaseFiles:'),'release controller must use non-deprecated releaseFiles input')
must(workflow.includes('tracks:'),'release controller must use non-deprecated tracks input')
must(workflow.includes('status: inProgress'),'release controller must support staged production rollout')
must(workflow.includes('userFraction:'),'release controller must pass staged rollout fraction')
must(workflow.includes('RELEASE TRYAMM'),'production must require explicit release confirmation')
must(workflow.includes('tryamm-device-proof-\${RELEASE_SHA}-\${device}'),'production must query exact-SHA device proof artifacts')
must(workflow.includes('iphone-safari android-chrome'),'production must require both iPhone and Android proof')
must(workflow.includes('play_console_ready'),'Play publishing must require Play Console readiness attestation')
must(workflow.includes('account-deletion.html'),'store gate must verify the public deletion resource')
must(workflow.includes('tryamm-release-0-to-5-proof.json'),'workflow must emit a durable final release proof')
must(!workflow.includes('\n          track:'),'deprecated singular Google Play track input must not be used')

const androidPrep=read('scripts/prepare-android-release.mjs')
must(androidPrep.includes('TRYAMM_VERSION_CODE'),'Android preparation must support injected versionCode')
must(androidPrep.includes('TRYAMM_VERSION_NAME'),'Android preparation must support injected versionName')
must(androidPrep.includes('versionCode\\s+\\d+'),'Android preparation must patch generated Gradle versionCode')
must(androidPrep.includes('versionName\\s+'),'Android preparation must patch generated Gradle versionName')
must(androidPrep.includes('2100000000'),'Android preparation must reject versionCode above Play maximum')

const mobileWorld=read('src/components/StreetVerseMobileWorld.tsx')
must(mobileWorld.includes('renderer.shadowMap.enabled=false'),'mobile StreetVerse must keep real-time shadow map disabled in alpha baseline')

const releaseNotes=read('distribution/whatsnew/whatsnew-en-US')
must(releaseNotes.includes('TRYAMM Birthday Alpha'),'Google Play release notes must identify the alpha')
must(releaseNotes.includes('phone shadows off'),'release notes must preserve the mobile performance truth')

console.log('RELEASE 0-5 CONTRACT PASS: freeze → certify → package/sign → store/device gate → Google Play publish → proof, with mobile shadows-off performance baseline.')
