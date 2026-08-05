'use strict';

// Transitional wiring layer: it keeps the existing server stable while registering
// the new content API immediately after music-api is registered. Remove this file
// after server.js is modularized and calls content-engine-routes directly.
const Module = require('module');
const originalLoad = Module._load;

Module._load = function tryammLoad(request, parent, isMain) {
  const loaded = originalLoad.apply(this, arguments);
  if (request === './music-api' && typeof loaded === 'function' && parent?.filename?.endsWith('server.js')) {
    return function registerMusicAndContent(args) {
      loaded(args);
      require('./content-engine-routes')({ ...args, admin: (_req, _res, next) => next() });
    };
  }
  return loaded;
};
