'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const input=process.argv[2];if(!input||!/^public\/[a-z0-9-]+\.html$/.test(input))throw Error('Pass a single approved public HTML file');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'tryamm-site-restore-'));
try{
const original=fs.readFileSync(input);const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const backup=path.join(tmp,'backup.html');fs.writeFileSync(backup,original,{flag:'wx'});
const restored=path.join(tmp,'restored.html');fs.copyFileSync(backup,restored);
assert.equal(hash(fs.readFileSync(restored)),hash(original),'Restored copy must match original');
assert.ok(original.toString('utf8').toLowerCase().includes('<!doctype html>'),'Missing HTML doctype');
console.log('PASS: file backup and isolated restore hash match for '+input+'; sha256='+hash(original));
console.log('Limit: static file only; database, uploads, production environment and customer flow NOT backed up or verified.');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
