export const telemetry = {
  logWorldEntry(slug, logger = console) {
    logger.info?.({ event: 'world_entry', slug, timestamp: new Date().toISOString() });
  },

  readRendererMemory(renderer) {
    if (!renderer?.info?.memory) {
      throw new TypeError('A Three.js renderer with renderer.info.memory is required.');
    }

    return {
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures
    };
  },

  compareRendererMemory(before, after) {
    return {
      geometryDelta: after.geometries - before.geometries,
      textureDelta: after.textures - before.textures,
      possibleLeak:
        after.geometries > before.geometries ||
        after.textures > before.textures
    };
  }
};
