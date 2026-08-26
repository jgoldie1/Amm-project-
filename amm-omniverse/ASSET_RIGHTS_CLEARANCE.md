# StreetVerse Asset Rights & Clearance Gate

## Production rule
No third-party asset enters a production game build unless its rights record resolves to **ORIGINAL**, **LICENSED**, or verified **PUBLIC_DOMAIN**, and the required commercial-use permissions are documented.

## Required provenance
For every character, likeness, vehicle, building, landmark, business/trademark, music/audio track, animation, texture, model, prop, and environment asset record:
- internal asset ID and category
- source and creator/licensor
- rights status
- license/proof reference when licensed
- commercial-use and derivative-use rights
- territory and expiration when applicable
- reviewer and review date
- special clearance for likeness, trademark/business branding, and music synchronization

## Gates
1. **ORIGINAL** — internally created asset with ownership/provenance recorded.
2. **LICENSED** — third-party asset with commercial license and proof reference recorded.
3. **PUBLIC_DOMAIN** — public-domain basis verified and recorded.
4. **PENDING_REVIEW** — may be evaluated in development but must not ship as a production dependency.
5. **REJECTED** — blocked from production.

## Chicago realism
Real-world Chicago geography and architectural inspiration can be modeled while specific trademarks, branded businesses, artwork, protected creative elements, music, and identifiable people's likenesses go through their applicable clearance lane. When clearance is unavailable, use an original fictionalized replacement rather than an unverified copy.

## Build policy
Production asset loading should call the rights gate before treating a rights-sensitive external asset as shippable. Missing provenance is a failure, not an implicit approval. Development fallbacks must be original project-owned primitives or assets that have already passed clearance.

This registry is an engineering compliance control and evidence trail, not a substitute for legal review where legal clearance is required.
