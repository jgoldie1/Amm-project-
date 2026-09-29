# TRYAMM Jacobie Edge DDoS Runbook

## Defense layers

1. **Vercel platform DDoS mitigation** remains the public-edge baseline for the Vercel-hosted application.
2. **Vercel WAF** custom rules are staged in log-first mode using `.github/workflows/tryamm-edge-ddos-firewall-stage.yml`.
3. **Vercel Functions** terminate the legacy HTTP routes that previously rewrote directly to Render.
4. **TRYAMM Origin Shield** signs Vercel → Render requests with HMAC-SHA-256 when `TRYAMM_EDGE_ORIGIN_SECRET` is configured.
5. **Render Origin Shield verifier** begins in monitor mode. Hard rejection turns on only after the same secret exists on both Vercel and Render and `TRYAMM_EDGE_ORIGIN_SHIELD_ENFORCE=true`.
6. **Jacobie Root Swarm Shield** rate-limits traffic that still reaches the legacy Render process.
7. **Jacobie Swarm Shield + Red Hat Sentinel** protect the current Omniverse backend with resource budgets, canaries and privacy-minimized incident evidence.

## Shared secret rollout

Generate a cryptographically random high-entropy secret using a trusted secret manager or local cryptographic tool. Store the same value as `TRYAMM_EDGE_ORIGIN_SECRET` in both:
- Vercel project environment for `amm-omniverse`
- Render environment for the protected origin

Do not put the secret in Git, logs, screenshots, chat, client-side `VITE_*` variables, or source maps.

Validate signed requests in monitor mode first. After successful validation, set this on Render:

`TRYAMM_EDGE_ORIGIN_SHIELD_ENFORCE=true`

Rollback: set enforcement to false or remove that flag. Do not remove the edge secret during an incident unless rotating it.

## WAF rollout

Run **TRYAMM Edge DDoS Firewall Staging** with `stage-log-rules`.
The workflow intentionally stages only log-first rules and never publishes them.

Review the Vercel Firewall traffic dashboard for each rule. Confirm legitimate iPhone/Android/web users, crawlers, payment callbacks and internal tooling are not being caught.

Then progress each rule deliberately:

`log → preview enforcement → production log validation → production rate-limit/challenge/deny`

Publishing is intentionally a human production action:

`vercel firewall publish --yes`

## Active large attack

Vercel Attack Mode is the emergency challenge layer. It is intentionally not automated by CI.

Use from an authenticated, linked operator terminal only after confirming an active attack:

`vercel firewall attack-mode enable --duration 1h --yes`

Reassess before extending. Disable after the incident:

`vercel firewall attack-mode disable --yes`

Never pause Vercel system DDoS mitigations during an attack.

## Service preservation order

When under load, preserve in this order:
1. health / release control
2. authentication / security / privacy
3. payments and verified provider webhooks
4. core StreetVerse gameplay state
5. LIVE token authority
6. normal browsing/content
7. AI generation / media processing / 3D generation

AI, media and asset generation should degrade before identity, payments or core gameplay authority.

## Truth boundary

This design reduces blast radius and gives TRYAMM layered DDoS resilience. It does not make the service unhackable or guarantee availability against every attack. Network-scale protection remains shared with the hosting/edge providers.
