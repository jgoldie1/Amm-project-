# TryAMM Production Handoff

## Current Branch
`agent/amm-intelligence-mvp`

## Current Deliverable
A demonstrable AMM Intelligence MVP with a responsive holographic interface, five modes, browser speech input, read-aloud output, local approved knowledge retrieval, optional external model connection, feedback logging, health checks, content search, rate limiting and security headers.

## Completed
- Replaced the original counter/chat demo with an AI-oriented Express service.
- Added Quick, Creator, Faith, Accessibility and Nerd modes.
- Added local knowledge fallback so the demo does not fabricate answers when no provider is configured.
- Added source cards, feedback controls and accessibility settings.
- Added provider-neutral environment configuration.
- Added agent instructions for Claude, Gemini, DeepSeek and other coding assistants.
- Added an application skills catalog.

## Required Validation
```bash
npm install
npm run check
npm start
```
Then test:
- `GET /api/health`
- all five modes
- microphone behavior in a supported browser
- read-aloud behavior
- large controls and reduced motion
- feedback submission
- local fallback with no AI credentials
- connected-provider behavior with credentials configured privately

## Known Limitations
- JSON persistence is development-only and unsafe for multiple server instances.
- No authentication or authorization yet.
- Conversations are stored only in browser memory.
- Retrieval is keyword-based, not vector-based.
- No admin dashboard.
- No production content catalog or creator uploads.
- No realtime streamed tokens or realtime voice.
- Runtime checks have not been executed by the GitHub connector.

## Next Exact Milestone
Implement Supabase authentication and PostgreSQL persistence.

### Tables
- profiles
- ai_conversations
- ai_messages
- ai_feedback
- ai_user_preferences
- knowledge_documents
- knowledge_chunks
- content_items

### Security
- Enable row-level security.
- Users may access only their own conversations and preferences.
- Admin-only roles manage approved knowledge.
- Service-role keys remain server-side.

### Acceptance Criteria
- User can sign in.
- Conversation survives refresh and a new session.
- Feedback is stored in PostgreSQL.
- Local JSON files are no longer used for production writes.
- Unauthorized users cannot read another user's data.
- Existing accessibility behavior still works.
