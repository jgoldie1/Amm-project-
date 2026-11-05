# TRYAMM Quantum Mail — One-Domain Commercial Pilot

Status: DEVELOPMENT / not live. This runbook is an acceptance checklist, not evidence that mail has been sent, received or deployed.

## Recovery of original work
The earlier branch agent/quantum-internet-mail and existing /api/mail draft workflow are preserved. The new persistent infrastructure is isolated under /api/mail/v2. Do not migrate or delete customer drafts until tested.

## Pilot setup
1. Choose a real customer-owned test domain or a dedicated subdomain, with ownership verified and consent documented.
2. Keep the current provider's root MX records, autodiscover, DKIM, SPF, DMARC, CAA, TXT, A and CNAME records. Export the complete DNS zone before modifying it.
3. Set up an HTTPS staging website and confirm login, customer inquiries, test-mode checkout, redirects and backups.
4. Choose mail provider. For initial development the adapter supports Resend API; credentials are stored only in server-side environment secrets. Never enter passwords, API keys or registrar authorization codes into website forms.
5. Verify the exact sending domain with provider-issued DNS records. Use the provider dashboard values, never guessed or generic DNS destinations.
6. For inbound testing, use an approved mail-specific subdomain; do not overwrite existing active business mail on the root domain.
7. Create a private mail account record marked pending and disabled. A privileged operator may mark it verified only after independently checking provider domain verification and ownership evidence.
8. After database backup/restore, start only QUANTUM_MAIL_DURABLE_ENABLED=true on the staging deployment. Sending and receiving default to disabled.
9. Test outgoing to a consenting test address. Confirm message delivered, authenticated, replied to, and recorded by provider. Merely obtaining a message ID is insufficient.
10. Test inbound signed event, event replay, rejection of forged signatures, account isolation, spam quarantine and attachment malware scanning before permitting inbox body access.
11. Run an encrypted database backup plus provider retention/export and restore rehearsal to isolated infrastructure. Validate restored mail, drafts and access permissions.
12. Test customer password reset, MFA recovery, session revocation, mailbox export, tenant data deletion, support escalation and incident handling.
13. Approve domain/DNS cutover in writing after a rollback rehearsal. Change only authorized DNS. Test the existing website and email after propagation.
14. Document pricing, subscription cancellation, support limits, data retention, deliverability monitoring, complaint and unsubscribe workflows before selling.

## Environment — server secrets only
- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for persistent storage.
- QUANTUM_MAIL_DURABLE_ENABLED=true only when SQL schema and isolation have been reviewed, deployed and tested.
- RESEND_API_KEY is a restricted provider credential for sending / inbox metadata retrieval.
- RESEND_WEBHOOK_SECRET verifies inbound Svix signatures.
- QUANTUM_MAIL_LIVE_SEND_ENABLED=true only after owner approval, sender verification, mock and external delivery tests.
- QUANTUM_MAIL_INBOUND_ENABLED=true only after signed-webhook, abuse monitoring, antivirus and spam scanning acceptance.
- Never print secret values, expose service-role keys to browser JavaScript or let arbitrary customers toggle verified mailbox state.

## Release blockers
- [ ] Verified DNS and domain ownership
- [ ] Real outgoing delivery and reply verified
- [ ] Signed inbound webhook, bad signatures and duplicate events tested
- [ ] Customer isolation, draft access and provider identity tested
- [ ] Spam, phishing, HTML and attachment scanning working
- [ ] Bounce, complaints, abuse throttle and unsubscribe controls working
- [ ] Existing email uninterrupted during website/domain changes
- [ ] Encrypted backup and successful restore drill
- [ ] MFA / account recovery / access revocation tested
- [ ] Customer approval and support agreement accepted

The new v2 inbound service deliberately quarantines all mail and does not release message bodies to the UI. No external send, receipt, DNS change or production deployment was performed.
