// HoloGPT gateway fallback policy.
// Keep the configured production model first. The free fallback is temporary
// and must never be treated as a substitute for owned/provider-backed capacity.
export const HOLOGPT_GATEWAY_FALLBACK_MODELS = [
  'inclusionai/ling-3.0-flash-sante-free',
  'openai/gpt-5.4',
]
