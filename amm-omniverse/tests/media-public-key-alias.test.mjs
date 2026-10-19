import {test} from 'node:test';
import assert from 'node:assert/strict';
import {userSupabaseReady,userRest} from '../api/_lib/supabase-user.js';
import {createSignedPlayback} from '../api/_lib/media-storage.js';
test('Vite publishable-only configuration works for database and signed playback',async()=>{
 const keys=['VITE_SUPABASE_ANON_KEY','VITE_SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','VITE_SUPABASE_URL'];
 const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]));const previousFetch=globalThis.fetch;
 try{
  for(const k of keys)delete process.env[k];
  process.env.VITE_SUPABASE_URL='https://media.example.invalid';process.env.VITE_SUPABASE_PUBLISHABLE_KEY='test-public-key';
  const requests=[];globalThis.fetch=async(url,options)=>{requests.push({url,options});return {ok:true,text:async()=>String(url).includes('/object/sign/')?JSON.stringify({signedURL:'/object/sign/creator-media/owner/video.mp4?token=test'}):'[]'}};
  assert.equal(userSupabaseReady(),true);const req={headers:{authorization:'Bearer user-test-token'}};
  await userRest(req,'media_catalog');const playback=await createSignedPlayback(req,'owner/video.mp4');
  assert.equal(requests.length,2);
  for(const {options} of requests){assert.equal(options.headers.apikey,'test-public-key');assert.equal(options.headers.authorization,'Bearer user-test-token');}
  assert.ok(playback.startsWith('https://media.example.invalid/storage/v1/object/sign/'));
 }finally{globalThis.fetch=previousFetch;for(const k of keys){if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k];}}
});
