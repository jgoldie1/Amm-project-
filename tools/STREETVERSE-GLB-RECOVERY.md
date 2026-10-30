# StreetVerse BJ GLB Recovery Audit

Read-only, zero-dependency inspection of existing GLB assets. It does not generate a replacement BJ character, modify game assets, deploy, or connect to production.

Run from the repository root with Node 22+:

```bash
node tools/streetverse-glb-audit.mjs amm-omniverse/public
node tools/streetverse-glb-audit.mjs /path/to/StreetVerse-Character-Recovery
```

The JSON output inventories meshes, skeleton skins, joint counts, animation clips, materials and images. A missing skin or animation is a diagnostic, not proof the character is unusable. Inspect licensing and actual visual quality separately. Next integrate the verified BJ asset path with the existing scene loader on this isolated branch, then run the existing StreetVerse smoke tests before considering a pull request.
