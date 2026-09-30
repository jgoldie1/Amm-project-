export type StreetVerseVec3 = Readonly<{ x: number; y: number; z: number }>;

export type StreetVersePortal = Readonly<{
  id: string;
  exterior: StreetVerseVec3;
  interiorId: string;
  interiorSpawn: StreetVerseVec3;
  exitReturn: StreetVerseVec3;
}>;

export type StreetVerseBusinessLot = Readonly<{
  id: string;
  blockId: string;
  displayName: string;
  category: string;
  streetAddressLabel: string;
  lot: StreetVerseVec3;
  entrance: StreetVersePortal;
  deliveryPickup?: StreetVerseVec3;
  missionIds: readonly string[];
}>;

export type StreetVerseBlock = Readonly<{
  id: string;
  corridorId: string;
  grid: Readonly<{ column: number; row: number }>;
  origin: StreetVerseVec3;
  sizeMeters: Readonly<{ width: number; depth: number }>;
  businesses: readonly StreetVerseBusinessLot[];
}>;

export type StreetVerseCorridor = Readonly<{
  id: string;
  displayName: string;
  city: "Chicago";
  coordinateSystem: "cartesian-local-meters";
  metersPerUnit: 1;
  blocks: readonly StreetVerseBlock[];
}>;

const v = (x: number, y: number, z: number): StreetVerseVec3 => ({ x, y, z });

/**
 * Birthday-alpha Taylor Street seed.
 * Coordinates are deterministic local gameplay coordinates, not surveyed parcels.
 */
export const TAYLOR_STREET_CORRIDOR: StreetVerseCorridor = {
  id: "chicago-taylor-alpha",
  displayName: "Taylor Street",
  city: "Chicago",
  coordinateSystem: "cartesian-local-meters",
  metersPerUnit: 1,
  blocks: [
    {
      id: "taylor-alpha-block-00",
      corridorId: "chicago-taylor-alpha",
      grid: { column: 0, row: 0 },
      origin: v(0, 0, 0),
      sizeMeters: { width: 100, depth: 80 },
      businesses: [
        {
          id: "taylor-alpha-storefront-01",
          blockId: "taylor-alpha-block-00",
          displayName: "Taylor Street Business 01",
          category: "retail",
          streetAddressLabel: "Taylor Street",
          lot: v(24, 0, 18),
          entrance: {
            id: "door-taylor-alpha-01",
            exterior: v(24, 0, 8),
            interiorId: "interior-taylor-alpha-01",
            interiorSpawn: v(0, 0, 4),
            exitReturn: v(24, 0, 10),
          },
          deliveryPickup: v(28, 0, 12),
          missionIds: ["taylor-business-intro"],
        },
      ],
    },
    {
      id: "taylor-alpha-block-01",
      corridorId: "chicago-taylor-alpha",
      grid: { column: 1, row: 0 },
      origin: v(100, 0, 0),
      sizeMeters: { width: 100, depth: 80 },
      businesses: [
        {
          id: "taylor-alpha-storefront-02",
          blockId: "taylor-alpha-block-01",
          displayName: "Taylor Street Business 02",
          category: "food",
          streetAddressLabel: "Taylor Street",
          lot: v(20, 0, 18),
          entrance: {
            id: "door-taylor-alpha-02",
            exterior: v(20, 0, 8),
            interiorId: "interior-taylor-alpha-02",
            interiorSpawn: v(0, 0, 4),
            exitReturn: v(20, 0, 10),
          },
          deliveryPickup: v(25, 0, 12),
          missionIds: ["taylor-food-delivery-intro"],
        },
      ],
    },
  ],
};

export function worldPosition(block: StreetVerseBlock, local: StreetVerseVec3): StreetVerseVec3 {
  return v(block.origin.x + local.x, block.origin.y + local.y, block.origin.z + local.z);
}

export function getStreetVerseBlock(blockId: string): StreetVerseBlock | undefined {
  return TAYLOR_STREET_CORRIDOR.blocks.find((block) => block.id === blockId);
}

export function getStreetVerseBusiness(businessId: string): StreetVerseBusinessLot | undefined {
  for (const block of TAYLOR_STREET_CORRIDOR.blocks) {
    const business = block.businesses.find((candidate) => candidate.id === businessId);
    if (business) return business;
  }
  return undefined;
}

export function resolvePortalEntry(businessId: string): {
  interiorId: string;
  spawn: StreetVerseVec3;
  returnToStreet: StreetVerseVec3;
} | undefined {
  const business = getStreetVerseBusiness(businessId);
  if (!business) return undefined;
  return {
    interiorId: business.entrance.interiorId,
    spawn: business.entrance.interiorSpawn,
    returnToStreet: business.entrance.exitReturn,
  };
}
