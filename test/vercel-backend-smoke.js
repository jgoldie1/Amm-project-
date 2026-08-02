'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const entry = fs.readFileSync(path.join(root, 'api', '[...path].js'), 'utf8');
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

assert(server.includes('if(require.main===module)'), 'server must not listen when imported by Vercel');
assert(server.includes("module.exports={app,server,io}"), 'server must export the Express app');
assert(server.includes("path.join('/tmp','tryamm-store.json')"), 'serverless fallback storage must use /tmp');
assert(entry.includes("require('../server')"), 'Vercel function must import the Express app');
assert(entry.includes('module.exports = app'), 'Vercel function must export the Express handler');
assert.strictEqual(config.framework, null, 'Vercel framework must be disabled for backend/static deployment');
assert.strictEqual(config.outputDirectory, 'public', 'Vercel must serve the public directory');
assert(config.functions['api/[...path].js'], 'Vercel catch-all API function must be configured');

console.log('Vercel backend deployment smoke checks passed');
