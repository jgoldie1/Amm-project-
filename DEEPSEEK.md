# DeepSeek Development Guide — TryAMM

Read `AGENTS.md` first.

## Role
Use DeepSeek as an optional server-side reasoning and coding provider. Keep it interchangeable with other providers through the same normalized adapter contract.

## Provider Requirements
- Credentials only in environment variables.
- Configurable base URL and model name.
- Timeout, rate-limit and upstream-error handling.
- Server-side moderation and retrieval remain active regardless of provider.
- Return the actual provider label; never disguise fallback output.

## Coding Tasks
DeepSeek may assist with API implementation, database migrations, tests, refactoring and technical documentation. Every generated change must be reviewed for security, correctness and compatibility with Node 20.

## Response Standards
- Use approved TryAMM knowledge for platform facts.
- Do not invent catalog entries, payouts, orders, users or Scripture citations.
- Keep answers direct in Quick mode and detailed in Nerd mode.
- In Accessibility mode, use short numbered steps and one-handed workflows.

## Security Review Checklist
- No secrets in commits or logs.
- Parameterized database queries.
- Authentication and authorization checked separately.
- Input validation on every public route.
- Output safely rendered in the browser.
- File uploads restricted by type, size and malware-scanning workflow.

## Validation
Run syntax checks and relevant tests. Record any untested behavior in `docs/HANDOFF.md` rather than calling it complete.
