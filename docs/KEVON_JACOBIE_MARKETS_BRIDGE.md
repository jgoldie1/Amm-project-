# Kevon + Jacobie MiddleVerse World Markets bridge
This is the first shared **educational data contract**, not a production integration. It does not call Kevon's or Jacobie's apps and contains no broker API.

## Recovered prior work
- Kevon Forex & Stock AI: prior route /kevon-forex-stock-ai; market research and education seed instruments EURUSD, GBPUSD, AAPL, NVDA, SPY. Source deployment not validated in this branch.
- Jacobie Visions DRIP Lab: demonstrated paper-only dividend reinvestment simulator, downside comparisons and downloadable CSV; production identities and journal were still not connected.
- Current World Markets module: lib/middleverse-world-markets.mjs.
- No financial execution or investment adviser functionality is asserted.

## Integration protocol
1. Recover and confirm both original app codebases and ownership.
2. Agree on HoloID / Supabase Auth user identity; apply RLS and avoid shared raw credentials.
3. Add API adapters that return immutable, attributed, timestamped instrument quotes and signed simulated trade results, not live execution endpoints.
4. Share optional learning completion and paper journal records by user ID with consent; distinct simulated money per app.
5. Connect optional read-only World Markets panels in Owner Command Center and StreetVerse University only after per-user privacy tests.
6. Add AI tutor question checking and corrections, never guaranteed returns or personalized trading orders.
7. Test cross-app privacy, replay, stale quote rejection, fee/risk calculations and browser/cloud restore independently of PR #707.

## First five lessons
1. Stock / ETF / index / currency pair definitions.
2. Forex quoted price, pip movement, spreads and leverage.
3. S&P 500 vs SPY and why markets move.
4. Paper risk budgeting, downside and journal.
5. DRIP cash versus dividend reinvestment examples.

Example: hypothetical $1,000 initial capital, $100 fixed share price, $1 dividend per share per period. Reinvesting increases share count from 10 to 10.1 after one period, before taxes and real-world price changes. This is arithmetic, not expected performance.

## Financial firewall
Do not expose company operating cash, customer money, sales commissions, $50 financing reserve or blockchain demo credits to market simulations. No auto trade, paid signals, guaranteed profits or broker connection without separate compliance and security review.
