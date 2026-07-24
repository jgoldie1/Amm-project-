"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const envManifest = require(path.join(ROOT, "data", "production-required-env.json"));

const requiredFiles = [
  "server.js",
  "data/production-integration-status.json",
  "scripts/production-gate.js",
  "lib/production-security.js",
  "supabase"
];

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

const checks = [];
for (const file of requiredFiles) {
  checks.push({ id: `file:${file}`, ok: exists(file), detail: exists(file) ? "present" : "missing" });
}

const envNames = process.env.NODE_ENV === "production"
  ? [...envManifest.requiredForStaging, ...envManifest.requiredBeforePublicProduction]
  : envManifest.requiredForStaging;

for (const name of envNames) {
  const value = process.env[name];
  checks.push({ id: `env:${name}`, ok: Boolean(value && String(value).trim()), detail: value ? "configured" : "missing" });
}

const forbiddenProductionDefaults = [
  ["SITE_URL", "https://tryamm.online", false],
  ["GAMEOPS_INTERNAL_SECRET", "changeme", true],
  ["SESSION_SIGNING_SECRET", "changeme", true]
];
for (const [name, badValue, onlyWhenSet] of forbiddenProductionDefaults) {
  const current = process.env[name];
  if (onlyWhenSet && !current) continue;
  const bad = current === badValue;
  checks.push({ id: `secret-safety:${name}`, ok: !bad, detail: bad ? "unsafe default" : "ok" });
}

const failed = checks.filter((check) => !check.ok);
console.log(JSON.stringify({
  environment: process.env.NODE_ENV || "development",
  ok: failed.length === 0,
  checks,
  failed: failed.map((check) => check.id)
}, null, 2));

if (failed.length) process.exit(1);
