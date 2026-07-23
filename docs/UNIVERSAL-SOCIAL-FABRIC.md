# TryAMM Universal Social Fabric

## Vision
TryAMM should not behave like a site with a few social buttons. It should act as a universal interoperability layer that can route public TryAMM content toward any social network, messaging surface, community platform, creator network, or future protocol through a capability-aware connector system.

The core rule is: **connect where an official API exists; degrade gracefully where it does not.** Never fake an API integration, bypass platform controls, scrape private data, or automate prohibited actions.

## The differentiator: Capability Negotiation
Every destination is represented by a connector manifest describing what that destination actually supports:
- official account connection / OAuth
- publish via API
- share URL / intent URL
- deep links into native apps
- web fallback
- rich preview / Open Graph support
- webhook support
- analytics callback support
- messaging/share-sheet support
- profile URL support
- unsupported or restricted actions

TryAMM selects the best legal route at runtime instead of hard-coding one integration path.

## Universal Presence Without Requiring a TryAMM Account on Every Network
A platform can still participate in distribution even when TryAMM has no official profile there.

### Tier A — Native Connected
Use OAuth and the platform's official API for permitted publishing, analytics, profile sync, or messaging.

### Tier B — Share Connected
When there is no authenticated TryAMM account or no publishing API, generate a platform-aware share flow using a share URL, native share sheet, deep link, or prefilled compose intent where allowed.

### Tier C — Link Connected
When a platform has no usable API or share intent, create a canonical TryAMM landing URL with correct Open Graph metadata, campaign attribution, QR/deep-link support, and copy-link flow.

### Tier D — Protocol Connected
Support open protocols and standards such as ActivityPub, RSS/Atom, Web Share API, Webmention-compatible patterns, Open Graph, Schema.org, and future decentralized identity/social protocols where appropriate.

This means TryAMM can advertise 'cross-platform connectivity' honestly without claiming unsupported direct integrations.

## Universal Social Object
Represent every public piece of TryAMM content as one portable social object with:
- canonical URL
- title
- short description
- long description
- media variants
- creator identity
- content type
- age/safety classification
- language
- accessibility metadata
- hashtags/topics
- campaign attribution
- destination-specific rendering hints

A connector transforms this one object into the best legal representation for each destination.

## Connector Adapter Contract
Each adapter should expose capabilities rather than pretending all networks are the same:

```json
{
  "id": "example-network",
  "displayName": "Example Network",
  "capabilities": {
    "oauth": false,
    "apiPublish": false,
    "shareIntent": true,
    "deepLink": true,
    "webFallback": true,
    "richPreview": true,
    "analyticsCallback": false
  }
}
```

## One-Link Social Router
Create a canonical route such as:

`https://tryamm.online/go/<content-id>?to=<destination>&campaign=<campaign-id>`

The router should:
1. resolve the public TryAMM social object,
2. validate the requested destination,
3. choose the highest supported capability tier,
4. preserve attribution,
5. redirect or render a safe share screen,
6. record privacy-safe outbound click analytics,
7. never expose secrets or private user data.

## Cross-Platform Identity Graph
Maintain a verified mapping between a TryAMM identity and external public identities only when the user/brand explicitly links them. Use this for verified profile badges, `sameAs` structured data, creator discovery, and routing.

Do not infer ownership just because names match.

## Universal Share Composer
Give a creator one composer that prepares destination-specific variants:
- horizontal/vertical/square media versions
- character-length variants
- subtitle/caption files
- alt text
- hashtags/topics
- canonical link
- tracking parameters

Where an official API supports publishing, publish only with explicit authorization. Otherwise hand off to the native platform compose/share flow.

## Audience Bridge, Not Data Theft
TryAMM should help creators move attention between networks without copying private follower graphs.

Use:
- public profile links
- opt-in follows/newsletters
- QR codes
- creator invite links
- referral codes
- campaign landing pages
- verified external identities
- consent-based imports only where official APIs allow them

## Social Graph Relay for Open Protocols
For networks/protocols that support federation or open feeds, expose public TryAMM content through standards-based endpoints. This can let TryAMM participate in broader ecosystems without custom bilateral integrations for every destination.

## Future-Proof Connector Registry
New social networks should be addable by configuration plus a small adapter instead of rewriting the app. The registry should support:
- enabled/disabled status
- region availability
- age restrictions
- account requirement
- API status
- rate limits
- share methods
- app deep-link templates
- web fallback templates
- content-type support

## Safety and Compliance Guardrails
- Respect every platform's API terms and automation policies.
- Do not bypass login, rate limits, anti-bot systems, or content controls.
- Never claim direct integration where only link/share interoperability exists.
- Apply TryAMM teen/minor safety rules before outbound distribution.
- Require explicit user authorization for external posting.
- Keep tokens encrypted and server-side.
- Allow users to disconnect/revoke integrations.

## What Makes This Different
The product is not merely 'post to many social networks.' The novelty is a **capability-aware social routing fabric** that treats API publishing, native share intents, deep links, canonical web links, open protocols, identity verification, attribution, and graceful fallbacks as one unified interoperability system.

This lets TryAMM say: **one piece of content, one identity, one analytics layer, many destinations — even when direct API publishing is unavailable.**
