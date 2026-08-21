# TRYAMM Organic Search / Backlink Release Plan

## Rule
No ranking guarantees, paid link farms, hidden text, doorway pages, automated spam comments, fake reviews, private-blog-network links, or misleading structured data. Search growth must come from crawlable public pages, useful original content, technical performance, legitimate citations, partnerships, press, community resources, and creator/business profiles.

## Technical SEO release gates
1. Production canonical host is https://tryamm.online/ with HTTPS and one preferred hostname.
2. robots.txt stays public and points to /sitemap.xml while API/admin/auth remain excluded.
3. sitemap.xml must enumerate every genuinely public crawlable landing page; authenticated/private application states must not be indexed.
4. Every public landing page gets a unique title, meta description, canonical, OG/Twitter image, H1, meaningful body copy, internal links and accessible image alt text.
5. Add JSON-LD only where page content supports it: Organization/WebSite on home; SoftwareApplication for TRYAMM app; VideoGame for public GameVerse/StreetVerse pages; ItemList for public marketplace category pages; Article for original editorial/archive articles; Event only for real public events.
6. Do not use query-string application states as the long-term SEO architecture. Replace key public discovery surfaces with stable routes such as /marketplace, /streetverse, /live, /creators, /business, /archive, /games, /accessibility and /about.
7. Server-render or prerender public discovery pages so crawlers receive meaningful HTML without requiring the authenticated React app to boot.
8. Core Web Vitals gate: code-split the large app bundle; lazy-load StreetVerse, Holoverse, SpaceVerse, LIVE and admin/business modules; optimize hero media; use responsive images and explicit dimensions.
9. Return correct 200/301/404 status codes. Never soft-404 missing businesses/creators.
10. Maintain public breadcrumbs and contextual internal links among cities, creators, businesses, games, archive exhibits and articles.

## Search clusters
- TRYAMM / All American Marketplace brand and product pages.
- StreetVerse Chicago / living-world game / persistent world-memory game.
- Creator-owned marketplace / creator storefront / independent creator tools.
- Accessible social/live/game platform and one-handed/captioned experiences.
- El Saturn / independent Black music history educational archive pages, using verified sources and rights-safe material.
- Chicago creator/business/community guides built from original TRYAMM data and editorial work.

## Backlink engine
1. Publish link-worthy original research: creator economy reports, accessibility engineering notes, StreetVerse technical case studies, Chicago small-business datasets/guides, and archive research with primary-source citations.
2. Create public creator and verified-business profile pages owners can link to from their official sites/social profiles.
3. Partner pages: universities, museums/archives, community organizations, accelerators, accessibility organizations, artists and legitimate local businesses can link to collaborations when a real relationship exists.
4. Digital PR: issue newsworthy release notes, product launches, original research and community-impact stories to relevant journalists/publications. Never mass-spam journalists.
5. Open-source selected reusable accessibility/game/network components with strong documentation and a canonical TRYAMM project page.
6. Publish embeddable rights-cleared widgets/badges (creator profile, event, verified storefront) that link back only when useful to the user and never hide keyword-rich anchors.
7. Broken-link/resource outreach: suggest a TRYAMM educational resource only where it genuinely replaces a dead or incomplete resource.
8. Local citations: keep business name/contact/site data consistent in legitimate directories and partner pages; do not create fake locations.
9. Archive/research pages should cite primary sources and earn links through scholarship rather than copying source material.
10. Track referring domains, link relevance, indexed pages, branded/non-branded impressions, clicks, conversions, Core Web Vitals and spam-link patterns monthly.

## Public route roadmap
P0: /, /about, /marketplace, /streetverse, /live, /accessibility
P1: /creators, /business, /games, /archive, /streetverse/chicago
P2: city pages, creator pages, business pages, original research/editorial hubs, public mission/exhibit pages where rights allow.

## Search Console / Bing release tasks
- Verify tryamm.online ownership.
- Submit https://tryamm.online/sitemap.xml.
- Inspect home plus every P0 route after deployment.
- Monitor indexing exclusions and canonical selection.
- Use URL inspection after major public-page launches, not as a substitute for crawlable architecture.

## Success definition
First-page ranking is not guaranteed. Success is increasing qualified non-branded impressions, indexed useful pages, reputable referring domains, organic sign-ups/storefront visits, and conversions while keeping the site technically healthy and policy-compliant.
