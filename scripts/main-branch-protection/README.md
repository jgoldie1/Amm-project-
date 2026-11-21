# TRYAMM main-branch protection bootstrap

**Verified starting condition, 2026-11-08:** main has no active ruleset. The permanent TypeScript repair PR #703 was merged and its three GitHub CI jobs passed. The Vercel deployment check remains blocked by billing/account suspension.

This repository's connected GitHub tool can add files and PRs but **cannot call the repository administration POST endpoint** to create a ruleset. These files alone do not protect main.

## Activate using GitHub's UI

Open https://github.com/jgoldie1/Amm-project-/settings/rules and choose **New branch ruleset**.

Use the values in `main-branch-ruleset.json`: name `TRYAMM Main — PR and CI Lock`, enforcement **Active**, target `main`, require pull requests (zero approval reviews for sole owner), status checks `Root platform checks`, `Omniverse app checks`, and `Release gate`; require up-to-date branch, block deletion and force pushes, no bypass actors.

## Activate using GitHub CLI

On an authenticated admin machine with `gh` and Python 3 installed:

```bash
gh auth login -w
bash scripts/main-branch-protection/protect-main.sh --check
bash scripts/main-branch-protection/protect-main.sh --apply
```

The script makes no changes without `--apply`, validates the JSON and admin permission, refuses duplicate disabled rulesets, and checks that GitHub reports the created rule active. Do not paste passwords or personal access tokens into chat or this repository.

**Warning:** Workflows that push directly to main will be denied after activation. Convert those to open PRs rather than weakening protection. Never require `Vercel – amm-project` until Vercel reactivates the account and its check succeeds.

Official docs: https://docs.github.com/en/rest/repos/rules
