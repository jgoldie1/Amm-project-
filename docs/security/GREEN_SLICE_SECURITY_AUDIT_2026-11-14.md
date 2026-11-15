# Green Slice Security Audit — 2026-11-14

## Scope
Current `main` plus recovered release-critical systems on `agent/green-slice-recovery-20261114`.

## Confirmed checks
- No default-branch code-search hits for `pull_request_target`.
- No default-branch code-search hits for `curl | bash`.
- No default-branch code-search hits for `wget | bash`.
- No default-branch code-search hits for `permissions: write`.
- No obvious default-branch code-search hit for `npm install github`.
- Guardian Group typo `holGuardian_minor_safety` corrected to `holoGuardian_minor_safety`.
- Guardian policy identifiers normalized for auditability.
- Guardian Group remains bounded: no authority to create money, inventory, or paid rewards; no silent competitive-result changes; high-impact actions require evidence/human review; rollback preserves audit trace.
- Money/game economy boundary and server-authoritative multiplayer modules were recovered into the clean branch.

## YELLOW items
- Recovery branch is not protected.
- Recovery branch has no current GitHub Actions evidence yet.
- Dependency advisories and lockfile integrity have not yet been proven for this exact recovery build.
- GitHub Actions permissions and third-party action pinning still need a file-by-file review on the workflows that will run this branch.
- Secrets must be validated through repository/provider settings; they must never be copied into source or audit documents.

## External security note
Current project failures have direct infrastructure explanations (Vercel 402 and Render 503). This audit does not establish that the project is under active cyberattack.

## Required before deploy
1. run repository security scan on exact recovery commit,
2. run dependency audit on exact lockfiles,
3. verify workflow permissions are least-privilege,
4. verify no secrets appear in source, logs, artifacts, or client bundles,
5. verify Guardian/Panic/security regression,
6. verify money and inventory remain server-authoritative,
7. verify provider credentials through settings, not source,
8. require evidence for any high-impact security promotion.
