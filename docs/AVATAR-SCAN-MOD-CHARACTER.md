# TryAMM Respectful Avatar Scan + Mod Character Pipeline

## Goal
Allow a player to create an original game avatar from authorized multi-view captures or import an original/licensed mod character, then pass it through Quantum Speed Engine / Asset Forge for reconstruction, mesh preparation, rigging, animation, LODs, XR/holographic variants, validation and publication.

## Capture flow
Required views:
- front
- left side
- right side
- back

Optional:
- full body
- facial expressions
- voice sample
- motion reference

Raw captures are inputs to reconstruction; they are not the final game asset.

## Processing flow
capture quality check -> landmark detection -> multi-view reconstruction -> base mesh fit -> texture projection -> retopology -> rig selection -> skin weighting -> facial rig -> LOD generation -> animation retargeting -> XR/holographic variants -> validation -> publish

## Consent and respect
- A user may scan themselves.
- Another person's likeness requires explicit permission.
- A minor requires appropriate guardian authorization and age-safety handling.
- Never create deceptive impersonation, identity fraud, degrading racial/ethnic caricatures, hateful transformations, sexualized minors, or unauthorized public-figure clones.
- Default stylization must preserve dignity.
- Users preview the avatar before publication and control stylization intensity.
- Likeness sharing/export requires permission.
- Raw biometric media should be encrypted, minimized, and deleted after validated derivation unless the user explicitly chooses a lawful retention option.

## Mod characters
Users may import:
- their own original character
- properly licensed assets
- assets with commercial-use rights compatible with TryAMM

Do not accept ripped/copied franchise assets merely because they are available online.

## Runtime integration
The derived avatar becomes a normal Asset Forge character job with provenance linking back to the consent record and avatar job ID. Once validated, the same approved avatar can produce optimized variants for mobile, TV, web, AR, VR, MR and holographic display profiles.

## Victor integration requirements
Wire `data/avatar-scan-policy.json` and `lib/avatar-pipeline-manager.js` into the authenticated API layer. Uploads must use signed/private object storage; do not put raw face scans in public folders or logs. Add explicit consent UX, deletion controls, retention policy, and secure admin access. Integrate the derived asset job with the existing Quantum Speed Engine Asset Forge pipeline and GameOps audit trail.
