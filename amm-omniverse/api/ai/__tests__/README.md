# HoloGPT readiness tests

The production readiness endpoint must only report healthy after a real gateway generation returns the exact `HOLOGPT_READY` token. Diagnostic/recovery responses are not certification. The configured `HOLOGPT_GATEWAY_MODEL` remains first priority; fallback model availability is operationally temporary and must be verified in production after deployment.
