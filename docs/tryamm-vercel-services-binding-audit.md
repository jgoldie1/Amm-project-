# TRYAMM service binding audit — non-deploying draft

Decision: keep existing production routing unchanged. Retain names `tryamm-api`, `amm-omniverse`, `amm-backend`, `streetverse-realtime`. Do not introduce root `vercel.json` services or rewrites without approval and runtime tests.

## Confirmed from source
- `render.yaml` describes `tryamm-api` as a separately hosted Node web service and declares external URL/credential settings.
- `server.js` serves static `public/` content and falls back to `public/index.html` for unmatched non-API paths. A dedicated security route guard was added, but production has not been checked.
- `amm-omniverse/package.json` identifies a Vite app with Node >=24 <25.
- `amm-omniverse/amm-backend/package.json` identifies an independent Express backend.
- `services/streetverse-realtime/package.json` identifies a Node Socket.IO server.

## Still to audit before any binding is declared
1. Search all four roots for fetch/axios/WebSocket/socket.io client base URLs and internal hostnames; distinguish browser requests from server-to-server requests.
2. Inventory every environment variable and the deployment that owns it. Do not migrate secrets into public Vite build variables.
3. Check whether persistent Socket.IO connections work with the intended Vercel runtime. Do not assume Vercel Functions replace the existing realtime host.
4. Confirm existing frontend public URL paths, auth redirects, media paths, webhooks, and health checks.
5. Test proposed bindings in preview; add only confirmed server-to-server edges, and only after approval.

## Binding matrix
| Caller | Callee | Binding | Status |
| --- | --- | --- | --- |
| tryamm-api | any other service | none | unverified |
| amm-omniverse | any other service | none | browser/build calls cannot use runtime bindings |
| amm-backend | any other service | none | unverified |
| streetverse-realtime | any other service | none | runtime suitability unverified |

**Production changes:** none from this audit. The security business is a separate static project rooted at `sites/stubbs-security`; it must not inherit the TRYAMM catch-all rewrite.
