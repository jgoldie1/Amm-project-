# Creator Project Model

Creator Project is the aggregate root for a creative property.

A project can contain: song/audio, Reel/short, film, series, anime/cartoon, game, podcast, LIVE event, AR/VR/MR/holographic experience, merchandise, ticket, Omni Box and related marketing assets.

Each child asset references project-level collaborators and rights assets while allowing asset-specific overrides through versioned agreements where necessary.

Core relationships:
CreatorProject → ProjectMembers → Assets → RightsAssets → SplitAgreements/SplitRecipients → Releases/Commerce → Earnings/Ledger references.

Projects should support roles, tasks, files, versions, approvals, credits, rights acceptance, publishing state and collaboration history.

Do not duplicate ownership percentages independently across every feature when one versioned rights agreement can be referenced.
