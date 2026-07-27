'use strict';
const assert=require('assert');
const fs=require('fs');
for(const file of ['server.js','public/index.html','public/app.js','public/styles.css']) assert(fs.existsSync(file),`${file} missing`);
const server=fs.readFileSync('server.js','utf8');
for(const route of ['/api/health','/api/auth/register','/api/rooms','/api/checkout','/api/admin/summary']) assert(server.includes(route),`${route} missing`);
const html=fs.readFileSync('public/index.html','utf8');
for(const feature of ['Go live','Virtual gifts','Ticketed livestreams','Built for trust']) assert(html.includes(feature),`${feature} missing`);
console.log('TryAMM smoke checks passed');
