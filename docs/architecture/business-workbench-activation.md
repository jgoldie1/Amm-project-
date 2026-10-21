# Jarvis / workstation / Middleverse and support activation — 2026-10-19

## Built
- Service catalog: Jarvis Business Copilot ($19/month proposed, 200 short replies), Creator Workstation + AI ($49/month proposed, 800), Middleverse Business Workflow ($99/month proposed, 1,500). These are proposed packages, not active subscriptions or additional automatic fees on existing AI add-ons. Final pricing needs measured costs, contractual scope, server metering and billing/delivery tests.
- Explicit HoloGPT planning request and readable draft output. No external actions, employment, lead supply, revenue or rendering are claimed.
- Local project/task/AI draft export. Existing Omni Workstation, Middleverse and HoloGPT remain linked destinations with their original backend requirements.
- Setup inquiry drafts hand off to the ticket form; no automatic submission.
- Account creation via the existing Supabase client. Confirmation requires correctly configured allowed callback origins.
- Operator console with server authorization, ticket descriptions, status updates and customer-visible replies. No email notifications are sent.

## Support storage created
Managed migrations business_support_tickets and business_support_operator_replies applied to the known project fxluchtdfpediivhoksl. Owner SELECT policy and restricted grants; browser roles cannot insert or update. Writes and operator queue use server-only access after authenticated identity and explicit operator authority checks.

Rollback-only database tests passed: owner reads own, another user cannot read, anonymous cannot read, customer cannot directly insert, customer cannot change status. Temporary auth/test records were rolled back. The connected auth table had no registered users at inspection; no owner identity or role was invented.

Operator authority accepts exact server-configured TRYAMM_SUPPORT_OPERATOR_USER_IDS or approved server-managed app_metadata roles. It never trusts user_metadata and never makes the first signup an administrator. Assigning a specific operator requires verifying that person's actual account ID. No account/role grants were made.

TRYAMM_SUPPORT_TICKETS_ENABLED remains false by default. The storage blocker is resolved; remaining activation gate is an authorized operator, real authenticated create/retry/history/reply verification through the deployed Data API, and an operating support policy. Existing provider REST restrictions may still block the application despite successful management/database calls. No billing changes made.

## Verification
18 behavior/generator tests; TypeScript; Vite build; dependency-isolation check. Database access tests are separate from live authenticated API/browser testing. Existing project security advisors also reported unrelated function-permission notices; no speculative broad permission changes were made. Review those before enabling credit/payment operations.

## Next concrete step
Register/confirm a TRYAMM account, verify which account belongs to the founder, assign its operator ID through the server-only allowlist, enable support on the intended environment, then exercise customer submit -> retry -> queue -> response -> customer history. Next paid-launch gate is verified Stripe purchase -> entitlement -> fulfilled website or metered AI delivery -> refund/reconciliation. Do not replace these checks with browser-reported status.
