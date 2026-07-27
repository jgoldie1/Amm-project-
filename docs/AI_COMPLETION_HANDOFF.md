# AI Completion Foundation — Victor Handoff

## Added by AI

- Accessible AMM Omniverse splash screen
- One-hand-friendly 48px minimum touch targets
- Add-to-home-screen button wiring
- PWA manifest and service worker foundation
- Offline shell caching
- 13-world registry display
- HoloGPT frontend status dialog
- Google sign-in status button
- Existing email authentication and livestream MVP preserved

## Important: still requires Victor or deployment credentials

The following cannot be truthfully marked complete without production credentials and deployment access:

1. Google OAuth client ID, secret, callback URL, and provider configuration
2. HoloGPT backend API route and AI provider key
3. Final PWA icon files (192x192 and 512x512)
4. Deployment of this branch to the correct Vercel project
5. Verification that the deployed URL points to this repository and branch
6. Runtime testing on Chromebook and mobile
7. Living Worlds Three.js runtime, portal transitions, and renderer memory cleanup

## Required Vercel configuration

- Confirm GitHub repository: `jgoldie1/Amm-project-`
- Deploy branch: `agent/ai-site-completion-foundation`
- Node.js: 20 or newer
- Add production secrets only in Vercel settings; never commit them

Suggested environment variables:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
OPENAI_API_KEY=
SESSION_SECRET=
```

## Acceptance checklist

- [ ] Splash screen appears and Enter Platform works
- [ ] Skip animation works with one hand
- [ ] All visible buttons respond
- [ ] Email registration and login work
- [ ] Google login redirects, returns, and persists session
- [ ] HoloGPT returns a real response through a protected backend route
- [ ] Add to Home Screen installs the app
- [ ] Offline shell opens after first successful visit
- [ ] Updated service worker activates without trapping users on an old build
- [ ] 13 world cards load from `/data/worlds.json`
- [ ] Correct repository, branch, and commit are shown in the delivery report

## Approval rule

Do not request milestone approval until the deployment video demonstrates the correct AMM Omniverse build, responsive buttons, email login, Google login, HoloGPT, and PWA installation.
