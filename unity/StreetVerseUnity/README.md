# TRYAMM Unity Client Profile

Unity is an optional TRYAMM native/AR/mobile client path. It is not the authoritative game backend.

## Recommended uses

- AR/XR/mobile-native experiments
- device integrations
- alternate native client distribution
- lightweight simulation or training clients

## Visual strategy

Unity 6:
- URP for broad mobile/native reach
- HDRP for high-end desktop visuals
- Dynamic Resolution for stable frame rate
- GPU Resident Drawer / GPU Occlusion Culling where supported
- DLSS on supported NVIDIA hardware
- FSR2 on supported AMD/graphics paths

## Shared state

Unity must consume the same TRYAMM identity, Passport, mission, inventory, OmniBox, Reels, CampusVerse, CrossVerse and server-ledger contracts.

Do not build a separate Unity economy or separate player identity.
