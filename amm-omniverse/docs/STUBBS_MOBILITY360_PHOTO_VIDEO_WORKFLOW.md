# Stubbs Mobility 360 — Product photo and captioned video publishing

## 0. Status
Product media feature is implemented on `/mobility360.html`. Live gallery currently displays **honest placeholders** until authentic, authorized media is available. There are no uploaded product images or demonstration video files in this change. Nothing is approved for sale, and videos make no cure claims.

## 1. Send or source actual content
For each of the first four samples: folding reacher, button/zipper helper, no-tie laces, and one-hand jar opener:
- Front, side, packaging/brand, and close-up detail photos of the actual model being sold.
- Optional 15–45-second horizontal or vertical demonstration: show how it is used safely in an everyday task, including limitations. Get all identifiable people's explicit permission.
- Plain English subtitles in a synchronized `.vtt` file; transcript text; photo descriptions that distinguish actual features.
- Written image/video rights or direct founder-owned footage. Manufacturer stock media is usable only when the manufacturer authorizes this particular resale/marketing use. Social-media ads/screenshots are **not** licensed automatically.
- No before/after recovery claims or implied stroke cure, unless reviewed and supported by reliable scientific evidence for the exact use.

## 2. Upload approved media
Put files in `amm-omniverse/public/mobility360-media/`; examples:
`reacher-front.webp`, `reacher-demo.mp4`, `reacher-demo.vtt`, `reacher-poster.webp`.

Then update `amm-omniverse/public/mobility360-media.json`:

```json
{
  "version": 1,
  "entries": [
    {
      "productId": "reacher",
      "approved": true,
      "imageSrc": "/mobility360-media/reacher-front.webp",
      "imageAlt": "Actual folding grabber in its extended position, showing the hand grip and two rubber jaws",
      "videoSrc": "/mobility360-media/reacher-demo.mp4",
      "captionsSrc": "/mobility360-media/reacher-demo.vtt",
      "posterSrc": "/mobility360-media/reacher-poster.webp",
      "videoTitle": "How to use the folding reacher in a daily living task"
    }
  ]
}
```

**Do not populate this example until the corresponding real files exist and have been inspected and approved.** The site validates same-origin file locations in the `/mobility360-media/` namespace and requires `approved: true`; unapproved entries are ignored. Videos additionally require caption file paths. Do not rely on the browser validation for independent medical-device or copyright clearance.

## 3. Accessible product page behavior
- Landing catalog cards show actual approved photos with meaningful alt text; otherwise emoji illustrations.
- "Real pictures. Helpful demonstrations." section shows four sample-product cards; approved photos and captioned on-demand playable videos; otherwise 'coming soon' placeholders.
- Product-detail panels display associated approved media.
- Never autoplay. Videos use native controls and inline playback; photo lazy-loading helps mobile performance.
- The page retains no checkout, product pricing or fake user testimonials.

## 4. Production requirements
- Rights and product correctness review, English captions, poster, alt text, accurate labeling, mobile performance checks, CDN/storage cost and consent log.
- Video: MP4 H.264/AAC where possible, exported at efficient bitrate. Make an accessible transcript available to users when ready; short previews should not be used as clinical training.
- Only enable shoppable video/Stripe after existing server-authoritative commerce gate verifies a seller, exact manufacturer/SKU, inventory, taxes, shipping, refund path and product compliance.
- Consider a consented disability creator demonstrator program; require paid partnership disclosures under FTC rules.

## 5. Next user-provided assets
A single clearly identified photo of a sample **you own or are authorized to use** and a short product demonstration video plus permission to publish are sufficient to start with one SKU. Captions can be prepared after transcription/review.

