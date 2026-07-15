# TryAMM AI Agent Instructions

## Mission
Build TryAMM as an accessible creator, streaming, music, anime, vertical-drama, marketplace, faith, education, gaming and immersive platform. Work in small, testable increments. Preserve working behavior while replacing placeholders with production services.

## Current Priority
1. AMM Intelligence MVP
2. Authentication and persistent conversations
3. Admin knowledge and evaluation dashboard
4. Real content catalog
5. Creator uploads and moderation
6. Realtime voice and streaming responses

## Required Rules
- Never commit API keys, secrets, private user data or payment credentials.
- Use environment variables and keep `.env` ignored.
- Do not invent platform capabilities; document stubs and unfinished work clearly.
- Keep faith content respectful and distinguish Scripture, history, interpretation and fiction.
- Build accessibility first: keyboard support, voice-first workflows, large controls, reduced motion, captions and one-handed use.
- Validate user input, rate-limit public APIs and avoid unsafe HTML injection.
- Keep provider integrations behind adapters so OpenAI-compatible, Gemini and DeepSeek endpoints can be swapped.
- Use approved knowledge sources before answering platform-specific questions.
- Add or update tests/checks for every meaningful change.

## Commands
```bash
npm install
npm run check
npm start
```

## Architecture
- `server.js`: current API and static app server
- `public/`: holographic responsive client
- `data/knowledge.json`: approved local knowledge
- `data/feedback.json`: local development feedback only
- `docs/`: architecture, skills and handoff documentation

## Definition of Done
A change is done only when it is documented, syntax-checked, does not expose secrets, preserves accessibility, and includes clear next steps for unfinished production work.
