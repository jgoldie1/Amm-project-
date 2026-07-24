"use strict";

const http = require("http");
const https = require("https");

const baseUrl = (process.env.STAGING_URL || process.env.SITE_URL || "").replace(/\/$/, "");
if (!/^https?:\/\//.test(baseUrl)) {
  console.error("STAGING_URL or SITE_URL must be set to an http(s) URL");
  process.exit(1);
}

function getJson(pathname) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathname, baseUrl);
    const client = url.protocol === "https:" ? https : http;
    const req = client.get(url, { timeout: 10_000, headers: { Accept: "application/json" } }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        let parsed = null;
        try { parsed = body ? JSON.parse(body) : null; } catch { /* report below */ }
        resolve({ status: res.statusCode, parsed, body: body.slice(0, 500) });
      });
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
  });
}

(async () => {
  const checks = [
    ["health", "/health", (r) => r.status === 200 && r.parsed?.ok === true],
    ["platform-status", "/api/platform/status", (r) => r.status === 200 && r.parsed?.domains],
    ["gameverse-status", "/api/gameverse/status", (r) => r.status === 200 && Number.isInteger(r.parsed?.gameCount)],
    ["services", "/api/services", (r) => r.status === 200]
  ];

  const results = [];
  for (const [id, pathname, validate] of checks) {
    try {
      const response = await getJson(pathname);
      results.push({ id, ok: Boolean(validate(response)), status: response.status });
    } catch (error) {
      results.push({ id, ok: false, error: error.message });
    }
  }
  const failed = results.filter((item) => !item.ok);
  console.log(JSON.stringify({ baseUrl, ok: failed.length === 0, results }, null, 2));
  if (failed.length) process.exit(1);
})();
