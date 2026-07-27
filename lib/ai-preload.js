'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Module = require('module');
const { registerAiRoutes } = require('./ai-runtime');

const MAIN_DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'store.json');
const AI_DATA_FILE = process.env.AI_DATA_FILE || path.join(__dirname, '..', 'data', 'ai-store.json');

function readJson(file, fallback) {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; }
  catch (error) { console.error(`Could not read ${file}:`, error.message); return fallback; }
}

let aiStore = readJson(AI_DATA_FILE, { aiConversations: [], aiUsage: [] });
let writeQueue = Promise.resolve();
function saveAiStore() {
  writeQueue = writeQueue.then(async () => {
    await fs.promises.mkdir(path.dirname(AI_DATA_FILE), { recursive: true });
    const temporary = `${AI_DATA_FILE}.tmp`;
    await fs.promises.writeFile(temporary, JSON.stringify(aiStore, null, 2));
    await fs.promises.rename(temporary, AI_DATA_FILE);
  });
  return writeQueue;
}

function bearer(req) {
  const value = req.headers.authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

function auth(req, res, next) {
  const main = readJson(MAIN_DATA_FILE, { users: [], sessions: [] });
  const token = bearer(req);
  const session = (main.sessions || []).find((item) => item.token === token && item.expiresAt > Date.now());
  const user = session && (main.users || []).find((item) => item.id === session.userId);
  if (!user) return res.status(401).json({ error: 'Sign in required' });
  req.user = user;
  next();
}

function admin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  const loaded = originalLoad.apply(this, arguments);
  if (request !== 'express' || loaded.__tryammAiWrapped) return loaded;

  function wrappedExpress(...args) {
    const app = loaded(...args);
    const originalUse = app.use.bind(app);
    let useCount = 0;
    let registered = false;
    app.use = function wrappedUse(...middleware) {
      const result = originalUse(...middleware);
      useCount += 1;
      if (!registered && useCount === 2) {
        registered = true;
        registerAiRoutes({
          app,
          auth,
          admin,
          getStore: () => aiStore,
          saveStore: saveAiStore,
          id: (prefix) => `${prefix}_${crypto.randomBytes(12).toString('hex')}`
        });
      }
      return result;
    };
    return app;
  }

  Object.assign(wrappedExpress, loaded);
  wrappedExpress.__tryammAiWrapped = true;
  return wrappedExpress;
};
