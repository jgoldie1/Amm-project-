# Servants of Christ standalone platform — prelaunch preview

The standalone, dependency-free static prototype is in [index.html](./index.html). It lives under a separate folder so it does not alter existing TRYAMM routes or build inputs.

## Identity
- Ministry: Servants of Christ
- Proposed leader display: Pastor Kofi Ofori (confirm spelling, title and authority before public release)
- Assistant brand: HoloGPT — Powered by Ofori AI
- Parent-platform interoperability: TRYAMM, FaithVerse, Broadcasting and University, through public links initially

## Implemented now
- Responsive ministry home, broadcasting, university, community and FaithVerse sections
- Keyboard-accessible starter Q&A with local rules, no server calls or data collection
- Links to existing TRYAMM routes, subject to production verification

## Not yet implemented
- Real AI model inference, retrieval of approved scripture/sermon material, multilingual speech or voice
- Secure pastoral request submissions, account login, CMS and event schedules
- Video hosting, LIVE broadcasting, streaming licenses, payment processing, tax verification
- Independent domain/hosting, automated tests, verified live route integrations

## Safe production plan
1. Obtain written ministry approval for public branding and the proposed pastor name.
2. Deploy this folder to its own static host/project with separate domain, without modifying TRYAMM production.
3. Create separate Supabase project or isolated tenant with reviewed RLS; never share TRYAMM owner keys or customer data.
4. Create a server-side Ofori AI endpoint with provider keys in secrets only, approved ministry knowledge and citations, moderation, privacy retention controls, and escalation to a human.
5. Replace preview-only responses with server-verified answers and make AI limitations clear.
6. Add content editor, schedule, rights-cleared media and accessible captions.
7. Verify any receiving ministry entity, tax statements, and payment account before enabling giving.
8. Test all links, mobile accessibility, privacy, account security and backups before launch.

## Deployment
Use the `standalone/servants-of-christ` folder as the publish root in a separate static hosting project. The current repository's main Vite build remains unchanged.
