(function(global){
  'use strict';
  function fmtMemory(info){const memory=info?.memory||{};return `${memory.geometries||0} geometries / ${memory.textures||0} textures`;}
  function mount(){
    const panel=document.createElement('aside');
    panel.id='world-runtime-status'; panel.setAttribute('aria-live','polite');
    panel.innerHTML='<strong>Living Worlds</strong><span data-state>Waiting for Living City connection</span><span data-world>World: —</span><span data-memory>GPU memory: —</span>';
    document.body.appendChild(panel);
    const state=panel.querySelector('[data-state]'),world=panel.querySelector('[data-world]'),memory=panel.querySelector('[data-memory]');
    global.addEventListener('tryamm:world-runtime-connected',event=>{state.textContent='Runtime connected';world.textContent=`World: ${event.detail.startSlug}`;memory.textContent=`GPU memory: ${fmtMemory(event.detail.rendererInfo)}`;});
    global.addEventListener('tryamm:world-mounted',event=>{world.textContent=`World: ${event.detail.slug}`;memory.textContent=`GPU memory: ${fmtMemory(event.detail.rendererInfo)}`;});
    global.addEventListener('tryamm:world-runtime-error',event=>{state.textContent=`Connection error: ${event.detail.message}`;});
    return panel;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})(window);
