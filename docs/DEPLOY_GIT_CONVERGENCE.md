# TRYAMM Canonical Git → Vercel Deployment Contract

## Canonical source

- Repository: `jgoldie1/Amm-project-`
- Production branch: `developer-vic`
- Frontend root directory: `amm-omniverse`
- Backend root directory: `amm-omniverse/amm-backend`
- Public domains: `tryamm.online`, `www.tryamm.online`
- Production frontend project intended to serve the domains: `amm-omniverse`

## Required invariant

A production deployment is valid only when its `githubCommitSha` equals the current `developer-vic` HEAD and its Git root is `amm-omniverse`.

Do not call the domain converged when GitHub CI reports success for a different Vercel project.

## Known mismatch found 2026-08-23

GitHub commit status targets a Vercel project named `amm-project`, while `tryamm.online` is aliased to a separate Vercel project named `amm-omniverse`.

The `amm-omniverse` production deployment is CLI-sourced and has been serving an older commit. This is why successful GitHub/Vercel checks have not guaranteed that the public domain contains the newest StreetVerse/Financial Truth source.

## Git integration fix

The Vercel project `amm-omniverse` must be connected to GitHub repository `jgoldie1/Amm-project-` with:

- Production branch: `developer-vic`
- Root directory: `amm-omniverse`
- Framework: Vite
- Production aliases: `tryamm.online`, `www.tryamm.online`

Vercel CLI equivalent when run from the linked project directory:

```bash
vercel git connect
```

If the local directory is not yet linked to the intended project:

```bash
vercel link
# choose existing project: amm-omniverse
vercel git connect
```

After connection, push/commit to `developer-vic` and require the resulting production deployment metadata to show the same commit SHA.

## Proof gate

Before declaring production GREEN, verify all of the following:

1. `developer-vic` HEAD SHA equals Vercel production `githubCommitSha`.
2. Deployment `target` is `production` and `state` is `READY`.
3. `tryamm.online` and `www.tryamm.online` are aliases of that deployment.
4. `/streetverse` resolves successfully.
5. the newest public Financial Truth page resolves successfully.
6. backend `/api/health` and `/api/financial-truth/health` return healthy responses from the intended backend deployment.
7. Supabase financial tables remain RLS protected.
8. No production secrets are stored in Git.

## Rollback rule

If a new deployment fails smoke tests, roll back the Vercel deployment while preserving the Git commit for diagnosis. Never rewrite financial ledger history to perform a deployment rollback.
