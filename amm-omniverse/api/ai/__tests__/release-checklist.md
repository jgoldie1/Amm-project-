# Release checklist

- CI must pass on the exact PR head.
- Branch must be synchronized with current `main` before merge.
- Production deployment must resolve to the merge SHA.
- `/api/ai/selftest` must return the exact readiness token from a real model.
- `/api/ai/answer` must return a non-diagnostic provider for a real prompt before HoloGPT is marked verified live.
