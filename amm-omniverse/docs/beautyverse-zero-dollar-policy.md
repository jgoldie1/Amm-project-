# La Taeasia BeautyVerse — $0 build policy

Goal: build and test using free software and existing infrastructure. **No purchases or upgrades are authorized.** This document does not claim production hosting, custom domains, regulated licensing, payment processing, or transaction fulfillment are free.

## Permitted at no additional subscription cost
- React, Vite, TypeScript, React Three Fiber and Three.js already in the project
- Existing GitHub repository, separate feature branch, PR reviews and local builds
- HTML/CSS booking and shop previews without taking customer data or payments
- Local browser Gamepad API and device-provided screen mirroring (hardware support varies)
- WebXR opt-in with a normal 3D fallback, if a supported browser/device is already owned
- Content preparation, social posts, organic creator promotion and test media with permission

## Explicitly disabled until business owner approval
- Paid cloud resources, hosting tier changes, advertising, new domains, email/SMS plans, AI paid API calls, or vendor subscriptions
- Automatic paid upgrades or metered paid features
- Paid training enrollment before relevant regulatory approvals
- Merchant onboarding or collection of deposits until service authorization and merchant ownership are verified

## Important current provider limitations (confirm again before going live)
- Vercel Hobby is restricted to personal/non-commercial use. **Do not launch paid BeautyVerse commerce on Hobby** merely because it is free.
- Supabase Free offers limited database capacity and may pause inactive projects; paid or production use and backups need separate operational review.
- Stripe standard US processing may have no monthly/setup fee, but card transactions incur fees and some optional Stripe products cost extra.
- Real licensed salon operation may require unavoidable regulatory, insurance, or other costs unrelated to website development.

## Free-first production plan
1. Develop and test the entire storefront, bookings workflow, creator links, mobile design and account role separation with mock data.
2. Reuse an existing **commercially permitted** hosting entitlement if available, otherwise choose a suitable commercial host with no recurring fee where terms permit it. Never assume free status.
3. Connect a business-owned calendar and merchant account only after owner approval; disclose card transaction fees.
4. Apply usage limits; reserve paid SMS, ads, AI inference and video transcoding until revenue supports them.
5. Review hosting/storage costs and make a monthly budget before publishing.

## Required release acceptance
- Existing StreetVerse remains unchanged with the beta feature flag off
- No new paid dependency, payment charge, platform subscription, or automatic billing
- All booking/customer operations remain demonstrations until backed by authenticated, tested services
- Existing successful deployment identified for rollback; no force pushes or destructive migrations
