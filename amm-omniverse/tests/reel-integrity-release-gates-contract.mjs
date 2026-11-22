import fs from 'node:fs'
import assert from 'node:assert/strict'

const reel=fs.readFileSync(new URL('../src/components/StreetVerseReelRecorder.tsx',import.meta.url),'utf8')
const store=fs.readFileSync(new URL('../src/lib/reels/reelDraftStore.ts',import.meta.url),'utf8')
const publish=fs.readFileSync(new URL('../api/media/publish.js',import.meta.url),'utf8')
const complete=fs.readFileSync(new URL('../api/media/upload-complete.js',import.meta.url),'utf8')

assert.ok(reel.includes('getAccessToken()'),'Authenticated upload must obtain bearer token')
assert.ok(reel.includes('Authorization:`Bearer ${token}`'),'Upload, completion and publish APIs must use bearer authorization')
assert.ok(reel.includes("completeBody.processing!=='ready'"),'Non-ready media cannot be queued')
assert.ok(reel.includes('completeBody.playbackUrl'),'Require server-generated playback URL')
assert.ok(!reel.includes("setPublished(true)"),'A queued job cannot be labeled published')
assert.ok(reel.includes('publication-queued'),'Publishing must honestly report queue status')
assert.ok(reel.includes('audioMixVerified:false'),'Unverified audio mixing must not be marked complete')
assert.ok(reel.includes('saveReelDraft(blob)')&&reel.includes('loadReelDraft()'),'Save/recover completed recording blobs')
assert.ok(store.includes('indexedDB.open(DB,1)'),'Persistent browser database is required')
assert.ok(store.includes("STORE='drafts'"),'Draft store must exist')
assert.ok(publish.includes("moderation_status:'pending'"),'Publication must pass moderation')
assert.ok(publish.includes("monetization_status:'gated'"),'Revenue must remain gated')
assert.ok(complete.includes('verifyStoredObject'),'Uploaded object existence must be checked before queueing')
console.log('Reel authentication, recovery, publishing status and release gate static checks: PASS')
