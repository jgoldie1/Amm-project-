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

const authIntent=`
            <!-- TRYAMM Supabase OAuth / magic-link return route. -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="tryamm.online" android:pathPrefix="/auth/callback" />
            </intent-filter>`
if(!xml.includes('android:host="tryamm.online"')){
  const activityClose=xml.indexOf('</activity>')
  if(activityClose<0)throw new Error('Main activity closing tag not found')
  xml=xml.slice(0,activityClose)+authIntent+'\n        '+xml.slice(activityClose)
}

fs.writeFileSync(manifestPath,xml)

for(const permission of permissions){
  if(!xml.includes(`android:name="${permission}"`))throw new Error(`Missing ${permission}`)
}
if(!xml.includes('android:host="tryamm.online"')||!xml.includes('android:pathPrefix="/auth/callback"')){
  throw new Error('Missing TRYAMM auth callback app link')
}
console.log('TRYAMM Android release ready: media permissions + https://tryamm.online/auth/callback app link')
