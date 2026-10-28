# Security notes

- Replace the dev JWT fallback before any non-local deployment.
- Keep service-role keys and provider secrets server-side only.
- Do not trust client-supplied age bands or roles.
- Enforce age and moderation rules on every privileged API route.
- Add rate limiting and durable audit logging in production.
- Verify webhook signatures for payment providers.
- Use Supabase RLS and least-privilege service access.
- Review upload MIME types, size limits, malware scanning, and signed URLs.
