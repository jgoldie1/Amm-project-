'use strict';
const assert=require('assert');
const fs=require('fs');

for(const file of [
  'server.js','music-api.js','public/index.html','public/app.js','public/styles.css',
  'public/music-hub.html','public/music-hub.js','public/music-hub.css','public/community-rules.html',
  'public/founder-dashboard.html','public/founder-dashboard.js','public/founder-dashboard.css',
  'lib/content-engine-routes.js','lib/content-engine-preload.js','lib/supabase-rest.js',
  'supabase/migrations/202608050001_content_engine.sql','render.yaml','.replit','.env.example','.gitignore'
]) assert(fs.existsSync(file),`${file} missing`);

const server=fs.readFileSync('server.js','utf8');
for(const route of ['/api/health','/api/auth/register','/api/rooms','/api/checkout','/api/admin/summary','music-api']) assert(server.includes(route),`${route} missing`);

const music=fs.readFileSync('music-api.js','utf8');
for(const route of ['/api/music/tracks','/api/music/charts/global-creators','/api/music/creator/ledger','/api/rooms/:roomId/status']) assert(music.includes(route),`${route} missing`);

const content=fs.readFileSync('lib/content-engine-routes.js','utf8');
for(const route of ['/api/content/projects','/api/content/projects/:projectId/outputs','/api/founder/dashboard']) assert(content.includes(route),`${route} missing`);
for(const channel of ['short-video','linkedin','discord','newsletter']) assert(content.includes(channel),`${channel} content output missing`);
for(const stage of ['concept','prototype','alpha','beta','live']) assert(content.includes(stage),`${stage} status missing`);

const dashboard=fs.readFileSync('public/founder-dashboard.html','utf8');
for(const feature of ['Founder Content & Build Dashboard','Add a development update','Generated content','Known limitation','Next milestone']) assert(dashboard.includes(feature),`${feature} missing`);

const migration=fs.readFileSync('supabase/migrations/202608050001_content_engine.sql','utf8');
for(const table of ['content_projects','content_assets','content_outputs','analytics_events','referrals']) assert(migration.includes(table),`${table} schema missing`);
assert(migration.includes('service_role'),'service-role access missing');
assert(migration.includes('enable row level security'),'RLS missing');

const html=fs.readFileSync('public/index.html','utf8');
for(const feature of ['Open Music Hub','AMM Global Creator Chart','rulesAccepted','bathroom-break','Built for trust']) assert(html.includes(feature),`${feature} missing`);

const hub=fs.readFileSync('public/music-hub.html','utf8');
for(const feature of ['CREATOR-OWNED MUSIC','Music video URL','AR experience URL','VR concert URL','Mixed reality URL','AMM GLOBAL CREATOR CHART']) assert(hub.includes(feature),`${feature} missing`);

const rules=fs.readFileSync('public/community-rules.html','utf8');
for(const feature of ['Lawful adult substance content','BRB and Bathroom Break privacy','No fake activity','Protect minors']) assert(rules.includes(feature),`${feature} missing`);

const gitignore=fs.readFileSync('.gitignore','utf8');
for(const ignored of ['node_modules/','.env','data/store.json']) assert(gitignore.includes(ignored),`${ignored} should be ignored`);

console.log('TryAMM live, music, content engine, Supabase wiring, deployment and safety smoke checks passed');
