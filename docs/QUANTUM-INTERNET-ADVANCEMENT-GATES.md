# TRYAMM Quantum Internet — advancement gates

Do not market this as the world's most advanced internet/search system until independent benchmarks justify the claim.

## Already in this branch
- federated TRYAMM + academic + Small Web + community + archive + optional live-web retrieval
- filter-bubble breaker with domain caps
- visible source provenance
- semantic reranking
- evidence scoring
- contradiction signals
- entity graph extraction
- historical timeline lookup
- research synthesis plan
- TRYAMM Mail assistant with human-confirmed sending
- source diversity evaluation

## Gate A — independent live index
Current provider adapters can use Brave or Kagi. To become materially independent, build and operate a TRYAMM crawler/index with robots.txt compliance, canonicalization, spam detection, freshness scheduling, deduplication, safe-content controls, takedown workflow, legal removal process and index-health metrics.

Target before independence claim: >1B useful indexed documents is a long-term infrastructure goal, not an MVP requirement. Publish current indexed-document count instead of aspirational numbers.

## Gate B — retrieval quality
Create a fixed benchmark suite covering navigational, factual, academic, local, shopping, news, Small Web, historical, adversarial and multilingual queries.
Measure NDCG@10, MRR, recall, citation correctness, freshness, source diversity and latency.

No 'better than Google' claim until a reproducible third-party evaluation supports the specific dimension claimed.

## Gate C — provenance accuracy
Every HoloGPT factual answer must preserve source URL, retrieval time, source class, archive date when historical, and claim-to-source mapping.
Target: >=99% citation-link integrity in automated tests; unsupported factual claims must be flagged rather than silently generated.

## Gate D — temporal intelligence
Store first-seen/last-seen timestamps, source publication dates, archive snapshots and supersession relationships. HoloGPT must distinguish 'current', 'historical', 'superseded', 'retracted/corrected', and 'unknown date'.

## Gate E — research intelligence
Add OpenAlex/Semantic Scholar/PubMed adapters where terms permit; Crossref remains metadata foundation. Add retraction/correction signals, study-type labels, preprint labels, systematic-review detection and evidence hierarchies without treating citation count as truth.

## Gate F — user-controlled ranking
Expose ranking lenses: Balanced, Independent Web, Academic, Community, Historical, Local, Creator, Business, No-personalization, and custom domain rules. Store private preferences locally or account-scoped; provide reset/export/delete controls.

## Gate G — private/local search
Index a user's authorized TRYAMM data and connected content with strict ACL filtering before retrieval. Never leak private documents into public search or cross-user results.

## Gate H — multimodal search
Add image, video, audio, podcast and 3D/World search with modality-specific provenance and copyright-aware previews.

## Gate I — agent actions
Search may suggest actions; execution requires explicit permission scopes. Payments, publishing, mail sending, account changes, bookings and legal/compliance actions require server-side authorization and audit logs.

## Gate J — abuse resistance
Rate limiting, prompt-injection defenses for retrieved content, malware/phishing URL checks, SEO-spam detection, bot controls, CSAM/illegal-content handling, copyright/takedown processes and transparent moderation appeals.

## Gate K — reliability
Multi-provider failover, caches with freshness labels, circuit breakers, timeout budgets, provider health checks, tracing and SLOs. Search should degrade gracefully when one provider is unavailable.

## Gate L — transparency
Public search status page, ranking-principles page, source-label definitions, corrections channel and benchmark reports. Claims must describe what is actually measured.
