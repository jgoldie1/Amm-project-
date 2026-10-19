# Business storefront release from the current live baseline

The public domain still served commit 397b73c6 while business work existed only in previews. In the previews, the catalog was below account, diagnostics, AI and onboarding sections. Customers could not easily discover available business templates or try them before choosing a package.

This release starts from exactly 397b73c6. It adds the independent business entry and previously reviewed business-only files, makes / and /app open that entry, and adds ten visible sample-site cards with direct demo links. The /streetverse route, its entry, game components and runtime source remain from the live baseline. The existing full build still performs its unchanged deterministic asset/source generation steps.

Interactive samples: appointment requests, service inquiries, or a product cart with totals and checkout preview. All sample actions remain local, require no login/payment and are explicitly labeled as demos. Customize selects the corresponding template in the website builder. Prices and backend activation limits remain visible. No checkout, paid delivery or staffing promise is invented.

The app manifest has its own identity /app and start URL /app. The game remains an optional navigation link. Existing creator/business tools remain available through their existing routes.

Acceptance: unchanged committed game source compared with 397b73c6; root route and app manifest assertions; TypeScript; complete existing build; 18 support/generator tests; mobile Chromium and iPhone WebKit tests for the initial catalog, no game bundles/canvas on app entry, cart totals, appointment simulation, all ten demo openings and template handoff. Screenshot artifacts are retained briefly by the focused workflow.

Release uses production settings with automatic domain assignment disabled until the staged build is checked. Promote only after the acceptance gate and HTTP checks pass. Rollback target is dpl_BkowKBzYk1GdJVtagGpmTM4831yh. This release is independent of unreconciled broad PR #638; do not merge the whole recovery branch to deliver this storefront.
