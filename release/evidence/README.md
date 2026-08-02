# TryAMM Release Evidence

This directory stores auditable proof for release requirements.

## Evidence rules

Every evidence item must identify:

- requirement ID
- evidence owner
- source tool, device, reviewer, authority, or account
- date produced
- scope
- result: pass, fail, blocked, expired, or incomplete
- artifact path or external reference
- checksum when a file is produced
- reviewer or approver
- confidentiality level

Internal self-authored checklists may document preparation, but they do not satisfy requirements that call for independent reviewers, real devices, native editor builds, deployed services, licensed rights, or outside certification.

## Folder layout

- `native-builds/`
- `deployment/`
- `art-audio/`
- `devices/`
- `accessibility/`
- `security/`
- `legal/`
- `certification/`

Sensitive reports may remain private. Commit a sanitized sign-off that identifies scope, reviewer, date, result, remediation status, and a private evidence reference.
