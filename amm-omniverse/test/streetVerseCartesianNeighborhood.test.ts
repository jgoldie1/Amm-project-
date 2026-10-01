import { describe, expect, it } from "vitest";
import {
  TAYLOR_STREET_CORRIDOR,
  getStreetVerseBusiness,
  resolvePortalEntry,
  worldPosition,
} from "../src/data/streetVerseCartesianNeighborhood";

describe("StreetVerse Cartesian neighborhood", () => {
  it("uses deterministic meter-based blocks", () => {
    expect(TAYLOR_STREET_CORRIDOR.coordinateSystem).toBe("cartesian-local-meters");
    expect(TAYLOR_STREET_CORRIDOR.metersPerUnit).toBe(1);
    expect(TAYLOR_STREET_CORRIDOR.blocks).toHaveLength(2);
    expect(worldPosition(TAYLOR_STREET_CORRIDOR.blocks[1], { x: 5, y: 0, z: 7 }))
      .toEqual({ x: 105, y: 0, z: 7 });
  });

  it("round-trips a storefront through its interior portal", () => {
    const business = getStreetVerseBusiness("taylor-alpha-storefront-01");
    expect(business?.blockId).toBe("taylor-alpha-block-00");
    expect(resolvePortalEntry("taylor-alpha-storefront-01")).toEqual({
      interiorId: "interior-taylor-alpha-01",
      spawn: { x: 0, y: 0, z: 4 },
      returnToStreet: { x: 24, y: 0, z: 10 },
    });
  });
});
