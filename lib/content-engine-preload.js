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
      require('./publishing-network-routes')({ ...args, admin: safeAdmin });
      require('./operating-layer-routes')({ ...args, admin: safeAdmin });
      require('./accessibility-device-routes')({ ...args, admin: safeAdmin });
      if (!args.app.locals.tryammPaymentRoutesRegistered) {
        require('./payment-routes')({ app: args.app, auth: args.auth, getStore: args.getStore, saveStore: args.saveStore });
        args.app.locals.tryammPaymentRoutesRegistered = true;
      }
      require('./durable-state-routes')({ app: args.app, auth: args.auth, getStore: args.getStore, saveStore: args.saveStore });
      require('./unified-release-routes')({ app: args.app, auth: args.auth, getStore: args.getStore, saveStore: args.saveStore });
      require('./get-paid-to-play-routes')({ app: args.app, getStore: args.getStore, saveStore: args.saveStore });
      require('./holo-ad-funding-routes')({ app: args.app, auth: args.auth });
      require('./stubbs-ai-routes')({ app: args.app, auth: args.auth });
      require('./release-flow-routes')({ app: args.app, auth: args.auth, getStore: args.getStore });
    };
  }
  return loaded;
};
