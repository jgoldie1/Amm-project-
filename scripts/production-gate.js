"use strict";

const fs = require("fs");
const path = require("path");

const statusPath = path.join(process.cwd(), "data", "production-integration-status.json");
const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "LIVEKIT_URL",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET"
];

function main() {
  if (!fs.existsSync(statusPath)) {
    console.error("FAIL: production integration status registry missing");
    process.exit(1);
  }

  const status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
  const blocked = status.criticalGates.filter(g => g.status !== "VERIFIED");
  const missingEnv = requiredEnv.filter(key => !process.env[key]);

  console.log(`TryAMM release gate: ${status.releaseGate}`);
  console.log(`Verified gates: ${status.criticalGates.length - blocked.length}/${status.criticalGates.length}`);

  if (missingEnv.length) {
    console.log("Missing required environment variables:");
    missingEnv.forEach(key => console.log(`- ${key}`));
  }

  if (blocked.length) {
    console.log("Unverified production gates:");
    blocked.forEach(g => console.log(`- ${g.id}: ${g.label} [${g.status}]`));
  }

  if (missingEnv.length || blocked.length) {
    console.error("BLOCKED: TryAMM is not production-ready.");
    process.exit(1);
  }

  console.log("PASS: all critical production gates are verified.");
}

main();
