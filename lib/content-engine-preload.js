'use strict';

// Transitional wiring layer: it keeps the existing server stable while registering
// modular APIs immediately after music-api is registered. Remove this file after
// server.js is modularized and calls each route module directly.
const Module = require('module');
const originalLoad = Module._load;

Module._load = function tryammLoad(request, parent, isMain) {
  const loaded = originalLoad.apply(this, arguments);
  if (request === './music-api' && typeof loaded === 'function' && parent?.filename?.endsWith('server.js')) {
    return function registerTryammModules(args) {
      loaded(args);
      const safeAdmin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access required' });
      require('./content-engine-routes')({ ...args, admin: safeAdmin });
      require('./operating-layer-routes')({ ...args, admin: safeAdmin });
      require('./accessibility-device-routes')({ ...args, admin: safeAdmin });
    };
  }
  return loaded;
};
