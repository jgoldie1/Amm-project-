# Business onboarding and support tickets — 2026-10-19

Update: ticket storage and operator reply columns are now applied and database isolation checks passed. See business-workbench-activation.md for the current activation state. Earlier draft/activation notes below describe the initial implementation.

Onboarding is a self-reported preparation checklist with a downloadable copy. It does not record payment, verification, hosting or publication. No data is persisted across refresh unless the customer downloads it. Customer content stays separate from backend-authoritative fulfillment status.

Support UI: category, subject, description, stable client request ID, explicit submit, download draft, history and start-new controls. No screenshot required. Signed-in submission uses /api/support/tickets. State changes to submitted only after server confirmation with a reference; timeout is unconfirmed, not a guaranteed failure. Retrying preserves the request ID and the API rejects mismatched content for an already used ID.

Backend: disabled unless TRYAMM_SUPPORT_TICKETS_ENABLED=true. A verified user owns each write; client ownership and status are ignored. GET always filters by authenticated user. Server requires a stored row before issuing a reference. Service errors return an unavailable/unconfirmed response and do not expose database error details. SQL draft in docs/setup/support-tickets-schema-draft.sql has not been applied. RLS and restricted table grants are included for review.

Activation blockers: generate and apply a reviewed managed migration in the correct environment; run anonymous/owner/other-user RLS tests and advisors; verify REST create/replay/history against real authenticated users; configure an authorized operator queue and escalation/retention policy; enable flag only after end-to-end confirmation. Supabase management reports the project healthy, but this is not proof that the app's Data API restriction has cleared. No billing changes or schema deployment were performed.

Support notifications, replies, attachments, ticket operator UI and guaranteed response times are not provided. Ticket storage is not a patient-data or emergency-service system.

Other paid launch gates: license/delivery scope, customer terms/privacy/refunds, signed payment webhooks and idempotent purchase entitlement, hosted-site provisioning, domain ownership, AI metering/budgets, seller delivery workflow, and device/accessibility checks. Preserve gifted free-site commitments.

Validation: TypeScript, production Vite build, business bundle isolation, seven support-handler behavior tests and five website-generator tests. Real database and assistive-device testing are not completed by mocked handler tests.
