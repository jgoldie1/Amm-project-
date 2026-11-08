# Kevon + Jacobie birthday release plan
- Candidate review deadline: **2026-11-15**
- Birthday milestone: **2026-11-20**
- Source branch: agent/middleverse-secure-sales-foundation-20261108, draft PR #708.
- Independent static preview package created in conversation: Kevon paper-trade calculation, Jacobie fixed-price DRIP calculation, six lessons, mobile responsive. Do not claim this package is deployed.
- The presumed existing page file paths public/kevon-forex-stock-ai.html and public/jacobie-visions-drip-lab.html were not found; recover actual source route and preserve original logic before integration.
## Acceptance gates
1. By Nov 10: recover both existing app locations, brand/user permissions and valid build steps. Verify repository CI status.
2. By Nov 11: validated paper trading and DRIP arithmetic, input boundaries, manual browser tests, accessibility.
3. By Nov 12: integrate shared navigational shell without replacing either app, confirm no real-money trading actions.
4. By Nov 13: confirm authentication and private journal design only if ready; disable unfinished data writes, privacy/security test.
5. By Nov 14: smoke test on Chromebook and mobile, verify actual deployment, error monitoring and backup.
6. By Nov 15: release candidate and owner sign-off only if all critical gates pass. Otherwise ship safe accessible preview and explicitly label missing features.
7. By Nov 20: birthday presentation of verified functions.
## Blockers
- Production deploy has previously been blocked by Vercel account state.
- Need existing Kevon/Jacobie actual source file paths and browser QA.
- Quantum Cloud PR #707 cross-device restoration not certified.
## Safety
No broker connectivity, orders, real-money simulations billed as investing, performance claims, or access to TRYAMM operating funds. User-specific financial records must not be placed in browser plaintext storage or exposed endpoints.