# Algorithm Studio

Algorithm Studio is a first-class TRYAMM creator tool.

## Authoring
Users can create ranking profiles with sliders/toggles, visual weighted rules, or Stubbs AI natural-language instructions. Profiles can be private, shared, published and remixed with attribution/version lineage.

## Example dimensions
New creators; local/global; faith/Set Apart; music; movies; anime; games; LIVE; learning; opportunities; independent creators; long-form; repeat reduction.

## Required controls
Why This?; More Like This; Less Like This; Reset; do-not-use-this-activity; algorithm switcher; preview/test; save/version; share/remix.

## Hard boundary
Custom algorithms rank only eligible content. They never disable moderation, age/teen protections, blocks, copyright/provenance enforcement, fraud/bot detection, jurisdiction restrictions or other mandatory policy controls.

## Data model direction
AlgorithmProfile(id, owner_id, name, description, visibility, version, safety_policy_version, scopes, weights, rules, remix_parent_id, created_at, updated_at).
AlgorithmFeedback(user_id, profile_id, content_id, action, surface, created_at).

## Ranking pipeline
Candidate retrieval → eligibility/policy filter → specialized ranker → user algorithm weights/rules → diversity/exploration → final safety check → explanation metadata → display.
