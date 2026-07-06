# AMM Omniverse — App Store Deployment Guide
## iOS App Store + Google Play + PWA

---

## Option 1: PWA (Fastest — works TODAY, no app store needed)

Users visit tryamm.online on their phone and tap "Add to Home Screen"
The app installs like a native app — icon on home screen, no browser bar, offline support.

**Enable PWA right now:**
1. Add to `index.html` `<head>`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#020212">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AMM Omniverse">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```
2. Register service worker in `src/main.tsx`:
```tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
```
3. Deploy to Vercel. Done. Installable from any iPhone or Android browser.

**PWA gives you:**
- Home screen icon (like a real app)
- No browser bar — full screen
- Offline support (cached game assets)
- Push notifications
- Background sync
- Camera + GPS + gyroscope access (AR games)
- Share target (other apps can share to AMM)

---

## Option 2: Google Play Store (Capacitor — 2-3 days)

**Cost:** $25 one-time Google Play developer fee

**Steps:**
```bash
# 1. Build the web app
npm run build

# 2. Initialize Capacitor (already in package.json)
npx cap init "AMM Omniverse" com.tryamm.omniverse --web-dir dist

# 3. Add Android platform
npx cap add android

# 4. Sync web build to Android
npx cap sync android

# 5. Open in Android Studio
npx cap open android
# Then: Build → Generate Signed APK/AAB → upload to Play Console
```

**What Victor does ($100-200):**
- Sets up Android Studio signing keystore
- Generates AAB (Android App Bundle)
- Creates Play Console listing with screenshots
- Submits for review (3-7 day Google review)

**Result:** AMM Omniverse on Google Play Store

---

## Option 3: Apple App Store (Capacitor — 1-2 weeks)

**Cost:** $99/year Apple Developer Program

**Steps:**
```bash
# Requires macOS with Xcode (Victor needs a Mac)
npx cap add ios
npx cap sync ios
npx cap open ios
# Then: Product → Archive → Distribute → TestFlight → App Store
```

**What Victor does ($150-300):**
- macOS + Xcode setup
- Apple Developer account setup
- App Store Connect listing
- TestFlight beta testing
- Submission + review (1-5 day Apple review)

**App Store requirements:**
- App icon: 1024×1024 PNG (no transparency)
- Screenshots: 6.7" iPhone (1290×2796)
- Privacy policy URL
- Age rating: 4+ (no violence, faith content)

---

## Option 4: React Native (Future — bigger rebuild)

For truly native performance (60fps animations, native maps, camera), rebuild
the UI layer with React Native / Expo. The game logic (Zustand store, game engines)
carries over unchanged.

**Timeline:** 3-4 months
**Cost:** $5,000-15,000
**Worth it when:** 10K+ monthly active users

---

## AR Games — Device Capabilities

| Feature | PWA | Capacitor Android | Capacitor iOS |
|---|---|---|---|
| Camera (AR overlay) | ✅ MediaDevices API | ✅ Native | ✅ Native |
| GPS (creature map) | ✅ Geolocation API | ✅ Native (better) | ✅ Native (best) |
| Gyroscope (aiming) | ✅ DeviceOrientation | ✅ Native | ✅ Native |
| WebXR (true AR) | ✅ Chrome Android | ⚠️ WKWebView limit | ❌ Not supported |
| Haptics (tap feedback) | ❌ Limited | ✅ Full | ✅ Full |
| Push notifications | ✅ Web Push | ✅ FCM | ✅ APNs |
| Background processes | ⚠️ Service Worker | ✅ Full | ✅ Full |
| Face ID / Touch ID | ✅ WebAuthn | ✅ Native | ✅ Native |

**Recommendation:** Launch as PWA first (today, free).
Add Capacitor Android for Play Store (Victor, $100-200, 3 days).
Add Capacitor iOS when you have $99/yr Apple dev account ($150-300, 1-2 weeks).

---

## App Store Listing Copy

**Name:** AMM Omniverse

**Subtitle:** Faith Creator Metaverse

**Description:**
AMM Omniverse is the first faith-centered creator economy metaverse.
Drive through AMM City in a 3D open world. Compete in 7 real sports games
(Boxing, Football, Basketball, WNBA, MMA, Baseball, Laser Tag).
Stream live with holographic gifts. Sell products with 90% creator payout.
Upload music and earn real royalties. Connect your wallet, mint NFTs, vote
in DAO governance. Prayer wall, feast calendar, ministry pages — all in one app.

**Keywords:** faith, creator, metaverse, marketplace, sports, music, streaming,
blockchain, gospel, holographic, boxing, basketball, WNBA, NFT, royalties

**Category:** Entertainment (primary) / Games (secondary)

**Price:** Free (with in-app purchases)

**Age Rating:** 4+ (no violence, faith-positive content)

---

## Pricing Config for App Stores

Add these IAP products in App Store Connect / Play Console:

| Product ID | Price | Description |
|---|---|---|
| amm_pro_monthly | $9.99 | Pro subscription monthly |
| amm_creator_monthly | $19.99 | Creator subscription monthly |
| amm_tokens_100 | $0.99 | 100 AMM tokens |
| amm_tokens_500 | $4.99 | 500 AMM tokens + 50 bonus |
| amm_tokens_1500 | $12.99 | 1,500 AMM tokens + 200 bonus |
| amm_battle_pass | $4.99 | Battle Pass monthly |
| amm_tokens_5000 | $39.99 | Prophet pack |
| amm_tokens_10000 | $74.99 | King pack (best value) |

Note: Apple takes 30% of all IAP (15% for subscriptions after year 1).
Google takes 15% for subscriptions.
Alternative: Use Stripe web payments at tryamm.online — you keep 97%.
