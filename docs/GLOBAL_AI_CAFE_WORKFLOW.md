# TRYAMM Global AI Café — integration contract

## Customer-to-revenue journey

1. Website / StreetVerse business directory presents an owner-approved service or product, in a selected supported language.
2. Customer consents to data use and submits an inquiry. Backend creates a tenant-scoped lead with source, campaign, locale, consent and contact permission.
3. HoloGPT/StubbsAI answers FAQs from that business's approved catalog; Ollama is first when configured. No model may invent pricing, availability, regulatory claims or payment confirmation.
4. MiddleVerse qualifies the inquiry and drafts a quote. Owner approves pricing, outbound messages and any public ads. Each ad uses a unique campaign identifier and tracking URL.
5. Authorized checkout requests are created through Stripe. Paid status is recorded only after verified Stripe server response/webhook; retries must be idempotent.
6. Platform Layer-2 hash chain anchors the verified transaction's evidence reference. It NEVER generates the payment and never stores card details.
7. The owner dashboard reconciles lead -> approved quote -> verified checkout -> fulfillment -> refund -> net revenue, split by campaign, business and locale.
8. Support and fulfillment run independently of the AI service; a failed model must not prevent order lookup, verified receipts or customer assistance.

## Translation and international sales

- First languages: English, Spanish, French, Portuguese. Add others only after reviewed catalog translations and accessibility testing.
- Save source-language text, reviewed translation and locale. Machine translation should not silently overwrite binding contracts, legal policies or prices.
- Use payment provider-supported currency quotes and tax rules for each destination; NEVER use generated FX rates.
- Confirm country-specific privacy consent, taxes/VAT, data transfers, refund rights and supported seller payments before market launch.
- Human approval required for any ad purchase, posting, marketing outreach, refund, or financial commitment; provide unsubscribe and suppression options.

## AI Café control panel requirements

- Lead inbox, sales pipeline, campaigns, translation queue, customer support, catalog, StreetVerse promotion, bill ledger, costs and access roles.
- Read-only integration health flags for HoloGPT, Ollama, Poyo, Supabase, Stripe, internal chain and live website.
- Disable paid inference unless TRYAMM_PAID_AI_ENABLED=true; cap daily requests and record provider and estimated cost.
- Keep secrets only on server, authorize by business tenant and log external side effects.
- Staff-facing workspace must be keyboard/one-hand accessible and mobile responsive.

## Proof required before production promotion

```sh
node scripts/verify-ai-cafe-workflow.cjs
npm run syntax
npm run test:payments
npm run test:stubbs-ai
npm run test:release
```

Then execute a live, permissioned smoke test: multilingual inquiry -> lead record -> owner-approved quote -> test-mode checkout -> verified webhook -> Layer-2 anchor -> ledger report -> support follow-up. Test failed Ollama/disabled AI; verify fallback does not mark transactions paid, leak credentials or charge paid providers. Test mobile and Chromebook. Check Vercel deployment READY and public page load. **Passing file checks alone is never an end-to-end certification.**

## Operational exclusions

- No autonomous advertising spend, credit-card charge, unsolicited bulk marketing, domain transfer, production deployment, paid hosting reactivation or financial disbursement.
- Poyo AI generation remains unavailable until its configured backend is tested.
- Layer 1 experience rewards and Layer 3 community attestations cannot be substituted for commercial payment authority.
- A local Ollama model must be reachable from the actual server runtime; localhost on the owner's Chromebook does not automatically make it reachable from Vercel.
