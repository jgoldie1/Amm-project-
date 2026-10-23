import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createRequire} from 'node:module'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const upload=read('api/media/upload-intent.js')
const publish=read('api/media/publish.js')
const worker=read('api/media/process-publish.js')
const playback=read('api/media/publication.js'),network=read('api/media/network-programs.js')
const policy=await import('../api/_lib/private-media-workflows.js')
const b=1024*1024
for(const {id,mime,bytes,composition} of [
 {id:'isaiah-ai-tv-audition',mime:'video/mp4',bytes:60*b,composition:{source:'isaiah-ai-tv-audition',reviewOnly:true,claimedAdult:true,claimedRights:true}},
 {id:'aniyah-64-track-studio',mime:'audio/webm',bytes:50*b,composition:{source:'aniyah-64-track-studio',releaseApproved:false}},
 {id:'omnibox-storyboard-video',mime:'video/webm',bytes:20*b,composition:{source:'omnibox-storyboard-video',kind:'preview-only',finalFilm:false}},
]){
 assert(policy.verifyPrivateMediaIntent({composition,contentType:mime,sizeBytes:bytes}).ok,id+' correct private upload')
 assert(!policy.verifyPrivateMediaIntent({composition,contentType:mime,sizeBytes:bytes+1}).ok,id+' rejects oversized upload')
 assert(!policy.verifyPrivateMediaIntent({composition,contentType:'image/png',sizeBytes:bytes}).ok,id+' rejects wrong type')
 assert(policy.isProtectedPrivateMedia({manifest:{composition}}),id+' always blocks ordinary public delivery')
}
assert(!policy.verifyPrivateMediaIntent({composition:{source:'isaiah-ai-tv-audition',reviewOnly:true,claimedAdult:false,claimedRights:true},contentType:'video/mp4',sizeBytes:b}).ok)
assert(!policy.verifyPrivateMediaIntent({composition:{source:'omnibox-storyboard-video',kind:'preview-only',finalFilm:true},contentType:'video/mp4',sizeBytes:b}).ok)
assert(!policy.verifyPrivateMediaIntent({composition:{source:'aniyah-64-track-studio',releaseApproved:true},contentType:'audio/mp4',sizeBytes:b}).ok)
assert(upload.includes('verifyPrivateMediaIntent({composition,contentType,sizeBytes})'))
assert(upload.includes('Number.isSafeInteger(sizeBytes)'))
assert(publish.includes('if(isProtectedPrivateMedia(media))'))
assert(worker.includes('if(isProtectedPrivateMedia(media))'),'pre-existing jobs must not bypass the guard')
assert(playback.includes('if(isProtectedPrivateMedia(media))'),'older publication records must not expose private studio or auditions')
assert(network.includes('if(isProtectedPrivateMedia(media))'),'network catalog must not list private studio or audition records')
assert(JSON.parse(read('package.json')).scripts.build.includes('tryamm-private-media-production-guards-contract.mjs'))
console.log('TRYAMM PRIVATE MEDIA GUARDS PASS: 3 server-enforced purpose limits and no automatic audition/studio/storyboard publishing')
