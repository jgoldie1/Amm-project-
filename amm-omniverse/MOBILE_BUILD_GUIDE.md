# AMM OMNIVERSE — MOBILE APP BUILD GUIDE
## Android · iPhone · Samsung · All Devices
## Using Capacitor (already installed in package.json)

---

## WHAT YOU ALREADY HAVE

Capacitor is already installed and configured:

```
@capacitor/android  v8.4.1  ✅ installed
@capacitor/ios      v8.4.1  ✅ installed
@capacitor/cli      v8.4.1  ✅ installed
@capacitor/core     v8.4.1  ✅ installed
```

Your `capacitor.config.json` is already set up with:
- App ID: `com.tryamm.omniverse`
- App Name: `AMM Omniverse`
- Splash screen: black (#020212), 2 seconds
- Status bar: dark, black
- Push notifications configured
- Geolocation (for AR Creature Capture) configured
- Camera (for AR Laser Tag and face scan) configured
- Motion/haptics configured

---

## ANDROID BUILD — Google Play + Samsung Galaxy

### What you need on your computer
- Node.js 18+ (you have this — it's running the build)
- Android Studio (free download — studio.android.com)
- Java 17 (installed with Android Studio)
- USB cable OR Wi-Fi debugging

### Step 1 — Build the web app

```bash
cd /home/claude/amm-omniverse
npm run build
```

Produces: `dist/` folder — the complete web app

### Step 2 — Add Android platform (first time only)

```bash
npx cap add android
```

Creates: `android/` folder — a real Android Studio project

### Step 3 — Sync your latest build

```bash
npx cap sync android
```

Copies your `dist/` into the Android project. Run this every time you change code.

### Step 4 — Open in Android Studio

```bash
npx cap open android
```

Android Studio opens. You'll see a real Android project with:
- `app/src/main/` — your app code
- `app/src/main/res/` — icons, splash screens
- `AndroidManifest.xml` — permissions

### Step 5 — Configure for Google Play

In Android Studio → `app/build.gradle`:
```gradle
android {
    compileSdk 34
    defaultConfig {
        applicationId "com.tryamm.omniverse"
        minSdk 22
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Step 6 — Add your icons

Replace these files in `android/app/src/main/res/`:
```
mipmap-mdpi/ic_launcher.png      48×48px
mipmap-hdpi/ic_launcher.png      72×72px
mipmap-xhdpi/ic_launcher.png     96×96px
mipmap-xxhdpi/ic_launcher.png    144×144px
mipmap-xxxhdpi/ic_launcher.png   192×192px
```

Use the AMM Omniverse 🌐 logo with #020212 background and #00ffcc glow.

### Step 7 — Build APK (for testing)

In Android Studio: Build → Build APK → find in `android/app/build/outputs/apk/`

Install directly on your Android phone:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 8 — Build AAB for Google Play

Build → Generate Signed Bundle/APK → Android App Bundle → sign with your keystore

Upload to play.google.com/console → Create app → Upload AAB

### Samsung Galaxy specific

AMM Omniverse works on ALL Samsung Galaxy phones automatically via the Android build:
- Galaxy S24, S23, S22, S21 — full support
- Galaxy A series — full support
- Galaxy Z Fold/Flip — supported, layout adapts
- Samsung One UI — no special code needed
- Samsung DeX (desktop mode) — works as web app

For Samsung Galaxy Store (separate from Google Play):
- Create account at seller.samsungapps.com
- Upload same APK/AAB from the Android build
- Samsung reviews within 5 business days

---

## iPHONE / iPAD BUILD — App Store

### What you need
- Mac computer running macOS 13+ (required — Apple forces this)
- Xcode 15+ (free from Mac App Store — xcode.app)
- Apple Developer account ($99/year)
- iPhone or iPad for testing

### Step 1 — Build web app (same as Android)

```bash
cd /home/claude/amm-omniverse
npm run build
```

### Step 2 — Add iOS platform (first time only)

```bash
npx cap add ios
```

Creates: `ios/` folder — a real Xcode project

### Step 3 — Sync latest build

```bash
npx cap sync ios
```

### Step 4 — Open in Xcode

```bash
npx cap open ios
```

Xcode opens with project `App.xcworkspace`

### Step 5 — Configure app settings in Xcode

General tab:
- Bundle Identifier: `com.tryamm.omniverse`
- Version: `1.0.0`
- Build: `1`
- Deployment Target: iOS 14.0 minimum

### Step 6 — Add your icons

In Xcode: Assets.xcassets → AppIcon
Required sizes:
```
20pt @1x, @2x, @3x
29pt @1x, @2x, @3x
40pt @1x, @2x, @3x
60pt @2x, @3x
76pt @1x, @2x (iPad)
83.5pt @2x (iPad Pro)
1024pt @1x (App Store)
```

### Step 7 — Set permissions in Info.plist

These are required for AMM features:
```xml
<key>NSCameraUsageDescription</key>
<string>AMM Omniverse uses your camera for AR Laser Tag and Creature Capture games</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>AMM Omniverse uses your location for Creature Capture GPS features</string>

<key>NSMotionUsageDescription</key>
<string>AMM Omniverse uses motion sensors for AR gaming features</string>

<key>NSMicrophoneUsageDescription</key>
<string>AMM Omniverse uses your microphone for live streaming</string>
```

### Step 8 — Test on device

Connect iPhone → trust computer → select your device in Xcode → Run

### Step 9 — Submit to App Store

Product → Archive → Distribute App → App Store Connect

Upload to appstoreconnect.apple.com:
- Create new app listing
- Screenshots: 6.7" (iPhone 15 Pro Max), 5.5" (iPhone 8 Plus), 12.9" (iPad)
- App description, keywords, categories: Games + Entertainment + Lifestyle
- Privacy policy URL (required — use tryamm.online/privacy)
- Submit for review — Apple reviews within 24 hours to 7 days

---

## PWA (RIGHT NOW — NO APP STORES NEEDED)

This is the fastest path to mobile users. Already works.

### Android Chrome
1. Open tryamm.online in Chrome
2. Tap the ⋮ menu → "Add to Home Screen"
3. App icon appears on home screen
4. Opens fullscreen, works offline

### iPhone Safari
1. Open tryamm.online in Safari (not Chrome)
2. Tap the share ⎙ button at bottom
3. Scroll down → "Add to Home Screen"
4. Name it "AMM Omniverse" → Add
5. App icon appears on home screen

### Samsung Internet Browser
1. Open tryamm.online in Samsung Internet
2. Tap ⋮ menu → "Add page to" → "Home screen"

This works TODAY with zero app store review.

---

## COST TO BUILD NATIVE APPS

| Path | Cost | Time |
|------|------|------|
| PWA (works now) | $0 | Done |
| Android APK (side-load) | $0 | 2 hours |
| Google Play submission | $25 one-time | 1 week review |
| Samsung Galaxy Store | $0 | 5 day review |
| iOS App Store | $99/year Apple Dev | 1–7 day review |
| Total for all platforms | $124/year | 1–2 weeks |

All builds use the same codebase you already have. No new code needed.

---

## COMMANDS REFERENCE

```bash
# Build web app
npm run build

# First time: add platforms
npx cap add android
npx cap add ios

# Every code change: sync
npx cap sync

# Open in IDE
npx cap open android    # opens Android Studio
npx cap open ios        # opens Xcode (Mac only)

# Run on connected device
npx cap run android     # runs on USB-connected Android
npx cap run ios         # runs on USB-connected iPhone (Mac only)

# Live reload during development
npx cap run android --livereload --external
```

---

## PERMISSIONS ALREADY CONFIGURED

Your `capacitor.config.json` already enables:

| Permission | Used For |
|-----------|---------|
| Camera | AR Laser Tag · Creature Capture · Face scan avatar |
| Geolocation | Creature Capture GPS radar |
| Motion/Gyroscope | AR aiming system |
| Push Notifications | Tournament alerts · Gift notifications · Drama updates |
| Haptics | Game feedback · Gift vibration |
| Microphone | Live streaming |

---

*AMM Omniverse · All American Marketplace LLC · Cary, IL · tryamm.online*
*Capacitor by Ionic · © 2026 All rights reserved*
