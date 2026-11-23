import fs from 'node:fs'
import assert from 'node:assert/strict'
import handler from '../api/gifts/external-event.js'

const bridge=fs.readFileSync(new URL('../src/runtime/UniversalCreatorStreamBridge.ts',import.meta.url),'utf8')
for(const platform of ['twitch','tiktok','kick','bigo','youtube','facebook','custom-rtmp']){
  assert.ok(bridge.includes(platform))
}
assert.match(bridge,/gameplayNeverDependsOnExternalPlatform:true/)
assert.match(bridge,/keepPlatformNativeMonetizationNative:true/)

async function request(method,platform){
  const response={
    setHeader(){},
    status(code){this.code=code;return this},
    json(body){this.body=body}
  }
  await handler({method,body:{platform,eventId:'test-event',channelId:'test-channel',verified:true}},response)
  return [response.code,response.body]
}
assert.deepEqual(await request('GET','twitch'),[405,{error:'method_not_allowed'}])
assert.deepEqual(await request('POST','unknown'),[400,{error:'unsupported_platform'}])
for(const platform of ['twitch','tiktok','kick','bigo','youtube','facebook']){
  assert.deepEqual(await request('POST',platform),[503,{error:'external_gift_webhook_disabled_pending_signature_verification'}])
}
