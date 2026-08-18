'use strict';
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
      const vault=require('./security-vault');
      const safeAdmin = async (req, res, next) => {
        if (req.user?.role !== 'admin') return res.status(403).json({error:'Admin access required'});
        if (!vault.configured()) return res.status(503).json({error:'Admin security vault required',code:'ADMIN_SECURITY_VAULT_REQUIRED'});
        try { const profile=await vault.getMfa(req.user.id); if(!profile?.enabled) return res.status(403).json({error:'Admin MFA enrollment required',code:'ADMIN_MFA_REQUIRED'}); return next(); }
        catch { return res.status(503).json({error:'Admin MFA verification unavailable',code:'ADMIN_MFA_UNAVAILABLE'}); }
      };
      require('./security-routes')({ ...args, admin: safeAdmin });
      require('./security-stepup-routes')({ ...args, admin: safeAdmin });
      require('./webauthn-routes')({ ...args, admin: safeAdmin });
      require('./account-protection-routes')({ ...args, admin: safeAdmin });
      require('./stripe-webhook-routes')({ ...args, admin: safeAdmin });
      require('./content-engine-routes')({ ...args, admin: safeAdmin });
      require('./publishing-network-routes')({ ...args, admin: safeAdmin });
      require('./operating-layer-routes')({ ...args, admin: safeAdmin });
      require('./accessibility-device-routes')({ ...args, admin: safeAdmin });
      require('./quantum-internet-routes')({ ...args, admin: safeAdmin });
      require('./tryamm-mail-routes')({ ...args, admin: safeAdmin });
      require('./holographic-runtime-routes')({ ...args, admin: safeAdmin });
      require('./holo-ice-routes')({ ...args, admin: safeAdmin });
      require('./holo-sfu-routes')({ ...args, admin: safeAdmin });
      require('./marketplace-routes')({ ...args, admin: safeAdmin });
      require('./marketplace-order-routes')({ ...args, admin: safeAdmin });
      require('./inventory-routes')({ ...args, admin: safeAdmin });
      require('./faith-routes')({ ...args, admin: safeAdmin });
      require('./ethiopian-bible-routes')({ ...args, admin: safeAdmin });
      require('./governance-routes')({ ...args, admin: safeAdmin });
      require('./operations-routes')({ ...args, admin: safeAdmin });
      require('./stubbs-ai-routes')({ app: args.app, auth: args.auth });
    };
  }
  return loaded;
};
