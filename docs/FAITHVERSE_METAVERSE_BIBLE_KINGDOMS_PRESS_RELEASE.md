# FaithVerse / Metaverse Bible / Kingdoms Press — Integration & completion record
Date: 2026-11-18 | Workstream: existing TRYAMM application | Status: integrated beta, NOT complete publication.

## Recovered modules preserved
- Faith Realm: `amm-omniverse/src/components/RealmScreens.tsx` (sanctuary, prayer, ministry and roleplay UI).
- StreetVerse Faith Chrono Portal: `amm-omniverse/src/components/StreetVerseFaithChronoPortal.tsx`, existing link to `/metaverse-bible`.
- Kingdoms Press Operations: `amm-omniverse/src/components/KingdomsPressOperations.tsx`, existing `pressCafeOperations` services for editorial reviews, publication rights, accessibility, translation, POD, edition/royalty and events. Functions depend on configured Supabase and authenticated access.
- Original Google Drive recovery registry (Aug. 2026): identifies Kingdoms Press / Living Scroll manuscripts, Torah/Bible learning, HoloBooks, interactive books, ebooks, audio, print, rights and provenance as recoverable work. It does not independently prove a complete Bible text is published.

## Completed on feature branch
- FaithVerse is a fifth clearly organized main super-app destination.
- In-app Bible hub opens from the homepage and routes `/faithverse`, `/metaverse-bible`, `/ethiopian-bible`.
- Starter excerpts from public-domain-in-the-US KJV with selection, search, device text-to-speech, large-text toggle, local bookmark.
- Connected to existing Faith Realm and Kingdoms Press operations; no redundant publishing backend created.
- Edition importer for source-annotated rights-reviewed JSON books -> chapters -> verse strings. Validates canonical structure, length, and explicit rights/source metadata; reads locally without uploading. Imported text is session-only. Rights statement is claimed metadata, not independently verified licensing.
- Included integration contract in root test suite.

## JSON import schema
```json
{
  "title": "Approved Edition Title",
  "language": "en",
  "source": "Approved publisher/source identifier",
  "rights": "Verifiable public domain or license and territory",
  "books": [
    {"name": "Genesis", "chapters": [["Verse 1 text", "Verse 2 text"], ["Chapter 2 verse 1"]]}
  ]
}
```

## Essential remaining work to claim a complete Bible
1. Obtain the specific final Bible edition and its FULL content files. Review translation rights and territories (including KJV status by jurisdiction); record reliable source metadata and edition revision.
2. Confirm canon/content choices with the owner and editors. The Ethiopian Orthodox broader canon is not interchangeable with a standard 66-book KJV; do not invent or silently merge books/versions.
3. Import a complete, accurately indexed corpus into an authorized publication storage/reader environment. Validate book/chapter/verse counts, spot-check sampled verses, references, attribution and versioning. Current importer is session-only; cloud synchronization is not yet live.
4. Add verse-by-verse highlights, chapter navigation, authorized cross references, notes, audio narration/permissions, downloads and accessible offline book packs.
5. Build the immersive FaithVerse reading/world experience with verified 3D assets, safe voice/NPC guidance, player return path, consent, moderation and Chromebook/iPhone acceptance.
6. Kingdoms Press editorial pipeline: create publication record, source-check, rights/translation/proof, accessibility, EPUB/PDF/print proofs, POD quote, royalty/contract and final human publication approval. No order/payment or print claims before provider integration.
7. Verify Supabase configuration, access controls, tenant isolation, backup/restoration, content moderation and secure publishing roles. A KJV-only beta must not be marketed as the complete Ethiopian Bible.
8. Make `/metaverse-bible` and `/faithverse` resolve with production SPA routing and save/reload on iPhone/Chromebook. Regression tests and device evidence required.

## Revenue and rights boundaries
- Scripture content licensing must be reviewed by territory; publish public-domain content or authorized licensed translations only.
- Paid original guides, author-created devotionals, books, study courses and print editions can be commercialized only with owner consent and approved payment flows. Do not claim exclusive copyright over public-domain biblical text.
- Avoid collecting sensitive prayer/pastoral disclosures in general analytics, AI agent training or advertising event streams.
