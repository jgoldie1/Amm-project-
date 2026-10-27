# TRYAMM browser development — safe, one-handed workflow

## Zero-install code editing
Open https://github.dev/jgoldie1/Amm-project- and choose branch `feature/stubbs-motion-fusion-core-20261026`.
GitHub.dev edits/commits files but does not execute Node, Blender, FFmpeg or render images. Prefer draft pull requests for experiments.

## Optional cloud terminal (Codespaces)
In GitHub repository, choose **Code → Codespaces → Create codespace on selected branch**.
This .devcontainer pins a Node 24 development image matching `amm-omniverse/package.json`. It does **not** install dependencies, run a server, start paid GPU compute, push code, or deploy automatically. Codespaces may incur usage charges depending on account allowances. Delete or stop a codespace when unused.

Only after confirming available disk and capacity:
```sh
cd amm-omniverse
npm ci
node --test tests/stubbs-film-engine-pipeline-contract.test.mjs tests/stubbs-film-continuity-contract.test.mjs tests/stubbs-motion-fusion-contract.test.mjs
npm run lint
npx tsc --noEmit
npm run build
```
When manually previewing with Vite, review package scripts, run `npm run dev -- --host 0.0.0.0`, then open the forwarded **5173** port (local development only). Do **not** enter secrets in screenshots, commit `.env` files, or expose local development ports publicly.

## Film production
The Blender script at `amm-omniverse/tools/blender/stubbs_film_scene.py` creates bounded primitive previs scenes. A Codespace with the default Node image does not include Blender or FFmpeg. Plan dedicated offline renderer workers after reviewing operational limits, media rights, and worker security. No video model or paid inference service is installed.

## Release safety
PR #675 contains live-game stabilization work. This experimental feature branch and PR #676 must not be merged to `main` until the stabilization branch, dependency security audit, mobile visual QA, and independent feature QA pass. Camera mode remains disabled by default.
