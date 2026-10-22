'use strict';
// Jacobie Vision: passive, offline checks for owned static business websites.
// No network requests, scanning third-party systems, or secret access.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),sites=path.join(root,'sites');
const findings=[];let checked=0;
function walk(dir){if(!fs.existsSync(dir))return;for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(ent.isFile()&&/\.html?$/i.test(ent.name))inspect(p)}}
function inspect(file){const s=fs.readFileSync(file,'utf8'),rel=path.relative(root,file);checked++;
const warn=(severity,code,detail)=>findings.push({severity,code,file:rel,detail});
if(!/<meta\s+name=["']viewport["']/i.test(s))warn('medium','viewport','Missing mobile viewport');
if(!/<html[^>]*\blang=/i.test(s))warn('medium','language','Missing document language');
if(/target\s*=\s*["']_blank["']/i.test(s)&&!/rel\s*=\s*["'][^"']*noopener/i.test(s))warn('medium','external-tab','Review external target links for rel=noopener');
if(/<script[^>]+src=["']http:/i.test(s))warn('high','insecure-script','HTTP script source');
if(/<form[^>]+action=["']http:/i.test(s))warn('high','insecure-form','HTTP form submission');
if(/(?:sk_live_|rk_live_|sk_test_)[A-Za-z0-9]{12,}/.test(s))warn('critical','potential-secret','Potential exposed payment API key; verify and rotate if real');
if(/<input[^>]+type=["']password["']/i.test(s)&&!/<form[^>]+method=["']post["']/i.test(s))warn('medium','password-form','Review password handling');
if(/document\.write\s*\(/.test(s))warn('medium','document-write','Avoid document.write on untrusted data');
}
walk(sites);
const counts={critical:0,high:0,medium:0};for(const f of findings)counts[f.severity]++;
const report={scope:'Local repository HTML files under sites/',checked,counts,findings};
console.log(JSON.stringify(report,null,2));
assert(checked>0,'No business HTML files discovered');
if(counts.critical||counts.high){console.error('High/critical static security findings require review');process.exitCode=1}
