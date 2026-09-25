import fs from 'node:fs'
import path from 'node:path'

const manifestPath=path.resolve('android/app/src/main/AndroidManifest.xml')
if(!fs.existsSync(manifestPath))throw new Error('AndroidManifest.xml not found. Run npx cap add android first.')

let xml=fs.readFileSync(manifestPath,'utf8')
const permissions=[
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
]
for(const permission of permissions){
  if(xml.includes(`android:name="${permission}"`))continue
  xml=xml.replace(/<manifest([^>]*)>/,match=>`${match}\n    <uses-permission android:name="${permission}" />`)
}
fs.writeFileSync(manifestPath,xml)

for(const permission of permissions){
  if(!xml.includes(`android:name="${permission}"`))throw new Error(`Missing ${permission}`)
}
console.log('TRYAMM Android media permissions ready: CAMERA + RECORD_AUDIO')


const versionCodeRaw=String(process.env.TRYAMM_VERSION_CODE||'').trim()
const versionNameRaw=String(process.env.TRYAMM_VERSION_NAME||'').trim()
if(versionCodeRaw||versionNameRaw){
  const gradlePath=path.resolve('android/app/build.gradle')
  if(!fs.existsSync(gradlePath))throw new Error('android/app/build.gradle not found after Capacitor generation.')
  let gradle=fs.readFileSync(gradlePath,'utf8')

  if(versionCodeRaw){
    const versionCode=Number(versionCodeRaw)
    if(!Number.isInteger(versionCode)||versionCode<=0||versionCode>2100000000){
      throw new Error(`Invalid TRYAMM_VERSION_CODE: ${versionCodeRaw}`)
    }
    if(!/versionCode\s+\d+/.test(gradle))throw new Error('Generated Gradle file is missing versionCode')
    gradle=gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
  }

  if(versionNameRaw){
    if(!/^[0-9A-Za-z._+-]{1,80}$/.test(versionNameRaw))throw new Error('TRYAMM_VERSION_NAME contains unsupported characters')
    if(!/versionName\s+["'][^"']+["']/.test(gradle))throw new Error('Generated Gradle file is missing versionName')
    gradle=gradle.replace(/versionName\s+["'][^"']+["']/, `versionName "${versionNameRaw}"`)
  }

  fs.writeFileSync(gradlePath,gradle)
  const verified=fs.readFileSync(gradlePath,'utf8')
  if(versionCodeRaw&&!verified.includes(`versionCode ${versionCodeRaw}`))throw new Error('versionCode patch did not persist')
  if(versionNameRaw&&!verified.includes(`versionName "${versionNameRaw}"`))throw new Error('versionName patch did not persist')
  console.log(`TRYAMM Android version ready: ${versionNameRaw||'(unchanged)'} (${versionCodeRaw||'unchanged'})`)
}
