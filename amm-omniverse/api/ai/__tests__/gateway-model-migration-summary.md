# HoloGPT gateway migration

Removed stale Ling fallback IDs from runtime and readiness probing, aligned the direct Vercel gateway default with the current temporary fallback, and strengthened readiness so only the exact model-generated `HOLOGPT_READY` token can certify the service. Existing configurable, owned/self-hosted, and cloud provider paths remain intact.
