# Render financial + marketplace route repair

This repair restores the production-certification read surface without enabling settlement or client-authoritative inventory.

- `/api/financial-truth/health` reports server authority and keeps real-money/ownership movement disabled.
- `/api/financial-truth` derives recorded purchase totals from the root server store.
- `/api/marketplace/products` is a server-authoritative read route; clients cannot mutate inventory through this module.
- Provider settlement remains required.
- The routes are registered before the generic `/api` 404 fallback.

This change does not activate payouts, ownership settlement, supplier settlement, or client-side inventory writes.
