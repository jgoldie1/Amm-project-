# TRYAMM Thursday Release — One Manual Trigger

The release candidate is frozen at:

`74b5b6850465ebd01a84d22eee16d9b518f71351`

The READY Vercel preview is:

`https://amm-omniverse-lt3mmyqo2-jgoldie1s-projects.vercel.app`

## One manual action

In GitHub Actions, run the workflow named:

**TRYAMM Release Orchestrator**

Choose branch **developer-vic** and press **Run workflow**.

That workflow is designed to:

1. Promote the exact frozen READY preview to Vercel production.
2. Verify `https://tryamm.online/api/system/release` returns the frozen SHA.
3. Build the web application.
4. Generate the Capacitor Android project.
5. Install Android API 36 build tools.
6. Build a debug APK.
7. Build an unsigned release AAB.
8. Upload both as GitHub Actions artifacts.
9. Post START / PASS / FAIL and its run URL to GitHub Issue #107.

No secrets should be pasted into chat. The workflow reads the existing `VERCEL_TOKEN` GitHub secret.

## After the workflow passes

Physical-device certification remains intentionally separate: install the APK on an Android phone and prove StreetVerse → capture → Reel → Save to Phone → publish/share. A Play-signed AAB and Play Console submission require the owner's Google Play Console signing/account context.
