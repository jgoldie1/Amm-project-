(function(){
  const CDN='https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.13.0/lottie.min.js';
  function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  async function ensureLottie(){if(window.lottie)return window.lottie;try{await loadScript('/vendor/lottie/lottie.min.js');}catch(_){await loadScript(CDN);}if(!window.lottie)throw new Error('Lottie runtime unavailable');return window.lottie;}
  async function loadRegistry(){const r=await fetch('/api/lottie-assets').catch(()=>null);if(r&&r.ok)return r.json();const fallback=await fetch('/lottie-registry.json');if(!fallback.ok)throw new Error('Lottie registry unavailable');return fallback.json();}
  function reduced(){return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
  async function mount(el,id,opts={}){const registry=await loadRegistry();const asset=registry.assets.find(a=>a.id===id);if(!asset)throw new Error('Unknown Lottie asset: '+id);if(reduced()){el.textContent=asset.reducedMotionFallback||asset.name;el.setAttribute('data-reduced-motion','true');return null;}const lottie=await ensureLottie();return lottie.loadAnimation({container:el,renderer:'svg',loop:opts.loop??asset.loop??true,autoplay:opts.autoplay??asset.autoplay??true,path:asset.path,rendererSettings:{preserveAspectRatio:'xMidYMid meet'}});}
  window.TryAMMLottie={mount,loadRegistry,ensureLottie};
})();
