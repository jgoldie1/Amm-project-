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
