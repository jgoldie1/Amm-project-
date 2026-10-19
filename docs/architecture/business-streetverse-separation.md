# Business / StreetVerse separation — 2026-10-19

The founder reports StreetVerse working. This change does not modify its source or entry document.

First deliverable: `/business-app.html` (and `/business-app`) uses an independent Vite entry, React error boundary, the existing Supabase client, and authenticated `/api/commerce/orders`. It does not mount game launchers, WebGL, physics or legacy index scripts. Existing shopping, creation, seller and earnings tools remain linked destinations; those destinations are not all isolated yet. Both surfaces still share hosting and deployment, so this is runtime isolation, not independent release or infrastructure isolation.

Shared server-owned records: account ID, business/seller ID, product/listing ID, order ID, media ID, rights and moderation status, paid entitlements and verified earnings. Preserve current server authentication and ownership checks. Keep game XP, inventory simulation and closed-loop credits separate from cash payable balances. Linking from a game to a purchase must pass a product ID; the server determines price, permissions and settlement. Never trust client-provided earnings or referral commissions.

Next acceptance gate: a real configured product with delivery terms, sign-in, checkout, signed provider webhook, order receipt, fulfillment, and reconciled earnings. Existing backend charging, transfer and reconciliation gates stay enabled. The payment-status endpoint timed out during this change; media service previously returned 402. Neither is resolved by a new page.

Next separation steps: move the existing marketplace, creator, seller and earnings screens behind this lightweight shell with individual error boundaries; retain the same backend contracts. Then give business and game independent release gates or deployments after shared-session, API-origin and callback tests. No new paid hosting is provisioned by this change.

Validation: TypeScript/build and business-entry dependency isolation check. Real sign-in/order history require configured services. Browser and live purchase verification remain separate release gates.
