'use strict';

const assert = require('assert');
const registerKernel = require('../platform-kernel');

const routes = [];
const app = {
  get(path, ...handlers) { routes.push({ method: 'GET', path, handlers }); },
  post(path, ...handlers) { routes.push({ method: 'POST', path, handlers }); },
  put(path, ...handlers) { routes.push({ method: 'PUT', path, handlers }); }
};

const store = { users: [], rooms: [], events: [] };
const auth = (_req, _res, next) => next();
const clean = (value, max = 120) => String(value || '').trim().slice(0, max);
const id = prefix => `${prefix}_test`;

registerKernel({
  app,
  auth,
  clean,
  id,
  getStore: () => store,
  saveStore: async () => undefined
});

const routeKeys = new Set(routes.map(route => `${route.method} ${route.path}`));
for (const required of [
  'GET /api/platform/v1',
  'GET /api/platform/features',
  'GET /api/platform/worlds',
  'GET /api/platform/nigeria',
  'GET /api/profile/experience',
  'PUT /api/profile/experience',
  'POST /api/enter-globe/prepare',
  'GET /api/experience/v1'
]) {
  assert(routeKeys.has(required), `Missing kernel route: ${required}`);
}

const platformRoute = routes.find(route => route.method === 'GET' && route.path === '/api/platform/v1');
let payload;
platformRoute.handlers[0]({}, { json(value) { payload = value; } });
assert.equal(payload.version, '1.0.0-prealpha');
assert.equal(payload.releaseTruth, 'verified-pre-alpha');
assert(payload.doors.includes('enter-globe'));

const nigeriaRoute = routes.find(route => route.method === 'GET' && route.path === '/api/platform/nigeria');
let nigeriaPayload;
nigeriaRoute.handlers[0]({}, { json(value) { nigeriaPayload = value; } });
assert.equal(nigeriaPayload.productionPaymentsEnabled, false);
assert(Array.isArray(nigeriaPayload.providers));

console.log(`Platform kernel smoke passed with ${routes.length} registered routes.`);
