# Test Plan

## Age band
- Under 13 => CHILD
- 13 through 17 => TEEN
- 18+ => ADULT
- Invalid/future DOB => rejected

## Access
- CHILD denied adult_live, adult_direct_messages, mature_content, unrestricted_virtual_gifts, marketplace_adult, creator_monetization
- TEEN denied adult_live, adult_direct_messages, mature_content, unrestricted_virtual_gifts, marketplace_adult, creator_monetization
- ADULT allowed eligible adult features

## Safety
- Authenticated user can report content/user/live target
- Authenticated user can block/unblock/mute another user
- Moderator-only route rejects ordinary users
- Moderator actions are persisted and auditable

## Live
- CHILD cannot join min_age 13/18 rooms
- TEEN cannot join min_age 18 rooms
- ADULT can join eligible rooms

## Deletion
- Authenticated user can create deletion request
- Request is persisted and receives status
- Production deletion worker/process must complete legal deletion/retention workflow

## Security
- No service-role/API secrets exposed client-side
- Authorization checked server-side
- Rate limiting added in production host app
- RLS/DB authorization reviewed before deployment
