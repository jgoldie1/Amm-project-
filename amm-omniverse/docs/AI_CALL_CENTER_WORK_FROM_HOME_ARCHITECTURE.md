# TRYAMM AI Call Center — Work From Home Architecture

## Recommendation

Keep the employee, supervisor, business-owner, CRM, accessibility and reporting UI inside the existing `jgoldie1/Amm-project-` platform repository.

Do not wholesale-clone a third-party call-center product into TRYAMM.

Use a separate server/service boundary for the voice AI and telephony runtime. If this grows enough to deserve an independent repository, use a dedicated repo such as `tryamm-ai-call-center`; until then, the implementation can live under a clearly isolated service directory such as `services/ai-call-center/` in `Amm-project-`.

## Primary upstream stack

### 1. LiveKit Agents — primary AI voice runtime

Upstream: `livekit/agents`

Use for:
- realtime AI voice agents
- speech-to-text / LLM / text-to-speech orchestration
- interruption and turn handling
- tool/function calls into TRYAMM services
- agent dispatch and session workers
- human/AI collaboration
- telephony-connected AI sessions

Why it fits TRYAMM:
- TRYAMM already uses LiveKit concepts in its streaming architecture
- it keeps realtime media and AI voice in one family of infrastructure
- it can support browser, app and phone-connected sessions

### 2. LiveKit Server — media plane when self-hosting is justified

Upstream: `livekit/livekit`

Use only if TRYAMM deliberately self-hosts the WebRTC media plane. Managed LiveKit can be used first to reduce operational burden.

### 3. Twilio Voice SDK — optional PSTN/browser telephony provider adapter

Upstream: `twilio/twilio-voice.js`

Use as a provider adapter when TRYAMM needs Twilio phone numbers, PSTN calling or a browser softphone through Twilio.

Do not make Twilio the platform authority for TRYAMM identity, CRM, employee roles, payroll or business data. It is a communications provider.

### 4. Twilio Agent Connect — optional Twilio-centric AI/handoff adapter

Upstream: `twilio/twilio-agent-connect-typescript` (or the Python SDK if the worker service is Python).

Use only if TRYAMM chooses Twilio ConversationRelay / Flex / Studio as part of the production call-routing and human-handoff path.

Do not run both LiveKit Agents and Twilio Agent Connect as competing orchestration cores in the first production version. Prefer one AI voice control plane and use the other as a provider-specific adapter when needed.

## Recommended TRYAMM control plane

`CUSTOMER PHONE / WEB / APP`
→ `SIP / PSTN / WEBRTC PROVIDER`
→ `TRYAMM AI CALL ROUTER`
→ `AI AGENT OR HUMAN WFH AGENT`
→ `CRM / BUSINESS / BOOKING / SUPPLIER / SUPPORT TOOLS`
→ `CALL SUMMARY / QA / FOLLOW-UP`
→ `AUTHORITATIVE TRYAMM RECORDS`

The AI call center must not directly mutate payment, payout, settlement, customs, inventory, legal identity or regulated-status truth. It may request those actions through the same server-authoritative gates used elsewhere in TRYAMM.

## Work-from-home agent desktop

The TRYAMM employee surface should support:
- secure sign-in and role assignment
- browser softphone
- inbound queue
- outbound approved-campaign queue
- available / busy / break / offline presence
- customer context panel
- business/supplier context panel
- AI suggested reply and knowledge assist
- realtime transcript
- call notes
- disposition / outcome codes
- callback scheduling
- warm transfer and human handoff
- supervisor assistance
- quality-review queue
- accessibility preferences
- captions and transcript view
- keyboard-only operation
- large controls / reduced-motion mode
- low-bandwidth fallback

## AI roles

Start with narrowly scoped agents rather than one unrestricted agent:
- receptionist / switchboard
- customer support
- booking / TRYAMM Stays intake
- supplier outreach assistant
- marketplace seller support
- creator/agency support
- Family account support
- Holo Fon service support
- collections/reminders only where legally and contractually permitted
- appointment scheduling
- after-call summary / QA assistant

Every agent must have an explicit tool allowlist and escalation path.

## Human authority

Human agents must be able to:
- take over from AI
- correct AI summaries
- approve sensitive outbound messages
- stop a call workflow
- escalate complaints
- mark consent/recording issues
- route to a supervisor

AI must not impersonate a human employee when disclosure is required, fabricate provider approvals, invent account balances, or represent an unverified transaction as settled.

## Data and security boundaries

Browser clients must never receive:
- SIP trunk secrets
- telephony provider auth secrets
- service-role database keys
- unrestricted AI provider keys
- recording-storage signing secrets

Server-side services own those credentials.

Store only the minimum data needed for the business purpose. Recording, transcription and retention must follow applicable consent, privacy and employment rules for the operating jurisdiction.

## Persistence

Suggested authoritative entities:
- `call_center_agents`
- `call_center_teams`
- `call_center_queues`
- `call_center_sessions`
- `call_center_participants`
- `call_center_dispositions`
- `call_center_callbacks`
- `call_center_transcript_refs`
- `call_center_recording_refs`
- `call_center_ai_runs`
- `call_center_tool_audit`
- `call_center_quality_reviews`

Use RLS and role-specific policies. Raw recordings should live in controlled object storage, not directly inside normal application rows.

## Streaming integration

TRYAMM LIVE and the AI Call Center should share identity and realtime infrastructure where sensible, but they are different authority domains:
- LIVE: public/creator streaming and audience interaction
- Call Center: private customer/business communications

A private customer call must never become a public LIVE stream unless every required party explicitly authorizes that separate action.

## Business model

The same system can power:
- TRYAMM internal support staff
- remote jobs for trained workers
- business customer service as a SaaS product
- supplier support desks
- property/booking support
- creator/agency support
- multilingual AI receptionist services
- after-hours AI support with human escalation

EPIC Training can issue TRYAMM course-completion badges for call-center skills, while external/regulatory certifications remain tied to their real issuers.

## First implementation order

1. Agent authentication + WFH status
2. Browser softphone / WebRTC session
3. One inbound support queue
4. LiveKit Agents AI receptionist
5. AI → human handoff
6. Transcript + after-call summary
7. CRM/customer context
8. Supervisor dashboard
9. QA/evaluation
10. Outbound approved-campaign workflows
11. Multilingual and accessibility expansion
12. Additional telephony/provider adapters

## Repository rule

**Primary TRYAMM product repo:** `jgoldie1/Amm-project-`

**Primary upstream AI voice repo:** `livekit/agents`

**Optional telecom adapters:** `twilio/twilio-voice.js` and `twilio/twilio-agent-connect-typescript`

**Self-hosting reference when justified:** `livekit/livekit`

Do not vendor or clone these entire upstream repositories into TRYAMM. Pin supported packages, keep adapter interfaces narrow, preserve license notices where required, and maintain rollback paths.