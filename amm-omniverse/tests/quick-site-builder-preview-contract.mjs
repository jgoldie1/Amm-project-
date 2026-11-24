import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../public/quick-site-builder-preview.html',import.meta.url),'utf8');
for(const id of ['name','kind','city','about','email','logo','banner','photo','preview','download','site','status','aiChat','aiPass','aiBooking']){
 assert.match(html,new RegExp('id="'+id+'"'),'Required control: '+id);
}
assert.match(html,/type="file" id="logo"/);
assert.match(html,/2\*1024\*1024/,'Upload size bound');
assert.match(html,/esc\(byId\('name'\)/,'User text escaping');
assert.match(html,/iframe id="site"[^>]*sandbox=""/,'Preview isolation');
assert.match(html,/srcdoc=generate\(\)/,'Preview actually renders');
assert.match(html,/new Blob\(\[html\]/,'Export supported');
assert.match(html,/not connected to real services/,'AI non-activation disclosure');
assert.match(html,/Nothing has been published/,'Publish safety disclosure');
assert.doesNotMatch(html,/<form[^>]*action=/,'No direct posting of user data');
console.log('TRYAMM QUICK SITE PREVIEW: required controls and safety checks PASS');
