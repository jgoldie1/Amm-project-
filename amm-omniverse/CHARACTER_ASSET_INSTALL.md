# StreetVerse — Original BJ / Jacobie / LaTeasia asset installation

The original 3 rigged GLBs are preserved in ChatGPT Library:
`/TRYAMM/StreetVerse/Character_Backups/StreetVerse_Mobile_3_Characters_Import_Only.zip`.

## Production path

Place these three **uncompressed GLB binaries** directly in
`amm-omniverse/public/tryamm-assets/meshy/characters/` on this branch:

| Character | Filename | Bytes |
| --- | --- | ---: |
| BJ Stubbs V15 | BJ_Stubbs_V15_Black_Suit_Purple_Shirt_Restore.glb | 6220868 |
| Jacobie Stubbs | Jacobie_Stubbs_12_Motions_Restore.glb | 7860680 |
| LaTeasia Monroe | LaTeasia_Monroe_7_Motions_Diagnostic.glb | 871880 |

If using the Chromebook GitHub website, open the **feature branch**,
navigate to the directory, select **Add file → Upload files**, choose the
three extracted GLBs, and commit to the same branch. Do not upload the ZIP
alone. After the Vercel preview rebuilds, the following requests must return
the original binary, not the application's HTML fallback:

- `/tryamm-assets/meshy/characters/BJ_Stubbs_V15_Black_Suit_Purple_Shirt_Restore.glb`
- `/tryamm-assets/meshy/characters/Jacobie_Stubbs_12_Motions_Restore.glb`
- `/tryamm-assets/meshy/characters/LaTeasia_Monroe_7_Motions_Diagnostic.glb`

Verify checksum and size in the repository with:
`cd amm-omniverse && node scripts/verify-streetverse-original-three-cast.mjs`

**This check fails until the original GLBs are uploaded.** Vercel build READY
by itself does not certify installed characters. Do not merge the draft PR or
claim production character completion until three-model loading,
animation/movement, appearance and actual mobile device testing succeed.
