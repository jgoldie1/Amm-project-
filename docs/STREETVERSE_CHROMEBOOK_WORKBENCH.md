# StreetVerse: Chromebook cloud workbench

This guide applies to the **streetverse-chromebook-workbench** branch of `jgoldie1/Amm-project-`.
The existing production branch `main` is left untouched.

## Why this setup
- The Chromebook needs only Chrome, an internet connection, and a GitHub sign-in. Do not install Unreal, Unity, Blender, or Crostini/Linux just to start.
- `github.dev` provides fast editing but **no built-in runtime/terminal**.
- GitHub Codespaces provides a cloud-hosted VS Code editor, Node.js 24, terminal, and preview. This branch includes a Node 24 development container, Vite port 5173, and ESLint/Prettier/glTF Tools extensions.
- GitHub Codespaces can incur usage charges after included personal-account quotas. Stop the codespace when not working, and delete unused codespaces after committing work. Verify account billing settings first.
- Large original GLB files remain in Google Drive; do not download all assets onto the Chromebook.

## 1. Check Chromebook storage (without installing)
On the Chromebook, select the clock > Settings > System preferences > Storage management.
Open `chrome://system` for device diagnostics including `meminfo` where available.
Record the model, total RAM, and free local storage.

## 2. Open the editing workspace
Open:
https://github.com/jgoldie1/Amm-project-/tree/streetverse-chromebook-workbench
Choose **Code > Codespaces > Create codespace on streetverse-chromebook-workbench**.
Select a small 2-core machine if offered. Cloud configuration uses Node 24.
For **editing without running**, use https://github.dev/jgoldie1/Amm-project- and select the branch.

## 3. Run the existing game in cloud VS Code
In the Codespaces terminal:

```bash
cd amm-omniverse
node --version
npm ci
npm run dev -- --host 0.0.0.0 --port 5173
```

Use the **Ports** tab to open port 5173 as a private forwarded preview.
`npm ci` may take time/space **in Codespaces**, not on the Chromebook. It can fail due to repository size or dependency/environment constraints; examine errors rather than claiming success.
**Do not run the full `npm run build` first**. Its script performs multiple tests, regenerates assets and executes recovery tasks before Vite build. Use the smallest verifiable playable loop first.

## 4. Scope of the first playable game milestone
1. Circle Park start location: visible textured street, sidewalks, and camera.
2. BJ playable avatar: verify original model ownership and actual GLB loader; use a clearly labeled placeholder until validated.
3. One-hand mobile joystick with camera and camera collision.
4. One driveable car: enter, accelerate, brake, reverse, exit.
5. One NPC that walks and responds to an interaction.
6. Taylor Street destination mission: marker, completion message, reward.
7. Test in Chromebook Chrome and an iPhone browser before merging.

Do not promise a GTA VI-equivalent game or enable VR until the basic loop works. VR is a later feature gate after performance and safety checks.

## 5. Asset workflow
- Recovery folder: https://drive.google.com/drive/folders/1QZHgdav1g0v22raXRDyGBx9hFBAZ_7JP
- Wave 1 and Wave 2 contain twelve original GLB file variants around 11–13 MB each. They are NPC files, **not verified as the BJ Stubbs player model**.
- Inventory files, license/rights, check SHA-256 manifests, and test skeleton/animations in a cloud environment before wiring in. Use optimized working copies and retain originals.
- Keep big models/textures online (cloud Drive / authorized asset storage) and load on demand. Do not commit private credentials or raw large asset packs to Git.
- Browser asset tools: https://threejs.org/editor/ , https://www.blockbench.net/ .

## 6. Save and avoid bills
- Review changed files > commit and push to the workbench branch.
- Never merge into `main` without an explicit review and real gameplay tests.
- Go to https://github.com/codespaces > ... > **Stop codespace** when finished. Closing the browser tab alone does not immediately stop compute use.
- Free GitHub personal accounts have an included quota, not unlimited cloud compute. Check the current quotas and spending settings at https://docs.github.com/en/billing/concepts/product-billing/github-codespaces.

## Existing checks still required
This configuration has been added to a branch, **but a new Codespace has not been launched**, packages have not been installed, and build/playback testing has **not** been performed.
