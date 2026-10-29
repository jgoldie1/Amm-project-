#!/usr/bin/env node
'use strict';
// Usage: node scripts/check-site-preservation.cjs <base-ref> <head-ref>
// Detect deletion of customer-visible website assets, PHP sources, and database migrations.
// A separate explicitly reviewed change is required for legitimate removals.
const cp=require('node:child_process');
const [base,head]=process.argv.slice(2);
if(!base||!head){console.error('Usage: node scripts/check-site-preservation.cjs <base> <head>');process.exit(2)}
const diff=cp.execFileSync('git',['diff','--name-status','--no-renames',base,head],{encoding:'utf8',maxBuffer:2e6});
const affected=diff.split('\n').filter(Boolean).map(s=>s.split('\t'));
const guarded=affected.filter(([status,path])=>/^D/.test(status)&&(/^(public|sites|websites|uploads|supabase\/migrations|db\/migrations)\//.test(path)||/\.php$/i.test(path)));
if(guarded.length){console.error('SITE PRESERVATION BLOCKED: website files, uploads, PHP or migrations removed; isolate and review these separately.');guarded.forEach(x=>console.error(x.join(' ')));process.exit(1)}
console.log('Site-preservation deletion guard: PASS (no protected path deletions detected).');
