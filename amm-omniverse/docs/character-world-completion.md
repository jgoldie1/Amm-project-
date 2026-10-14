# BJ, Circle Park and West Side completion evidence

The `BJ Rig and Circle Park West Side Completion Gate` GitHub Action rebuilds
25 existing native world-kit assets, retrieves the checksum-locked live BJ V15
model, checks GLB structure, skin binding references and required clips, and
publishes the resulting 26-file asset package with a checksum inventory.

It runs on the `fix/character-world-completion` branch, relevant pull requests,
relevant main pushes and manual workflow dispatch once available on the default
branch. It never requests generation credits or automatically deploys artwork.
Artifacts expire after 90 days. Keep downloaded backups separately.

## Local reproduction

From `amm-omniverse`:

```sh
npm ci --ignore-scripts
npm run native:assets
node --test tests/streetverse-completion-gate.test.mjs tests/streetverse-west-side-lifecycle.test.mjs
node scripts/streetverse-completion-gate.mjs
```

The report and models appear in `release-evidence/character-world/` at repository
root. `--hero-file /absolute/path/model.glb` permits an offline copy; the same
checksum and rig checks still apply. Update the lock only after reviewing a new
model and updating the actual runtime URL. Never mark likeness approved based
on a checksum or source-code contract.

## Current verified scope

- V15: one skeleton; eight clips, including idle, walk and greeting.
- Native kit: 25 GLBs; these remain PREVIEW artwork.
- Eight focused gameplay/source contracts pass locally.
- New tests reject corrupt containers, absent bindings/clips and broken references.
- West Side unload now removes its own collision boxes, frees only its own
  graphics resources and tolerates repeated disposal. A two-world regression
  test covers the previously shared-resource failure.
- The master action no longer hides a missing Meshy test with `|| true`.

## Incomplete work

BJ likeness and deformation require visual review. The older Higgsfield project
`d25c495c-32f8-4388-ab0c-63bc727c7c0e` has smoother clothing in revision 5,
but remains a stylized draft and has not replaced production V15.
The Circle Park and West Side missions still need physical-device play evidence.
A successful automated run is technical regression evidence, not a finished-art
or full-game certification. Raw face photographs stay out of this repository.
