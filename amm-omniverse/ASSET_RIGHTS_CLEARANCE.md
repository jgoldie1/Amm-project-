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

## Real-person likeness, voice, name, and digital-replica clearance
A recognizable real-person character, voice clone, face/body match, name/persona treatment, or other identity-sensitive asset requires a separate clearance record before it is described as verified or used in rights-sensitive commercial placement.

Minimum evidence:
- character/person identifier and intended display name
- usable reference source and provenance
- permission/self-authorization evidence for the intended use
- allowed uses (for example gameplay, missions, promotional screenshots, advertising, merchandise)
- reviewer and review date
- any territory, duration, revocation, exclusivity, compensation, or platform limits that apply

A generic rig, procedural face, AI-generated approximation, or stylistic resemblance is not automatically a verified likeness. A real-person character may remain REFERENCE_LOCKED or use a fictional/generic stand-in until clearance is verified.

## Fictional Global population rule
StreetVerse Global guides, residents and city NPCs are fictional by default. They may use shared generic rig slots, but those rigs must not be presented as tracked residents or as the likeness of a real person. If a real person replaces a fictional slot, that asset enters the real-person clearance lane before any verified-likeness claim.

## Endorsement and affiliation
Do not use a real person, business, school, government body, creator, celebrity, trademark or logo in a way that implies sponsorship, endorsement, employment, partnership or official affiliation unless that relationship is authorized and accurately documented.

## AI and synthetic-media provenance
AI-assisted assets still require provenance and rights review. Generation alone does not cure a copyright, trademark, likeness, voice, privacy, endorsement, music or source-license problem. Rights-sensitive synthetic assets may be blocked or replaced with original fictional alternatives.
## Chicago realism
Real-world Chicago geography and architectural inspiration can be modeled while specific trademarks, branded businesses, artwork, protected creative elements, music, and identifiable people's likenesses go through their applicable clearance lane. When clearance is unavailable, use an original fictionalized replacement rather than an unverified copy.

## Build policy
Production asset loading should call the rights gate before treating a rights-sensitive external asset as shippable. Missing provenance is a failure, not an implicit approval. Development fallbacks must be original project-owned primitives or assets that have already passed clearance.

This registry is an engineering compliance control and evidence trail, not a substitute for legal review where legal clearance is required.
