# QA + Release Completion Lane

Release truth is evidence, not percentage claims.

Gate order:
1. typecheck
2. repository security
3. production readiness/provider contracts
4. smoke contracts
5. production build
6. browser E2E
7. Supabase migrations applied to target production
8. real auth account proof
9. two-account/two-device save-rejoin proof
10. LIVE/PK/backchannel proof
11. Movie Box save/reopen/export proof
12. HoloGPT/AI provider proof
13. AR/VR/MR device entry proof
14. HoloArena OpenXR hardware/venue proof where applicable
15. Money Engine sandbox settlement/reversal proof
16. mobile performance/accessibility/global smoke
17. Vercel production smoke
18. regression matrix green

No branch merges into release merely because architecture exists. Planned content stays planned until its vertical-slice proof is green.
