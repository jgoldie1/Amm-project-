# StreetVerse Chromebook — zero-install development workflow

**Device constraint:** 32 GB total storage; Linux/Crostini and local Visual Studio Code cannot be installed. This workflow does NOT require either one. It also does NOT require opening github.dev or GitHub Codespaces.

## Use what is already connected

1. **ChatGPT + GitHub connector:** Ask ChatGPT to inspect or edit `jgoldie1/Amm-project-` on branch `streetverse-chromebook-workbench`. ChatGPT can read, create, and change individual repository files through the connected GitHub tools. Keep production `main` untouched until tests pass and changes are reviewed.
2. **ChatGPT + Google Drive connector:** Recover models, animations, sound files, and SHA-256 manifests from the folder `StreetVerse_Original_Character_Recovery_2026-10-08`:
   https://drive.google.com/drive/folders/1QZHgdav1g0v22raXRDyGBx9hFBAZ_7JP
3. **Browser-only layout planner:** Use the small standalone HTML game-planning file from the ChatGPT conversation. No libraries, VS Code, Linux, or Node installations. Export layouts as small JSON files when done. Only download individual small working files—not the game repository or model library.
4. **Cloud tests:** Use GitHub Actions when available/configured, or test the small edited files in ChatGPT's sandbox. For this large Vite repository, verify the actual game build separately; a successful syntax check is not a gameplay certification.
5. **Browser preview:** A reviewed static preview may be published through GitHub Pages later, but do not publish proprietary/nonpublic assets or expose secrets. Publishing requires separately confirming Pages settings; no live preview has yet been deployed.

## Working loop

Ask for ONE feature (for example `Circle Park one-hand controls`).
ChatGPT reads relevant existing code → prepares patch → commits to workbench branch → runs available scoped tests → reports exact results and remaining blockers → user tests any preview in Chrome.

## Existing game

- Core Vite game: `amm-omniverse/` in `jgoldie1/Amm-project-`.
- Engine: Three.js / TypeScript / Vite, Node.js 24 required for the full repo.
- Existing assets are in Drive, including Wave 1/Wave 2 NPC GLB variants. These are NOT proof that the BJ Stubbs player model is present or animated in the running game.
- First gameplay milestone: Circle Park, player avatar, one-hand mobile controls, car enter/drive/exit, one talking/walking NPC, Taylor Street mission and reward.

## Costs and limitations

- GitHub Actions public-repo minutes have an included allowance; check account usage before enabling frequent builds.
- The full 3D game still needs a server/preview host and rendering hardware. ChatGPT connectors edit cloud files; they do not remotely control the Chromebook or guarantee gameplay works.
- If browser-based development accounts are failing, avoid them for now. GitHub Codespaces configuration is retained as **optional** only; it is NOT required for this Chromebook workflow.
- Do not add sensitive credentials or private assets to this public repository.
