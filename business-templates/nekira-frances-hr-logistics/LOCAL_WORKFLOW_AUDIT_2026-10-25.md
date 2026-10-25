# Frances AI / Nekira — verified local starter workflow audit (2026-10-25)

**Deliverable:** downloadable `Frances_AI_Owned_Starter_TESTED.zip` provided in ChatGPT conversation. Standalone Node 22 local application; dependency-free prototype, **not production**.

**Automated tests run:** 13 passed, 0 failed using `node --test`.
Covered: home page/photos, local bearer-token gate, scripted Frances AI intents, Scout consent, HR applicant consent, dispatcher restrictions, creator demo mission, denial of creator commission, storefront separation, request validation, and explicit false values for live voice/freight/payments.

**Critical safety limit:** the single admin token allows selecting demo roles. This is **not secure user-specific RBAC**; the app binds to `127.0.0.1` intentionally. Do not deploy publicly or enter real personal/job/customer data.

**Workflow status:** logistics site and local form demo: working locally; consented demo leads/records: working locally; Frances AI script: working locally; production HoloGPT, phone, live authorized load board, real HR applicant system, secure tenant roles, payments, commissions, streaming, 3D Detroit, franchise operations: still pending.

**Prioritized release gates:** secure tenant accounts and database → owner-approved customer intake → compliant call center with handoff → broker/carrier authorization and load feed → real verified checkout/commission ledger → deploy mobile-tested site → optional StreetVerse behind feature flag → franchise legal diligence.

**Ownership:** custom code can be reused; third-party component/model/content licenses and Nekira portrait rights must be verified before public resale. Development replacement costs are not proof of market value.

No TRYAMM main route or live deployment was changed for this audit.
