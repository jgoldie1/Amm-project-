import fs from 'node:fs';
import assert from 'node:assert/strict';
const files=process.argv.slice(2);if(!files.length) throw new Error('Pass one or more manifest files');
for(const file of files){const m=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(m.schemaVersion,1);assert.match(m.id,/^[a-z0-9][a-z0-9.-]{2,100}$/);assert.match(m.version,/^\d+\.\d+\.\d+$/);
 for(const k of ['name','author','world','license'])assert.equal(typeof m[k],'string');
 assert.ok(Array.isArray(m.objects)&&m.objects.length<=100);
 for(const o of m.objects){assert.ok(['building','sign','portal'].includes(o.type));assert.ok(Array.isArray(o.position)&&o.position.length===3&&o.position.every(n=>Number.isFinite(n)&&Math.abs(n)<10000));if(o.size)assert.ok(Array.isArray(o.size)&&o.size.every(n=>Number.isFinite(n)&&n>0&&n<=300));}
 assert.ok(!('script' in m)&&!('code' in m),'Executable fields forbidden');console.log('PASS',file,m.id);
}
