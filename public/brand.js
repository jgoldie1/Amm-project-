(()=>{
  const BRAND={name:'Stubbs AI',technology:'Lyons Tech AI',mark:'/brand/stubbs-ai-rounded-512.png',small:'/brand/stubbs-ai-rounded-180.png',fallback:'/brand/stubbs-ai-fallback.svg',social:'/brand/stubbs-ai-social-card.jpg'};
  function ensureHead(tag,attrs){let node=document.head.querySelector(attrs.rel?`${tag}[rel="${attrs.rel}"]`:attrs.property?`${tag}[property="${attrs.property}"]`:attrs.name?`${tag}[name="${attrs.name}"]`:null);if(!node){node=document.createElement(tag);document.head.appendChild(node);}Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));return node;}
  ensureHead('link',{rel:'manifest',href:'/manifest.webmanifest'});
  ensureHead('link',{rel:'icon',href:'/brand/favicon.ico',sizes:'any'});
  ensureHead('link',{rel:'apple-touch-icon',href:'/brand/stubbs-ai-rounded-180.png'});
  ensureHead('link',{rel:'stylesheet',href:'/brand.css'});
  ensureHead('meta',{name:'application-name',content:BRAND.name});
  ensureHead('meta',{name:'apple-mobile-web-app-title',content:BRAND.name});
  ensureHead('meta',{property:'og:site_name',content:BRAND.name});
  ensureHead('meta',{property:'og:image',content:`${location.origin}${BRAND.social}`});
  function repair(img){img.addEventListener('error',()=>{if(img.dataset.fallbackApplied)return;img.dataset.fallbackApplied='true';img.src=BRAND.fallback;img.classList.add('brand-fallback');},{once:true});}
  function lockup(){const wrap=document.createElement('div');wrap.className='brand-lockup brand-auto-lockup';wrap.innerHTML=`<img class="brand-mark" data-brand-image src="${BRAND.mark}" alt="Stubbs AI Lion of Judah crest"><div class="brand-copy"><strong>STUBBS AI</strong><small>Powered by Lyons Tech AI</small></div>`;return wrap;}
  document.querySelectorAll('[data-brand-image]').forEach(repair);
  const header=document.querySelector('header');if(header&&!header.querySelector('.brand-lockup'))header.prepend(lockup());
  document.querySelectorAll('video,[data-live-stream],[data-broadcast]').forEach(el=>{const parent=el.parentElement;if(!parent||parent.querySelector('.brand-watermark'))return;parent.classList.add('brand-watermark-host');const wm=document.createElement('div');wm.className='brand-watermark';wm.innerHTML=`<img src="${BRAND.small}" alt=""><span>STUBBS AI</span>`;parent.appendChild(wm);repair(wm.querySelector('img'));});
  const splash=document.querySelector('[data-brand-splash]');if(splash){const hide=()=>splash.classList.add('is-hidden');window.addEventListener('load',()=>setTimeout(hide,900),{once:true});setTimeout(hide,3500);}
  const observer=new MutationObserver(()=>document.querySelectorAll('img[data-brand-image]:not([data-brand-ready])').forEach(img=>{img.dataset.brandReady='1';repair(img);}));observer.observe(document.documentElement,{childList:true,subtree:true});
  window.TryAMMBrand={...BRAND,createLockup:lockup};
})();