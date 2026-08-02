'use strict';
class SoloAmbientPresenceAdapter {
  async join(world, viewer){ return { mode:'solo-ambient', worldSlug:world.slug, viewerId:viewer?.id||null }; }
  async leave(){ return undefined; }
  updateLocalTransform(){ /* LiveKit multiplayer seam: intentionally no-op in this milestone. */ }
  dispose(){ return undefined; }
}
module.exports={SoloAmbientPresenceAdapter};
