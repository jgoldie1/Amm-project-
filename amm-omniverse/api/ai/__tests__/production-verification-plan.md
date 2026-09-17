# Production verification

After CI and merge, verify `/api/ai/selftest` on the exact production deployment. Certification requires HTTP 200 with `ok:true`, `degraded:false`, a non-null model, provider `vercel-ai-gateway-auto`, and response `HOLOGPT_READY`. If those conditions are not met, keep HoloGPT degraded and inspect provider diagnostics rather than weakening the gate.
