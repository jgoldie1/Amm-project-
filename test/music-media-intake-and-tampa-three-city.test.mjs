import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {MEDIA_INTAKE_MAX_BYTES,inspectMediaIntake,verifyMediaSignature,createMediaIntakeReceipt,REQUIRED_MEDIA_DECLARATIONS} from '../amm-omniverse/src/lib/music/mediaIntakePreflight.mjs'
import {TAMPA_RIVERWALK_DISTRICTS,resolveTampaTravel,clampTampaWalk,TAMPA_RIVERWALK_SCENE_STATUS} from '../amm-omniverse/src/data/tampaRiverwalkScene.mjs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('local media intake requires valid extensions, finite size, category and confirmation',()=>{
 assert.equal(inspectMediaIntake({name:'demo.wav',size:123,type:'audio/wav',kind:'audio'}).ok,true)
 assert.equal(inspectMediaIntake({name:'demo.mp4',size:123,type:'video/mp4',kind:'video'}).ok,true)
 assert.equal(inspectMediaIntake({name:'demo.exe',size:123,kind:'audio'}).ok,false)
 assert.equal(inspectMediaIntake({name:'demo.wav',size:-1,kind:'audio'}).ok,false)
 assert.equal(inspectMediaIntake({name:'demo.wav',size:100,type:'video/mp4',kind:'audio'}).ok,false)
 assert.equal(inspectMediaIntake({name:'huge.mp4',size:MEDIA_INTAKE_MAX_BYTES.video+1,kind:'video'}).ok,false)
});
test('media file signatures reject spoofed extensions',()=>{
 const bytes=s=>Uint8Array.from([...s].map(x=>x.charCodeAt(0)))
 assert.equal(verifyMediaSignature(bytes('RIFFxxxxWAVEfmt '),'audio','wav'),true)
 assert.equal(verifyMediaSignature(bytes('This is not a sound'),'audio','wav'),false)
 assert.equal(verifyMediaSignature(bytes('xxxxftypisomxxxx'),'video','mp4'),true)
 assert.equal(verifyMediaSignature(bytes('bad bad bad bad'),'video','mp4'),false)
});
test('intake receipt is always unapproved and never uploads media',()=>{
 const base={name:'original.mp3',size:314159,kind:'audio',sha256:'a'.repeat(64),artist:'Creator',title:'Original',declarations:REQUIRED_MEDIA_DECLARATIONS.map(x=>x.id)}
 const receipt=createMediaIntakeReceipt(base)
 assert.equal(receipt.status,'AWAITING_HUMAN_RIGHTS_REVIEW')
 assert.equal(receipt.fileUploaded,false)
 assert.equal(receipt.publishAuthorized,false)
 assert.equal(receipt.assetStored,false)
 assert.equal(createMediaIntakeReceipt({...base,declarations:['authorized']}),null)
 assert.equal(createMediaIntakeReceipt({...base,sha256:'not-a-hash'}),null)
 const view=read('amm-omniverse/src/components/MediaIntakePreflight.tsx')
 const studio=read('amm-omniverse/src/components/Aniyah64TrackStudio.tsx')
 assert.match(view,/crypto\.subtle\.digest\('SHA-256'/)
 assert.match(view,/RUN ONE-BUTTON MEDIA CHECK/)
 assert.match(view,/EXPORT PRIVATE INTAKE RECEIPT/)
 assert.match(studio,/mode==='intake'/)
 assert.doesNotMatch(view,/fetch\(|createPaymentIntent|uploadFile\(/)
});
test('Tampa four distinct districts have walkable bounded coordinates and entry route',()=>{
 assert.equal(TAMPA_RIVERWALK_DISTRICTS.length,4)
 assert.deepEqual(TAMPA_RIVERWALK_DISTRICTS.map(x=>x.id),['riverwalk','beauty','homes','pier'])
 assert.equal(TAMPA_RIVERWALK_SCENE_STATUS,'PROTOTYPE_NOT_GEOSPATIAL_CERTIFIED')
 assert.equal(resolveTampaTravel('nope'),null)
 assert.deepEqual(clampTampaWalk(100,-100),{x:33,z:-35})
 const scene=read('amm-omniverse/src/components/TampaRiverwalkWorld.tsx')
 const bridge=read('amm-omniverse/src/components/StreetVerseGeoSpawnBridge.tsx')
 assert.match(scene,/Tampa Riverwalk 3D prototype loaded/)
 assert.match(scene,/temporary stylized stand-in/)
 assert.match(scene,/<Canvas/)
 assert.match(bridge,/data-streetverse-demo="tampa"/)
 assert.match(bridge,/TampaRiverwalkWorld onReturn/)
 assert.match(bridge,/data-streetverse-demo="chicago"/)
 assert.match(bridge,/data-streetverse-demo="greenville"/)
});
