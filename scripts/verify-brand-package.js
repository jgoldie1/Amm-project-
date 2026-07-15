const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const required=[
  'public/brand/favicon.ico',
  'public/brand/stubbs-ai-rounded-180.png',
  'public/brand/stubbs-ai-rounded-512.png',
  'public/brand/stubbs-ai-icon-192.png',
  'public/brand/stubbs-ai-icon-512.png',
  'public/brand/stubbs-ai-maskable-192.png',
  'public/brand/stubbs-ai-maskable-512.png',
  'public/brand/stubbs-ai-social-card.jpg',
  'public/brand-hologram.json',
  'public/brand-lottie.js',
  'public/brand.js',
  'public/brand.css',
  'public/manifest.webmanifest',
  'docs/STUBBS_AI_BRAND_HANDOFF.md'
];
const pages=[
  'public/index.html','public/platform.html','public/holo.html','public/holo-news.html',
  'public/immersive-marketplace.html','public/memory-control.html'
];
let failed=false;
for(const rel of required){const ok=fs.existsSync(path.join(root,rel));console.log(`${ok?'PASS':'MISSING'} ${rel}`);if(!ok)failed=true;}
for(const rel of pages){const file=path.join(root,rel);if(!fs.existsSync(file)){console.log(`MISSING ${rel}`);failed=true;continue;}const html=fs.readFileSync(file,'utf8');const branded=html.includes('/brand.js')||html.includes('stubbs-ai-rounded');console.log(`${branded?'PASS':'UNWIRED'} ${rel}`);if(!branded)failed=true;}
if(failed){console.error('\nBrand package is incomplete. Extract stubbs-ai-brand-assets.zip into public/brand/ and rerun.');process.exit(1);}
console.log('\nStubbs AI / Lyons Tech AI brand package is deployment-ready.');
