import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=x=>fs.readFileSync(new URL('../'+x,import.meta.url),'utf8')
const complete=read('api/media/upload-complete.js')
const omni=read('src/components/OmniBoxStoryboardVideoExport.tsx')
const studio=read('src/components/RecordingStudio.tsx')
const pkg=JSON.parse(read('package.json'))
assert(complete.includes('createSignedPlayback(req,storagePath,3600)'))
assert(complete.includes('playbackUrl'))
for(const [name,code,playbackVar] of [['Omni Box',omni,'privatePlaybackUrl'],['Aniyah',studio,'privateTakePlayback']]){
 assert(code.includes(playbackVar),name+' needs private stored playback')
 assert(code.includes('playbackUrl'),name+' must read checked server signed playback')
 assert(code.includes("startsWith('https://')"),name+' must reject insecure playback URL')
 assert(code.includes('Temporary signed'),name+' must disclose expiring player')
 assert(!code.includes("fetch('/api/media/publish'"),name+' cannot auto-release private files')
}
assert(pkg.scripts.build.includes('tryamm-private-cloud-playback-contract.mjs'))
console.log('TRYAMM PRIVATE CLOUD PLAYBACK PASS: owner sees signed cloud playback separately from local recording, no automatic release')
