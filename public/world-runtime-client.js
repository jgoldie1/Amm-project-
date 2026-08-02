(function(global){
  'use strict';
  function createAccessibleOverlay(loader){
    const wrap=document.createElement('section'); wrap.id='world-loading-status'; wrap.setAttribute('role','status'); wrap.setAttribute('aria-live','polite'); wrap.hidden=true;
    wrap.innerHTML='<strong>Loading world</strong><progress max="100" value="0"></progress><span></span><button type="button">Dismiss</button>';
    const progress=wrap.querySelector('progress'),label=wrap.querySelector('span'); wrap.querySelector('button').onclick=()=>{wrap.hidden=true}; document.body.appendChild(wrap);
    loader.on('progress',e=>{wrap.hidden=false;progress.value=e.percent;label.textContent=` ${e.phase} ${e.percent}%`;});
    loader.on('mounted',()=>{progress.value=100;setTimeout(()=>wrap.hidden=true,600)});
    loader.on('announce',text=>{label.textContent=text;wrap.hidden=false;setTimeout(()=>wrap.hidden=true,1200)});
    return wrap;
  }
  function wireKeyboard({loader,avatar,speed=.18,viewer}){
    const held=new Set(); const down=e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D','Enter'].includes(e.key)){held.add(e.key.toLowerCase());e.preventDefault();}}; const up=e=>held.delete(e.key.toLowerCase());
    addEventListener('keydown',down); addEventListener('keyup',up);
    let raf; const tick=async()=>{const p=avatar.position;if(held.has('w')||held.has('arrowup'))p.z-=speed;if(held.has('s')||held.has('arrowdown'))p.z+=speed;if(held.has('a')||held.has('arrowleft'))p.x-=speed;if(held.has('d')||held.has('arrowright'))p.x+=speed;if(held.has('enter')){held.delete('enter');await loader.checkPortals(viewer);}raf=requestAnimationFrame(tick)}; tick();
    return ()=>{cancelAnimationFrame(raf);removeEventListener('keydown',down);removeEventListener('keyup',up)};
  }
  global.TryAMMWorldRuntime={
    boot:async function({WorldLoader,registry,renderer,scene,avatar,camera,THREE,assetLoader,presenceAdapter,persistence,transitionEffects,viewer,startSlug='faith-hub'}){
      if(camera&&!avatar.camera)avatar.camera=camera;
      const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const loader=new WorldLoader({registry,renderer,scene,avatar,THREE,assetLoader,presenceAdapter,persistence,transitionEffects,reducedMotion});
      createAccessibleOverlay(loader);
      const stopKeyboard=wireKeyboard({loader,avatar,viewer});
      await loader.mount(await loader.preload(startSlug),viewer);
      return {loader,stop:async()=>{stopKeyboard();await loader.dispose();}};
    }
  };
})(window);
