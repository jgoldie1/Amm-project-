# Ofri AI — Independent ministry intelligence and commerce blueprint

## Verified scope
Standalone ministry HTML prototype exists. Ofri AI presently has a local FAQ demonstration, **not** an LLM endpoint or trained model. This document is the architecture for the next release, not a claim of deployment.

## Quantum Oracle ingestion (rights-first)
1. Pastor or authorized ministry admin registers official YouTube, Facebook, Patreon, TikTok, livestream and website URLs.
2. Record owner approval, rights scope, license, date and any subscriber/private restrictions for each source.
3. Use official APIs, authorized exports, or supplied media/transcripts; do not bypass access controls or paywalls.
4. Transcribe authorized audio/video with timecodes, speaker identification where justified and scripture reference extraction.
5. Review for transcript errors and doctrinal accuracy before publishing.
6. Store approved passages as versioned chunks with original URL, timestamp, copyright permission and visibility.
7. Retrieval-augmented generation (RAG) answers cite sermon/video and timestamps; distinguish quotation, summary, interpretation and AI-generated explanation.
8. Admin can revoke permission and remove material from search, indexes and caches.

The `ofri-oracle.mjs` module validates approved transcript records, chunks text and provides a simple reviewed-only keyword search. It does not access social platforms or download media.

## Dedicated Ofri AI
- Independent assistant persona, ministry-controlled knowledge base, scripture study and teaching assistant.
- Start with an existing LLM through a secure server endpoint and RAG. Keep provider API keys off the browser.
- Consider fine-tuning only after a licensed, reviewed dataset exists; do not promise a newly trained foundation model.
- Never present synthetic pastor speech or likeness as genuine; require specific consent and conspicuous labeling.
- Human pastoral referral for sensitive matters; no claims of spiritual certainty or medical/legal authority.
- Minimize personal data and segregate pastoral requests from model training.

## Broadcast production pipeline
Authorized sermon/live -> transcript -> reviewed highlights -> captioned clip -> podcast -> lesson -> multilingual draft -> approved schedule -> public channels. Publication requires rights and human review.

## Standalone storefront and marketplace
- Categories: ministry books, study guides, courses, event tickets, licensed media, apparel, community vendor listings.
- Each product: title, description, seller, fulfillment, inventory, refund policy, taxes, permissions and price.
- Merch and paid classes use verified merchant checkout and taxable/service ledgers as applicable.
- Voluntary donations use a separate verified ministry account and tax-status disclosure; never imply tax deductibility without proof.
- Marketplace vendors must be verified; platform fees and payouts calculated server-side.
- TRYAMM interoperability through scoped APIs/webhooks and approved product/catalog syndication, not shared admin passwords or unrestricted database access.

## Go-live blockers
- Confirm Pastor Kofi Ofri's official accounts and written content/brand authorization.
- Configure independent domain/hosting, secure AI backend, database, admin roles and privacy policy.
- Verify payment processing, taxes, fulfillment, returns, consumer disclosures and donation classification.
- Test rights removal, citations, accessibility, streaming, account recovery and audit logs.
