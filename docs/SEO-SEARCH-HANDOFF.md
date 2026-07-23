# TryAMM SEO + Search Indexing Handoff

This branch adds the production-safe foundation for search discovery on `https://tryamm.online`.

## Implemented in this branch
- Canonical homepage metadata and description.
- Open Graph and Twitter/X sharing metadata.
- Organization + WebSite JSON-LD structured data.
- `public/robots.txt` with private/admin/account route exclusions.
- Initial `public/sitemap.xml` containing the current public homepage.
- `/health` endpoint.
- Protected `/api/indexnow` endpoint for notifying participating search engines when public pages are published or materially updated.
- `.env.example` documenting required SEO environment variables.

## Required deployment configuration
Set these in the deployment environment, not in source control:

```env
SITE_URL=https://tryamm.online
INDEXNOW_KEY=<secure generated key>
INTERNAL_PUBLISH_WEBHOOK_SECRET=<secure secret>
```

Host the IndexNow key file at:

`https://tryamm.online/<INDEXNOW_KEY>.txt`

The file body must contain the same key value.

## Search engine setup after deployment
1. Verify `tryamm.online` in Google Search Console.
2. Submit `https://tryamm.online/sitemap.xml`.
3. Verify the domain in Bing Webmaster Tools.
4. Submit the same sitemap there.
5. Test `robots.txt`, canonical metadata, Open Graph data, and JSON-LD in production.
6. Configure the publishing workflow to POST newly published or changed public URLs to `/api/indexnow` using `Authorization: Bearer <INTERNAL_PUBLISH_WEBHOOK_SECRET>`.

Example request body:

```json
{
  "urls": [
    "https://tryamm.online/",
    "https://tryamm.online/example-public-page"
  ]
}
```

## Next phase when full public content routes exist
Expand the sitemap to include only canonical, public, indexable 200-status pages for:
- creators
- marketplace products
- games
- music
- podcasts
- approved public live pages and replays
- holographic/mixed-reality pages
- accessibility
- academy
- news and help content

Do not index private profiles, admin pages, account pages, messages, checkout, wallet, moderation, drafts, unpublished content, or sensitive user-specific routes.

## Important limitation
The current repository is a small Express/Socket.IO application and does not yet contain the full TryAMM route architecture described in the larger product plan. This branch therefore wires the SEO foundation into the code that actually exists without inventing non-existent production pages.
