# Illinois-First Vision QA Capture Plan

The first capture benchmark is Illinois, beginning with Chicago StreetVerse scenes and the Golden Order commerce loop.

Capture sets:

1. Street intersection: pedestrians, traffic direction, lane alignment, signals, collision/clipping.
2. Creator/business storefront: signage, character scale, lighting, UI readability, LIVE commerce prompts.
3. Warehouse: pallets, forklifts/vehicles, inventory visualization, occlusion, clipping, navigation.
4. Founder command center: KPI legibility, contrast, hierarchy, accessibility, responsive layout.
5. Golden Order logistics scene: supplier/order/shipment state shown visually without altering authoritative commerce truth.
6. Night scene: reflections, emissive materials, traffic visibility, character readability, performance artifacts.
7. Mobile view: touch targets, text size, contrast, orientation, safe areas, frame stability.

For each build, associate captures with the build SHA and region. Compare against the previous accepted build and open defects for meaningful regressions.

After Illinois passes this benchmark, reuse the same capture categories for each U.S. state expansion and later for global regions and trade corridors.
