'use strict';

// Transitional wiring layer: it keeps the existing server stable while registering
// modular APIs immediately after music-api is registered. Remove this file after
// server.js is modularized and calls each route module directly.
//
// The server currently installs express.json() before modular routes. Stripe webhook
// signature verification requires the exact request bytes, so preserve those bytes
// during JSON parsing for webhook paths until server.js is modularized.
const express = require('express');
const originalJson = express.json;
express.json = function tryammJson(options = {}) {
  const priorVerify = options.verify;
  return originalJson({
    ...options,
    verify(req, res, buf, encoding) {
      if (String(req.originalUrl || req.url || '').startsWith('/api/webhooks/')) req.rawBody = Buffer.from(buf);
      if (typeof priorVerify === 'function') priorVerify(req, res, buf, encoding);
    }
  });
};

const Module = require('module');
const originalLoad = Module._load;

Module._load = function tryammLoad(request, parent, isMain) {
  const loaded = originalLoad.apply(this, arguments);
  if (request === './music-api' && typeof loaded === 'function' && parent?.filename?.endsWith('server.js')) {
    return function registerTryammModules(args) {
      loaded(args);
      const safeAdmin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access required' });
      require('./stripe-webhook-routes')({ ...args, admin: safeAdmin });
      require('./content-engine-routes')({ ...args, admin: safeAdmin });
      require('./publishing-network-routes')({ ...args, admin: safeAdmin });
      require('./operating-layer-routes')({ ...args, admin: safeAdmin });
      require('./accessibility-device-routes')({ ...args, admin: safeAdmin });
      require('./quantum-internet-routes')({ ...args, admin: safeAdmin });
      require('./tryamm-mail-routes')({ ...args, admin: safeAdmin });
      require('./holographic-runtime-routes')({ ...args, admin: safeAdmin });
      require('./holo-ice-routes')({ ...args, admin: safeAdmin });
      require('./marketplace-routes')({ ...args, admin: safeAdmin });
      require('./marketplace-order-routes')({ ...args, admin: safeAdmin });
      require('./governance-routes')({ ...args, admin: safeAdmin });
      require('./stubbs-ai-routes')({ app: args.app, auth: args.auth });
    };
  }
  return loaded;
};
