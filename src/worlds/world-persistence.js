'use strict';
function createWorldPersistence({storage}={}) {
  const target=storage || (typeof localStorage!=='undefined'?localStorage:null);
  const key='tryamm:living-world-state:v1';
  return {
    load(){ if(!target)return null; try{return JSON.parse(target.getItem(key)||'null')}catch{return null} },
    save(worldSlug,position){ if(!target)return false; target.setItem(key,JSON.stringify({worldSlug,position,savedAt:new Date().toISOString()})); return true; },
    clear(){ target?.removeItem(key); }
  };
}
module.exports={createWorldPersistence};
