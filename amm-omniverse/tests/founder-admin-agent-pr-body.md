## Founder Admin Agent

Adds the initial permission-gated TRYAMM control-tower policy layer.

### Automatic, reversible scope
- inspect status/evidence
- diagnose failures/bottlenecks
- rerun tests
- retry read-only health checks

### Founder approval required
- production deployment/promotion
- security/access-control changes
- destructive data operations
- real-money/payout/settlement actions

### Truth and integration boundaries
- preserves LIVE / READY / BUILDING / LOCKED / COMING SOON
- StreetVerse starts diagnose/read-only
- intended flow: Founder Command -> Admin Agent -> Automan/Command Nexus -> evidence
- does not mark itself LIVE from code or PR presence

### Merge gate
Exact-head CI/build and policy contracts must pass before merge.
