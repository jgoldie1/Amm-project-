# TRYAMM Growth Automation Lane

This file records the decision to keep launch-critical Android work on `developer-vic` while growth experiments are isolated on a separate `growth-automation` branch.

Goals:
- AI Café content engine
- Discord community growth
- Quantum Zapier / Zapier MCP orchestration
- Share Once → Everywhere fanout
- Network TV clip repurposing

Release protection rules:
- Do not merge growth work into the Thursday Android launch candidate unless it closes an existing release gate.
- Never store Discord webhooks, Zapier tokens, API keys, or social credentials in source control.
- No spam, fake engagement, unauthorized mass-DMs, or platform-rule evasion.
- Human approval remains required for sensitive/high-risk public posts.
