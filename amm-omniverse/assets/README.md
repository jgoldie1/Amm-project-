# StreetVerse recovered 3D cast — one archive import

Place the original `StreetVerse_3_Character_GLBS_Extracted.zip` in this folder, keeping the exact filename. It is preserved in the owner's private Google Drive backup and contains BJ, Jacobie, and LaTeasia.

The `native:assets` build step automatically extracts and SHA256-verifies the three actual GLBs to `public/tryamm-assets/recovered-characters/`. To verify: `node scripts/import-recovered-cast.mjs && node scripts/verify-recovered-cast-assets.mjs`. A missing archive cannot pass verification. Do not commit a generic placeholder with a real person's name.

**Visibility warning:** This GitHub repository is public. Committing the ZIP here makes its character models and embedded likeness data publicly accessible. Publish only with the relevant people's authorization. For private delivery, use authenticated first-party model storage instead and keep the repository archive absent until configured.

LaTeasia's extracted rig has no textures or morph targets and is a diagnostic model; it must not be described as the final corrected body.
