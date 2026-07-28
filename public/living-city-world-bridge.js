(function(global){
  'use strict';

  function requireRuntimeObject(name,value){
    if(!value) throw new Error(`Living Worlds integration missing ${name}. Connect the existing Living City ${name}; do not create a duplicate.`);
    return value;
  }

  function createApiRegistry(apiBase='/api'){
    let cache=[];
    return {
      async list(){
        const response=await fetch(`${apiBase}/worlds`);
        if(!response.ok) throw new Error(`World registry request failed (${response.status})`);
        const data=await response.json(); cache=data.worlds||[]; return cache;
      },
      async get(slug){
        const found=cache.find(world=>world.slug===slug);
        if(found) return found;
        const response=await fetch(`${apiBase}/worlds/${encodeURIComponent(slug)}`);
        if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||`World ${slug} is unavailable`);}
        return response.json().then(data=>data.world);
      }
    };
  }

  function createPersistence(token,apiBase='/api'){
    const headers=()=>({'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})});
    return {
      async load(){
        if(!token) return JSON.parse(localStorage.getItem('tryamm_world_state')||'null');
        const response=await fetch(`${apiBase}/world-state`,{headers:headers()});
        if(!response.ok) return null;
        const data=await response.json(); return data.worldState||null;
      },
      async save(worldState){
        localStorage.setItem('tryamm_world_state',JSON.stringify(worldState));
        if(!token) return {persisted:'local'};
        const response=await fetch(`${apiBase}/world-state`,{method:'PUT',headers:headers(),body:JSON.stringify(worldState)});
        if(!response.ok) throw new Error('World position could not be saved');
        return response.json();
      }
    };
  }

  async function connect(options={}){
    const livingCity=options.livingCity||global.TryAMMLivingCity||global.LivingCity;
    requireRuntimeObject('runtime export (window.TryAMMLivingCity)',livingCity);
    const renderer=requireRuntimeObject('renderer',livingCity.renderer);
    const scene=requireRuntimeObject('scene',livingCity.scene);
    const avatar=requireRuntimeObject('avatar',livingCity.avatar);
    const camera=requireRuntimeObject('camera',livingCity.camera);
    const THREE=requireRuntimeObject('THREE instance',livingCity.THREE||global.THREE);
    const WorldLoader=requireRuntimeObject('WorldLoader constructor',options.WorldLoader||global.TryAMMWorldLoader);
    const registry=options.registry||createApiRegistry(options.apiBase);
    await registry.list();
    const token=options.token||localStorage.getItem('tryamm_token')||'';
    const persistence=options.persistence||createPersistence(token,options.apiBase);
    const saved=await persistence.load().catch(()=>null);
    const startSlug=options.startSlug||saved?.worldSlug||'faith-hub';
    const viewer=options.viewer||{id:livingCity.userId||'solo-viewer'};

    const runtime=await global.TryAMMWorldRuntime.boot({
      WorldLoader,registry,renderer,scene,avatar,camera,THREE,
      assetLoader:livingCity.assetLoader,
      presenceAdapter:options.presenceAdapter||livingCity.presenceAdapter,
      persistence,viewer,startSlug
    });

    global.dispatchEvent(new CustomEvent('tryamm:world-runtime-connected',{detail:{startSlug,rendererInfo:renderer.info}}));
    return runtime;
  }

  global.TryAMMLivingCityWorldBridge={connect,createApiRegistry,createPersistence};
})(window);
