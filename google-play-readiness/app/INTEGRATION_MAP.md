# Production integration map

## Frontend
- onboarding DOB -> `POST /api/onboarding`
- session -> use returned token or replace with production Supabase session claims
- navigation/feed -> render by server-issued `ageBand`
- block/mute/report buttons -> corresponding API routes
- account deletion settings -> `POST /api/account-deletion`

## Backend
- live creation/token issuance -> require `create_live` + audience checks
- teen live -> separate protected room policy
- DMs -> call `canInteract(actorBand,targetBand)` before thread/message creation
- gifts -> require `virtual_gifts`
- marketplace -> require `marketplace`; classify transaction before choosing payment rail
- moderation -> `POST /api/moderation/actions` plus production persistence/audit trail

## Supabase
- replace in-memory store with tables for profiles, reports, blocks, mutes, moderation_actions, deletion_requests
- enable RLS
- never trust age band submitted by the client

## LiveKit
- mint room tokens only after backend authorization
- include age/audience metadata server-side
- prevent client-provided room names from bypassing room policy

## Android / Google Play
- package the real production frontend, not this reference shell
- map camera/mic/notification permissions to just-in-time prompts
- provide privacy policy and web deletion URL
- use Google Play-compliant billing where required for digital items
