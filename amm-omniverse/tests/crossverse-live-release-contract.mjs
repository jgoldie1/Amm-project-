import assert from 'node:assert/strict'
import fs from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import handler from '../api/live/crossverse-distribution-status.js'

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)))
const read=file=>fs.readFileSync(path.join(root,file),'utf8')
const endpoint=read('api/live/obs-ingress.js')
const clip=read('src/components/CrossVerseClipCutter.tsx')
const recorder=read('src/components/CrossVerseSourceRecorder.tsx')
const studio=read('src/components/HoloClipStudio.tsx')
const statusUI=read('src/components/CrossVerseDistributionStatus.tsx')
const xr=read('src/components/CrossVerseXRPortal.tsx')

function fakeRes(){
  return {
    headers:{},statusCode:200,
    setHeader(k,v){this.headers[k]=v;return this},
    status(n){this.statusCode=n;return this},
    json(value){this.data=value;return this},
  }
}
const forbidden='tryamm-stream-secret-MUST-NOT-LEAK'
const prior=process.env.TRYAMM_STREAM_YOUTUBE_KEY
const priorFlag=process.env.TRYAMM_STREAM_YOUTUBE_ENABLED
try{
  process.env.TRYAMM_STREAM_YOUTUBE_KEY=forbidden
  process.env.TRYAMM_STREAM_YOUTUBE_ENABLED='true'
  const res=fakeRes()
  handler({method:'GET'},res)
  assert.equal(res.statusCode,200)
  assert.equal(res.headers['Cache-Control'],'no-store')
  assert.equal(res.data.acceptingIngest,false,'distribution remains disabled until relay verified')
  assert.equal(res.data.activeRelay,false,'no pretend relay')
  assert.equal(res.data.automatedPublishing,false,'no automatic external publishing')
  assert.equal(res.data.destinations.find(d=>d.id==='youtube').configured,true)
  assert.equal(res.data.destinations.find(d=>d.id==='youtube').verified,false)
  assert.equal(JSON.stringify(res.data).includes(forbidden),false,'destination key leaked')
  const deny=fakeRes()
  handler({method:'POST'},deny)
  assert.equal(deny.statusCode,405)
}finally{
  if(prior===undefined)delete process.env.TRYAMM_STREAM_YOUTUBE_KEY
  else process.env.TRYAMM_STREAM_YOUTUBE_KEY=prior
  if(priorFlag===undefined)delete process.env.TRYAMM_STREAM_YOUTUBE_ENABLED
  else process.env.TRYAMM_STREAM_YOUTUBE_ENABLED=priorFlag
}
assert.match(endpoint,/TRYAMM_OBS_INGRESS_ENABLED/,'ingress must be disabled by default')
assert.match(endpoint,/requireUser\(req,res\)/,'private ingest requires signed-in creator')
assert.match(endpoint,/TRYAMM_OBS_ALLOWED_USER_IDS/,'private ingest requires a configured operator allowlist')
assert.match(endpoint,/ownerIds.includes\(String\(user.id\)\)/,'authenticated non-operators cannot create billable inputs')
assert.match(endpoint,/recentlyAuthenticated/,'fresh authentication required')
assert.match(endpoint,/confirm!=='CREATE_PRIVATE_INGEST'/,'explicit creator approval required')
assert.match(endpoint,/IngressInput\.RTMP_INPUT/,'real ingress SDK is used')
assert.match(endpoint,/client\.listIngress\(roomName\)/,'reusing existing room must be checked')
assert.match(endpoint,/client\.createIngress/,'real ingest creation must be implemented')
assert.match(endpoint,/roomFor\(user\.id,format\)/,'rooms must bind to owner')
assert.match(statusUI,/getAccessToken/,'source ingress API requires user token')
assert.match(statusUI,/COPY SOURCE KEY/,'OBS source credential must be usable by owner')
assert.match(statusUI,/CREATE PRIVATE OBS INPUT/,'visible opt-in control')
assert.match(clip,/const LIMIT_SECONDS=300/,'up to five minutes required')
assert.match(clip,/vertical:\{width:480,height:854\}/,'vertical output required')
assert.match(clip,/landscape:\{width:854,height:480\}/,'landscape output required')
assert.match(clip,/MediaRecorder/,'real browser encoding required')
assert.match(clip,/DOWNLOAD YOUR CLIP/,'download control required')
assert.match(clip,/onloadedmetadata/,'encoded clip metadata must be inspected')
assert.match(clip,/check.videoWidth===width&&check.videoHeight===height/,'dimensions must be verified before download')
assert.match(clip,/Verify exported CrossVerse clip/,'creator needs playback preview')
assert.match(clip,/<CrossVerseSourceRecorder/,'local recording source must mount in clip cutter')
assert.match(recorder,/getUserMedia/,'camera capture required')
assert.match(recorder,/getDisplayMedia/,'screen capture required')
assert.match(recorder,/const MAX_MS=300_000/,'recordings must stop at five minutes')
assert.match(recorder,/onRecorded\(file\)/,'recorded file must transfer into clip editor')
assert.match(xr,/isSessionSupported\('immersive-ar'\)/,'real AR availability check required')
assert.match(xr,/isSessionSupported\('immersive-vr'\)/,'real VR availability check required')
assert.match(xr,/path:'\/streetverse'/,'world portal required')
assert.match(studio,/<CrossVerseClipCutter\/>/,'cutter must mount to real studio')
assert.match(studio,/<CrossVerseDistributionStatus\/>/,'OBS control must mount to studio')
assert.match(studio,/<CrossVerseXRPortal\/>/,'XR entry must mount to studio')
console.log('CROSSVERSE LIVE RELEASE CONTRACT PASS: server secrecy, owner-only ingress gates, editor+XR wiring. Hardware clip/OBS tests still required.')
