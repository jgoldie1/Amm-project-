# TRYAMM Quantum Server — development prototype

A **low-cost, independent Node.js service** for StreetVerse and Soul Ascension. Zero npm runtime dependencies. It is NOT a physical quantum computer.

## Features
- Classical 1–4 qubit state-vector circuit simulation, supported gates H, X, Z, S, T, CX.
- Up to 2,048 measurements per request, using OS cryptographic sampling.
- Soul Ascension dance-line rooms with ordered dance cues and server timestamps.
- Bearer-token authentication for all private routes, 16 KB request limit, simple rate limits.
- Ephemeral, single-instance storage only. Restart erases rooms and cues.

## Run and test
Requires Node.js 20 or later (Node 22 preferred), available through the Chromebook Linux environment.

    cd services/quantum-server
    npm test
    export TRYAMM_QUANTUM_TOKEN="choose-a-long-random-secret"
    npm start

Replace the example with a randomly generated secret. Never commit real secrets, and never send this token to browsers or client-side JavaScript.

## Test the endpoints

    curl http://localhost:8787/healthz
    curl http://localhost:8787/v1/capabilities

Simulate an entangled Bell-state circuit on a normal CPU:

    curl -X POST http://localhost:8787/v1/quantum/simulate \
      -H "Authorization: Bearer choose-a-long-random-secret" \
      -H "Content-Type: application/json" \
      -d '{"qubits":2,"gates":[{"type":"H","target":0},{"type":"CX","control":0,"target":1}],"shots":128}'

Create Soul Ascension dance room:

    curl -X POST http://localhost:8787/v1/dance/rooms \
      -H "Authorization: Bearer choose-a-long-random-secret" \
      -H "Content-Type: application/json" \
      -d '{"name":"Soul Ascension Virtual Dance Line"}'

Use the returned roomId to cue a move:

    curl -X POST http://localhost:8787/v1/dance/rooms/ROOM_ID/cues \
      -H "Authorization: Bearer choose-a-long-random-secret" \
      -H "Content-Type: application/json" \
      -d '{"moveId":"soul-1980s-moonwalk","delayMs":1800}'

Read the room with GET /v1/dance/rooms/ROOM_ID and the same bearer token. Cues include serverTime, a sequence, and a scheduled startAt timestamp in Unix milliseconds.

## Truth and limits
- This is a **classical software simulator**, not a device with physical quantum processors, quantum random number generation, teleportation, or provable quantum advantage.
- Dance synchronization is a single-instance timestamp queue, NOT an Internet-scale real-time multiplayer server. There is no WebSocket push.
- Server rooms last two hours, with limits of 50 rooms and 100 cues per room.
- This does NOT persist user accounts, purchases, crypto balances, winnings or rewards.
- No AI agents, AR/VR, blockchain, content licenses, ticketing, or live video have been connected yet.
- Existing StreetVerse game remains untouched by this isolated branch until testing and integration review.

## Safe growth path
1. Verify CI, test locally on Chromebook, and make a protected HTTPS backend-to-backend connection.
2. Next add durable PostgreSQL storage, optional Redis pub/sub, account auth and authenticated WebSockets or SSE when truly needed.
3. Track usage and budget before deploying to an always-on service. GitHub Actions runs tests, not 24-hour game hosting.
4. If external quantum hardware ever becomes useful, integrate a real provider with separate usage limits, cost checks, and explicit hardware reporting.

Shadow Box remains reserved for the future boxing game.
