# MiddleVerse World Markets — Research & Paper Trading

**Status:** draft-only addition to secure sales PR #708. No live broker integration, no real market-data provider and no cash moved.

## Modules
1. **Business FX exposure:** invoice currency conversion budgeting with attributed, timestamped rate supplied by a reviewed provider; spreads, fees and safety buffer; outputs not executable quotes.
2. **World market watch:** research scope (US S&P 500, global equity benchmarks, forex pairs, commodity and supply-chain currency exposure). Market-data licensing/redistribution rights and delayed versus live labeling must be verified.
3. **Paper-trading simulator:** hypothetical long and short position P/L for supplied prices, fees and slippage; no broker orders or guarantees.
4. **Risk review:** hypothetical stop-distance sizing and maximum risk budget; paper only.
5. **Corporate funds firewall:** never combine actual sales receipts, customer funds, commissions, $50 reserves, game rewards or operational cash with speculative trading.

## Owner Command Center integration plan
Business sales and margin ledger remain authoritative. Create a separate read-only markets panel showing each rate's provider, timestamp, quote currency, age and delayed status; paper P/L stays in a distinctly marked sandbox. Require explicit admin approval and legal review before any paid finance education or signals. TradingPermission always returns disabled.

## Product boundaries
S&P 500 is an index (not directly tradable). Illustrative simulations may use a separately identified index-tracking product, with correct licensing and market-data feeds. FINRA intraday margin rules entered a transition period in 2026; do not hard-code old pattern-day-trader thresholds. US CFTC reports material losses and leverage risks for retail forex; no promise of returns or automated trading profits.

## Next tests
Add verified licensed market-data ingestion with stale-rate rejection; separate cross-currency accounting and currency precision; timezone-aware market calendars; portfolio mock performance; RLS isolation; API rate limits and cost caps. No real-money brokerage or advisory feature until suitability and regulatory review.
