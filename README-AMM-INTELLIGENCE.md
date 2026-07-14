# AMM Intelligence MVP

This branch replaces the original counter/chat demo with the first working TryAMM intelligence showcase.

## Included

- Holographic responsive chat interface
- Quick, Creator, Faith, Accessibility and Nerd modes
- Voice input where the browser supports SpeechRecognition
- Read-aloud responses through browser speech synthesis
- Approved local TryAMM knowledge retrieval
- Optional OpenAI-compatible model connection
- Feedback logging
- Health, knowledge and content-search API routes
- Helmet, CORS, JSON limits and API rate limiting

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:10000`.

The application works in local-knowledge mode without an AI key. To connect a model, set `AI_API_URL`, `AI_API_KEY`, and `AI_MODEL` in `.env`. Never commit the real `.env` file.

## Validate

```bash
npm run check
```

## API

- `GET /api/health`
- `GET /api/knowledge`
- `POST /api/ai/chat`
- `POST /api/ai/feedback`
- `GET /api/content/search?q=anime`

## Next production upgrades

1. Replace JSON storage with Supabase/PostgreSQL.
2. Add authenticated conversation history and user preferences.
3. Add vector embeddings for larger knowledge libraries.
4. Add admin controls for reviewing feedback and publishing knowledge.
5. Add provider-specific streaming responses and realtime voice.
6. Connect the real music, drama, anime and marketplace catalogs.
