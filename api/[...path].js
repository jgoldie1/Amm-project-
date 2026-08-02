'use strict';

// Vercel serverless entrypoint for the TryAMM Express backend.
// The Express app is exported from server.js without opening a listening port.
process.env.VERCEL = process.env.VERCEL || '1';
process.env.DATA_FILE = process.env.DATA_FILE || '/tmp/tryamm-store.json';

const { app } = require('../server');

module.exports = app;
