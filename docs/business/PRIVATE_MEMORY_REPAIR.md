# Private memory repair — October 21, 2026

## Implemented

- SharedQuantumMemory now clears state on sign-out/account switches, cancels pending timers, ignores stale responses, and binds writes to the captured owner. Signed-in memory is not cached in localStorage. Route query strings are excluded.
- World state moves from user-editable auth metadata into an RLS-protected database document. Old localStorage and user_metadata values are left untouched, but are not automatically imported because their ownership may already have been mixed by the old code.
- Googloplex retains its synchronous catalog/search API and hydrates private saved records after authentication. Existing Benny/Googloplex bridges can search hydrated records.
- The Googloplex screen now provides explicit catalog saves, business notes with source references, search, export of saved catalog/notes, restore of the previous revision, and confirmed deletion of catalog/notes including the previous revision.
- Stored text is user-provided data, never authorization or instructions to execute. Business notes are owner-entered and not independently verified. This does not add automatic business-note retrieval to the website executor.
- Server-maintained revision numbers, timestamps and one previous payload provide conflict detection and limited recovery. Reload before resaving after a conflict. Reload intentionally discards unsaved edits.
- Limits: three fixed namespaces per account (world/catalog/business), each payload at most 256 KiB plus one previous payload; client saves use a smaller 240,000-byte limit; catalog at most 500 records. World saves are throttled to 15 seconds while state changes. No model calls or embeddings required.

## Boundaries

This is private owner memory, not organization/team sharing or separate business membership authorization. Put business names in notes to distinguish entries. Team sharing, larger document ingestion, comprehensive audit history and automated backups require separate implementation. One previous revision is not a disaster-recovery backup; download exports for an additional copy. The export/delete controls currently cover catalog and business notes, not world state.

## Verification and activation

The additive migration 20261021092253_private_long_term_memory.sql was applied to the connected TRYAMM Supabase database. Readback confirmed RLS enabled, anonymous reads denied, and owner checks on all four CRUD policies. Security advisors returned no findings for the new table/function; existing project advisories for other functions/tables remain and were not changed blindly.

Four runtime regression tests pass (switch/late read, owner/revision/conflict, late save, real world runtime signout/timer/legacy-storage behavior). A PGlite test applies the actual migration and checks owner CRUD, cross-owner denial, immutable owner, revision/history, stale updates, size limits, restoration, deletion and anonymous denial. Both changed browser entry modules bundle with esbuild. These are not a full application build or signed-in production browser test.

Tests from amm-omniverse:

- TYPESCRIPT_MODULE=/absolute/path/to/typescript node --test tests/private-memory.test.cjs
- PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node tests/private-memory-rls.test.mjs

Use TypeScript 5.9.3 and @electric-sql/pglite in an isolated test directory if not already installed. The code release still requires deployment before the public website uses the fix. Reverting application code would restore the old account-mixing risk; keep the corrected auth isolation even if disabling cloud memory.

The Supabase CLI scaffold succeeded, but automatic approval review rejected its subsequent analytics connection to PostHog. No retry was made; database installation and verification used the Supabase connector instead.
