# TRYAMM LiveKit + Cloudflare R2 low-cost launch plan (Oct 2026)

**State:** code on a draft branch; Cloudflare account is NOT connected. No paid Cloudflare service or bucket was activated. R2 pilot uploads default to OFF.

## What each service does
- LiveKit: real-time WebRTC LIVE/PK, audience participation and guests.
- Cloudflare R2 Standard: low-cost private archive for recorded MP4/WebM files; not a WebRTC server or video transcoder.
- Cloudflare Stream: optional separate paid delivery for larger HLS/on-demand viewing.
- Stripe verified server checkout: web sales and eligible goods/services, NOT automatically verified native-app virtual coin payments.

## Published R2 Standard free allowance
10 GB-month stored, 1 million Class A operations, 10 million Class B reads, and free R2 egress; overage for Standard storage is $0.015 per GB-month. LiveKit, video encoding, and Cloudflare Stream may add charges.

## Configuration (server-only; DO NOT add to VITE_)
CLOUDFLARE_R2_ENABLED=true
CLOUDFLARE_R2_ACCOUNT_ID=Cloudflare account ID
CLOUDFLARE_R2_BUCKET=private bucket name
CLOUDFLARE_R2_ACCESS_KEY_ID=scoped R2 access key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=scoped secret key
CLOUDFLARE_R2_OPERATOR_USER_ID=allowed authenticated pilot account UUID
CLOUDFLARE_R2_PILOT_UPLOADS=true (ONLY AFTER guard review)

## Operator-only rollout
GET /api/media/cloudflare-r2 reports readiness without revealing secrets.
POST /api/media/cloudflare-r2 accepts action sign-replay-upload plus a supported Content-Type and declared size; issues a 60-second signed PUT URL for one private object, only for allowed operator.
CORS on the private bucket must allow the actual tryamm.online origin with PUT and Content-Type header; expose ETag when necessary.
Important: presigned PUT does NOT enforce the claimed number of bytes. No wider creator uploading until Cloudflare Worker enforces actual upload byte cap, durable per-account quotas, content and rights checks, and budget alerts.
Uploaded objects are unverified and private until a server confirms file data and grants playback access. Upload intent does not constitute a playable recording.

## Cost and launch checks
Do not start paid Stream/Workers/video conversion automatically. Monitor LiveKit participant-minutes and bandwidth separately from R2 stored gigabytes and request operations.
Enable Cloudflare and LiveKit only after credentials are configured and a two-device real-camera call, network recovery, host ownership, moderation, and billing tests pass.
Apple and Google store submission is not required to run a mobile website with eligible web commerce; native digital coin/gift purchases have different rules.