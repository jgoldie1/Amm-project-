'use strict';
// Isolated static Cloudflare Pages preview. Never include StreetVerse or private data.
const fs=require('node:fs');const path=require('node:path');
const output='dist-holofon-pages';fs.mkdirSync(output,{recursive:true});
const pages=['holofon-service.html','quantum-boost-remote-diagnostic.html','quantum-boost-assessment.html','quantum-towers-intake.html','quantum-towers.html'];
for(const name of pages){const input=path.join('public',name);if(!fs.existsSync(input))throw new Error('Missing release page '+input);fs.copyFileSync(input,path.join(output,name));}
const index='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TRYAMM HoloFon & Quantum Boost Preview</title><style>body{font:18px/1.6 system-ui;background:#0b1a2d;color:white;max-width:660px;margin:4rem auto;padding:1rem}a{color:#a7ecff}li{margin:1rem 0}</style></head><body><h1>HoloFon + Quantum Boost</h1><p>TRYAMM development preview. Mobile service, payments and automatic remote repair are not live.</p><ul>'+pages.map(p=>'<li><a href="/'+p+'">'+p.replace(/.html$/,'').replace(/-/g,' ')+'</a></li>').join('')+'</ul></body></html>';
fs.writeFileSync(path.join(output,'index.html'),index);console.log('Prepared '+pages.length+' isolated customer pages in '+output);
