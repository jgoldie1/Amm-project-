import fs from 'node:fs';import assert from 'node:assert/strict';
const bridge=fs.readFileSync(new URL('../src/runtime/UniversalCreatorStreamBridge.ts',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('../api/gifts/external-event.js',import.meta.url),'utf8');
for(const p of ['twitch','tiktok','kick','bigo','youtube','facebook','custom-rtmp'])assert.match(bridge,new RegExp(p));
assert.match(bridge,/gameplayNeverDependsOnExternalPlatform:true/);assert.match(bridge,/keepPlatformNativeMonetizationNative:true/);assert.match(api,/platform_event_not_verified/);assert.match(api,/deduplicated:true/);assert.match(api,/withdrawable:false/);assert.match(api,/settlementAuthority:platform/);console.log('Universal creator stream bridge contract: PASS');
